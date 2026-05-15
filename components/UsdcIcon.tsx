import Image from "next/image";

interface Props {
  size?: number;
  className?: string;
}

export default function UsdcIcon({ size = 16, className }: Props) {
  return (
    <Image
      src="/usdc-logo.png"
      alt=""
      width={size}
      height={size}
      className={className}
      aria-hidden
      style={{ display: "block", flexShrink: 0, objectFit: "contain" }}
    />
  );
}
