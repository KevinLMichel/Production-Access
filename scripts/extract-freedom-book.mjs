import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import AdmZip from "adm-zip";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDocx = path.join(
  root,
  "Books downloader from Kindle",
  "Freedom_by_Design_extracted_from_DIGITAL_BOOK_BLOCK.docx"
);
const outputDir = path.join(root, "src", "content", "book-chapters", "freedom-by-design");
const updated = "2026-05-21";

const summaries = new Map([
  ["introduction", "A welcoming blueprint for the book's promise: rewriting inherited beliefs into deliberate freedom."],
  ["the-toltec-lens-freedom-as-design", "Introduces freedom as a design practice shaped by intention, awareness, and the four guiding agreements."],
  ["how-beliefs-are-installed", "Shows how family, culture, school, authority, repetition, emotion, and identity install hidden agreements."],
  ["the-cost-of-hidden-agreements", "Reveals how unexamined beliefs tax energy, relationships, work, and joy."],
  ["compassionate-awareness-101", "Begins the practice of seeing inner patterns clearly without turning awareness into self-attack."],
  ["the-belief-audit-a-step-by-step-map", "Turns self-inquiry into a practical map for locating beliefs, scripts, and inherited agreements."],
  ["spotting-agreements-triggers-and-payoffs", "Helps the reader identify triggers and the hidden rewards that keep old agreements alive."],
  ["story-vs-reality", "Separates what happened from the story the mind built around it."],
  ["choose-what-to-keep-update-or-release", "Guides the reader through deciding which beliefs still serve, which need repair, and which can be released."],
  ["language-shifts-from-inner-critic-to-ally", "Rewrites inner language so self-talk becomes truthful, kind, and useful."],
  ["micro-promises-rebuilding-self-trust", "Uses small kept promises to rebuild trust with oneself through action."],
  ["daily-alignments-morning-midday-evening", "Creates a daily rhythm for returning to chosen beliefs and deliberate conduct."],
  ["simple-rituals-and-cues-for-consistency", "Uses environmental cues and simple rituals to make new agreements easier to remember."],
  ["relationships-and-boundaries", "Applies freedom by design to communication, boundaries, care, and not taking others personally."],
  ["work-career-change-and-leadership", "Brings belief design into work, leadership, career change, and professional courage."],
  ["healing-self-sabotage-and-fear-loops", "Addresses fear loops, sabotage patterns, and compassionate interruption."],
  ["decision-design-money-time-energy", "Applies the design method to choices around money, time, and energy."],
  ["the-30-day-reclaim-plan", "Organizes the method into a 30-day practice plan for reclaiming agency."],
  ["course-correcting-with-compassion", "Teaches the reader to adjust without shame when the design experiment drifts."],
  ["metrics-that-matter-integrity-joy-energy", "Defines success by lived integrity, joy, energy, and alignment rather than performance alone."],
  ["teach-what-you-live", "Closes by turning the reader's practice into quiet leadership and lived example."]
]);

function textFromDocumentXml(xml) {
  const paragraphs = [];
  const paragraphMatches = xml.match(/<w:p[\s\S]*?<\/w:p>/g) ?? [];

  for (const paragraph of paragraphMatches) {
    const text = [...paragraph.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)]
      .map((match) => decodeXml(match[1]))
      .join("");
    const normalized = text.replace(/\s+/g, " ").trim();

    if (normalized) {
      paragraphs.push(normalized);
    }
  }

  return mergeDropCaps(paragraphs);
}

function mergeDropCaps(paragraphs) {
  const merged = [];

  for (let index = 0; index < paragraphs.length; index += 1) {
    const current = paragraphs[index];
    const next = paragraphs[index + 1];

    if (/^[A-Z]$/.test(current) && next && /^[a-z]/.test(next)) {
      merged.push(`${current}${next}`);
      index += 1;
      continue;
    }

    merged.push(current);
  }

  return merged;
}

function decodeXml(value) {
  return repairMojibake(
    value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
  );
}

function repairMojibake(value) {
  return value
    .replace(/\u00e2\u20ac\u009d/g, "”")
    .replace(/\u00e2\u20ac\u0153/g, "“")
    .replace(/\u00e2\u20ac\u2122/g, "’")
    .replace(/\u00e2\u20ac\u02dc/g, "‘")
    .replace(/\u00e2\u20ac\u201c/g, "–")
    .replace(/\u00e2\u20ac\u201d/g, "—")
    .replace(/\u00e2\u20ac\u2018/g, "‑")
    .replace(/\u00e2\u20ac\u00a6/g, "…")
    .replace(/â€\u009d/g, "”")
    .replace(/â€œ/g, "“")
    .replace(/â€™/g, "’")
    .replace(/â€˜/g, "‘")
    .replace(/â€“/g, "–")
    .replace(/â€”/g, "—")
    .replace(/â€\u2018/g, "‑")
    .replace(/â€¦/g, "…")
    .replace(/Â /g, " ")
    .replace(/Â/g, "");
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

function bodyToMarkdown(paragraphs) {
  return paragraphs
    .map((paragraph) => {
      if (paragraph.includes(":") && paragraph.length < 86 && !paragraph.endsWith(".")) {
        return `### ${paragraph}`;
      }

      return paragraph;
    })
    .join("\n\n");
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

  if (paragraph === "Introduction" || /^Chapter\s+\d+:/.test(paragraph)) {
    if (current) {
      sections.push(current);
    }

    const order = paragraph === "Introduction" ? 0 : Number(paragraph.match(/^Chapter\s+(\d+):/)?.[1]);
    const title = paragraph.replace(/^Chapter\s+\d+:\s*/, "");
    current = {
      order,
      heading: paragraph,
      title,
      part: paragraph === "Introduction" ? "Opening" : currentPart,
      paragraphs: []
    };
    continue;
  }

  if (current && paragraph !== "Freedom by Design" && !paragraph.startsWith("Toltec Principles") && paragraph !== "Kevin L. Michel") {
    current.paragraphs.push(paragraph);
  }
}

if (current) {
  sections.push(current);
}

await fs.rm(outputDir, { recursive: true, force: true });
await fs.mkdir(outputDir, { recursive: true });

for (const section of sections) {
  const slug = section.title === "Introduction" ? "introduction" : slugify(section.title);
  const filename = `${String(section.order).padStart(2, "0")}-${slug}.md`;
  const markdown = [
    frontmatter({
      bookSlug: "freedom-by-design",
      title: section.title,
      part: section.part,
      order: section.order,
      summary: summaries.get(slug) ?? `A chapter from Freedom by Design: ${section.title}.`,
      updated
    }),
    "",
    bodyToMarkdown(section.paragraphs),
    ""
  ].join("\n");

  await fs.writeFile(path.join(outputDir, filename), markdown, "utf8");
}

console.log(`Extracted ${sections.length} sections to ${outputDir}`);
