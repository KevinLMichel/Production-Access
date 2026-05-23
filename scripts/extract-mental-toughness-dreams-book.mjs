import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import AdmZip from "adm-zip";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultSource = path.join(
  os.homedir(),
  "Downloads",
  "Mental_Toughness_Strengthen_Your_Mind_To_Achieve_Your_Goals_extracted_from_KDP.docx"
);
const sourceDocx = process.env.MENTAL_TOUGHNESS_DOCX ? path.resolve(process.env.MENTAL_TOUGHNESS_DOCX) : defaultSource;
const outputDir = path.join(root, "src", "content", "book-chapters", "mental-toughness-dreams");
const updated = "2026-05-22";

const summaries = new Map([
  ["authors-note-why-mental-toughness-is-the-missing-lever", "Introduces mental toughness as the missing lever that turns self-mastery tools into durable change."],
  ["from-talent-to-triumph", "Shows why talent starts the race, but purpose, persistence, practice, and perspective finish it."],
  ["inner-sovereignty", "Builds the inner command center: composure, agency, and disciplined response under pressure."],
  ["the-finisher-mindset", "Turns intention into completion by training follow-through, friction tolerance, and closing strength."],
  ["purpose-find-your-guiding-vector", "Defines purpose as the guiding vector that keeps effort organized when motivation fades."],
  ["persistence-build-an-elastic-identity", "Frames persistence as an identity that bends, recovers, and keeps moving through setbacks."],
  ["precision-practice-stretch-with-feedback", "Turns practice into an upgrade loop through feedback, stretch, and deliberate correction."],
  ["perspective-master-cognitive-distance", "Teaches cognitive distance so pressure can be seen clearly instead of obeyed blindly."],
  ["thought-world-narrative-engineering", "Examines the inner story-world and how narrative design shapes resilience, action, and self-command."],
  ["skill-world-engineering-the-upgrade-cycle", "Applies mental toughness to skill acquisition, repetition, feedback, and continuous improvement."],
  ["real-world-high-friction-execution", "Brings toughness into high-friction reality: logistics, interruption, fatigue, and imperfect conditions."],
  ["sport-and-fitness", "Applies the Michel Method to sport, fitness, training pressure, and physical discipline."],
  ["business-and-leadership", "Applies mental toughness to leadership, negotiation, responsibility, and high-stakes work."],
  ["music-production", "Uses creative work and music production to show discipline, iteration, taste, and completion."],
  ["stress-inoculation-vs-burnout", "Separates useful stress training from burnout and teaches recovery as part of toughness."],
  ["teaching-toughness", "Shows how toughness can be modeled, transmitted, coached, and made useful to others."],
  ["the-infinite-game", "Closes with toughness as a lifelong practice of growth, service, renewal, and durable ambition."]
]);

function decodeXml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function normalizeDashes(value) {
  return value
    .replace(/[–—]/g, "-")
    .replace(/\u202f|\u2002|\u2003|\u2009|\u200a|\u200b|\u00a0/g, " ")
    .replace(/\s+-\s+/g, " - ")
    .replace(/\s+/g, " ")
    .trim();
}

function repairMojibake(value) {
  return value
    .replaceAll("Ã¢â‚¬â„¢", "'")
    .replaceAll("Ã¢â‚¬Ëœ", "'")
    .replaceAll("Ã¢â‚¬Å“", '"')
    .replaceAll("Ã¢â‚¬Â", '"')
    .replaceAll("Ã¢â‚¬â€œ", "-")
    .replaceAll("Ã¢â‚¬â€", "-")
    .replaceAll("Ã¢â‚¬Â¦", "...")
    .replaceAll("Ã‚", "");
}

function paragraphStyle(paragraph) {
  return paragraph.match(/<w:pStyle[^>]+w:val="([^"]+)"/)?.[1] ?? "";
}

function stripLiteralXmlTags(value) {
  return value.replace(/<\/?w:[^>]+>/g, "").replace(/<[^>]+>/g, "").trim();
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

  return stripLiteralXmlTags(repairMojibake(pieces.join("").replace(/\u00a0/g, " ").trim()));
}

function paragraphsFromDocumentXml(xml) {
  const paragraphMatches = xml.match(/<w:p(?:\s|>)[\s\S]*?<\/w:p>/g) ?? [];

  return paragraphMatches
    .map((paragraph) => ({
      style: paragraphStyle(paragraph),
      text: textFromParagraph(paragraph)
    }))
    .filter((paragraph) => paragraph.text);
}

function repairDropCaps(records) {
  const repaired = [];

  for (let index = 0; index < records.length; index += 1) {
    const record = records[index];
    const next = records[index + 1];

    if (/^[A-Z]$/.test(record.text) && next && /^[a-z]/.test(next.text)) {
      repaired.push({
        style: next.style || record.style,
        text: `${record.text}${next.text}`
      });
      index += 1;
      continue;
    }

    repaired.push(record);
  }

  return repaired;
}

function publicText(value) {
  return normalizeDashes(value)
    .replaceAll("Mental Toughness: Strengthen Your Mind To Achieve Your Goals", "Mental Toughness: Strengthen Your Mind to Achieve Your Dreams")
    .replaceAll("Mental Toughness: Strengthen Your Mind to Achieve Your Goals", "Mental Toughness: Strengthen Your Mind to Achieve Your Dreams")
    .replaceAll("Strengthen Your Mind To Achieve Your Goals", "Strengthen Your Mind to Achieve Your Dreams")
    .replaceAll("Strengthen Your Mind to Achieve Your Goals", "Strengthen Your Mind to Achieve Your Dreams")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .trim();
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parsePart(text) {
  const normalized = publicText(text).replace(/['"]/g, "");
  const match = normalized.match(/^Part\s+([IVX]+)\s*[:,-]\s*(.+)$/i);
  if (!match) return null;
  return `Part ${match[1].toUpperCase()} - ${match[2].trim()}`;
}

function parseSection(text) {
  const normalized = publicText(text);

  if (/^Author'?s Note\b/i.test(normalized)) {
    return {
      order: 0,
      title: "Author's Note - Why Mental Toughness Is the Missing Lever",
      subtitle: "Author's Note"
    };
  }

  const match = normalized.match(/^Chapter\s+(\d+)\s*[:-]\s*(.+)$/i);
  if (!match) return null;

  return {
    order: Number(match[1]),
    title: match[2].trim(),
    subtitle: `Chapter ${match[1]}`
  };
}

function isSourceFrontMatter(text) {
  return (
    text === "Mental Toughness: Strengthen Your Mind to Achieve Your Dreams" ||
    text === "Kevin L. Michel" ||
    text === "Copyright © 2020 Kevin L. Michel" ||
    text === "All rights reserved." ||
    text === "Contents" ||
    text.startsWith("No part of this publication may be reproduced") ||
    text.startsWith("For permissions or inquiries") ||
    text.startsWith("This book is a work of nonfiction") ||
    text.startsWith("Publisher:") ||
    text.startsWith("www.kevinlmichel.com")
  );
}

function normalizeParagraph(paragraph) {
  return publicText(paragraph)
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function looksLikeSubheading(record, index, records) {
  const text = normalizeParagraph(record.text);
  const next = records[index + 1] ? normalizeParagraph(records[index + 1].text) : "";
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  return (
    record.style !== "Heading1" &&
    wordCount >= 2 &&
    wordCount <= 8 &&
    text.length <= 78 &&
    next.length > 90 &&
    /^[A-Z0-9]/.test(text) &&
    !/^["'(]/.test(text) &&
    !/[.!]$/.test(text) &&
    !text.includes("<br")
  );
}

function recordToMarkdown(record, index, records) {
  const text = normalizeParagraph(record.text);
  if (!text) return "";
  if (looksLikeSubheading(record, index, records)) return `## ${text}`;
  return text.replace(/\n/g, "<br />\n");
}

function bodyToMarkdown(records) {
  return records.map((record, index) => recordToMarkdown(record, index, records)).filter(Boolean).join("\n\n");
}

function frontmatter(data) {
  const lines = ["---"];

  for (const [key, value] of Object.entries(data)) {
    lines.push(typeof value === "number" ? `${key}: ${value}` : `${key}: ${JSON.stringify(value)}`);
  }

  lines.push("---");
  return lines.join("\n");
}

const zip = new AdmZip(sourceDocx);
const documentEntry = zip.getEntry("word/document.xml");

if (!documentEntry) {
  throw new Error(`Unable to read ${sourceDocx}`);
}

const records = repairDropCaps(paragraphsFromDocumentXml(documentEntry.getData().toString("utf8")));
const sections = [];
let currentPart = "Opening - Author's Note";
let current = null;

for (const record of records) {
  const text = publicText(record.text);
  if (isSourceFrontMatter(text)) continue;

  const part = record.style === "Heading1" ? parsePart(text) : null;
  if (part) {
    currentPart = part;
    continue;
  }

  const section = record.style === "Heading1" ? parseSection(text) : null;
  if (section) {
    if (current) sections.push(current);
    current = {
      ...section,
      part: section.order === 0 ? "Opening - Author's Note" : currentPart,
      records: []
    };
    continue;
  }

  if (current) {
    current.records.push({ ...record, text });
  }
}

if (current) sections.push(current);

if (sections.length !== 17) {
  throw new Error(`Expected 17 sections, found ${sections.length}.`);
}

await fs.rm(outputDir, { recursive: true, force: true });
await fs.mkdir(outputDir, { recursive: true });

for (const section of sections) {
  const slug = slugify(section.title);
  const filename = `${String(section.order).padStart(2, "0")}-${slug}.md`;
  const markdown = [
    frontmatter({
      bookSlug: "mental-toughness-dreams",
      title: section.title,
      subtitle: section.subtitle,
      part: section.part,
      order: section.order,
      summary: summaries.get(slug) ?? `A section from Mental Toughness: ${section.title}.`,
      updated
    }),
    "",
    bodyToMarkdown(section.records),
    ""
  ].join("\n");

  await fs.writeFile(path.join(outputDir, filename), markdown, "utf8");
}

console.log(`Extracted ${sections.length} sections to ${outputDir}`);
