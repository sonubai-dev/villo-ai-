import Link from "next/link";
import { Film, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 px-4 text-center">
      <div className="space-y-6 max-w-md">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
          <Film className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-white font-mono">404</h1>
          <h2 className="text-xl font-semibold text-slate-200">Scene Not Found</h2>
          <p className="text-sm text-slate-400">
            The studio project, scene, or media asset you requested does not exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="glow" className="w-full gap-2">
              <Home className="h-4 w-4" />
              <span>Back to Studio</span>
            </Button>
          </Link>
          <Link href="/projects" className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>View Projects</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
