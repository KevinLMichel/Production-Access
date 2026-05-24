import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import AdmZip from "adm-zip";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const inputDir =
  process.env.BOOK_ACCESS_SESSION_FOUR_INPUT ??
  path.join(root, "Book Files and images for Book Access Detail", "Session Four");
const outputBase = path.join(root, "src", "content", "book-chapters");
const updated = "2026-05-24";
const requestedSlugs = (process.env.BOOK_ACCESS_SESSION_FOUR_SLUGS ?? "")
  .split(",")
  .map((slug) => slug.trim())
  .filter(Boolean);

const books = [
  {
    slug: "die-auferstehung-des-marcus-aurelius",
    title: "Die Auferstehung des Marcus Aurelius",
    source: "Die_Auferstehung_des_Marcus_Aurelius_extracted_from_EPUB.docx",
    expected: 10,
    mode: "german-marcus"
  },
  {
    slug: "i-am-what-happens",
    title: "I Am What Happens",
    source: "I_Am_What_Happens_extracted_from_KDP.docx",
    expected: 6,
    mode: "chapter-list",
    preserveLineBreaks: true
  },
  {
    slug: "7-laws-quantum-power",
    title: "The 7 Laws of Quantum Power",
    source: "Seven_Laws_of_Quantum_Power_extracted_from_KDP.docx",
    expected: 9,
    mode: "quantum-laws"
  },
  {
    slug: "science-law-attraction",
    title: "The Science of the Law of Attraction",
    source: "The_Science_of_the_Law_of_Attraction_extracted_from_KDP.docx",
    expected: 10,
    mode: "science-attraction"
  },
  {
    slug: "theory-ordered-sacrifice",
    title: "The Theory of Ordered Sacrifice",
    source: "The_Theory_of_Ordered_Sacrifice_extracted_from_KDP.docx",
    expected: 10,
    mode: "ordered-sacrifice"
  }
];

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
    .replaceAll("\u00e2\u20ac\u00a6", "...")
    .replaceAll("\u00e2\u20ac\u00a2", "-");
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
    .trim();
}

function repairGermanHyphenation(value) {
  return value
    .replace(/([A-Za-z\u00c4\u00d6\u00dc\u00e4\u00f6\u00fc\u00df])-([a-z\u00e4\u00f6\u00fc\u00df])/g, "$1$2")
    .replace(/\bPhi-losophie\b/g, "Philosophie")
    .replace(/\bBe-wusstsein\b/g, "Bewusstsein")
    .replace(/\bTech-nologie\b/g, "Technologie");
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
  return /fldChar|TOC \\\\|PAGEREF|HYPERLINK|MERGEFORMAT|instrText/i.test(text);
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
    .replace(/\n+/g, " ")
    .replace(/[–—]/g, "-")
    .replace(/:\s+$/, "")
    .trim();
}

function canonical(value) {
  return normalizeTitle(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u00df/g, "ss")
    .replace(/[’‘]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function sectionFromHeading(text) {
  const normalized = normalizeTitle(text);
  const chapter = normalized.match(/^Chapter\s+(\d+)\s*[:.-]?\s*(.+)?$/i);
  if (chapter) {
    return {
      title: (chapter[2] ?? `Chapter ${chapter[1]}`).trim(),
      subtitle: `Chapter ${chapter[1]}`,
      orderHint: Number(chapter[1])
    };
  }
  if (/^Introduction\b/i.test(normalized)) return { title: normalized, subtitle: "Introduction", orderHint: 0 };
  if (/^Conclusion\b/i.test(normalized)) return { title: normalized, subtitle: "Conclusion", orderHint: 99 };
  if (/^Epilogue\b/i.test(normalized)) return { title: normalized, subtitle: "Epilogue", orderHint: 99 };
  return null;
}

function parsePart(text) {
  const match = normalizeTitle(text).match(/^Part\s+([IVX]+|\d+)\s*[:|-]\s*(.+)$/i);
  if (!match || match[0].length > 150) return null;
  return `Part ${match[1].toUpperCase()} - ${match[2].trim()}`;
}

function shouldSkipFrontMatter(book, text) {
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
    /^Names:/i.test(normalized) ||
    /^Title:/i.test(normalized) ||
    /^Subjects:/i.test(normalized) ||
    /^Contents$/i.test(normalized) ||
    /^Table of Contents$/i.test(normalized) ||
    /^CONTENT ADVISORY$/i.test(normalized) ||
    /^This book is not/i.test(normalized) ||
    /^It is a work of/i.test(normalized)
  );
}

function isSubheading(record) {
  const text = normalizeTitle(record.text);
  return /^Heading[2-9]$/i.test(record.style) || (text.length < 90 && !/[.!?]$/.test(text) && !/[,;:]/.test(text) && /[a-z]/i.test(text));
}

function recordToMarkdown(record) {
  let text = record.preserveLineBreaks ? cleanText(record.text) : normalizeTitle(record.text);
  if (!text) return "";
  if (record.german) text = repairGermanHyphenation(text);
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

function parseGermanMarcus(book, records) {
  const starts = new Map([
    ["einfuhrung", { title: "Einleitung", subtitle: "Einleitung", part: "Moderne Meditationen" }],
    ["selbst und identitat in der modernen welt", { title: "Selbst und Identit\u00e4t in der modernen Welt", subtitle: "Kapitel 1", part: "Moderne Meditationen" }],
    ["die natur der realitat", { title: "Die Natur der Realit\u00e4t", subtitle: "Kapitel 2", part: "Moderne Meditationen" }],
    ["die tugend der massigung in einer welt des uberflusses", { title: "Die Tugend der M\u00e4\u00dfigung in einer Welt des \u00dcberflusses", subtitle: "Kapitel 3", part: "Moderne Meditationen" }],
    ["moderne beziehungen und die stoische perspektive", { title: "Moderne Beziehungen und die stoische Perspektive", subtitle: "Kapitel 4", part: "Moderne Meditationen" }],
    ["der stoiker und der einflussbereich", { title: "Der Stoiker und der Einflussbereich", subtitle: "Kapitel 5", part: "Moderne Meditationen" }],
    ["die tugend des mutes in einer zeit der angst", { title: "Die Tugend des Mutes in einer Zeit der Angst", subtitle: "Kapitel 6", part: "Moderne Meditationen" }],
    ["weisheit in einer welt der informationsuberlastung", { title: "Weisheit in einer Welt der Informations\u00fcberlastung", subtitle: "Kapitel 7", part: "Moderne Meditationen" }],
    ["der stoikerfuhrer zu tod und verganglichkeit", { title: "Der Stoikerf\u00fchrer zu Tod und Verg\u00e4nglichkeit", subtitle: "Kapitel 8", part: "Moderne Meditationen" }],
    ["schluss", { title: "Die ewige Relevanz der stoischen Philosophie", subtitle: "Schlussfolgerung", part: "Moderne Meditationen" }]
  ]);
  const sections = [];
  let current = null;
  let seenBody = false;

  for (const rawRecord of records) {
    const text = normalizeTitle(rawRecord.text);
    const detected = starts.get(canonical(text));
    if (detected) {
      seenBody = true;
      current = startSection(sections, current, { ...detected, orderHint: sections.length }, detected.part);
      continue;
    }
    if (!seenBody || !current) continue;
    if (/^\d+$/.test(text) || /^Die Auferstehung des Marcus Aurelius$/i.test(text) || /^Moderne Meditationen$/i.test(text)) continue;
    if (/^EINF\u00dcHRUNG$/i.test(text) || /^KAPITEL\s+\d+:/i.test(text) || /^SCHLUSSFOLGERUNG:/i.test(text)) continue;
    const textForRecord = repairGermanHyphenation(rawRecord.text);
    const previous = current.records.at(-1);
    if (previous && /[A-Za-z\u00c4\u00d6\u00dc\u00e4\u00f6\u00fc\u00df]-$/.test(previous.text) && /^[a-z\u00e4\u00f6\u00fc\u00df]/.test(textForRecord)) {
      previous.text = `${previous.text.slice(0, -1)}${textForRecord}`;
      previous.asSubheading = isSubheading(previous);
      continue;
    }
    current.records.push({ ...rawRecord, text: textForRecord, german: true, asSubheading: isSubheading({ ...rawRecord, text: textForRecord }) });
  }

  if (current) sections.push(current);
  return sections;
}

function parseChapterList(book, records) {
  const sections = [];
  let current = null;

  for (const record of records) {
    const text = normalizeTitle(record.text);
    const detected = sectionFromHeading(text);
    const isSection = detected && /^Chapter\s+[1-6]:/i.test(text) && text.length < 80;
    if (isSection) {
      current = startSection(sections, current, detected, book.title);
      continue;
    }
    if (!current || shouldSkipFrontMatter(book, text) || /^Chapter \d:/.test(text)) continue;
    current.records.push({ ...record, preserveLineBreaks: book.preserveLineBreaks, asSubheading: false });
  }

  if (current) sections.push(current);
  return sections;
}

function parseQuantumLaws(book, records) {
  const sections = [];
  let current = null;
  let pendingChapter = null;
  let started = false;
  let introSeen = false;
  const lawTitles = new Set([
    "the law of ego and essence convergence",
    "the law of intentional creation",
    "the law of quantum attraction",
    "the law of multi-sensory expansion",
    "the law of visualizing quantum realities",
    "the law of energetic balance",
    "the law of unified field actualization"
  ]);

  for (const record of records) {
    const text = normalizeTitle(record.text);
    if (!started && /^Introduction$/i.test(text)) {
      if (!introSeen) {
        introSeen = true;
        continue;
      }
      started = true;
      current = startSection(sections, current, { title: "Introduction", subtitle: "Introduction", orderHint: 0 }, "The 7 Laws of Quantum Power");
      continue;
    }
    if (!started) continue;

    const chapterOnly = text.match(/^Chapter\s+([1-7])$/i);
    if (chapterOnly) {
      pendingChapter = Number(chapterOnly[1]);
      continue;
    }
    if (pendingChapter && lawTitles.has(canonical(text))) {
      current = startSection(sections, current, { title: text, subtitle: `Chapter ${pendingChapter}`, orderHint: pendingChapter }, "The 7 Laws");
      pendingChapter = null;
      continue;
    }
    if (/^Conclusion:\s*Destiny$/i.test(text) || /^Destiny$/i.test(text)) {
      current = startSection(sections, current, { title: "Conclusion: Destiny", subtitle: "Conclusion", orderHint: 99 }, "The 7 Laws of Quantum Power");
      pendingChapter = null;
      continue;
    }
    if (!current || shouldSkipFrontMatter(book, text)) continue;
    if (/^Chapter\s+[1-7]:/i.test(text) || lawTitles.has(canonical(text))) continue;
    current.records.push({ ...record, asSubheading: isSubheading(record) });
  }

  if (current) sections.push(current);
  return sections;
}

function parseScienceAttraction(book, records) {
  const sections = [];
  let current = null;
  let started = false;
  let introSeen = false;

  for (const record of records) {
    const text = normalizeTitle(record.text);
    if (!started && /^Introduction$/i.test(text)) {
      if (!introSeen) {
        introSeen = true;
        continue;
      }
      started = true;
      current = startSection(sections, current, { title: "Introduction", subtitle: "Introduction", orderHint: 0 }, "The Science of the Law of Attraction");
      continue;
    }
    if (!started) continue;
    const detected = sectionFromHeading(text);
    const isSection =
      detected &&
      ((/^Chapter\s+[1-8]:/i.test(text) && text.length < 180) || /^Conclusion:\s*The Science and Spirit of Success$/i.test(text));
    if (isSection) {
      current = startSection(sections, current, detected, "The Science of the Law of Attraction");
      continue;
    }
    if (!current || shouldSkipFrontMatter(book, text)) continue;
    if (/^Chapter\s+[1-8]:/i.test(text)) continue;
    current.records.push({ ...record, asSubheading: /^Conclusion of /i.test(text) || isSubheading(record) });
  }

  if (current) sections.push(current);
  return sections;
}

function parseOrderedSacrifice(book, records) {
  const sections = [];
  let current = null;
  let currentPart = "Opening";

  for (const record of records) {
    const text = normalizeTitle(record.text);
    const part = parsePart(text);
    if (part) {
      currentPart = part;
      continue;
    }
    const detected = sectionFromHeading(text);
    const isSection =
      detected &&
      (/^Introduction:/i.test(text) ||
        /^Chapter\s+[1-7]:/i.test(text) ||
        /^Chapter\s+9:/i.test(text) ||
        /^Conclusion:/i.test(text));
    if (isSection) {
      current = startSection(sections, current, detected, detected.subtitle === "Introduction" ? "Introduction" : currentPart);
      continue;
    }
    if (!current || shouldSkipFrontMatter(book, text)) continue;
    current.records.push({ ...record, asSubheading: isSubheading(record) });
  }

  if (current) sections.push(current);
  return sections;
}

function parseSections(book, records) {
  switch (book.mode) {
    case "german-marcus":
      return parseGermanMarcus(book, records);
    case "chapter-list":
      return parseChapterList(book, records);
    case "quantum-laws":
      return parseQuantumLaws(book, records);
    case "science-attraction":
      return parseScienceAttraction(book, records);
    case "ordered-sacrifice":
      return parseOrderedSacrifice(book, records);
    default:
      throw new Error(`Unknown mode ${book.mode}`);
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
    const body = section.records.map(recordToMarkdown).filter(Boolean).join("\n\n");
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
      body,
      ""
    ].join("\n");
    await fs.writeFile(path.join(outputDir, filename), markdown, "utf8");
  }

  console.log(`${book.slug}: ${sections.length} sections`);
}

const selectedBooks = requestedSlugs.length ? books.filter((book) => requestedSlugs.includes(book.slug)) : books;
const missingSlugs = requestedSlugs.filter((slug) => !books.some((book) => book.slug === slug));

if (missingSlugs.length) {
  throw new Error(`Unknown Session Four book slug(s): ${missingSlugs.join(", ")}`);
}

for (const book of selectedBooks) {
  await writeBook(book);
}
