import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import AdmZip from "adm-zip";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultSource = path.join(
  os.homedir(),
  "Downloads",
  "Book Downlo",
  "The_Subconscious_Advantage_extracted_from_KDP.docx"
);
const sourceDocx = process.env.SUBCONSCIOUS_DOCX ? path.resolve(process.env.SUBCONSCIOUS_DOCX) : defaultSource;
const outputDir = path.join(root, "src", "content", "book-chapters", "subconscious-advantage");
const updated = "2026-05-22";

const summaries = new Map([
  ["introduction", "Introduces the automatic mind as a trainable growth engine for wealth, wellness, power, and joy."],
  ["why-the-automatic-mind-wins", "Shows how daily life runs on autopilot and how cues, friction, and weekly review begin to redirect it."],
  ["the-rules-your-subconscious-follows", "Teaches the clear, positive, concrete instruction language the subconscious can actually obey."],
  ["from-intentions-to-instructions", "Turns vague hopes into cue-linked scripts, implementation intentions, and identity-based commands."],
  ["results-and-defaults-your-personal-scorecard", "Builds a simple scorecard for tracking the defaults that shape money, energy, influence, and joy."],
  ["cue-based-routines-that-stick", "Explains how stable cues, tiny starts, rewards, and routine names make better habits easier to repeat."],
  ["micro-practices-to-shift-state", "Offers short practices for changing emotional and physical state before old patterns take over."],
  ["designing-environments-that-nudge-you-forward", "Shows how to arrange rooms, devices, tools, and defaults so the good action becomes the easy action."],
  ["language-shifts-and-self-talk-upgrades", "Rewrites inner language into specific, present-tense, useful commands rather than self-sabotage."],
  ["visualization-protocols-that-feel-inevitable", "Uses mental rehearsal to make desired actions familiar before they are demanded in real life."],
  ["emotional-tagging-and-reward", "Links new behaviors to feeling, meaning, and reward so the subconscious marks them as important."],
  ["embodied-anchors-posture-and-breath", "Connects breath, posture, gesture, and body cues to reliable states of calm, courage, and focus."],
  ["sleep-windows-for-lasting-change", "Uses evening review and sleep-friendly routines to help new instructions consolidate over time."],
  ["wealth-automatic-money-behaviors", "Applies subconscious design to saving, spending, investing, earning, and financial identity."],
  ["power-presence-and-influence-defaults", "Builds automatic presence, communication, and influence behaviors without forcing a false persona."],
  ["joy-connection-and-gratitude-routines", "Designs small recurring practices that make connection, gratitude, and delight easier to notice."],
  ["7-minute-drills-and-checklists", "Packages the method into compact drills and checklists that can be practiced even on crowded days."],
  ["weekly-reset-rituals", "Creates a weekly reset for reviewing scorecards, cleaning defaults, and recommitting with precision."],
  ["tracking-feedback-and-tiny-course-corrections", "Shows how to use feedback without shame and adjust the system one small lever at a time."],
  ["troubleshooting-and-staying-consistent", "Closes with ways to recover from drift, simplify the plan, and keep momentum alive."],
  ["endnotes", "Source notes and research references for the practical claims used throughout The Subconscious Advantage."]
]);

function decodeXml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function textFromParagraph(paragraph) {
  const pieces = [];
  const tokenPattern = /<w:t[^>]*>([\s\S]*?)<\/w:t>|<w:br\b[^>]*\/>|<w:tab\b[^>]*\/>/g;

  for (const match of paragraph.matchAll(tokenPattern)) {
    if (match[1] !== undefined) {
      pieces.push(decodeXml(match[1]));
    } else if (match[0].startsWith("<w:br")) {
      pieces.push("\n");
    } else {
      pieces.push("\t");
    }
  }

  return pieces.join("").replace(/\u00a0/g, " ").trim();
}

function textFromDocumentXml(xml) {
  const paragraphMatches = xml.match(/<w:p[\s\S]*?<\/w:p>/g) ?? [];
  return paragraphMatches.map(textFromParagraph).filter(Boolean);
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseHeading(paragraph) {
  const normalized = paragraph.replace(/\s+/g, " ").trim();

  if (normalized === "Introduction") {
    return {
      order: 0,
      title: "Introduction",
      heading: "Introduction"
    };
  }

  const chapterMatch = normalized.match(/^Chapter\s+(\d+):\s*(.+)$/i);
  if (chapterMatch) {
    return {
      order: Number(chapterMatch[1]),
      title: chapterMatch[2].trim(),
      heading: `Chapter ${chapterMatch[1]}`
    };
  }

  return null;
}

function formatParagraph(paragraph) {
  const normalized = paragraph.replace(/\s+/g, " ").trim();
  const labelMatch = normalized.match(/^([^:]{4,78}):\s+(.+)$/);

  if (
    labelMatch &&
    !/[.!?]$/.test(labelMatch[1]) &&
    /^[A-Z0-9]/.test(labelMatch[1]) &&
    !labelMatch[1].includes("http")
  ) {
    return `**${labelMatch[1]}:** ${labelMatch[2]}`;
  }

  return normalized;
}

function bodyToMarkdown(paragraphs) {
  return paragraphs.map(formatParagraph).filter(Boolean).join("\n\n");
}

function frontmatter(data) {
  const lines = ["---"];
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "number") {
      lines.push(`${key}: ${value}`);
    } else {
      lines.push(`${key}: ${JSON.stringify(value)}`);
    }
  }
  lines.push("---");
  return lines.join("\n");
}

const zip = new AdmZip(sourceDocx);
const documentEntry = zip.getEntry("word/document.xml");

if (!documentEntry) {
  throw new Error(`Unable to read ${sourceDocx}`);
}

const paragraphs = textFromDocumentXml(documentEntry.getData().toString("utf8"));
const sections = [];
let currentPart = "Opening";
let current = null;

for (const paragraph of paragraphs) {
  if (/^Part\s+[IVX]+:/.test(paragraph)) {
    currentPart = paragraph;
    continue;
  }

  const heading = parseHeading(paragraph);

  if (heading) {
    if (current) sections.push(current);
    current = {
      ...heading,
      part: heading.order === 0 ? "Opening - The Automatic Mind" : currentPart,
      paragraphs: []
    };
    continue;
  }

  if (
    current &&
    paragraph !== "The Subconscious Advantage" &&
    paragraph !== "A Practical Path to Wealth, Wellness, Power, and Joy" &&
    paragraph !== "Kevin L. Michel"
  ) {
    current.paragraphs.push(paragraph);
  }
}

if (current) sections.push(current);

const finalChapter = sections.find((section) => section.order === 19);
if (finalChapter) {
  const endnotesIndex = finalChapter.paragraphs.findIndex((paragraph) => /^Endnotes:?$/i.test(paragraph.trim()));

  if (endnotesIndex >= 0) {
    const endnotes = finalChapter.paragraphs.slice(endnotesIndex + 1);
    finalChapter.paragraphs = finalChapter.paragraphs.slice(0, endnotesIndex);
    sections.push({
      order: 20,
      title: "Endnotes",
      heading: "Endnotes",
      part: "Back Matter - Endnotes",
      paragraphs: endnotes
    });
  }
}

if (sections.length !== 21) {
  throw new Error(`Expected 21 sections, found ${sections.length}.`);
}

await fs.rm(outputDir, { recursive: true, force: true });
await fs.mkdir(outputDir, { recursive: true });

for (const section of sections) {
  const slug = section.title === "Introduction" ? "introduction" : slugify(section.title);
  const filename = `${String(section.order).padStart(2, "0")}-${slug}.md`;
  const markdown = [
    frontmatter({
      bookSlug: "subconscious-advantage",
      title: section.title,
      subtitle: section.heading,
      part: section.part,
      order: section.order,
      summary: summaries.get(slug) ?? `A section from The Subconscious Advantage: ${section.title}.`,
      updated
    }),
    "",
    bodyToMarkdown(section.paragraphs),
    ""
  ].join("\n");

  await fs.writeFile(path.join(outputDir, filename), markdown, "utf8");
}

console.log(`Extracted ${sections.length} sections to ${outputDir}`);
