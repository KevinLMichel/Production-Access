import type { Book } from "./books";
import { getBatchBookWorld } from "./batchBookWorlds";

interface BookVisualTheme {
  accent: string;
  accent2: string;
  glow: string;
}

const customThemes: Record<string, BookVisualTheme> = {
  "freedom-by-design": {
    accent: "#d8ad45",
    accent2: "#78b6ff",
    glow: "rgba(216, 173, 69, 0.24)"
  },
  "fragmented-become-whole": {
    accent: "#f26a24",
    accent2: "#4f9dff",
    glow: "rgba(242, 106, 36, 0.24)"
  },
  "subconscious-advantage": {
    accent: "#50d6c8",
    accent2: "#f2c95f",
    glow: "rgba(80, 214, 200, 0.22)"
  },
  "steam-over-cold-steel": {
    accent: "#b54232",
    accent2: "#ead8b4",
    glow: "rgba(181, 66, 50, 0.18)"
  },
  "tao-of-maat": {
    accent: "#d9b453",
    accent2: "#59d5d0",
    glow: "rgba(217, 180, 83, 0.22)"
  },
  "will-to-fail": {
    accent: "#d84235",
    accent2: "#f0d7aa",
    glow: "rgba(216, 66, 53, 0.22)"
  },
  "banzos-sword": {
    accent: "#c24636",
    accent2: "#e7ddc8",
    glow: "rgba(194, 70, 54, 0.2)"
  },
  "kindness-algorithm": {
    accent: "#68dfd4",
    accent2: "#ff947d",
    glow: "rgba(104, 223, 212, 0.22)"
  },
  "mental-toughness-dreams": {
    accent: "#f0b94d",
    accent2: "#7ca7ff",
    glow: "rgba(240, 185, 77, 0.2)"
  },
  "new-prince-hard-times": {
    accent: "#b44732",
    accent2: "#e6c878",
    glow: "rgba(180, 71, 50, 0.2)"
  }
};

const fallbackThemes: BookVisualTheme[] = [
  { accent: "#27d8ff", accent2: "#f4c95d", glow: "rgba(39, 216, 255, 0.22)" },
  { accent: "#ff6b4a", accent2: "#8fdcff", glow: "rgba(255, 107, 74, 0.2)" },
  { accent: "#b8ff5c", accent2: "#f0c978", glow: "rgba(184, 255, 92, 0.18)" },
  { accent: "#9f8cff", accent2: "#ffb36b", glow: "rgba(159, 140, 255, 0.2)" },
  { accent: "#5eead4", accent2: "#ffd36c", glow: "rgba(94, 234, 212, 0.2)" }
];

function hashSlug(slug: string) {
  return Array.from(slug).reduce((hash, char) => hash + char.charCodeAt(0), 0);
}

export function getBookVisualTheme(bookOrSlug: Book | string): BookVisualTheme {
  const slug = typeof bookOrSlug === "string" ? bookOrSlug : bookOrSlug.id;
  const batchTheme = getBatchBookWorld(slug);

  if (batchTheme) {
    return {
      accent: batchTheme.accent,
      accent2: batchTheme.accent2,
      glow: batchTheme.glow
    };
  }

  return customThemes[slug] ?? fallbackThemes[hashSlug(slug) % fallbackThemes.length];
}

export function bookVisualThemeStyle(bookOrSlug: Book | string) {
  const theme = getBookVisualTheme(bookOrSlug);
  return `--accent: ${theme.accent}; --accent-2: ${theme.accent2}; --book-glow: ${theme.glow};`;
}
