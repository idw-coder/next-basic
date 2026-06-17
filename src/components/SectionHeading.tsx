import { type ReactNode } from "react";

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
  const dotSize = lg ? "w-5 h-1.5" : "w-4 h-1";

  const headingClass = [
    lg ? "text-xl font-extrabold md:text-2xl" : "text-lg font-bold",
    "text-foreground",
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
      <div
        className={[
          "flex gap-1",
          lg ? "mt-2.5" : "mt-1.5",
          center && "justify-center",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span className={`${dotSize} rounded-full bg-[#df796b]`} />
        <span className={`${dotSize} rounded-full bg-[#2f86c9]`} />
        <span className={`${dotSize} rounded-full bg-[#f3c875]`} />
      </div>
      {subtitle && (
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      )}
    </div>
  );
}
