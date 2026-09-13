"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Sparkles, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";

export function PricingSection() {
  const router = useRouter();
  const loginAsDemo = useAppStore((s) => s.loginAsDemo);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  const handleSelectPlan = (tier: string) => {
    loginAsDemo();
    router.push("/dashboard");
  };

  const PLANS = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      desc: "Perfect for testing the waters and creating quick test videos.",
      credits: "50 credits / mo",
      features: [
        "3 video exports per month",
        "720p HD resolution",
        "Standard AI avatars",
        "Community voice catalog",
        "Vilo watermark",
      ],
      cta: "Get Started Free",
      highlighted: false,
      buttonVariant: "secondary" as const,
    },
    {
      name: "Creator",
      price: billingPeriod === "monthly" ? "$19" : "$15",
      period: "/month",
      desc: "Designed for content creators, influencers, and small teams.",
      credits: "500 credits / mo",
      features: [
        "Unlimited video projects",
        "1080p Full HD resolution",
        "No Vilo watermark",
        "All 8+ premium avatars",
        "Multi-accent voices & speed controls",
        "Image & slide extraction",
      ],
      cta: "Start Free Creator Trial",
      highlighted: true,
      buttonVariant: "glow" as const,
      badge: "Most Popular",
    },
    {
      name: "Pro",
      price: billingPeriod === "monthly" ? "$49" : "$39",
      period: "/month",
      desc: "For growing businesses, real estate agents, and marketing agencies.",
      credits: "2,000 credits / mo",
      features: [
        "Everything in Creator",
        "Custom Brand Kit & logos",
        "Priority fast rendering queue",
        "Custom image splitter studio",
        "Advanced camera & motion effects",
        "Commercial usage rights",
      ],
      cta: "Upgrade to Pro",
      highlighted: false,
      buttonVariant: "secondary" as const,
    },
    {
      name: "Business",
      price: "Custom",
      period: "annual billing",
      desc: "For enterprise organizations requiring dedicated avatars and team seats.",
      credits: "Custom credits",
      features: [
        "Everything in Pro",
        "Custom bespoke avatar training",
        "Voice cloning integration",
        "Team workspaces & roles",
        "Dedicated account manager",
        "Custom SLA & API access",
      ],
      cta: "Contact Enterprise",
      highlighted: false,
      buttonVariant: "outline" as const,
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-slate-950 border-t border-slate-900 relative">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <Badge variant="glow">Transparent Pricing</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Simple plans for creators &amp; teams
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Choose the plan that fits your production volume. Upgrade or downgrade anytime.
          </p>

          {/* Billing Switcher */}
          <div className="inline-flex items-center rounded-xl bg-slate-900 p-1 border border-slate-800 mt-4">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
                billingPeriod === "monthly" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5 ${
                billingPeriod === "yearly" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Annual Billing</span>
              <span className="rounded-full bg-emerald-500/20 text-emerald-400 px-2 py-0.2 text-[10px] font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map((plan, idx) => (
            <div
              key={idx}
              className={`relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-300 ${
                plan.highlighted
                  ? "border-sky-500/60 bg-gradient-to-b from-sky-950/40 via-slate-900/90 to-slate-900 shadow-2xl shadow-sky-500/15 ring-1 ring-sky-500/30"
                  : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="glow" className="bg-sky-500 text-white border-none shadow-md">
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-xs text-slate-400 mb-4 min-h-[32px]">{plan.desc}</p>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-xs text-slate-400 font-medium">{plan.period}</span>
                </div>

                <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950/80 px-2.5 py-1 text-xs font-semibold text-sky-400 mb-6 border border-slate-800">
                  <Zap className="h-3 w-3" />
                  <span>{plan.credits}</span>
                </div>

                <div className="space-y-2.5 border-t border-slate-850 pt-5 mb-6">
                  {plan.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <Check className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => handleSelectPlan(plan.name)}
                variant={plan.buttonVariant}
                size="md"
                className="w-full text-xs font-semibold"
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
