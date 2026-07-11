import { type ReactNode } from "react";

import { TriBar } from "@/components/TriBar";

interface SectionHeadingProps {
  children: ReactNode;
  subtitle?: string;
  center?: boolean;
  /** "lg" for page-level headings, "sm" for sub-section headings */
  size?: "sm" | "lg";
  as?: "h1" | "h2" | "h3";
  icon?: ReactNode;
  className?: string;
}

export function SectionHeading({
  children,
  subtitle,
  center = true,
  size = "lg",
  as: Tag = "h2",
  icon,
  className,
}: SectionHeadingProps) {
  const lg = size === "lg";

  const headingClass = [
    lg ? "text-xl font-black md:text-2xl" : "text-lg font-black",
    "text-ink",
    icon && "flex items-center gap-2",
    icon && center && "justify-center",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={[center && "text-center", className]
        .filter(Boolean)
        .join(" ")}
    >
      <Tag className={headingClass}>
        {icon}
        {children}
      </Tag>
      <TriBar
        size={lg ? "md" : "sm"}
        className={[lg ? "mt-2.5" : "mt-1.5", center && "justify-center"]
          .filter(Boolean)
          .join(" ")}
      />
      {subtitle && (
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      )}
    </div>
  );
}
