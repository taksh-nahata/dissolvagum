"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import RevealLines, { EASE } from "@/components/RevealLines";

/* One page for every way to reach the team. The switch picks which form loads;
   ?form=support|business|question links straight to one. */

const FORMS = {
  support: {
    label: "Support it",
    intro: "Want to see DissolvaGum happen, or help fund it? Tell us how you would like to help.",
    src: "https://forms.zohopublic.com/teamdisso1/form/SupportInterest/formperma/8VXk4nDXb374KAF9erP_ihdgGGdu3p2m3MeLDoaDWJs?zf_rszfm=1",
    height: 560,
  },
  business: {
    label: "Partner as a business",
    intro: "Retailer or business? Tell us about you, and we will reach out if the project moves forward.",
    src: "https://forms.zohopublic.com/teamdisso1/form/BusinessInterest/formperma/2mmQzb-YZzPHiR6ANCyB212NKUA9T0umHk-68RHsBxw?zf_rszfm=1",
    height: 620,
  },
  question: {
    label: "Ask a question",
    intro: "Anything else. The team reads every message.",
    src: "https://forms.zohopublic.com/teamdisso1/form/ContactUs/formperma/wNpe3SR04rKvomg19XkoRLfnKV9luRJlnMwst1pff40?zf_rszfm=1",
    height: 900,
  },
} as const;

type Key = keyof typeof FORMS;
const KEYS = Object.keys(FORMS) as Key[];

export default function GetInvolved() {
  const reduce = useReducedMotion();
  const [form, setForm] = useState<Key>("support");
  const [heights, setHeights] = useState<Record<string, number>>({});
  const [loaded, setLoaded] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);

  // deep links: /get-involved?form=business
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("form");
    if (q && q in FORMS) setForm(q as Key);
  }, []);

  // Zoho forms post "perma|height" so the frame can grow to fit, with no inner scrollbar.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (typeof e.data !== "string") return;
      const [perma, h] = e.data.split("|");
      if (!perma || !h || !frame.current?.src.includes(perma)) return;
      setHeights((prev) => ({ ...prev, [form]: parseInt(h, 10) + 16 }));
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [form]);

  const pick = (k: Key) => {
    setForm(k);
    setLoaded(false);
    history.replaceState(null, "", k === "support" ? "/get-involved" : `/get-involved?form=${k}`);
  };

  const current = FORMS[form];

  return (
    <section className="mx-auto w-full max-w-[880px] px-[clamp(16px,2.8vw,44px)] pb-[14svh] pt-[10svh]">
      <RevealLines
        as="h1"
        on="mount"
        lines={["Get involved."]}
        className="mb-5 text-[clamp(48px,8vw,112px)] leading-[0.95] tracking-[-0.045em]"
      />
      <p className="mb-10 max-w-[48ch] text-lg text-ink-2">
        DissolvaGum is an early-stage concept. Nothing is for sale, but there are three ways to help it along.
      </p>

      {/* segmented switch */}
      <div role="tablist" aria-label="What would you like to do?" className="relative mb-8 inline-flex flex-wrap gap-1 rounded-xl bg-foreground/[0.06] p-1">
        {KEYS.map((k) => (
          <button
            key={k}
            role="tab"
            aria-selected={form === k}
            onClick={() => pick(k)}
            className={`relative rounded-lg px-4 py-2.5 text-[15px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              form === k ? "text-white" : "text-foreground/70 hover:text-foreground"
            }`}
          >
            {form === k && (
              <motion.span
                layoutId="tab-pill"
                className="absolute inset-0 rounded-lg bg-[#12261d]"
                transition={reduce ? { duration: 0 } : { duration: 0.45, ease: EASE }}
              />
            )}
            <span className="relative">{FORMS[k].label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={form}
          initial={reduce ? false : { opacity: 0, y: 14, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={reduce ? undefined : { opacity: 0, y: -10, filter: "blur(6px)" }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <p className="mb-6 text-lg">{current.intro}</p>
          <div className="relative overflow-hidden rounded-xl border border-foreground/10 bg-white">
            {!loaded && (
              <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground" aria-hidden>
                Loading the form…
              </div>
            )}
            <iframe
              ref={frame}
              key={current.src}
              src={current.src}
              title={current.label}
              onLoad={() => setLoaded(true)}
              className="relative block w-full border-0 transition-[height] duration-500"
              style={{ height: heights[form] ?? current.height }}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      <p className="mt-10 text-ink-2">
        Prefer email? Write to <span className="font-bold text-foreground">team@dissolvagum.com</span>, or find us on{" "}
        <a href="https://www.instagram.com/dissolvagum/" className="font-bold text-foreground underline underline-offset-4 hover:text-primary">
          Instagram
        </a>
        .
      </p>
    </section>
  );
}
