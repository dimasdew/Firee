import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Products",
  description: "Explore smart contracts, DApp templates, UI kits, and developer tools on Firee marketplace.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
