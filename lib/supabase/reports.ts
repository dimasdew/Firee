import { createClient } from "./client";

export type ReportReason = "copyright" | "malware" | "scam" | "inappropriate" | "other";

export async function reportProduct(
  productId: string,
  reporterId: string,
  reason: ReportReason,
  details?: string
): Promise<void> {
  const { error } = await createClient()
    .from("reports")
    .insert({
      product_id: productId,
      reporter_id: reporterId,
      reason,
      details: details || null,
      status: "pending",
    });
  if (error) throw error;
}

export async function hasReported(productId: string, reporterId: string): Promise<boolean> {
  const { data } = await createClient()
    .from("reports")
    .select("id")
    .eq("product_id", productId)
    .eq("reporter_id", reporterId)
    .limit(1);
  return (data?.length ?? 0) > 0;
}
