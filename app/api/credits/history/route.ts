import { NextRequest, NextResponse } from "next/server";
import { serverCreditService } from "@/lib/credits/server-credit-service";
import { assertAuthorizedUser } from "@/lib/auth/server-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedUserId = searchParams.get("userId") || undefined;
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    // IDOR Protection: Verify caller is authorized for the requested userId
    const auth = await assertAuthorizedUser(req, requestedUserId);
    const targetUid = requestedUserId || auth.uid;

    const transactions = await serverCreditService.getUserTransactions(targetUid, limit);

    return NextResponse.json({
      success: true,
      userId: targetUid,
      transactions,
    });
  } catch (err: any) {
    const isForbidden = err.message?.includes("FORBIDDEN");
    const isUnauthorized = err.message?.includes("UNAUTHORIZED");
    const status = isForbidden ? 403 : isUnauthorized ? 401 : 500;

    return NextResponse.json(
      { error: err.message || "Failed to fetch credit transactions" },
      { status }
    );
  }
}
