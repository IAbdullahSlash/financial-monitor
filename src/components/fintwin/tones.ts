/** Status colours (theme tokens in styles.css). Text stays black on every tone for contrast. */
export type Tone = "good" | "warn" | "bad" | "info" | "neutral";

export const toneBg: Record<Tone, string> = {
  good: "bg-good",
  warn: "bg-warn",
  bad: "bg-bad",
  info: "bg-info",
  neutral: "bg-secondary-background",
};

/** Hover effect for cards that are links: the card "presses" into its shadow. */
export const pressable =
  "transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none";
