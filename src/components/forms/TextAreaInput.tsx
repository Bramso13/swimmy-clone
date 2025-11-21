"use client";

import { forwardRef, TextareaHTMLAttributes } from "react";

type TextAreaInputProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: string;
};

const TextAreaInput = forwardRef<HTMLTextAreaElement, TextAreaInputProps>(({ className = "", error, ...props }, ref) => {
  return (
    <div>
      <textarea
        ref={ref}
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});

TextAreaInput.displayName = "TextAreaInput";

export default TextAreaInput;


