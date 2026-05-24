import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import AdmZip from "adm-zip";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const inputDir =
  process.env.BOOK_ACCESS_SESSION_THREE_INPUT ??
  path.join(root, "Book Files and images for Book Access Detail", "Session Three");
const outputBase = path.join(root, "src", "content", "book-chapters");
const updated = "2026-05-23";

const books = [
  { slug: "7-rules-acceleration", title: "7 Rules of Acceleration", source: "Seven_Rules_of_Acceleration_extracted_from_KDP.docx", expected: 9, mode: "rules" },
  { slug: "song-for-new-gods", title: "A Song for the New Gods", source: "A_Song_for_the_New_Gods_extracted_from_KDP.docx", expected: 6, mode: "song-parts" },
  { slug: "acta-non-verba", title: "Acta Non Verba", source: "Acta_Non_Verba_extracted_from_KDP.docx", expected: 17, mode: "acta" },
  { slug: "memento-mori", title: "Memento Mori", source: "Memento_Mori_extracted_from_KDP.docx", expected: 33, mode: "roman-meditations" },
  { slug: "path-of-the-prince", title: "The Path of the Prince", source: "The_Path_of_the_Prince_extracted_from_KDP.docx", expected: 10, mode: "path-prince" },
  { slug: "polyphasic-sleep", title: "Polyphasic Sleep", source: "Polyphasic_Sleep_A_Balanced_Approach_extracted_from_KDP.docx", expected: 8, mode: "polyphasic" },
  { slug: "crab-who-would-not-bow", title: "The Crab Who Would Not Bow", source: "The_Crab_Who_Would_Not_Bow_extracted_from_KDP.docx", expected: 7, mode: "fixed-headings", headings: ["Moon-Shell at the Water's Edge", "The Challenge of Yũng Bia", "Scorch & Struggle", "Two Reflections", "Carved in Clay", "Generations", "Epilogue"] },
  { slug: "kappas-gift", title: "The Kappa's Gift", source: "The_Kappas_Gift_extracted_from_KDP.docx", expected: 8, mode: "fixed-headings", headings: ["Prologue", "Cucumber Seed Oath", "Murmurs", "Envy's Imitation", "Blight and Ransom", "Whirlpool Shrine", "Covenant", "Epilogue - Crowless Fields"] },
  { slug: "liberated-mind", title: "The Liberated Mind", source: "The_Liberated_Mind_extracted_from_KDP.docx", expected: 18, mode: "liberated" },
  { slug: "little-green-book-guaranteed-success", title: "The Little Green Book of Guaranteed Success", source: "The_Little_Green_Book_of_Guaranteed_Success_extracted_from_KDP.docx", expected: 13, mode: "green-book" },
  { slug: "mango-of-justice", title: "The Mango of Justice", source: "The_Mango_of_Justice_extracted_from_KDP.docx", expected: 5, mode: "fixed-headings", headings: ["Seed Money", "Summons", "Juice", "Honor", "Slices"] }
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
  ["XXII", 22],
  ["XXIII", 23],
  ["XXIV", 24],
  ["XXV", 25],
  ["XXVI", 26],
  ["XXVII", 27],
  ["XXVIII", 28],
  ["XXIX", 29],
  ["XXX", 30],
  ["XXXI", 31],
  ["XXXII", 32],
  ["XXXIII", 33]
]);

const writtenNumbers = new Map([
  ["ONE", 1],
  ["TWO", 2],
  ["THREE", 3],
  ["FOUR", 4],
  ["FIVE", 5],
  ["SIX", 6],
  ["SEVEN", 7],
  ["EIGHT", 8]
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
    .replaceAll("â€¢", "-")
    .replaceAll("Ã¢â‚¬â„¢", "'")
    .replaceAll("Ã¢â‚¬Ëœ", "'")
    .replaceAll("Ã¢â‚¬Å“", '"')
    .replaceAll("Ã¢â‚¬Â", '"')
    .replaceAll("Ã¢â‚¬â€œ", "-")
    .replaceAll("Ã¢â‚¬â€", "-")
    .replaceAll("Ã¢â‚¬Â¦", "...")
    .replaceAll("Ã‚Â©", "©")
    .replaceAll("Ã‚", "")
    .replaceAll("Ã¡", "á")
    .replaceAll("Ã©", "é")
    .replaceAll("Ã¨", "è")
    .replaceAll("Ã­", "í")
    .replaceAll("Ã³", "ó")
    .replaceAll("Ãº", "ú")
    .replaceAll("Ã¼", "ü")
    .replaceAll("Ã¶", "ö")
    .replaceAll("Ã±", "ñ")
    .replaceAll("Ã£", "ã")
    .replaceAll("Å«", "ū")
    .replaceAll("Å", "ō")
    .replaceAll("Å©", "ũ")
    .replaceAll("Å«", "ū");
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

function canonical(value) {
  return cleanText(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
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
  return /fldChar|TOC \\\\|PAGEREF|HYPERLINK|w:tab|w:pPr|w:rPr/i.test(text);
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
    if (/^long time ago, a war-weary captain/i.test(record.text)) return { ...record, text: `A ${record.text}` };
    if (/^he monitors in the intensive care unit/i.test(record.text)) return { ...record, text: `T${record.text}` };
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
    .replace(/[–—]/g, "-")
    .replace(/:\s+$/, "")
    .trim();
}

function parseChapterHeading(text) {
  const normalized = normalizeTitle(text);
  const match = normalized.match(/^Chapter\s+([0-9]+|[IVX]+|One|Two|Three|Four|Five|Six|Seven|Eight)\s*[:.-]?\s*(.+)$/i);
  if (!match) return null;
  const rawNumber = match[1].toUpperCase();
  const order =
    Number.isFinite(Number(rawNumber))
      ? Number(rawNumber)
      : romanValues.get(rawNumber) ?? writtenNumbers.get(rawNumber) ?? 0;
  return { title: match[2].trim(), subtitle: `Chapter ${match[1]}`, orderHint: order };
}

function parsePart(text) {
  const normalized = normalizeTitle(text);
  const match = normalized.match(/^Part\s+([IVX]+|\d+|One|Two|Three|Four|Five|Six)\s*[:|-]\s*(.+)$/i);
  if (!match || normalized.length > 140) return null;
  return `Part ${match[1].toUpperCase()} - ${match[2].trim()}`;
}

function sectionFromHeading(text) {
  const normalized = normalizeTitle(text);
  const chapter = parseChapterHeading(normalized);
  if (chapter) return chapter;
  const rule = normalized.match(/^Rule\s+(\d+)\s*[:|-]\s*(.+)$/i);
  if (rule) return { title: rule[2].trim(), subtitle: `Rule ${rule[1]}`, orderHint: Number(rule[1]) };
  if (/^Introduction\b/i.test(normalized)) return { title: normalized, subtitle: "Introduction", orderHint: 0 };
  if (/^Preface$/i.test(normalized)) return { title: "Preface", subtitle: "Preface", orderHint: 0 };
  if (/^Prologue\b/i.test(normalized)) return { title: normalized.replace(/^Prologue\s*[-:]\s*/i, "").trim() || "Prologue", subtitle: "Prologue", orderHint: 0 };
  if (/^Epilogue\b/i.test(normalized)) return { title: normalized.replace(/^Epilogue\s*[-:]\s*/i, "").trim() || "Epilogue", subtitle: "Epilogue", orderHint: 99 };
  if (/^Conclusion\b/i.test(normalized)) return { title: normalized, subtitle: "Conclusion", orderHint: 99 };
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
    /^Names:/i.test(normalized) ||
    /^Title:/i.test(normalized) ||
    /^Subjects:/i.test(normalized) ||
    /^Contents$/i.test(normalized) ||
    /^Table of Contents$/i.test(normalized) ||
    /^CONTENT ADVISORY$/i.test(normalized) ||
    /^This book is not medical/i.test(normalized) ||
    /^It is a work of philosophy/i.test(normalized) ||
    /^If you need professional support/i.test(normalized)
  );
}

function isSubheading(record) {
  return /^Heading[2-9]$/i.test(record.style);
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

function parseRules(book, records) {
  const sections = [];
  let current = null;

  for (const record of records) {
    const text = normalizeTitle(record.text);
    const detected = sectionFromHeading(text);
    const isSection = detected && (/^Introduction:/i.test(text) || /^Rule\s+\d+:/i.test(text) || /^Conclusion:/i.test(text)) && text.length < 170;
    if (!current && !isSection) continue;
    if (isSection) {
      current = startSection(sections, current, detected, "Rules of Acceleration");
      continue;
    }
    if (!current) continue;
    current.records.push({ ...record, asSubheading: false });
  }

  if (current) sections.push(current);
  return sections;
}

function parseSongParts(book, records) {
  const sections = [];
  let current = null;

  for (const record of records) {
    const text = normalizeTitle(record.text);
    const part = text.match(/^Part\s+([IVX]+):\s*(.+)$/i);
    if (part) {
      current = startSection(sections, current, { title: part[2].trim(), subtitle: `Part ${part[1].toUpperCase()}`, orderHint: sections.length }, "A Song for the New Gods");
      continue;
    }
    if (!current || shouldSkipBeforeSections(book, text)) continue;
    current.records.push({ ...record, asSubheading: false });
  }

  if (current) sections.push(current);
  return sections;
}

function parseActa(book, records) {
  const sectionHeadings = new Set([
    "chapter 1: the ledger of deeds",
    "chapter 2: claim the controllables",
    "chapter 3: habit architecture",
    "chapter 4: impulse as ignition",
    "chapter 5: the essential few",
    "calm edge",
    "mini-acts of integrity",
    "first reflection",
    "chapter 10: cut through noise",
    "chapter 11: strike like musashi",
    "chapter 12: lead by example, not edict",
    "chapter 13: praxis loops for teams",
    "chapter 14: social contagion of deeds",
    "chapter 15: systems over heroes",
    "chapter 16: battles worth winning",
    "chapter 17: architect your legacy",
    "epilogue - the quiet ledger"
  ]);
  const sections = [];
  let current = null;
  let currentPart = "Part 1 - Forge the Inner Engine";

  for (const record of records) {
    const text = normalizeTitle(record.text);
    const textKey = canonical(text);
    const part = parsePart(text);
    if (part && /^Heading1$/i.test(record.style)) {
      currentPart = part;
      continue;
    }
    if (sectionHeadings.has(textKey)) {
      const detected = sectionFromHeading(text) ?? { title: text, subtitle: "Section", orderHint: sections.length };
      current = startSection(sections, current, detected, currentPart);
      continue;
    }
    if (!current || shouldSkipBeforeSections(book, text)) continue;
    current.records.push({ ...record, asSubheading: isSubheading(record) });
  }

  if (current) sections.push(current);
  return sections;
}

function parseRomanMeditations(book, records) {
  const sections = [];
  let current = null;
  let started = false;

  for (const record of records) {
    const text = normalizeTitle(record.text);
    const roman = romanValues.get(text);
    if (roman) {
      started = true;
      current = startSection(sections, current, { title: text, subtitle: `Meditation ${roman}`, orderHint: roman }, "Memento Mori");
      continue;
    }
    if (!started || shouldSkipBeforeSections(book, text)) continue;
    if (/^MEMENTO MORI$/i.test(text)) continue;
    current.records.push({ ...record, asSubheading: false });
  }

  if (current) sections.push(current);
  return sections;
}

function parsePathPrince(book, records) {
  const sections = [];
  let current = null;
  let started = false;
  let introductionSeen = false;

  for (const record of records) {
    const text = normalizeTitle(record.text);
    if (!started && /^Introduction$/i.test(text)) {
      if (!introductionSeen) {
        introductionSeen = true;
        continue;
      }
      started = true;
      current = startSection(sections, current, { title: "Introduction", subtitle: "Introduction", orderHint: 0 }, "The Path of the Prince");
      continue;
    }
    if (!started) continue;
    const detected = sectionFromHeading(text);
    const isSection =
      detected &&
      ((/^Chapter\s+(One|Two|Three|Four|Seven|Eight):/i.test(text) ||
        /^Chapter\s+[5-6]:/i.test(text) ||
        /^Conclusion:/i.test(text)) &&
        text.length < 120);
    if (isSection) {
      current = startSection(sections, current, detected, "The Path of the Prince");
      continue;
    }
    if (!current || shouldSkipBeforeSections(book, text)) continue;
    current.records.push({ ...record, asSubheading: /^\d+\.\d+/.test(text) });
  }

  if (current) sections.push(current);
  return sections;
}

function parsePolyphasic(book, records) {
  const sections = [];
  let current = null;
  let introductionSeen = false;

  for (const record of records) {
    const text = normalizeTitle(record.text);
    const isIntro = /^Introduction$/i.test(text);
    if (isIntro) {
      if (!introductionSeen) {
        introductionSeen = true;
        continue;
      }
      current = startSection(sections, current, { title: "Introduction", subtitle: "Introduction", orderHint: 0 }, "Polyphasic Sleep");
      continue;
    }
    const detected = sectionFromHeading(text);
    const isSection = detected && (/^Chapter\s+\d+:/i.test(text) || /^Conclusion:/i.test(text)) && text.length < 120;
    if (isSection) {
      current = startSection(sections, current, detected, "Polyphasic Sleep");
      continue;
    }
    if (!current || shouldSkipBeforeSections(book, text)) continue;
    current.records.push({ ...record, asSubheading: /^Chapter References:?$/i.test(text) || isSubheading(record) });
  }

  if (current) sections.push(current);
  return sections;
}

function parseFixedHeadings(book, records) {
  const sections = [];
  let current = null;
  const headingMap = new Map(book.headings.map((heading) => [canonical(heading), heading]));

  for (const record of records) {
    const text = normalizeTitle(record.text);
    const heading = headingMap.get(canonical(text));
    if (heading) {
      const detected = sectionFromHeading(heading) ?? { title: heading, subtitle: sections.length === 0 ? "Opening" : "Section", orderHint: sections.length };
      current = startSection(sections, current, detected, book.title);
      continue;
    }
    if (!current || shouldSkipBeforeSections(book, text)) continue;
    current.records.push({ ...record, asSubheading: false });
  }

  if (current) sections.push(current);
  return sections;
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
    if (part && /^Heading1$/i.test(record.style)) {
      currentPart = part;
      continue;
    }

    const detected = sectionFromHeading(text);
    const isSection =
      detected &&
      ((record.style === "Heading1" && (/^Preface$/i.test(text) || /^Introduction$/i.test(text) || /^Chapter\s+/i.test(text) || /^Epilogue\b/i.test(text))) ||
        (/^Chapter\s+/i.test(text) && text.length < 150) ||
        /^Introduction$/i.test(text) ||
        /^Preface$/i.test(text) ||
        /^Epilogue\b/i.test(text));

    if (isSection) {
      current = startSection(sections, current, detected, detected.subtitle === "Introduction" || detected.subtitle === "Preface" ? detected.subtitle : currentPart);
      continue;
    }
    if (!current) continue;
    current.records.push({ ...record, asSubheading: isSubheading(record) });
  }

  if (current) sections.push(current);
  return sections;
}

function parseGreenBook(book, records) {
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
    const isSection = detected && (/^Introduction:/i.test(text) || /^Chapter\s+\d+:/i.test(text) || /^Conclusion:/i.test(text)) && text.length < 120;
    if (isSection) {
      current = startSection(sections, current, detected, detected.subtitle === "Introduction" ? "Introduction" : currentPart);
      continue;
    }
    if (!current || shouldSkipBeforeSections(book, text)) continue;
    current.records.push({ ...record, asSubheading: isSubheading(record) });
  }

  if (current) sections.push(current);
  return sections;
}

function parseSections(book, records) {
  switch (book.mode) {
    case "rules":
      return parseRules(book, records);
    case "song-parts":
      return parseSongParts(book, records);
    case "acta":
      return parseActa(book, records);
    case "roman-meditations":
      return parseRomanMeditations(book, records);
    case "path-prince":
      return parsePathPrince(book, records);
    case "polyphasic":
      return parsePolyphasic(book, records);
    case "fixed-headings":
      return parseFixedHeadings(book, records);
    case "liberated":
      return parsePartsChapters(book, records);
    case "green-book":
      return parseGreenBook(book, records);
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

for (const book of books) {
  await writeBook(book);
}
