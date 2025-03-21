
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps extends React.ComponentProps<typeof Button> {
  animateOnHover?: boolean;
  pulseEffect?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  loading?: boolean;
}

const AnimatedButton = ({
  children,
  className,
  variant = "default",
  size = "default",
  animateOnHover = true,
  pulseEffect = false,
  icon,
  iconPosition = "left",
  loading = false,
  ...props
}: AnimatedButtonProps) => {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "relative overflow-hidden group",
        animateOnHover && 
          "transform transition-all duration-300 hover:shadow-md hover:translate-y-[-2px] active:translate-y-[1px]",
        pulseEffect && !loading && "animate-pulse-subtle",
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Processing...</span>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          {icon && iconPosition === "left" && <span className="mr-2">{icon}</span>}
          {children}
          {icon && iconPosition === "right" && <span className="ml-2">{icon}</span>}
        </div>
      )}
      <div className="absolute inset-0 w-full h-full transition-all duration-300 bg-white/0 group-hover:bg-white/10 rounded-md"></div>
    </Button>
  );
};

export { AnimatedButton };
