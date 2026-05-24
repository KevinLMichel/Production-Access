import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import AdmZip from "adm-zip";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath =
  process.env.BOOK_ACCESS_ETERNAL_WISDOM_INPUT ??
  path.join(process.env.USERPROFILE ?? "", "Downloads", "eternal wisdom DIGITAL_BOOK_BLOCK (2)");
const outputDir = path.join(root, "src", "content", "book-chapters", "book-eternal-wisdom");
const updated = "2026-05-24";

function decodeXml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function cleanText(value) {
  return value
    .replace(/\u202f|\u2002|\u2003|\u2009|\u200a|\u200b|\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/[ \t]*\n[ \t]*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
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
    .filter((paragraph) => paragraph.text && !/fldChar|TOC \\|PAGEREF|HYPERLINK|MERGEFORMAT|instrText/i.test(paragraph.text));
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

function parseChapterHeading(text) {
  const match = text.match(/^Chapter\s+(\d+)\s*:\s*(.+)$/i);
  if (!match) return null;
  return {
    number: Number(match[1]),
    title: cleanText(match[2]),
    subtitle: `Chapter ${Number(match[1])}`
  };
}

function partForChapter(number) {
  if (number <= 2) return "Creation and Wisdom";
  if (number <= 6) return "Justice, Mercy, and Reverence";
  if (number <= 10) return "Conduct, Household, and Seasons";
  return "Shadow and Hope";
}

function recordToMarkdown(record) {
  const text = cleanText(record.text);
  if (!text) return "";
  return text.replace(/\n/g, "<br />\n");
}

function summarize(records, fallbackTitle) {
  const paragraph = records.find((record) => record.text.length > 50)?.text ?? fallbackTitle;
  const compact = paragraph.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
  const sentence = compact.match(/^(.{80,220}?[.!?])\s/)?.[1] ?? compact.slice(0, 180);
  return sentence || fallbackTitle;
}

async function main() {
  const records = paragraphsFromNestedDocx(sourcePath);
  const sections = [];
  let current = null;

  for (const record of records) {
    const chapter = parseChapterHeading(record.text);
    if (chapter) {
      if (current) sections.push(current);
      current = { ...chapter, records: [] };
      continue;
    }

    if (!current) continue;
    current.records.push(record);
  }

  if (current) sections.push(current);

  if (sections.length !== 12) {
    throw new Error(`Expected 12 Eternal Wisdom chapters, generated ${sections.length}`);
  }

  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });

  for (const [index, section] of sections.entries()) {
    const body = section.records.map(recordToMarkdown).filter(Boolean).join("\n\n").trim();
    const filename = `${String(index).padStart(2, "0")}-${slugify(section.title)}.md`;
    const markdown = [
      frontmatter({
        bookSlug: "book-eternal-wisdom",
        title: section.title,
        subtitle: section.subtitle,
        part: partForChapter(section.number),
        order: index,
        summary: summarize(section.records, section.title),
        updated
      }),
      "",
      body,
      ""
    ].join("\n");
    await fs.writeFile(path.join(outputDir, filename), markdown, "utf8");
  }

  console.log(`book-eternal-wisdom: ${sections.length} sections`);
}

await main();
