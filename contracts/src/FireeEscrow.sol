// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title FireeEscrow
 * @notice Escrow contract for Firee marketplace. Handles USDC payments between
 *         buyers and sellers with a configurable platform fee.
 * @dev Deployed on Base (Sepolia for testnet).
 */
contract FireeEscrow is Ownable, ReentrancyGuard {
    // --- State ---
    IERC20 public immutable usdc;
    uint256 public platformFeeBps; // basis points, e.g. 300 = 3%
    uint256 public constant MAX_FEE_BPS = 1000; // max 10%

    // Seller balances (available to withdraw)
    mapping(address => uint256) public sellerBalances;
    // Platform revenue
    uint256 public platformBalance;

    // Order tracking
    uint256 public nextOrderId;

    struct Order {
        address buyer;
        address seller;
        uint256 amount;       // total USDC paid by buyer (6 decimals)
        uint256 sellerAmount;
        uint256 platformFee;
        uint256 timestamp;
        bool refunded;
    }

    mapping(uint256 => Order) public orders;

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
    event SellerWithdrawal(address indexed seller, uint256 amount);
    event PlatformWithdrawal(address indexed to, uint256 amount);
    event FeeUpdated(uint256 oldFee, uint256 newFee);
    event Refund(uint256 indexed orderId, address indexed buyer, uint256 amount);

    // --- Constructor ---
    constructor(address _usdc, uint256 _feeBps) Ownable(msg.sender) {
        require(_usdc != address(0), "Invalid USDC address");
        require(_feeBps <= MAX_FEE_BPS, "Fee too high");
        usdc = IERC20(_usdc);
        platformFeeBps = _feeBps;
    }

    // --- Core Functions ---

    /**
     * @notice Buyer calls this to purchase a product. Requires prior USDC approval.
     * @param _seller Seller's wallet address
     * @param _amount USDC amount (6 decimals)
     * @param _productId Off-chain product ID for indexing
     * @return orderId The on-chain order ID (used by off-chain to link DB records)
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
        uint256 sellerAmt = _amount - fee;

        sellerBalances[_seller] += sellerAmt;
        platformBalance += fee;

        orderId = nextOrderId++;
        orders[orderId] = Order({
            buyer: msg.sender,
            seller: _seller,
            amount: _amount,
            sellerAmount: sellerAmt,
            platformFee: fee,
            timestamp: block.timestamp,
            refunded: false
        });

        emit Purchase(orderId, msg.sender, _seller, _amount, sellerAmt, fee, _productId);
    }

    /**
     * @notice Seller withdraws all accumulated earnings
     */
    function withdrawSeller() external nonReentrant {
        uint256 balance = sellerBalances[msg.sender];
        require(balance > 0, "No balance to withdraw");

        sellerBalances[msg.sender] = 0;
        require(usdc.transfer(msg.sender, balance), "Transfer failed");

        emit SellerWithdrawal(msg.sender, balance);
    }

    /**
     * @notice Platform owner withdraws accumulated fees
     */
    function withdrawPlatform(address _to) external onlyOwner nonReentrant {
        require(_to != address(0), "Invalid address");
        uint256 balance = platformBalance;
        require(balance > 0, "No platform balance");

        platformBalance = 0;
        require(usdc.transfer(_to, balance), "Transfer failed");

        emit PlatformWithdrawal(_to, balance);
    }

    /**
     * @notice Owner can refund a buyer (e.g. dispute resolution)
     * @dev C4 fix: check balances before deducting to prevent underflow on already-withdrawn funds
     */
    function refund(uint256 _orderId) external onlyOwner nonReentrant {
        Order storage o = orders[_orderId];
        require(o.buyer != address(0), "Order not found");
        require(!o.refunded, "Already refunded");

        // C4 fix: verify contract has enough balance to refund
        // (seller may have already withdrawn — in that case owner must top-up or handle off-chain)
        require(
            sellerBalances[o.seller] >= o.sellerAmount,
            "Seller already withdrew — fund contract before refunding"
        );
        require(platformBalance >= o.platformFee, "Insufficient platform balance for refund");

        o.refunded = true;

        // Safe deduction — both checked above
        sellerBalances[o.seller] -= o.sellerAmount;
        platformBalance -= o.platformFee;

        require(usdc.transfer(o.buyer, o.amount), "Refund failed");

        emit Refund(_orderId, o.buyer, o.amount);
    }

    // --- Admin ---

    function setFee(uint256 _newFeeBps) external onlyOwner {
        require(_newFeeBps <= MAX_FEE_BPS, "Fee too high");
        uint256 old = platformFeeBps;
        platformFeeBps = _newFeeBps;
        emit FeeUpdated(old, _newFeeBps);
    }

    // --- Views ---

    function getOrder(uint256 _orderId) external view returns (Order memory) {
        return orders[_orderId];
    }
}
