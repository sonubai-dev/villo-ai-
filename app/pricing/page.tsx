"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { 
  Check, 
  Sparkles, 
  Zap, 
  HelpCircle, 
  ChevronDown, 
  ArrowRight,
  Video,
  ShieldCheck,
  Building,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";

const PRICING_TIERS = [
  {
    name: "Free Starter",
    id: "free",
    desc: "For exploring AI avatars, motion presets, and fast video prototyping.",
    monthlyPrice: 0,
    annualPrice: 0,
    credits: "50 Credits / mo",
    features: [
      "50 Generation credits monthly",
      "720p HD export resolution",
      "Access to 8 AI Presenter avatars",
      "Standard camera motion presets",
      "Web speech preview",
      "Community support",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Creator",
    id: "creator",
    desc: "Perfect for content creators, solo marketers, and social media managers.",
    monthlyPrice: 19,
    annualPrice: 15,
    credits: "500 Credits / mo",
    features: [
      "500 Generation credits monthly",
      "1080p Full HD video exports",
      "All 9 Motion presets & camera paths",
      "Full AI Avatar & Voice library",
      "Custom Brand Kit & logo overlay",
      "Karaoke subtitle animations",
      "No Vilo watermark",
      "Standard email support",
    ],
    cta: "Get Creator Plan",
    popular: true,
  },
  {
    name: "Pro Studio",
    id: "pro",
    desc: "For creative agencies, high-volume production teams, and educators.",
    monthlyPrice: 49,
    annualPrice: 39,
    credits: "2,000 Credits / mo",
    features: [
      "2,000 Generation credits monthly",
      "4K Ultra HD video rendering",
      "Priority cloud rendering queue",
      "Custom Voice Cloning simulation",
      "Unlimited Brand Kits & fonts",
      "Batch scene & slide import (PPT/PDF)",
      "Image Splitter multi-section auto-crops",
      "Dedicated priority support",
    ],
    cta: "Get Pro Studio",
    popular: false,
  },
  {
    name: "Enterprise",
    id: "enterprise",
    desc: "For enterprise brands requiring custom AI avatars, SSO, and dedicated pipelines.",
    monthlyPrice: 149,
    annualPrice: 119,
    credits: "Unlimited Custom",
    features: [
      "Custom unlimited credits pool",
      "Custom brand 3D photo avatar training",
      "Dedicated private GPU rendering cluster",
      "REST API & Webhook access",
      "SAML / SSO authentication",
      "Custom SLAs & 99.9% uptime guarantee",
      "Dedicated account manager",
    ],
    cta: "Contact Enterprise",
    popular: false,
  },
];

const COMPARISON_MATRIX = [
  { feature: "Monthly Video Credits", free: "50", creator: "500", pro: "2,000", enterprise: "Unlimited" },
  { feature: "Export Max Resolution", free: "720p HD", creator: "1080p FHD", pro: "4K UHD", enterprise: "4K ProRes" },
  { feature: "Camera Motion Presets", free: "Basic (4)", creator: "All 9 Presets", pro: "All 9 + Keyframing", enterprise: "Custom Curves" },
  { feature: "AI Presenter Avatars", free: "8 Standard", creator: "8+ Standard", pro: "Full Library", enterprise: "Custom 3D Clone" },
  { feature: "Voiceover Synthesis", free: "Standard TTS", creator: "Neural Voices", pro: "Neural + Pitch/Rate", enterprise: "Voice Cloning" },
  { feature: "Brand Kits & Logos", free: "—", creator: "1 Kit", pro: "Unlimited", enterprise: "Multi-workspace" },
  { feature: "Slide & Doc Import (PPT/PDF)", free: "—", creator: "Up to 5 slides", pro: "Unlimited slides", enterprise: "Batch Pipeline" },
  { feature: "Image Splitter Engine", free: "—", creator: "Included", pro: "Included", enterprise: "Included" },
  { feature: "Watermark Free", free: "No", creator: "Yes", pro: "Yes", enterprise: "Yes" },
  { feature: "Commercial Rights", free: "Personal", creator: "Commercial", pro: "Commercial", enterprise: "Enterprise License" },
];

const FAQS = [
  {
    q: "How do generation credits work?",
    a: "1 credit equates to approximately 1 second of rendered AI video or speech generation. Unused credits rollover for up to 60 days on Creator and Pro plans.",
  },
  {
    q: "Can I use my own images and presentation slides?",
    a: "Yes! Vilo allows you to upload photos, PPT presentations, PDF documents, or generate visuals directly via AI prompt within the editor.",
  },
  {
    q: "How does the Image → Storyboard → Motion pipeline operate?",
    a: "You start by uploading or generating images, structure them into storyboard scenes, apply motion presets (cinematic push, pans, zooms), synchronize speech narration, and export high-definition video.",
  },
  {
    q: "Can I switch plans or cancel anytime?",
    a: "Yes, you can upgrade, downgrade, or cancel your subscription at any time directly from the Workspace Settings page.",
  },
];

export default function PricingPage() {
  const router = useRouter();
  const loginAsDemo = useAppStore((s) => s.loginAsDemo);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handlePlanSelect = (tierId: string) => {
    loginAsDemo();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-16">
        {/* Title Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-3.5 py-1 text-xs font-semibold text-sky-400 border border-sky-500/20">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Simple, Transparent Creator Pricing</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Supercharge Your Video Creation
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Choose the plan that fits your production volume. All plans include access to our 5 creation modes and timeline editor.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <div className="flex items-center rounded-2xl bg-slate-900 p-1.5 border border-slate-800">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${
                  billingCycle === "monthly" ? "bg-slate-800 text-white shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${
                  billingCycle === "annual" ? "bg-sky-500 text-white shadow-md shadow-sky-500/20" : "text-slate-400 hover:text-white"
                }`}
              >
                <span>Annual Billing</span>
                <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px] font-extrabold">Save 20%</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRICING_TIERS.map((tier) => {
            const price = billingCycle === "annual" ? tier.annualPrice : tier.monthlyPrice;

            return (
              <div
                key={tier.id}
                className={`relative flex flex-col justify-between rounded-3xl border p-6 transition-all duration-300 backdrop-blur-xl ${
                  tier.popular
                    ? "border-sky-500 bg-gradient-to-b from-sky-950/40 via-slate-900 to-slate-900 shadow-2xl shadow-sky-500/10 ring-1 ring-sky-500/50"
                    : "border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-lg">
                    Most Popular
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                    <p className="text-xs text-slate-400 min-h-[32px] mt-1">{tier.desc}</p>
                  </div>

                  <div className="py-2 border-y border-slate-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-extrabold text-white">${price}</span>
                      <span className="text-xs text-slate-400 font-medium">/ month</span>
                    </div>
                    <span className="text-[11px] font-semibold text-sky-400">{tier.credits}</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {tier.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 text-sky-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-850">
                  <Button
                    onClick={() => handlePlanSelect(tier.id)}
                    variant={tier.popular ? "glow" : "secondary"}
                    size="md"
                    className="w-full font-bold"
                  >
                    {tier.cta}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Matrix Table */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="text-left">
            <h2 className="text-xl font-bold text-white">Full Feature Comparison</h2>
            <p className="text-xs text-slate-400">Detailed breakdown across all subscription tiers.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="py-3 px-4">Feature</th>
                  <th className="py-3 px-4">Free Starter</th>
                  <th className="py-3 px-4 text-sky-400">Creator</th>
                  <th className="py-3 px-4">Pro Studio</th>
                  <th className="py-3 px-4">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-300">
                {COMPARISON_MATRIX.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">{row.feature}</td>
                    <td className="py-3.5 px-4 text-slate-400">{row.free}</td>
                    <td className="py-3.5 px-4 font-semibold text-sky-300">{row.creator}</td>
                    <td className="py-3.5 px-4">{row.pro}</td>
                    <td className="py-3.5 px-4">{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-400">Everything you need to know about Vilo billing and creation limits.</p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;

              return (
                <div
                  key={idx}
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 cursor-pointer hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">{faq.q}</h3>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180 text-sky-400" : ""}`} />
                  </div>
                  {isOpen && (
                    <p className="mt-2 text-xs text-slate-400 leading-relaxed animate-in fade-in duration-200">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
