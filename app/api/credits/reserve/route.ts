import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { serverCreditService } from "@/lib/credits/server-credit-service";
import { CreditActionType } from "@/lib/credits/pricing-config";
import { assertAuthorizedUser } from "@/lib/auth/server-auth";

const ReserveSchema = z.object({
  userId: z.string().min(1),
  actionType: z.enum([
    "avatar_video",
    "image_video",
    "presentation_video",
    "script_generation",
    "image_splitter",
    "signup_grant",
    "plan_grant",
    "manual_adjustment",
  ]),
  jobId: z.string().optional(),
  idempotencyKey: z.string().min(1),
  customCost: z.number().optional(),
  reason: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ReserveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid reservation request", details: parsed.error.format() },
        { status: 400 }
      );
    }

    // IDOR Protection: Verify caller is authorized for the target userId
    await assertAuthorizedUser(req, parsed.data.userId);

    const transaction = await serverCreditService.reserveCredits({
      userId: parsed.data.userId,
      actionType: parsed.data.actionType as CreditActionType,
      jobId: parsed.data.jobId,
      idempotencyKey: parsed.data.idempotencyKey,
      customCost: parsed.data.customCost,
      reason: parsed.data.reason,
    });

    return NextResponse.json({ success: true, transaction });
  } catch (err: any) {
    const isForbidden = err.message?.includes("FORBIDDEN");
    const isUnauthorized = err.message?.includes("UNAUTHORIZED");
    const status = isForbidden ? 403 : isUnauthorized ? 401 : 400;

    console.error("[API /api/credits/reserve] Error:", err.message);
    return NextResponse.json(
      { error: err.message || "Credit reservation failed" },
      { status }
    );
  }
}
