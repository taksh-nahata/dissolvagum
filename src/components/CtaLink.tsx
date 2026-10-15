import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Variant = "primary" | "text" | "light" | "light-outline" | "text-light";

const solid: Record<string, string> = {
  primary: "bg-[#12261d] text-white hover:bg-[#1f5133] focus-visible:ring-[#1f5133]",
  light: "bg-[#e8f3ec] text-[#0e1a17] hover:bg-mint focus-visible:ring-mint",
  "light-outline": "border border-white/40 text-[#e8f3ec] hover:border-white hover:bg-white/10 focus-visible:ring-mint",
};

/** Solid button with an arrow, or a plain underlined text link. "light" variants sit on dark sections. */
export default function CtaLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
}) {
  if (variant === "text" || variant === "text-light") {
    return (
      <Link
        href={href}
        className={`py-3 text-[15px] font-bold underline decoration-2 underline-offset-[6px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          variant === "text-light" ? "text-[#e8f3ec] hover:text-mint" : "hover:text-primary"
        }`}
      >
        {children}
      </Link>
    );
  }
  return (
    <Link
      href={href}
      className={`group inline-flex h-12 items-center gap-3 rounded-lg px-6 text-[15px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${solid[variant]}`}
    >
      {children}
      <ArrowRight size={18} strokeWidth={2} className="transition-transform duration-200 group-hover:translate-x-1" />
    </Link>
  );
}
