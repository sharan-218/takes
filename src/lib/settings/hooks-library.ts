export const HOOK_LIBRARY: { id: string; text: string; tags: string[] }[] = [
  { id: "h1", text: "Stop scrolling.", tags: ["pattern-break", "short"] },
  { id: "h2", text: "Two litres. Every day.", tags: ["specific", "aspirational"] },
  { id: "h3", text: "Worth every rupee.", tags: ["value", "short"] },
  { id: "h4", text: "Honestly couldn't go back.", tags: ["testimonial", "conversational"] },
  { id: "h5", text: "See it on me.", tags: ["try-on", "curiosity"] },
  { id: "h6", text: "It just works.", tags: ["minimal", "proof"] },
  { id: "h7", text: "First look, real reaction.", tags: ["unboxing", "anticipation"] },
  { id: "h8", text: "Set up in minutes.", tags: ["demo", "low-friction"] },
  { id: "h9", text: "Delicate. Deliberate.", tags: ["cinematic", "premium"] },
  { id: "h10", text: "The softest glow.", tags: ["sensory", "beauty"] },
  { id: "h11", text: "Commute upgraded.", tags: ["aspiration", "lifestyle"] },
  { id: "h12", text: "Lights every evening.", tags: ["sensory", "lifestyle"] },
  { id: "h13", text: "Festival-ready.", tags: ["seasonal", "specific"] },
  { id: "h14", text: "Why I switched.", tags: ["story", "curiosity"] },
  { id: "h15", text: "Three months in.", tags: ["story", "authority"] },
];

export const HOOK_TAGS: string[] = Array.from(
  new Set(HOOK_LIBRARY.flatMap((h) => h.tags))
).sort();
