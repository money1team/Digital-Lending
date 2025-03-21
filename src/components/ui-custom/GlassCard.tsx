
import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "light" | "dark";
  intensity?: "low" | "medium" | "high";
  hoverEffect?: boolean;
  clickable?: boolean;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ 
    className, 
    variant = "light", 
    intensity = "medium", 
    hoverEffect = false, 
    clickable = false,
    children, 
    ...props 
  }, ref) => {
    const getBackdropIntensity = () => {
      const base = variant === "light" ? "bg-white/70" : "bg-slate-900/70";
      
      switch (intensity) {
        case "low":
          return variant === "light" ? "bg-white/40" : "bg-slate-900/40";
        case "high":
          return variant === "light" ? "bg-white/90" : "bg-slate-900/90";
        default:
          return base;
      }
    };

    const getBorderStyle = () => {
      return variant === "light" 
        ? "border border-white/20" 
        : "border border-slate-800/30";
    };

    const getHoverEffect = () => {
      if (!hoverEffect) return "";
      
      return variant === "light"
        ? "hover:bg-white/80 transition-all duration-300 ease-in-out"
        : "hover:bg-slate-900/80 transition-all duration-300 ease-in-out";
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl shadow-sm backdrop-blur-lg",
          getBackdropIntensity(),
          getBorderStyle(),
          getHoverEffect(),
          clickable && "cursor-pointer transform transition-transform duration-300 hover:scale-[1.01] active:scale-[0.99]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };
