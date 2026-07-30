// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title FireeEscrowV2
 * @notice Escrow contract for Firee physical goods marketplace.
 *         Funds are held until the buyer confirms delivery (or the
 *         dispute window passes after the seller marks shipped).
 *
 *         Order lifecycle:
 *           Paid      -> seller ships     -> Shipped
 *           Shipped   -> buyer confirms   -> Delivered (funds released to seller balance)
 *           Shipped   -> autoRelease after RELEASE_TIMEOUT if buyer is unresponsive
 *           Paid      -> seller never ships -> buyer can claim refund after SHIP_TIMEOUT
 *           Paid/Shipped -> buyer opens dispute -> Disputed -> owner resolves (refund or release)
 *
 * @dev Deployed on Base (Sepolia for testnet). USDC has 6 decimals.
 */
contract FireeEscrowV2 is Ownable, ReentrancyGuard {
    // --- State ---
    IERC20 public immutable usdc;
    uint256 public platformFeeBps; // basis points, e.g. 300 = 3%
    uint256 public constant MAX_FEE_BPS = 1000; // max 10%

    /// @notice If seller has not shipped within this window, buyer can self-refund.
    uint256 public shipTimeout = 14 days;
    /// @notice After shipping, if buyer neither confirms nor disputes, seller can claim funds.
    uint256 public releaseTimeout = 30 days;

    enum Status {
        None,
        Paid,
        Shipped,
        Delivered,
        Disputed,
        Refunded
    }

    struct Order {
        address buyer;
        address seller;
        uint256 amount;       // total USDC paid by buyer (6 decimals)
        uint256 sellerAmount;
        uint256 platformFee;
        uint64 paidAt;
        uint64 shippedAt;
        Status status;
    }

    uint256 public nextOrderId;
    mapping(uint256 => Order) public orders;

    // Balances become withdrawable only after release
    mapping(address => uint256) public sellerBalances;
    uint256 public platformBalance;

    // --- Events ---
    event Purchase(
        uint256 indexed orderId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        uint256 sellerAmount,
        uint256 platformFee,
        string productId
    );
    event Shipped(uint256 indexed orderId, string trackingRef);
    event Delivered(uint256 indexed orderId);
    event AutoReleased(uint256 indexed orderId);
    event DisputeOpened(uint256 indexed orderId, address indexed by);
    event DisputeResolved(uint256 indexed orderId, bool refundedBuyer);
    event Refund(uint256 indexed orderId, address indexed buyer, uint256 amount);
    event SellerWithdrawal(address indexed seller, uint256 amount);
    event PlatformWithdrawal(address indexed to, uint256 amount);
    event FeeUpdated(uint256 oldFee, uint256 newFee);
    event TimeoutsUpdated(uint256 shipTimeout, uint256 releaseTimeout);

    // --- Constructor ---
    constructor(address _usdc, uint256 _feeBps) Ownable(msg.sender) {
        require(_usdc != address(0), "Invalid USDC address");
        require(_feeBps <= MAX_FEE_BPS, "Fee too high");
        usdc = IERC20(_usdc);
        platformFeeBps = _feeBps;
    }

    // --- Buyer flow ---

    /**
     * @notice Buyer pays for a physical product. Funds are locked in escrow.
     * @param _seller Seller's wallet address
     * @param _amount USDC amount (6 decimals)
     * @param _productId Off-chain product ID for indexing
     */
    function purchase(
        address _seller,
        uint256 _amount,
        string calldata _productId
    ) external nonReentrant returns (uint256 orderId) {
        require(_seller != address(0), "Invalid seller");
        require(_seller != msg.sender, "Cannot buy own product");
        require(_amount > 0, "Amount must be > 0");

        require(
            usdc.transferFrom(msg.sender, address(this), _amount),
            "USDC transfer failed"
        );

        uint256 fee = (_amount * platformFeeBps) / 10000;

        orderId = nextOrderId++;
        orders[orderId] = Order({
            buyer: msg.sender,
            seller: _seller,
            amount: _amount,
            sellerAmount: _amount - fee,
            platformFee: fee,
            paidAt: uint64(block.timestamp),
            shippedAt: 0,
            status: Status.Paid
        });

        emit Purchase(orderId, msg.sender, _seller, _amount, _amount - fee, fee, _productId);
    }

    /**
     * @notice Buyer confirms the item arrived. Releases funds to seller balance.
     */
    function confirmDelivery(uint256 _orderId) external nonReentrant {
        Order storage o = orders[_orderId];
        require(o.buyer == msg.sender, "Not your order");
        require(o.status == Status.Shipped, "Not shipped");

        o.status = Status.Delivered;
        sellerBalances[o.seller] += o.sellerAmount;
        platformBalance += o.platformFee;

        emit Delivered(_orderId);
    }

    /**
     * @notice Buyer self-refunds if seller never shipped within shipTimeout.
     */
    function claimRefundNotShipped(uint256 _orderId) external nonReentrant {
        Order storage o = orders[_orderId];
        require(o.buyer == msg.sender, "Not your order");
        require(o.status == Status.Paid, "Not refundable");
        require(block.timestamp >= o.paidAt + shipTimeout, "Ship window still open");

        o.status = Status.Refunded;
        require(usdc.transfer(o.buyer, o.amount), "Refund failed");

        emit Refund(_orderId, o.buyer, o.amount);
    }

    /**
     * @notice Buyer or seller opens a dispute (item not as described, lost package, etc).
     */
    function openDispute(uint256 _orderId) external {
        Order storage o = orders[_orderId];
        require(
            msg.sender == o.buyer || msg.sender == o.seller,
            "Not a party to this order"
        );
        require(
            o.status == Status.Paid || o.status == Status.Shipped,
            "Cannot dispute"
        );

        o.status = Status.Disputed;
        emit DisputeOpened(_orderId, msg.sender);
    }

    // --- Seller flow ---

    /**
     * @notice Seller marks the order as shipped with an off-chain tracking reference.
     */
    function markShipped(uint256 _orderId, string calldata _trackingRef) external {
        Order storage o = orders[_orderId];
        require(o.seller == msg.sender, "Not your order");
        require(o.status == Status.Paid, "Not in Paid state");

        o.status = Status.Shipped;
        o.shippedAt = uint64(block.timestamp);

        emit Shipped(_orderId, _trackingRef);
    }

    /**
     * @notice Seller claims funds if buyer neither confirmed nor disputed
     *         within releaseTimeout after shipping.
     */
    function autoRelease(uint256 _orderId) external nonReentrant {
        Order storage o = orders[_orderId];
        require(o.seller == msg.sender, "Not your order");
        require(o.status == Status.Shipped, "Not shipped");
        require(block.timestamp >= o.shippedAt + releaseTimeout, "Release window still open");

        o.status = Status.Delivered;
        sellerBalances[o.seller] += o.sellerAmount;
        platformBalance += o.platformFee;

        emit AutoReleased(_orderId);
        emit Delivered(_orderId);
    }

    /**
     * @notice Seller withdraws all released earnings.
     */
    function withdrawSeller() external nonReentrant {
        uint256 balance = sellerBalances[msg.sender];
        require(balance > 0, "No balance to withdraw");

        sellerBalances[msg.sender] = 0;
        require(usdc.transfer(msg.sender, balance), "Transfer failed");

        emit SellerWithdrawal(msg.sender, balance);
    }

    // --- Admin ---

    /**
     * @notice Owner resolves a dispute: refund the buyer or release to the seller.
     */
    function resolveDispute(uint256 _orderId, bool _refundBuyer) external onlyOwner nonReentrant {
        Order storage o = orders[_orderId];
        require(o.status == Status.Disputed, "Not disputed");

        if (_refundBuyer) {
            o.status = Status.Refunded;
            require(usdc.transfer(o.buyer, o.amount), "Refund failed");
            emit Refund(_orderId, o.buyer, o.amount);
        } else {
            o.status = Status.Delivered;
            sellerBalances[o.seller] += o.sellerAmount;
            platformBalance += o.platformFee;
            emit Delivered(_orderId);
        }
        emit DisputeResolved(_orderId, _refundBuyer);
    }

    function withdrawPlatform(address _to) external onlyOwner nonReentrant {
        require(_to != address(0), "Invalid address");
        uint256 balance = platformBalance;
        require(balance > 0, "No platform balance");

        platformBalance = 0;
        require(usdc.transfer(_to, balance), "Transfer failed");

        emit PlatformWithdrawal(_to, balance);
    }

    function setFee(uint256 _newFeeBps) external onlyOwner {
        require(_newFeeBps <= MAX_FEE_BPS, "Fee too high");
        uint256 old = platformFeeBps;
        platformFeeBps = _newFeeBps;
        emit FeeUpdated(old, _newFeeBps);
    }

    function setTimeouts(uint256 _shipTimeout, uint256 _releaseTimeout) external onlyOwner {
        require(_shipTimeout >= 1 days && _shipTimeout <= 60 days, "Invalid ship timeout");
        require(_releaseTimeout >= 7 days && _releaseTimeout <= 90 days, "Invalid release timeout");
        shipTimeout = _shipTimeout;
        releaseTimeout = _releaseTimeout;
        emit TimeoutsUpdated(_shipTimeout, _releaseTimeout);
    }

    // --- Views ---

    function getOrder(uint256 _orderId) external view returns (Order memory) {
        return orders[_orderId];
    }
}
