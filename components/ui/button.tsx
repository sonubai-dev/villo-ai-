import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "glow";
  size?: "sm" | "md" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]";
    
    const variants = {
      default: "bg-sky-500 text-white hover:bg-sky-400 shadow-md shadow-sky-500/20",
      secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700/60",
      outline: "border border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800/80 hover:text-white",
      ghost: "text-slate-300 hover:bg-slate-800/60 hover:text-white",
      destructive: "bg-rose-600 text-white hover:bg-rose-500 shadow-md shadow-rose-600/20",
      glow: "bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 text-white hover:opacity-95 shadow-lg shadow-sky-500/25 border border-white/20",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
      md: "h-10 px-4 text-sm rounded-xl gap-2",
      lg: "h-12 px-6 text-base rounded-xl gap-2.5",
      icon: "h-9 w-9 rounded-xl p-0",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
