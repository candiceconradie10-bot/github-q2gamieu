import React from "react";

interface PremiumLoaderProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "minimal" | "elegant";
  text?: string;
}

export function PremiumLoader({
  size = "md",
  variant = "default",
  text = "Loading...",
}: PremiumLoaderProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const containerClasses = {
    sm: "p-4",
    md: "p-8",
    lg: "p-12",
  };

  if (variant === "minimal") {
    return (
      <div className="flex items-center justify-center">
        <div
          className={`${sizeClasses[size]} border-2 border-brand-red/30 border-t-brand-red rounded-full animate-spin`}
        />
      </div>
    );
  }

  if (variant === "elegant") {
    return (
      <div
        className={`flex flex-col items-center justify-center space-y-4 ${containerClasses[size]}`}
      >
        <div className="relative">
          <div
            className={`${sizeClasses[size]} border-2 border-brand-red/20 rounded-full animate-pulse`}
          />
          <div
            className={`absolute inset-0 ${sizeClasses[size]} border-2 border-transparent border-t-brand-red rounded-full animate-spin`}
          />
        </div>
        {text && (
          <p className="text-sm text-muted-foreground font-medium animate-pulse">
            {text}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center space-y-6 ${containerClasses[size]}`}
    >
      {/* Main loader */}
      <div className="relative">
        {/* Outer ring */}
        <div
          className={`${sizeClasses[size]} border-4 border-white/10 rounded-full`}
        />

        {/* Spinning ring */}
        <div
          className={`absolute inset-0 ${sizeClasses[size]} border-4 border-transparent border-t-brand-red border-r-brand-red/50 rounded-full animate-spin`}
        />

        {/* Inner pulsing circle */}
        <div className="absolute inset-2 bg-gradient-to-br from-brand-red/40 to-red-600/40 rounded-full animate-pulse" />

        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-brand-red rounded-full animate-ping" />

        {/* Glow effect */}
        <div
          className={`absolute -inset-2 ${sizeClasses[size]} bg-gradient-to-br from-brand-red/20 to-red-600/20 rounded-full blur-md animate-breathe`}
        />
      </div>

      {/* Loading text */}
      {text && (
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-white">{text}</p>
          <div className="flex space-x-1 justify-center">
            <div className="w-2 h-2 bg-brand-red rounded-full animate-bounce" />
            <div
              className="w-2 h-2 bg-brand-red rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            />
            <div
              className="w-2 h-2 bg-brand-red rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default PremiumLoader;
