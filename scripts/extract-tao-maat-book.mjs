import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import AdmZip from "adm-zip";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultSource = path.join(os.homedir(), "Downloads", "The_Tao_of_Maat_extracted_from_KDP.docx");
const sourceDocx = process.env.TAO_MAAT_DOCX ? path.resolve(process.env.TAO_MAAT_DOCX) : defaultSource;
const outputDir = path.join(root, "src", "content", "book-chapters", "tao-of-maat");
const updated = "2026-05-22";

function decodeXml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function paragraphStyle(paragraph) {
  return paragraph.match(/<w:pStyle[^>]+w:val="([^"]+)"/)?.[1] ?? "";
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

  return repairMojibake(pieces.join("").replace(/\u00a0/g, " ").trim());
}

function repairMojibake(value) {
  return value
    .replaceAll("â€™", "’")
    .replaceAll("â€˜", "‘")
    .replaceAll("â€œ", "“")
    .replaceAll("â€", "”")
    .replaceAll("â€“", "–")
    .replaceAll("â€”", "—")
    .replaceAll("â€¦", "…")
    .replaceAll("Â", "");
}

function paragraphsFromDocumentXml(xml) {
  const paragraphMatches = xml.match(/<w:p[\s\S]*?<\/w:p>/g) ?? [];

  return paragraphMatches.map((paragraph) => ({
    style: paragraphStyle(paragraph),
    text: textFromParagraph(paragraph)
  }));
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

function movementForOrder(order) {
  if (order <= 10) return "Cosmic Order";
  if (order <= 20) return "Right Relations";
  if (order <= 30) return "Household and Heart";
  if (order <= 40) return "World as Teacher";
  if (order <= 50) return "Restraint and Courage";
  if (order <= 60) return "Social Conduct";
  if (order <= 70) return "Inner Virtue";
  if (order <= 78) return "Living Example";
  return "The Final Weighing";
}

function parseHeading(text, fallbackOrder) {
  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error(`Unable to parse meditation heading: ${text}`);
  }

  return {
    order: fallbackOrder,
    title: lines[0],
    roman: lines[1]
  };
}

function normalizeParagraph(paragraph) {
  return paragraph
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function bodyToMarkdown(paragraphs) {
  return paragraphs
    .map(normalizeParagraph)
    .filter(Boolean)
    .map((paragraph) => paragraph.replace(/\n/g, "<br />\n"))
    .join("\n\n");
}

function summaryFor(section) {
  const title = section.title.toLowerCase();
  return `A short Ma’at meditation on ${title}, truth, and the discipline of right living.`;
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

const paragraphs = paragraphsFromDocumentXml(documentEntry.getData().toString("utf8")).filter((paragraph) => paragraph.text);
const sections = [];
let current = null;
let nextOrder = 1;

for (const paragraph of paragraphs) {
  if (paragraph.style === "Heading1") {
    if (current) sections.push(current);
    const heading = parseHeading(paragraph.text, nextOrder);
    current = {
      ...heading,
      part: movementForOrder(nextOrder),
      paragraphs: []
    };
    nextOrder += 1;
    continue;
  }

  if (
    current &&
    paragraph.text !== "The Tao of Ma'at" &&
    paragraph.text !== "The Tao of Ma’at" &&
    paragraph.text !== "Kevin L. Michel" &&
    !/^Nekhen\s+M\.\s+Asar$/i.test(paragraph.text)
  ) {
    current.paragraphs.push(paragraph.text);
  }
}

if (current) sections.push(current);

if (sections.length !== 81) {
  throw new Error(`Expected 81 meditations, found ${sections.length}.`);
}

await fs.rm(outputDir, { recursive: true, force: true });
await fs.mkdir(outputDir, { recursive: true });

for (const section of sections) {
  const slug = slugify(section.title);
  const filename = `${String(section.order).padStart(3, "0")}-${slug}.md`;
  const markdown = [
    frontmatter({
      bookSlug: "tao-of-maat",
      title: section.title,
      subtitle: section.roman,
      part: section.part,
      order: section.order,
      summary: summaryFor(section),
      updated
    }),
    "",
    bodyToMarkdown(section.paragraphs),
    ""
  ].join("\n");

  await fs.writeFile(path.join(outputDir, filename), markdown, "utf8");
}

console.log(`Extracted ${sections.length} meditations to ${outputDir}`);
