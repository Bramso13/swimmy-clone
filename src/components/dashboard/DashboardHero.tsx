"use client";

import { ReactNode } from "react";

type DashboardHeroProps = {
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  gradient?: string;
  className?: string;
};

const DashboardHero = ({
  eyebrow,
  title,
  description,
  gradient = "linear-gradient(90deg, #08436A, #4f46e5)",
  className = "mb-8",
}: DashboardHeroProps) => {
  return (
    <div className={className}>
      <p className="text-sm text-muted-foreground uppercase tracking-wide">{eyebrow}</p>
      <h1 className="text-3xl font-extrabold tracking-tight mb-2">
        <span className="bg-clip-text text-transparent" style={{ backgroundImage: gradient }}>
          {title}
        </span>
      </h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default DashboardHero;


