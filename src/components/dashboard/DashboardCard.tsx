"use client";

import { ReactNode } from "react";

type DashboardCardProps = {
  label: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
};

const DashboardCard = ({ label, title, description, footer }: DashboardCardProps) => {
  return (
    <div className="rounded-xl border bg-white shadow-sm p-5 flex flex-col gap-3">
      <div className="text-xs uppercase text-gray-500">{label}</div>
      <div className="text-2xl font-bold">{title}</div>
      {description && <div className="text-sm text-muted-foreground">{description}</div>}
      {footer && <div className="mt-2">{footer}</div>}
    </div>
  );
};

export default DashboardCard;


