"use client";

import Link from "next/link";
import { ReactNode } from "react";

export type MenuEntry = {
  key: string;
  label: ReactNode;
  href?: string;
  icon?: ReactNode;
  variant?: "default" | "blue" | "indigo" | "emerald" | "purple";
  type?: "link" | "button";
  onClick?: (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
};

type MenuSectionProps = {
  items: MenuEntry[];
  onNavigate?: () => void;
};

const variantClasses: Record<NonNullable<MenuEntry["variant"]>, string> = {
  default: "hover:bg-muted",
  blue: "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500",
  indigo: "bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500",
  emerald: "bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500",
  purple: "bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500",
};

const baseClasses = "block px-4 py-3 rounded-md transition-colors";

const MenuSection = ({ items, onNavigate }: MenuSectionProps) => {
  if (!items.length) return null;

  return (
    <>
      {items.map((item) => {
        const content = (
          <span className="inline-flex items-center gap-2">
            {item.icon && <span>{item.icon}</span>}
            <span>{item.label}</span>
          </span>
        );
        const variant = item.variant ?? "default";
        const className = `${baseClasses} ${variantClasses[variant] ?? variantClasses.default}`;

        const handleClick = (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
          item.onClick?.(event);
          onNavigate?.();
        };

        if (item.type === "button") {
          return (
            <li key={item.key}>
              <button onClick={handleClick} className={`w-full text-left ${className}`}>
                {content}
              </button>
            </li>
          );
        }

        if (!item.href) return null;

        return (
          <li key={item.key}>
            <Link href={item.href} onClick={handleClick} className={className}>
              {content}
            </Link>
          </li>
        );
      })}
    </>
  );
};

export default MenuSection;


