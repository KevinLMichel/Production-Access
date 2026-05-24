import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import AdmZip from "adm-zip";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath =
  process.env.BOOK_ACCESS_MACHIAVELLIAN_DREAMS_INPUT ??
  path.join(
    root,
    "Book Files and images for Book Access Detail",
    "Session Five",
    "Machiav drms DIGITAL_BOOK_BLOCK"
  );
const outputDir = path.join(root, "src", "content", "book-chapters", "machiavellian-dreams");
const updated = "2026-05-24";

const sectionStarts = new Map([
  ["content development", { title: "Content Development", subtitle: "Creation Note", part: "Opening Cautions" }],
  ["an ethical caution", { title: "An Ethical Caution", subtitle: "Caution", part: "Opening Cautions" }],
  [
    "the necessity of machiavellian knowledge for the ethical individual",
    {
      title: "The Necessity of Machiavellian Knowledge for the Ethical Individual",
      subtitle: "Ethical Knowledge",
      part: "Opening Cautions"
    }
  ],
  [
    "chapter 1: the throne of dreams",
    { title: "The Throne of Dreams", subtitle: "Chapter 1", part: "Dream and Ambition" }
  ],
  [
    "chapter 2: the armory of the dreamer",
    { title: "The Armory of the Dreamer", subtitle: "Chapter 2", part: "Influence and Vigilance" }
  ],
  [
    "chapter 3: fortifying your dreams",
    { title: "Fortifying Your Dreams", subtitle: "Chapter 3", part: "Fortification and Control" }
  ],
  [
    "chapter 4: the art of conquest",
    { title: "The Art of Conquest", subtitle: "Chapter 4", part: "Conquest and Diplomacy" }
  ],
  [
    "chapter 5: the shadows of power",
    { title: "The Shadows of Power", subtitle: "Chapter 5", part: "Secrecy and Shadow" }
  ],
  [
    "chapter 6: the price of power",
    { title: "The Price of Power", subtitle: "Chapter 6", part: "Cost and Legacy" }
  ],
  [
    "conclusion: the dreamer\u2019s empire",
    { title: "The Dreamer's Empire", subtitle: "Conclusion", part: "The Dreamer's Empire" }
  ],
  [
    "conclusion: the dreamer's empire",
    { title: "The Dreamer's Empire", subtitle: "Conclusion", part: "The Dreamer's Empire" }
  ]
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
    .replaceAll("\u00e2\u20ac\u2122", "'")
    .replaceAll("\u00e2\u20ac\u02dc", "'")
    .replaceAll("\u00e2\u20ac\u0153", '"')
    .replaceAll("\u00e2\u20ac\u009d", '"')
    .replaceAll("\u00e2\u20ac\u201c", "-")
    .replaceAll("\u00e2\u20ac\u0094", "-")
    .replaceAll("\u00e2\u20ac\u00a6", "...");
}

function stripLiteralXmlTags(value) {
  return value
    .replace(/<\/?w:[^>]+>/g, "")
    .replace(/<\/?[^>]+>/g, "")
    .replace(/\bw:(?:tab|tabs|rPr|pPr|fldChar|instrText)\b[^ ]*/g, "")
    .trim();
}

function cleanText(value) {
  return repairMojibake(stripLiteralXmlTags(value))
    .replace(/\u202f|\u2002|\u2003|\u2009|\u200a|\u200b|\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/[ \t]*\n[ \t]*/g, "\n")
    .replace(/\s+([,.;:?!])/g, "$1")
    .trim();
}

function paragraphStyle(paragraph) {
  return paragraph.match(/<w:pStyle[^>]+w:val="([^"]+)"/)?.[1] ?? "";
}

function textFromParagraph(paragraph) {
  const pieces = [];
  const tokenPattern = /<w:t[^>]*>([\s\S]*?)<\/w:t>|<w:br\b[^>]*\/>|<w:tab\b[^>]*\/>/g;

  for (const match of paragraph.matchAll(tokenPattern)) {
    if (match[1] !== undefined) pieces.push(decodeXml(match[1]));
    else if (match[0].startsWith("<w:br")) pieces.push("\n");
    else pieces.push("\t");
  }

  return cleanText(pieces.join(""));
}

function isFieldCodeNoise(text) {
  return /fldChar|TOC \\|PAGEREF|HYPERLINK|MERGEFORMAT|instrText/i.test(text);
}

function paragraphsFromNestedDocx(filePath) {
  const outerZip = new AdmZip(filePath);
  const docxEntry = outerZip.getEntry("book_1.docx");
  if (!docxEntry) throw new Error(`Unable to find book_1.docx inside ${filePath}`);

  const docxZip = new AdmZip(docxEntry.getData());
  const documentEntry = docxZip.getEntry("word/document.xml");
  if (!documentEntry) throw new Error("Unable to read word/document.xml from book_1.docx");

  const xml = documentEntry.getData().toString("utf8");
  const paragraphMatches = xml.match(/<w:p(?:\s|>)[\s\S]*?<\/w:p>/g) ?? [];

  return paragraphMatches
    .map((paragraph) => ({ style: paragraphStyle(paragraph), text: textFromParagraph(paragraph) }))
    .filter((paragraph) => paragraph.text && !isFieldCodeNoise(paragraph.text));
}

function repairDropCaps(records) {
  const repaired = [];

  for (let index = 0; index < records.length; index += 1) {
    const current = records[index];
    const next = records[index + 1];
    if (/^[A-Z]$/.test(current.text) && next && /^[a-z]/.test(next.text)) {
      repaired.push({ style: next.style || current.style, text: `${current.text}${next.text}` });
      index += 1;
      continue;
    }
    repaired.push(current);
  }

  return repaired;
}

function normalizeTitle(value) {
  return cleanText(value).replace(/\n+/g, " ").replace(/\s+/g, " ").trim();
}

function canonical(value) {
  return normalizeTitle(value)
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
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

function frontmatter(data) {
  const lines = ["---"];
  for (const [key, value] of Object.entries(data)) {
    lines.push(typeof value === "number" ? `${key}: ${value}` : `${key}: ${JSON.stringify(value)}`);
  }
  lines.push("---");
  return lines.join("\n");
}

function shouldSkipBodyNoise(text) {
  const normalized = normalizeTitle(text);
  return (
    !normalized ||
    /^\d+$/.test(normalized) ||
    /^Machiavellian Dreams:?\s*A Manual$/i.test(normalized) ||
    /^Kevin L\.?\s+Michel$/i.test(normalized) ||
    /^Copyright\b/i.test(normalized) ||
    /^All rights reserved/i.test(normalized) ||
    /^Names:/i.test(normalized) ||
    /^Title:/i.test(normalized) ||
    /^Subjects:/i.test(normalized) ||
    /^Contents$/i.test(normalized) ||
    /^References are to sections$/i.test(normalized)
  );
}

function isSubheading(record) {
  const text = normalizeTitle(record.text);
  if (!text || text.length > 150) return false;
  if (/^TL;DR$/i.test(text)) return true;
  if (/^Summary of Chapter\s+\d+/i.test(text)) return true;
  if (/^\d+(?:\.\d+)+\s+\S/.test(text)) return true;
  if (/^Chapter\s+6\.5\b/i.test(text)) return true;
  if (/[.!?]$/.test(text)) return false;
  if (/:/.test(text)) return /^[A-Z0-9]/.test(text);
  return /^[A-Z0-9]/.test(text) && /[a-z]/.test(text) && text.split(/\s+/).length <= 10;
}

function recordToMarkdown(record) {
  const text = normalizeTitle(record.text);
  if (!text) return "";
  if (record.asSubheading) return `## ${text}`;
  return cleanText(record.text).replace(/\n/g, "<br />\n");
}

function summarize(records, fallbackTitle) {
  const paragraph = records.find((record) => !record.asSubheading && record.text.length > 50)?.text ?? fallbackTitle;
  const compact = paragraph.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
  const sentence = compact.match(/^(.{80,220}?[.!?])\s/)?.[1] ?? compact.slice(0, 180);
  return sentence || fallbackTitle;
}

function startSection(sections, current, detected) {
  if (current) sections.push(current);
  return { ...detected, records: [] };
}

function parseSections(records) {
  const sections = [];
  let current = null;
  let introductionCount = 0;
  let started = false;

  for (const record of records) {
    const text = normalizeTitle(record.text);
    const key = canonical(text);

    if (key === "introduction") {
      introductionCount += 1;
      if (introductionCount < 2) continue;
      started = true;
      current = startSection(sections, current, {
        title: "Introduction",
        subtitle: "Opening",
        part: "Opening Cautions"
      });
      continue;
    }

    if (!started) continue;
    if (key === "index") break;

    const detected = sectionStarts.get(key);
    if (detected) {
      current = startSection(sections, current, detected);
      continue;
    }

    if (!current || shouldSkipBodyNoise(text)) continue;
    current.records.push({ ...record, asSubheading: isSubheading(record) });
  }

  if (current) sections.push(current);
  return sections;
}

async function main() {
  const records = repairDropCaps(paragraphsFromNestedDocx(sourcePath));
  const sections = parseSections(records).map((section, order) => ({ ...section, order }));

  if (sections.length !== 11) {
    throw new Error(
      `Expected 11 Machiavellian Dreams sections, generated ${sections.length}: ${sections
        .map((section) => section.title)
        .join(" | ")}`
    );
  }

  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });

  for (const section of sections) {
    const filename = `${String(section.order).padStart(2, "0")}-${slugify(section.title)}.md`;
    const body = section.records.map(recordToMarkdown).filter(Boolean).join("\n\n").trim();
    const markdown = [
      frontmatter({
        bookSlug: "machiavellian-dreams",
        title: section.title,
        subtitle: section.subtitle,
        part: section.part,
        order: section.order,
        summary: summarize(section.records, section.title),
        updated
      }),
      "",
      body,
      ""
    ].join("\n");
    await fs.writeFile(path.join(outputDir, filename), markdown, "utf8");
  }

  console.log(`machiavellian-dreams: ${sections.length} sections`);
}

await main();
