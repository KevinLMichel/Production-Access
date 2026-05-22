import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import AdmZip from "adm-zip";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultSource = path.join(os.homedir(), "Downloads", "The_Kindness_Algorithm_extracted_from_KDP_2.docx");
const sourceDocx = process.env.KINDNESS_ALGORITHM_DOCX ? path.resolve(process.env.KINDNESS_ALGORITHM_DOCX) : defaultSource;
const outputDir = path.join(root, "src", "content", "book-chapters", "kindness-algorithm");
const updated = "2026-05-22";

const summaries = new Map([
  ["prologue", "Introduces kindness as a practical operating system for relationships, habits, and social design."],
  ["hello-world-of-generosity", "Builds the foundation: humans are wired for connection, reciprocity, and compounding generosity."],
  ["the-inner-council", "Names the inner voices that shape kind decisions: self-interest, social mirror, and ideal self."],
  ["bias-and-bandwidth", "Shows how negativity, overload, and distraction block kindness unless we debug perception."],
  ["the-scarcity-illusion-and-fairness-firewall", "Separates generous living from self-erasure through boundaries, fairness, and a wider gift portfolio."],
  ["design-patterns-of-empathy", "Turns empathy into a repeatable design practice: perspective, story, presence, and context."],
  ["the-five-coin-day", "Introduces the daily ritual of small kindness deposits that make generosity visible and repeatable."],
  ["kindness-sprints", "Uses short focused bursts of outreach to build momentum, connection, and practical care."],
  ["metrics-that-matter", "Measures kindness without reducing it: relationship depth, community vibrancy, warm glow, and honest feedback."],
  ["burnout-proof-generosity", "Protects kindness from depletion through self-compassion, replenishment, boundaries, and resilience."],
  ["network-effects", "Explores how kindness spreads through social contagion, ladders of friendship, schools, and neighborhoods."],
  ["kindness-as-strategy", "Frames kindness as a strategic advantage in teams, leadership, organizations, and trust-building systems."],
  ["the-civic-api", "Extends kindness into policy, public design, civic dashboards, and institutional defaults."],
  ["the-infinite-loop", "Closes the main argument by making kindness sustainable, open-source, and self-renewing."],
  ["epilogue", "Sends the reader back into daily life with kindness as a beginning rather than an ending."]
]);

function decodeXml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
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
    .replaceAll("ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢", "'")
    .replaceAll("ÃƒÂ¢Ã¢â€šÂ¬Ã‹Å“", "'")
    .replaceAll("ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œ", '"')
    .replaceAll("ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â", '"')
    .replaceAll("ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“", "-")
    .replaceAll("ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â", "-")
    .replaceAll("ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦", "...")
    .replaceAll("Ãƒâ€š", "")
    .replaceAll("Ã‚", "");
}

function normalizeDashes(value) {
  return value
    .replace(/[–—]/g, "-")
    .replace(/\u202f|\u2002|\u2003|\u2009|\u200a|\u200b|\u00a0/g, " ")
    .replace(/\s+-\s+/g, " - ")
    .replace(/\s+/g, " ")
    .trim();
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

function cleanTitle(value) {
  return normalizeDashes(value)
    .replace("KindnessasStrategy", "Kindness as Strategy")
    .replace(/\bthat\b/g, "that")
    .trim();
}

function parsePart(text) {
  const normalized = normalizeDashes(text);
  const match = normalized.match(/^Part\s+([IVX]+)\s+-\s+(.+)$/i);
  if (!match) return null;
  return `Part ${match[1].toUpperCase()} - ${match[2].trim()}`;
}

function parseChapter(text) {
  const normalized = cleanTitle(text);
  const match = normalized.match(/^Chapter\s+(\d+)\s*[-:]\s*(.+)$/i);
  if (!match) return null;
  return {
    order: Number(match[1]),
    title: match[2].trim(),
    subtitle: `Chapter ${match[1]}`
  };
}

function normalizeParagraph(paragraph) {
  return paragraph
    .replace(/^Code Break:\s*/, "**Code Break:** ")
    .replace(/^Self-Interest\s+-\s+/, "**Self-Interest** - ")
    .replace(/^Social Mirror\s+-\s+/, "**Social Mirror** - ")
    .replace(/^Ideal Self\s+-\s+/, "**Ideal Self** - ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function recordToMarkdown(record) {
  const headingText = cleanTitle(record.text)
    .replace(/^Code Break:\s*/, "Code Break: ")
    .trim();

  if (record.style === "Heading2" || record.asSubheading) return headingText ? `## ${headingText}` : "";

  const text = normalizeParagraph(headingText);

  if (!text) return "";

  return text.replace(/\n/g, "<br />\n");
}

function bodyToMarkdown(records) {
  return records.map(recordToMarkdown).filter(Boolean).join("\n\n");
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
let currentPart = "Prologue";
let current = null;

for (const record of records) {
  const text = cleanTitle(record.text);

  if (text === "The Kindness Algorithm" || text === "Kevin L. Michel") continue;

  const part = record.style === "Heading1" ? parsePart(text) : null;
  if (part) {
    currentPart = part;
    continue;
  }

  if (text === "Prologue") {
    if (current) sections.push(current);
    currentPart = "Prologue";
    current = {
      order: 0,
      title: "Prologue",
      subtitle: "Prologue",
      part: "Prologue",
      records: []
    };
    continue;
  }

  if (text === "Epilogue") {
    if (current) sections.push(current);
    currentPart = "Epilogue";
    current = {
      order: 14,
      title: "Epilogue",
      subtitle: "Epilogue",
      part: "Epilogue",
      records: []
    };
    continue;
  }

  const chapter = record.style === "Heading1" ? parseChapter(text) : null;
  if (chapter) {
    if (current) sections.push(current);
    current = {
      ...chapter,
      part: currentPart,
      records: []
    };
    continue;
  }

  if (!current) continue;

  if (record.style === "Heading1") {
    current.records.push({ ...record, text, asSubheading: true });
  } else {
    current.records.push({ ...record, text });
  }
}

if (current) sections.push(current);

if (sections.length !== 15) {
  throw new Error(`Expected 15 sections, found ${sections.length}.`);
}

await fs.rm(outputDir, { recursive: true, force: true });
await fs.mkdir(outputDir, { recursive: true });

for (const section of sections) {
  const slug = slugify(section.title);
  const filename = `${String(section.order).padStart(2, "0")}-${slug}.md`;
  const markdown = [
    frontmatter({
      bookSlug: "kindness-algorithm",
      title: section.title,
      subtitle: section.subtitle,
      part: section.part,
      order: section.order,
      summary: summaries.get(slug) ?? `A section from The Kindness Algorithm: ${section.title}.`,
      updated
    }),
    "",
    bodyToMarkdown(section.records),
    ""
  ].join("\n");

  await fs.writeFile(path.join(outputDir, filename), markdown, "utf8");
}

console.log(`Extracted ${sections.length} sections to ${outputDir}`);
