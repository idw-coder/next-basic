import { type ReactNode } from "react";

interface SectionHeadingProps {
  children: ReactNode;
  subtitle?: string;
  center?: boolean;
  /** "lg" for page-level headings, "sm" for sub-section headings */
  size?: "sm" | "lg";
  as?: "h1" | "h2" | "h3";
  icon?: ReactNode;
  /** "frame" wraps the text in the logo-style broken round frame */
  variant?: "plain" | "frame";
  className?: string;
}

export function SectionHeading({
  children,
  subtitle,
  center = true,
  size = "lg",
  as: Tag = "h2",
  icon,
  variant = "plain",
  className,
}: SectionHeadingProps) {
  const lg = size === "lg";
  const framed = variant === "frame";

  // 枠付きはロゴに合わせて丸ゴシック400。Dela Gothic Oneのような黒々しさは枠が担う
  const headingClass = framed
    ? [
        lg ? "text-lg md:text-2xl" : "text-base md:text-lg",
        "logo-frame font-round text-ink",
        "inline-flex items-center gap-2 rounded-[1.75rem]",
        lg ? "px-5 py-2 md:px-8 md:py-2.5" : "px-4 py-1.5 md:px-6 md:py-2",
        "tracking-[0.02em] leading-[1.5] text-left",
      ].join(" ")
    : [
        lg ? "text-xl font-black md:text-2xl" : "text-lg font-black",
        "font-display text-ink",
        icon && "flex items-center gap-2",
        icon && center && "justify-center",
      ]
        .filter(Boolean)
        .join(" ");

  return (
    <div
      // 枠付きは影が5px下にはみ出すぶん、下に余白を足して詰まって見えないようにする
      className={[center && "text-center", framed && "pb-2", className]
        .filter(Boolean)
        .join(" ")}
    >
      <Tag className={headingClass}>
        {icon}
        {children}
      </Tag>
      {subtitle && (
        <p
          className={[
            "text-sm text-muted-foreground",
            // 枠の影が5px下に出るぶん、サブタイトルは大きめに離す
            framed ? "mt-5" : "mt-1",
          ].join(" ")}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
