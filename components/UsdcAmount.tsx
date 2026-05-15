import UsdcIcon from "./UsdcIcon";
import { formatUsdc } from "../lib/utils";

interface Props {
  value: number | string;
  decimals?: number;
  showLabel?: boolean;
  iconSize?: number;
  className?: string;
  style?: React.CSSProperties;
  amountClassName?: string;
}

export default function UsdcAmount({
  value,
  decimals = 3,
  showLabel = true,
  iconSize = 14,
  className,
  style,
  amountClassName = "mono",
}: Props) {
  const formatted = typeof value === "number" ? formatUsdc(value, decimals) : value;

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        lineHeight: 1,
        ...style,
      }}
    >
      <UsdcIcon size={iconSize} />
      <span className={amountClassName}>{formatted}</span>
      {showLabel && (
        <span style={{ fontSize: "0.72em", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.04em" }}>
          USDC
        </span>
      )}
    </span>
  );
}
