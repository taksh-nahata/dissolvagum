"use client";
import { useEffect, useState } from "react";

export default function SurveyPopup() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    // Only show the popup if not already closed in this session
    if (typeof window !== "undefined" && !sessionStorage.getItem("dg_survey_popup_closed")) {
      let scrolled = false;
      let timer: NodeJS.Timeout;
      const onScroll = () => {
        if (!scrolled) {
          scrolled = true;
          timer = setTimeout(() => setShow(true), 3000);
          window.removeEventListener("scroll", onScroll);
        }
      };
      window.addEventListener("scroll", onScroll);
      return () => {
        window.removeEventListener("scroll", onScroll);
        if (timer) clearTimeout(timer);
      };
    }
  }, []);

  const handleClose = () => {
    setShow(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("dg_survey_popup_closed", "1");
    }
  };

  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-deep/60 px-4">
      <div
        role="dialog"
        aria-labelledby="survey-title"
        className="w-full max-w-md rounded-[32px] bg-card p-8 text-center shadow-soft"
      >
        <h2 id="survey-title" className="mb-3 text-2xl">Would you be willing to try DissolvaGum?</h2>
        <p className="mb-6 text-ink-2">
          If you can spare 40 seconds, please share your thoughts on our DissolvaGum concept. Your feedback helps shape
          what we build. Thank you!
        </p>
        <div className="flex flex-col items-center gap-3">
          <a
            href="https://forms.gle/XshZmHL6ix4sesuE9"
            target="_blank"
            rel="noopener noreferrer"
            className="ds-label inline-flex h-11 items-center rounded-full bg-primary px-6 text-primary-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            Take the survey
          </a>
          <a href="/support-interest" className="text-primary underline underline-offset-4 hover:no-underline">
            Visit our supporter form
          </a>
          <button
            className="mt-2 text-muted-foreground transition-colors hover:text-foreground"
            onClick={handleClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
