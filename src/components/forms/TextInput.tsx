"use client";

import { forwardRef, InputHTMLAttributes } from "react";

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
};

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(({ className = "", error, ...props }, ref) => {
  return (
    <div>
      <input
        ref={ref}
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});

TextInput.displayName = "TextInput";

export default TextInput;


