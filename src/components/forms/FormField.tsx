"use client";

import { ReactNode } from "react";

type FormFieldProps = {
  label: ReactNode;
  htmlFor: string;
  hint?: ReactNode;
  children: ReactNode;
};

const FormField = ({ label, htmlFor, hint, children }: FormFieldProps) => {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
};

export default FormField;


