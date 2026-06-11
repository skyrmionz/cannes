// Shared formatting constants used by all 3 L'Oreal question screens
// (sun, hydration, agenda). Keeps padding, hint sizing, and footer
// button sizing in lockstep so changes to one screen don't drift.

export const QUESTION_SHELL_TOP_PT = "pt-20"; // padding-top for header
export const QUESTION_SHELL_BOTTOM_PB = "pb-8"; // padding-bottom for footer

// Hint paragraph under the body interaction. Same color family as the
// question title (navy, slightly higher opacity than before so it
// reads as part of the question voice instead of a quiet caption).
export const HINT_TEXT_CLASS =
  "relative z-30 shrink-0 text-center font-bold tracking-tight text-[#001050]/85 px-7";
export const HINT_TEXT_FONT_SIZE = "clamp(1.3rem, min(6.2vw, 3.8vh), 2rem)";

// Bigger Back/Next footer buttons used on every question screen.
export const FOOTER_BUTTON_STYLE: React.CSSProperties = {
  paddingInline: "clamp(2.5rem, 7vw, 4.5rem)",
  paddingBlock: "clamp(1.1rem, 2.8vh, 1.9rem)",
  fontSize: "clamp(1.35rem, min(5vw, 3.6vh), 1.85rem)",
  background: "rgba(255,255,255,0.45)",
  boxShadow: [
    "0 0 0 1px rgba(255,255,255,0.6) inset",
    "0 1px 0 rgba(255,255,255,0.8) inset",
    "0 8px 24px rgba(120,160,220,0.2)",
  ].join(", "),
  WebkitBackdropFilter: "blur(12px) saturate(140%)",
  backdropFilter: "blur(12px) saturate(140%)",
};

// Subtitle (the description under the question) sized so it reads as
// primary copy, not a quiet caption.
export const SUBTITLE_FONT_SIZE = "clamp(1.05rem, min(4.6vw, 2.6vh), 1.5rem)";

// Margin between the progress bar and the question title — a noticeable
// breathing room block so the bar doesn't crowd the title.
export const TITLE_MARGIN_TOP = "clamp(1.5rem, 5vh, 3.25rem)";
