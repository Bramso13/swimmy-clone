"use client";

import Link from "next/link";
import { ReactNode } from "react";

type DashboardCtaCardProps = {
  href: string;
  label: string;
  buttonColor?: string;
  children?: ReactNode;
  className?: string;
};

const DashboardCtaCard = ({
  href,
  label,
  buttonColor = "#08436A",
  children,
  className = "",
}: DashboardCtaCardProps) => {
  return (
    <div className={`rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm ${className}`}>
      {children && <div className="mb-4 text-sm text-muted-foreground">{children}</div>}
      <Link
        href={href}
        className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white"
        style={{ backgroundColor: buttonColor }}
      >
        {label}
      </Link>
    </div>
  );
};

export default DashboardCtaCard;


