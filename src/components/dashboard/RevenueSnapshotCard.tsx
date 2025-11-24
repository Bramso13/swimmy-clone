"use client";

import { ReactNode } from "react";

type RevenueSnapshotCardProps = {
  label: string;
  period: string;
  value: ReactNode;
  hint?: string;
  badge?: string;
};

const RevenueSnapshotCard = ({ label, period, value, hint, badge }: RevenueSnapshotCardProps) => {
  return (
    <div className="rounded-2xl border bg-white shadow-sm p-5 flex flex-col gap-3">
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500">{period}</p>
        <p className="text-lg font-semibold">{label}</p>
      </div>
      <div className="text-3xl font-extrabold" style={{ color: "#08436A" }}>
        {value}
      </div>
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      {badge && (
        <span className="inline-flex w-fit items-center gap-1 rounded-full border border-dashed border-gray-300 px-2 py-1 text-xs text-gray-500">
          {badge}
        </span>
      )}
    </div>
  );
};

export default RevenueSnapshotCard;


