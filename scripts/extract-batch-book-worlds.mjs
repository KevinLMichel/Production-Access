import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import AdmZip from "adm-zip";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const inputDir =
  process.env.BOOK_ACCESS_BATCH_INPUT ??
  path.join(root, "Book Files and images for Book Access Detail");
const outputBase = path.join(root, "src", "content", "book-chapters");
const updated = "2026-05-23";

const books = [
  {
    slug: "refractions-of-the-real",
    title: "Refractions of the Real",
    source: "Refractions_of_the_Real_extracted_from_KDP.docx",
    expected: 9
  },
  {
    slug: "shadow-dialogues-edge-reason",
    title: "Shadow-Dialogues at the Edge of Reason",
    source: "Shadow_Dialogues_at_the_Edge_of_Reason_extracted_from_KDP.docx",
    expected: 6
  },
  {
    slug: "art-inner-warfare",
    title: "The Art of Inner Warfare",
    source: "The_Art_of_Inner_Warfare_extracted_from_KDP.docx",
    expected: 25
  },
  {
    slug: "council-of-gods",
    title: "The Council of Gods",
    source: "The_Council_of_Gods_extracted_from_KDP.docx",
    expected: 10
  },
  {
    slug: "science-inspired-action",
    title: "The Science of Inspired Action",
    source: "The_Science_of_Inspired_Action_extracted_from_KDP.docx",
    expected: 18
  },
  {
    slug: "thought-that-changed-everything",
    title: "The Thought That Changed Everything",
    source: "The_Thought_That_Changed_Everything_extracted_from_KDP.docx",
    expected: 13
  },
  {
    slug: "will-to-become",
    title: "The Will to Become",
    source: "The_Will_to_Become_extracted_from_KDP.docx",
    expected: 12
  },
  {
    slug: "four-upgrades",
    title: "The Four Upgrades",
    source: "The_Four_Upgrades_extracted_from_KDP.docx",
    expected: 14
  },
  {
    slug: "military-industrial-complex-technological-progress",
    title: "How the Military-Industrial Complex Shapes Technological Progress",
    source: "How_the_Military_Industrial_Complex_Shapes_Technological_Progress_extracted_from_KDP.docx",
    expected: 11,
    tocEndText: "Conclusion"
  }
];

const romanValues = new Map([
  ["I", 1],
  ["II", 2],
  ["III", 3],
  ["IV", 4],
  ["V", 5],
  ["VI", 6],
  ["VII", 7],
  ["VIII", 8],
  ["IX", 9],
  ["X", 10],
  ["XI", 11],
  ["XII", 12],
  ["XIII", 13],
  ["XIV", 14],
  ["XV", 15],
  ["XVI", 16],
  ["XVII", 17],
  ["XVIII", 18],
  ["XIX", 19],
  ["XX", 20]
]);

const writtenPartNumbers = new Map([
  ["One", "I"],
  ["Two", "II"],
  ["Three", "III"],
  ["Four", "IV"],
  ["Five", "V"]
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
    .replaceAll("â€™", "'")
    .replaceAll("â€˜", "'")
    .replaceAll("â€œ", '"')
    .replaceAll("â€", '"')
    .replaceAll("â€“", "-")
    .replaceAll("â€”", "-")
    .replaceAll("â€¦", "...")
    .replaceAll("Â©", "©")
    .replaceAll("Â", "")
    .replaceAll("Ã©", "é")
    .replaceAll("Ã¼", "ü")
    .replaceAll("Ã¶", "ö")
    .replaceAll("Ã", "à");
}

function stripLiteralXmlTags(value) {
  return value.replace(/<\/?w:[^>]+>/g, "").replace(/<[^>]+>/g, "").trim();
}

function normalizeWhitespace(value) {
  return value
    .replace(/\u202f|\u2002|\u2003|\u2009|\u200a|\u200b|\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/[ \t]*\n[ \t]*/g, "\n")
    .trim();
}

function cleanText(value) {
  return normalizeWhitespace(stripLiteralXmlTags(repairMojibake(value)))
    .replace(/\s+([,.;:?!])/g, "$1")
    .replace(/\s+-\s+/g, " - ")
    .trim();
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

  return cleanText(pieces.join(""));
}

function paragraphsFromDocx(filePath) {
  const zip = new AdmZip(filePath);
  const documentEntry = zip.getEntry("word/document.xml");

  if (!documentEntry) {
    throw new Error(`Unable to read ${filePath}`);
  }

  const xml = documentEntry.getData().toString("utf8");
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

function normalizeTitle(value) {
  return cleanText(value)
    .replace(/:\s+$/, "")
    .replace(/\s*-\s*/g, " - ")
    .replace(/\s*–\s*/g, " - ")
    .trim();
}

function parsePart(text) {
  const normalized = normalizeTitle(text);
  let match = normalized.match(/^PART\s+([IVX]+):\s*(.+)$/i);
  if (match) return `Part ${match[1].toUpperCase()} - ${match[2].trim()}`;

  match = normalized.match(/^Part\s+([IVX]+)\s*[:|-]\s*(.+)$/i);
  if (match) return `Part ${match[1].toUpperCase()} - ${match[2].trim()}`;

  match = normalized.match(/^Part\s+(One|Two|Three|Four|Five)\s*:\s*(.+)$/i);
  if (match) return `Part ${writtenPartNumbers.get(match[1])} - ${match[2].trim()}`;

  return null;
}

function parseChapterHeading(text) {
  const normalized = normalizeTitle(text);
  const match = normalized.match(/^Chapter\s+([0-9]+|[IVX]+)\s*[:|-]\s*(.+)$/i);
  if (!match) return null;

  const rawNumber = match[1].toUpperCase();
  const order = Number.isFinite(Number(rawNumber)) ? Number(rawNumber) : romanValues.get(rawNumber);

  return {
    title: match[2].trim(),
    subtitle: `Chapter ${match[1]}`,
    orderHint: order ?? 0
  };
}

function detectSection(book, record) {
  const text = normalizeTitle(record.text);
  const chapter = parseChapterHeading(text);

  if (chapter) return chapter;

  if (/^Introduction\b/i.test(text)) {
    return { title: text, subtitle: "Introduction", orderHint: 0 };
  }

  if (/^Author['’]s Statement/i.test(text)) {
    return { title: "Author's Statement on Accuracy and Open Communication", subtitle: "Author's Statement", orderHint: 0 };
  }

  if (/^Prologue\b/i.test(text)) {
    return { title: text.replace(/^Prologue:\s*/i, ""), subtitle: "Prologue", orderHint: 0 };
  }

  if (/^Proem\b/i.test(text)) {
    return { title: text.replace(/^Proem\s*[-:]\s*/i, ""), subtitle: "Proem", orderHint: 0 };
  }

  if (/^Book\s+[IVX]+\s*[-:]/i.test(text)) {
    const match = text.match(/^Book\s+([IVX]+)\s*[-:]\s*(.+)$/i);
    return { title: match?.[2]?.trim() ?? text, subtitle: `Book ${match?.[1]?.toUpperCase() ?? ""}`.trim(), orderHint: romanValues.get(match?.[1]?.toUpperCase() ?? "") ?? 0 };
  }

  if (/^Coda\b/i.test(text)) {
    return { title: text.replace(/^Coda\s*[-:]\s*/i, ""), subtitle: "Coda", orderHint: 99 };
  }

  if (/^Epilogue\b/i.test(text)) {
    return { title: text.replace(/^Epilogue:\s*/i, "Epilogue").trim(), subtitle: "Epilogue", orderHint: 99 };
  }

  if (/^Conclusion\b/i.test(text)) {
    return { title: text, subtitle: "Conclusion", orderHint: 99 };
  }

  return null;
}

function shouldSkipBeforeSections(book, text) {
  const normalized = normalizeTitle(text);
  const skip = new Set([
    book.title,
    "Kevin L. Michel",
    "Table of Contents",
    "Published by Kevin L. Michel"
  ]);

  return (
    skip.has(normalized) ||
    /^Copyright\b/i.test(normalized) ||
    /^All rights reserved/i.test(normalized) ||
    /^No part of this/i.test(normalized) ||
    /^This book is intended/i.test(normalized) ||
    /^This is a work of nonfiction/i.test(normalized) ||
    /^www\./i.test(normalized)
  );
}

function isSubheading(record) {
  if (/^Heading[2-9]|^HeadingBeta|^Subtitle$/i.test(record.style)) return true;
  if (/^(TRY IT NOW|KEY TAKEAWAYS|Key Takeaways|Historical and Philosophical Context|Key Questions|Structure of the Book)$/i.test(record.text)) return true;
  return false;
}

function recordToMarkdown(record) {
  const text = normalizeTitle(record.text);
  if (!text) return "";
  if (record.asSubheading) return `## ${text}`;
  return text.replace(/\n/g, "<br />\n");
}

function summarize(records, fallbackTitle) {
  const paragraph = records.find((record) => !record.asSubheading && record.text.length > 50)?.text ?? fallbackTitle;
  const compact = paragraph.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
  const sentence = compact.match(/^(.{80,220}?[.!?])\s/)?.[1] ?? compact.slice(0, 180);
  return sentence.length < compact.length ? sentence : sentence.replace(/[,:;]$/, ".");
}

function frontmatter(data) {
  const lines = ["---"];

  for (const [key, value] of Object.entries(data)) {
    lines.push(typeof value === "number" ? `${key}: ${value}` : `${key}: ${JSON.stringify(value)}`);
  }

  lines.push("---");
  return lines.join("\n");
}

function parseSections(book, records) {
  const sections = [];
  let currentPart = "Opening";
  let current = null;
  let skippingToc = false;

  for (const record of records) {
    const text = normalizeTitle(record.text);

    if (!text) continue;

    if (book.tocEndText && text === "Table of Contents") {
      skippingToc = true;
      continue;
    }

    if (skippingToc) {
      if (text === book.tocEndText) skippingToc = false;
      continue;
    }

    if (!current && shouldSkipBeforeSections(book, text)) continue;

    const part = parsePart(text);
    if (part) {
      currentPart = part;
      continue;
    }

    const detected = detectSection(book, record);
    const isHeadingLike =
      detected &&
      (record.style === "Heading1" ||
        /^(Author|Introduction|Prologue|Proem|Book|Coda|Epilogue|Conclusion)/i.test(text) ||
        (/^Chapter/i.test(text) && text.length < 140));

    if (detected && isHeadingLike) {
      if (current) sections.push(current);
      current = {
        ...detected,
        part: detected.subtitle === "Introduction" || detected.subtitle === "Prologue" || detected.subtitle === "Proem" || detected.subtitle === "Author's Statement" ? detected.subtitle : currentPart,
        records: []
      };
      continue;
    }

    if (!current) continue;

    current.records.push({ ...record, asSubheading: isSubheading(record) });
  }

  if (current) sections.push(current);

  return sections.map((section, index) => ({
    ...section,
    order: index
  }));
}

async function writeBook(book) {
  const sourcePath = path.join(inputDir, book.source);
  const outputDir = path.join(outputBase, book.slug);
  const records = repairDropCaps(paragraphsFromDocx(sourcePath));
  const sections = parseSections(book, records);

  if (sections.length !== book.expected) {
    throw new Error(`${book.slug}: expected ${book.expected} sections, found ${sections.length}.`);
  }

  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });

  for (const section of sections) {
    const slug = slugify(section.title);
    const filename = `${String(section.order).padStart(2, "0")}-${slug}.md`;
    const markdown = [
      frontmatter({
        bookSlug: book.slug,
        title: section.title,
        subtitle: section.subtitle,
        part: section.part,
        order: section.order,
        summary: summarize(section.records, section.title),
        updated
      }),
      "",
      section.records.map(recordToMarkdown).filter(Boolean).join("\n\n"),
      ""
    ].join("\n");

    await fs.writeFile(path.join(outputDir, filename), markdown, "utf8");
  }

  console.log(`${book.slug}: ${sections.length} sections`);
}

for (const book of books) {
  await writeBook(book);
}
