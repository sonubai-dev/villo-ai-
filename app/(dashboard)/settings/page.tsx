"use client";

import React, { useState, useEffect } from "react";
import { 
  Settings, 
  User, 
  Zap, 
  Key, 
  ShieldCheck, 
  Check, 
  RotateCcw, 
  Sparkles,
  Database,
  Cloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { checkFirebaseHealth, FirebaseHealthStatus } from "@/lib/firebase/health";

export default function SettingsPage() {
  const { user, updateUser } = useAppStore();

  const [name, setName] = useState(user?.name || "Alex Rivera");
  const [email, setEmail] = useState(user?.email || "alex.rivera@vilo.ai");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [healthStatus, setHealthStatus] = useState<FirebaseHealthStatus | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  useEffect(() => {
    runHealthCheck();
  }, []);

  const runHealthCheck = async () => {
    setIsCheckingHealth(true);
    const result = await checkFirebaseHealth();
    setHealthStatus(result);
    setIsCheckingHealth(false);
  };

  const handleSaveProfile = () => {
    updateUser({ name, email });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleResetDemo = () => {
    if (confirm("Reset demo data and reload fresh seed projects?")) {
      localStorage.removeItem("vilo-ai-storage-v2");
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold mb-1">
            <Settings className="h-4 w-4" />
            <span>Workspace Settings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Settings &amp; Infrastructure</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage your creator profile, generation credits, and Firebase backend status.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Firebase Backend & Connection Health Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-5 shadow-xl backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="h-4 w-4 text-sky-400" />
                <span>Firebase Backend Foundation</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time health status of Auth, Firestore, and Cloud Storage adapters.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant={healthStatus?.isConfigured ? "success" : "secondary"}
                className="capitalize text-[11px] font-mono"
              >
                {healthStatus?.mode === "production-firebase" ? "Production Firebase" : "Local Mock Mode"}
              </Badge>

              <Button
                variant="outline"
                size="sm"
                onClick={runHealthCheck}
                disabled={isCheckingHealth}
                className="h-7 px-2.5 text-xs border-slate-800 gap-1"
              >
                <RefreshCw className={`h-3 w-3 ${isCheckingHealth ? "animate-spin text-sky-400" : ""}`} />
                <span>{isCheckingHealth ? "Probing..." : "Test Connection"}</span>
              </Button>
            </div>
          </div>

          {/* Diagnostic Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-medium">Firebase Auth</span>
                {healthStatus?.authReady ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <span className="text-[10px] text-slate-500 font-mono">Mock</span>
                )}
              </div>
              <p className="text-xs font-bold text-white">
                {healthStatus?.authReady ? "Ready & Observer Active" : "Local Session Provider"}
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-medium">Cloud Firestore</span>
                {healthStatus?.firestoreReady ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <span className="text-[10px] text-slate-500 font-mono">Mock</span>
                )}
              </div>
              <p className="text-xs font-bold text-white">
                {healthStatus?.firestoreReady ? "Connected & Indexed" : "Zustand Local Cache"}
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-medium">Cloud Storage</span>
                {healthStatus?.storageReady ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <span className="text-[10px] text-slate-500 font-mono">Mock</span>
                )}
              </div>
              <p className="text-xs font-bold text-white">
                {healthStatus?.storageReady ? "Bucket Initialized" : "Local Object URLs"}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center justify-between">
            <span className="truncate">{healthStatus?.message || "Diagnosing backend connectivity..."}</span>
            <span className="text-sky-400 font-bold ml-2 shrink-0">{healthStatus?.latencyMs}ms</span>
          </div>
        </div>

        {/* Profile Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <User className="h-4 w-4 text-sky-400" />
              <span>Creator Profile</span>
            </h2>
            <Badge variant="glow" className="capitalize">{user?.tier || "creator"} Plan</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Full Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Email Address</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSaveProfile} variant="glow" size="sm" className="gap-1.5 font-semibold">
              {savedSuccess ? <Check className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
              <span>{savedSuccess ? "Saved!" : "Save Profile"}</span>
            </Button>
          </div>
        </div>

        {/* Credits & Subscription Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400 fill-amber-400" />
              <span>Generation Credits &amp; Plan</span>
            </h2>
            <span className="text-xs font-bold text-sky-400">{user?.credits ?? 85} Credits Remaining</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <span className="text-xs text-slate-400">Current Plan</span>
              <p className="text-lg font-bold text-white mt-1 capitalize">{user?.tier || "Creator"}</p>
              <span className="text-[11px] text-emerald-400 font-semibold">$19 / month</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <span className="text-xs text-slate-400">Monthly Allowance</span>
              <p className="text-lg font-bold text-white mt-1">500 Credits</p>
              <span className="text-[11px] text-slate-400">Refills on 1st of month</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <span className="text-xs text-slate-400">Rendering Resolution</span>
              <p className="text-lg font-bold text-white mt-1">1080p Full HD</p>
              <span className="text-[11px] text-sky-400 font-semibold">No Watermark</span>
            </div>
          </div>
        </div>

        {/* Data Reset */}
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white">Reset Local Workspace Data</h3>
            <p className="text-xs text-slate-400">
              Clear saved localStorage state and restore original seed projects &amp; templates.
            </p>
          </div>
          <Button onClick={handleResetDemo} variant="destructive" size="sm" className="gap-1.5 shrink-0">
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Demo State</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
