"use client";

import { ReactNode } from "react";

type SectionIntroProps = {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
};

const SectionIntro = ({ eyebrow, title, description, className = "mb-4" }: SectionIntroProps) => {
  return (
    <div className={className}>
      <p className="text-sm text-muted-foreground uppercase tracking-wide">{eyebrow}</p>
      <h2 className="text-xl font-semibold mt-1">{title}</h2>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
  );
};

export default SectionIntro;


