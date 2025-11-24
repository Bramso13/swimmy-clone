"use client";

import { ReactNode } from "react";

type StatCardProps = {
  label: ReactNode;
  value: ReactNode;
  helperText?: ReactNode;
  icon?: ReactNode;
  accentColor?: string;
  loading?: boolean;
  loadingLabel?: string;
  className?: string;
};

const StatCard = ({
  label,
  value,
  helperText,
  icon,
  accentColor = "#08436A",
  loading = false,
  loadingLabel = "Chargement...",
  className = "",
}: StatCardProps) => {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          {loading ? (
            <p className="text-2xl font-bold text-gray-400">{loadingLabel}</p>
          ) : (
            <p className="text-3xl font-extrabold" style={{ color: accentColor }}>
              {value}
            </p>
          )}
        </div>
        {icon && <div className="text-4xl">{icon}</div>}
      </div>
      {helperText && <p className="text-xs text-muted-foreground mt-4">{helperText}</p>}
    </div>
  );
};

export default StatCard;


