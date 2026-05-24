import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import AdmZip from "adm-zip";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const inputDir =
  process.env.BOOK_ACCESS_SESSION_TWO_INPUT ??
  path.join(root, "Book Files and images for Book Access Detail", "Session Two");
const outputBase = path.join(root, "src", "content", "book-chapters");
const updated = "2026-05-23";

const books = [
  { slug: "alpha-tennis-blueprint", title: "Alpha Tennis Blueprint", source: "Alpha_Tennis_Blueprint_extracted_from_KDP.docx", expected: 13, mode: "parts-chapters" },
  { slug: "behind-the-gates", title: "Behind the Gates", source: "Behind_the_Gates_extracted_from_KDP.docx", expected: 19, mode: "all-headings-sections" },
  { slug: "first-principles-everyday-wins", title: "First Principles, Everyday Wins", source: "First_Principles_Everyday_Wins_extracted_from_KDP.docx", expected: 22, mode: "parts-chapters" },
  { slug: "more-than-matter", title: "More Than Matter", source: "More_Than_Matter_extracted_from_KDP.docx", expected: 24, mode: "parts-chapters" },
  { slug: "safe-to-speak", title: "Safe to Speak", source: "Safe_to_Speak_extracted_from_KDP.docx", expected: 16, mode: "parts-chapters" },
  { slug: "stamped-identity", title: "Stamped Identity", source: "Stamped_Identity_extracted_from_KDP.docx", expected: 9, mode: "chapter-header-sections" },
  { slug: "subconscious-mind-wealth", title: "Subconscious Mind Wealth", source: "subconscious mind wealth DIGITAL_BOOK_BLOCK.docx", expected: 4, mode: "heading1-only" },
  { slug: "everyday-strategist", title: "The Everyday Strategist", source: "The_Everyday_Strategist_extracted_from_KDP.docx", expected: 18, mode: "parts-chapters" },
  { slug: "uninstrument", title: "The Uninstrument", source: "The_Uninstrument_extracted_from_KDP.docx", expected: 13, mode: "plain-chapter-reorder" },
  { slug: "virtue-of-the-gods", title: "Virtue of the Gods", source: "virtue of the gods DIGITAL_BOOK_BLOCK.docx", expected: 6, mode: "virtue-letter" }
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
  ["XX", 20],
  ["XXI", 21],
  ["XXII", 22]
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
    .replaceAll("Ã¢â‚¬â„¢", "'")
    .replaceAll("Ã¢â‚¬Ëœ", "'")
    .replaceAll("Ã¢â‚¬Å“", '"')
    .replaceAll("Ã¢â‚¬Â", '"')
    .replaceAll("Ã¢â‚¬Å’", '"')
    .replaceAll("Ã¢â‚¬ï¿½", '"')
    .replaceAll("Ã¢â‚¬â€œ", "-")
    .replaceAll("Ã¢â‚¬â€", "-")
    .replaceAll("Ã¢â‚¬Â¦", "...")
    .replaceAll("Ã‚Â©", "©")
    .replaceAll("Ã‚", "");
}

function stripLiteralXmlTags(value) {
  return value
    .replace(/<\/?w:[^>]+>/g, "")
    .replace(/<\/?[^>]+>/g, "")
    .replace(/\bw:(?:tab|tabs|rPr|pPr|fldChar|instrText)\b[^ ]*/g, "")
    .trim();
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
    .replace(/\bAfew\b/g, "A few")
    .replace(/\bKevinlmichel\b/gi, "KevinLMichel")
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
  return (
    /fldChar|TOC \\\\|PAGEREF|HYPERLINK|w:tab|w:pPr|w:rPr/i.test(text) ||
    /^Table of Contents$/i.test(text)
  );
}

function paragraphsFromDocx(filePath) {
  const zip = new AdmZip(filePath);
  const documentEntry = zip.getEntry("word/document.xml");
  if (!documentEntry) throw new Error(`Unable to read ${filePath}`);
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

  return repaired.map((record) => {
    if (/^he monitors in the intensive care unit/i.test(record.text)) return { ...record, text: `T${record.text}` };
    if (/^hush falls over the royal court/i.test(record.text)) return { ...record, text: `A ${record.text}` };
    if (/^Ahush falls over the royal court/i.test(record.text)) return { ...record, text: record.text.replace(/^Ahush/, "A hush") };
    return record;
  });
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
    .replace(/\n+/g, " ")
    .replace(/:\s+$/, "")
    .replace(/\s*[-–—]\s*/g, " - ")
    .trim();
}

function parsePart(text) {
  const normalized = normalizeTitle(text);
  const match = normalized.match(/^Part\s+([IVX]+|\d+)\s*[:|-]\s*(.+)$/i);
  if (!match || normalized.length > 130) return null;
  return `Part ${match[1].toUpperCase()} - ${match[2].trim()}`;
}

function parseChapterHeading(text) {
  const normalized = normalizeTitle(text);
  const match = normalized.match(/^Chapter\s+([0-9]+|[IVX]+)\s*[:|-]\s*(.+)$/i);
  if (!match) return null;
  const rawNumber = match[1].toUpperCase();
  const order = Number.isFinite(Number(rawNumber)) ? Number(rawNumber) : romanValues.get(rawNumber);
  return { title: match[2].trim(), subtitle: `Chapter ${match[1]}`, orderHint: order ?? 0 };
}

function sectionFromHeading(text) {
  const normalized = normalizeTitle(text);
  const chapter = parseChapterHeading(normalized);
  if (chapter) return chapter;
  if (/^Introduction$/i.test(normalized)) return { title: "Introduction", subtitle: "Introduction", orderHint: 0 };
  if (/^Author/i.test(normalized)) return { title: normalized, subtitle: "Author's Statement", orderHint: 0 };
  if (/^Prologue\b/i.test(normalized)) return { title: normalized.replace(/^Prologue:\s*/i, "").trim(), subtitle: "Prologue", orderHint: 0 };
  if (/^Epilogue\b/i.test(normalized)) return { title: normalized.replace(/^Epilogue:\s*/i, "").trim(), subtitle: "Epilogue", orderHint: 99 };
  if (/^Conclusion\b/i.test(normalized)) return { title: normalized, subtitle: "Conclusion", orderHint: 99 };
  if (/^Endnotes$/i.test(normalized)) return { title: "Endnotes", subtitle: "Endnotes", orderHint: 100 };
  return null;
}

function shouldSkipBeforeSections(book, text) {
  const normalized = normalizeTitle(text);
  const lower = normalized.toLowerCase();
  return (
    lower === book.title.toLowerCase() ||
    lower === "kevin l. michel" ||
    lower === "kevin michel" ||
    lower === "by kevin l. michel" ||
    /^Copyright\b/i.test(normalized) ||
    /^©\s*\d{4}/i.test(normalized) ||
    /^All rights reserved/i.test(normalized) ||
    /^No part of this/i.test(normalized) ||
    /^Published\b/i.test(normalized) ||
    /^First edition/i.test(normalized) ||
    /^For permissions?/i.test(normalized) ||
    /^For bulk orders/i.test(normalized) ||
    /^Contact:/i.test(normalized) ||
    /^ISBN:/i.test(normalized) ||
    /^Disclaimers?\b/i.test(normalized)
  );
}

function isSubheading(record) {
  if (/^Heading[3-9]$/i.test(record.style)) return true;
  if (/^(Key Takeaways|TRY IT NOW|Practice|Reflection|Exercise|Checklist)$/i.test(record.text)) return true;
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

function startSection(sections, current, detected, part) {
  if (current) sections.push(current);
  return { ...detected, part, records: [] };
}

function parsePartsChapters(book, records) {
  const sections = [];
  let current = null;
  let currentPart = "Opening";

  for (const record of records) {
    const text = normalizeTitle(record.text);
    if (!text) continue;
    if (!current && shouldSkipBeforeSections(book, text)) continue;

    const part = parsePart(text);
    if (part && record.style === "Heading1") {
      currentPart = part;
      continue;
    }

    const detected = sectionFromHeading(text);
    const isSection =
      detected &&
      ((record.style === "Heading1" && (/^Introduction$/i.test(text) || /^Endnotes$/i.test(text))) ||
        record.style === "Heading2" ||
        (/^Introduction$/i.test(text) && record.text.length < 40) ||
        (/^Chapter\s+/i.test(text) && record.text.length < 160) ||
        (/^Epilogue\b/i.test(text) && record.text.length < 120));

    if (isSection) {
      current = startSection(sections, current, detected, detected.subtitle === "Introduction" || detected.subtitle === "Endnotes" ? detected.subtitle : currentPart);
      continue;
    }
    if (!current) continue;
    current.records.push({ ...record, asSubheading: isSubheading(record) });
  }

  if (current) sections.push(current);
  return sections;
}

function parseAllHeadingsSections(book, records) {
  const sections = [];
  let current = null;
  let currentPart = "Main text";
  let started = false;

  for (const record of records) {
    const text = normalizeTitle(record.text);
    if (!text) continue;
    if (!started && shouldSkipBeforeSections(book, text)) continue;
    if (record.style === "Heading1" || record.style === "Heading2") {
      started = true;
      const detected = sectionFromHeading(text) ?? { title: text, subtitle: record.style === "Heading1" ? "Section" : "Document", orderHint: sections.length };
      current = startSection(sections, current, detected, currentPart);
      if (/^Memoirs of the Second Gate/i.test(text)) currentPart = "Memoirs of the Second Gate";
      if (/^Selected Classified Documents/i.test(text)) currentPart = "Classified documents";
      continue;
    }
    if (!current) continue;
    current.records.push({ ...record, asSubheading: false });
  }

  if (current) sections.push(current);
  return sections;
}

function parseChapterHeaderSections(book, records) {
  const sections = [];
  let current = null;
  let currentPart = "Stamped Identity";

  for (const record of records) {
    const text = normalizeTitle(record.text);
    if (!text) continue;
    if (text === "Table of Contents" || record.style === "FrontMatter" || shouldSkipBeforeSections(book, text)) continue;
    if (record.style === "ChapterHeader") {
      const detected = sectionFromHeading(text) ?? { title: text, subtitle: "Section", orderHint: sections.length };
      current = startSection(sections, current, detected, currentPart);
      if (/^Part/i.test(text)) currentPart = text;
      continue;
    }
    if (!current) continue;
    current.records.push({ ...record, asSubheading: false });
  }

  if (current) sections.push(current);
  return sections;
}

function parseHeading1Only(book, records) {
  const sections = [];
  let current = null;
  let started = false;

  for (const record of records) {
    const text = normalizeTitle(record.text);
    if (!text) continue;
    if (!started && shouldSkipBeforeSections(book, text)) continue;
    if (record.style === "Heading1") {
      started = true;
      current = startSection(sections, current, { title: text, subtitle: sections.length === 0 ? "Opening" : "Section", orderHint: sections.length }, "Subconscious Mind Wealth");
      continue;
    }
    if (!current) continue;
    current.records.push({ ...record, asSubheading: false });
  }

  if (current) sections.push(current);
  return sections;
}

function parsePlainChapterReorder(book, records) {
  const sections = [];
  let current = null;

  for (const record of records) {
    const text = normalizeTitle(record.text);
    const detected = sectionFromHeading(text);
    const isPlainHeading = detected && (/^Chapter\s+\d+:/i.test(text) || /^Prologue:/i.test(text) || /^Epilogue$/i.test(text));
    if (isPlainHeading) {
      current = startSection(sections, current, detected, "A Republic of Shadows");
      continue;
    }
    if (!current || shouldSkipBeforeSections(book, text)) continue;
    current.records.push({ ...record, asSubheading: false });
  }

  if (current) sections.push(current);
  return sections.sort((a, b) => {
    const rank = (section) => {
      if (section.subtitle === "Prologue") return 0;
      if (section.subtitle?.startsWith("Chapter")) return Number(section.subtitle.replace(/\D/g, "")) || 50;
      if (section.subtitle === "Epilogue") return 99;
      return 50;
    };
    return rank(a) - rank(b);
  });
}

function parseVirtueLetter(book, records) {
  const sectionTitles = new Set(["Note from the Author", "Dear Aloysius", "Introduction", "Maximum Virtue", "A God Walks Through Fire", "Conclusion"]);
  const sections = [];
  let current = null;
  let skippingContents = false;

  for (const record of records) {
    const rawText = normalizeTitle(record.text);
    let text = rawText;
    if (text === "Contents") {
      skippingContents = true;
      continue;
    }
    if (skippingContents && rawText !== "Dear Aloysius,") continue;
    if (rawText === "Dear Aloysius,") {
      skippingContents = false;
      text = "Dear Aloysius";
    }
    if (!text || shouldSkipBeforeSections(book, text)) continue;
    if (/^Virtue$|^of$|^the$|^Gods$/i.test(text)) continue;
    if (/^The First Letter to Aloysius\.?$/i.test(text)) continue;
    if (/^Virtue of the Gods:/i.test(text)) continue;
    if (sectionTitles.has(text)) {
      const detected = { title: text, subtitle: text === "Dear Aloysius" ? "Letter" : text, orderHint: sections.length };
      current = startSection(sections, current, detected, "The First Letter to Aloysius");
      if (text === "Dear Aloysius") current.records.push({ ...record, text: "Dear Aloysius,", asSubheading: false });
      continue;
    }
    if (!current) continue;
    current.records.push({ ...record, asSubheading: false });
  }

  if (current) sections.push(current);
  return sections;
}

function parseSections(book, records) {
  switch (book.mode) {
    case "all-headings-sections":
      return parseAllHeadingsSections(book, records);
    case "chapter-header-sections":
      return parseChapterHeaderSections(book, records);
    case "heading1-only":
      return parseHeading1Only(book, records);
    case "plain-chapter-reorder":
      return parsePlainChapterReorder(book, records);
    case "virtue-letter":
      return parseVirtueLetter(book, records);
    case "parts-chapters":
    default:
      return parsePartsChapters(book, records);
  }
}

async function writeBook(book) {
  const sourcePath = path.join(inputDir, book.source);
  const outputDir = path.join(outputBase, book.slug);
  const records = repairDropCaps(paragraphsFromDocx(sourcePath));
  const sections = parseSections(book, records).map((section, index) => ({ ...section, order: index }));

  if (sections.length !== book.expected) {
    const titles = sections.map((section) => section.title).join(" | ");
    throw new Error(`${book.slug}: expected ${book.expected} sections, found ${sections.length}. Found: ${titles}`);
  }

  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });

  for (const section of sections) {
    const filename = `${String(section.order).padStart(2, "0")}-${slugify(section.title)}.md`;
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
