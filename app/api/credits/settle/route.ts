import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { serverCreditService } from "@/lib/credits/server-credit-service";

const SettleSchema = z.object({
  transactionId: z.string().optional(),
  jobId: z.string().optional(),
  userId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SettleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid settlement payload" }, { status: 400 });
    }

    const transaction = await serverCreditService.settleCredits(parsed.data);
    return NextResponse.json({ success: true, transaction });
  } catch (err: any) {
    console.error("[API /api/credits/settle] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to settle credits" },
      { status: 500 }
    );
  }
}
