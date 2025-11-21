"use client";

import Link from "next/link";
import { ReactNode } from "react";

type QuickLinkCardProps = {
  href: string;
  label: string;
  title: string;
  icon?: ReactNode;
  accentColor?: string;
  description?: string;
};

const QuickLinkCard = ({ href, label, title, icon, accentColor = "#08436A", description }: QuickLinkCardProps) => {
  return (
    <Link
      href={href}
      className="group rounded-xl border bg-white shadow-sm p-6 transition hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">{label}</div>
          <div className="text-xl font-semibold">{title}</div>
        </div>
        {icon && (
          <span className="text-2xl" style={{ color: accentColor }}>
            {icon}
          </span>
        )}
      </div>
      {description && (
        <div className="mt-3 text-sm text-gray-600 group-hover:underline" style={{ color: accentColor }}>
          {description}
        </div>
      )}
    </Link>
  );
};

export default QuickLinkCard;


