import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { serverCreditService } from "@/lib/credits/server-credit-service";

const RefundSchema = z.object({
  transactionId: z.string().optional(),
  jobId: z.string().optional(),
  userId: z.string().optional(),
  reason: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RefundSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid refund payload" }, { status: 400 });
    }

    const transaction = await serverCreditService.refundCredits({
      transactionId: parsed.data.transactionId,
      jobId: parsed.data.jobId,
      userId: parsed.data.userId,
      reason: parsed.data.reason,
    });

    return NextResponse.json({ success: true, transaction });
  } catch (err: any) {
    console.error("[API /api/credits/refund] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to refund credits" },
      { status: 500 }
    );
  }
}
