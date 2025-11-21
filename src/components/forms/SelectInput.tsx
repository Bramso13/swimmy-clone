"use client";

import { forwardRef, SelectHTMLAttributes } from "react";

type Option = { value: string; label: string };

type SelectInputProps = SelectHTMLAttributes<HTMLSelectElement> & {
  options: Option[];
};

const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(({ className = "", options, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
});

SelectInput.displayName = "SelectInput";

export default SelectInput;


