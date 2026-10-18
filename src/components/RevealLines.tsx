"use client";

import { motion, useReducedMotion } from "framer-motion";

export const EASE = [0.16, 0.84, 0.24, 1] as const;

/* Lines rise out of a mask and sharpen from a blur, one after another.
   `on="view"` plays when scrolled into view (once); `on="mount"` plays on load. */
export default function RevealLines({
  lines,
  as = "h2",
  className = "",
  lineClassName,
  on = "view",
  delay = 0,
  play = true,
}: {
  lines: string[];
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  lineClassName?: (i: number) => string;
  on?: "view" | "mount";
  delay?: number;
  /** For `on="mount"`: hold the reveal until this turns true. */
  play?: boolean;
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  const trigger = on === "view"
    ? { whileInView: "show", viewport: { once: true, amount: 0.5 } }
    : { animate: play ? "show" : "hidden" };
  return (
    <Tag
      className={className}
      initial={reduce ? false : "hidden"}
      {...trigger}
      transition={{ staggerChildren: 0.09, delayChildren: delay }}
    >
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <motion.span
            className={`block ${lineClassName?.(i) ?? ""}`}
            variants={{
              hidden: { y: "108%", opacity: 0, filter: "blur(10px)" },
              show: { y: "0%", opacity: 1, filter: "blur(0px)", transition: { duration: 1.15, ease: EASE } },
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
