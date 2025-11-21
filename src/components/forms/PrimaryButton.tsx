"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

const PrimaryButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-lg px-4 py-3 font-medium text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 ${className}`}
        style={{ backgroundColor: "var(--brand-blue)" }}
        {...props}
      >
        {children}
      </button>
    );
  }
);

PrimaryButton.displayName = "PrimaryButton";

export default PrimaryButton;


