import { NextResponse } from "next/server";
import { DEFAULT_PRICING_CONFIG } from "@/lib/credits/pricing-config";

export async function GET() {
  return NextResponse.json({
    success: true,
    pricing: DEFAULT_PRICING_CONFIG,
  });
}
