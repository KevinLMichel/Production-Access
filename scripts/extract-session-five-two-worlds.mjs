import fs from "node:fs/promises";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import AdmZip from "adm-zip";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const updated = "2026-05-24";

const sources = {
  unbridled:
    process.env.BOOK_ACCESS_UNBRIDLED_INPUT ??
    "C:\\Users\\kevin\\Downloads\\the unbridled prince DIGITAL_BOOK_BLOCK (2)",
  marcus:
    process.env.BOOK_ACCESS_MARCUS_RESURRECTION_INPUT ??
    "C:\\Users\\kevin\\Downloads\\the resrrctn of Marcus DIGITAL_BOOK_BLOCK (2)"
};

const outputRoot = path.join(root, "src", "content", "book-chapters");

const unbridledStarts = new Map([
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
    "chapter 1: the foundation of self-belief",
    { title: "The Foundation of Self-Belief", subtitle: "Chapter 1", part: "Self-Belief and Potential" }
  ],
  [
    "chapter 2: embracing your potential",
    { title: "Embracing Your Potential", subtitle: "Chapter 2", part: "Self-Belief and Potential" }
  ],
  [
    "chapter 3: the art of self-preservation",
    { title: "The Art of Self-Preservation", subtitle: "Chapter 3", part: "Preservation and Strategy" }
  ],
  [
    "chapter 4: strategic networking and exploiting weaknesses",
    { title: "Strategic Networking and Exploiting Weaknesses", subtitle: "Chapter 4", part: "Preservation and Strategy" }
  ],
  [
    "chapter 5: embodying the qualities of a leader",
    { title: "Embodying the Qualities of a Leader", subtitle: "Chapter 5", part: "Leadership and Conquest" }
  ],
  [
    "chapter 6: the mindset of a conqueror",
    { title: "The Mindset of a Conqueror", subtitle: "Chapter 6", part: "Leadership and Conquest" }
  ],
  ["conclusion", { title: "Conclusion", subtitle: "Closing", part: "Integration" }]
]);

const marcusSections = [
  {
    title: "Introduction",
    subtitle: "The Return of the Stoic",
    part: "Return of the Stoic",
    objectIds: [167, 168, 157, 158, 159]
  },
  {
    title: "Self and Identity in the Modern World",
    subtitle: "Chapter 1",
    part: "Self and Reality",
    objectIds: [160, 161, 152, 153, 154]
  },
  {
    title: "The Nature of Reality",
    subtitle: "Chapter 2",
    part: "Self and Reality",
    objectIds: [155, 156, 147, 148]
  },
  {
    title: "Temperance in a World of Excess",
    subtitle: "Chapter 3",
    part: "Temperance, Relationships, Influence",
    objectIds: [149, 150, 151, 126]
  },
  {
    title: "Relationships and the Stoic Perspective",
    subtitle: "Chapter 4",
    part: "Temperance, Relationships, Influence",
    objectIds: [127, 128, 129, 130]
  },
  {
    title: "The Stoic and the Sphere of Influence",
    subtitle: "Chapter 5",
    part: "Temperance, Relationships, Influence",
    objectIds: [121, 122, 123, 124]
  },
  {
    title: "Courage in an Age of Fear",
    subtitle: "Chapter 6",
    part: "Courage, Wisdom, Mortality",
    objectIds: [125, 116, 117, 118, 119]
  },
  {
    title: "Wisdom in a World of Information Overload",
    subtitle: "Chapter 7",
    part: "Courage, Wisdom, Mortality",
    objectIds: [120, 111, 112, 113, 114]
  },
  {
    title: "The Stoic's Guide to Death and Impermanence",
    subtitle: "Chapter 8",
    part: "Courage, Wisdom, Mortality",
    objectIds: [115, 59, 68, 70, 72, 73]
  },
  {
    title: "The Eternal Relevance of Stoic Philosophy",
    subtitle: "Conclusion",
    part: "Practice and Relevance",
    objectIds: [74, 75, 76, 77, 78]
  }
];

const marcusSubheadingTitles = [
  "Waking up in the 21st Century",
  "The Relevance of Stoicism in Modern Times",
  "The Stoic Approach to Living in a Hyperconnected World",
  "Understanding Self in the Digital Age",
  "The Illusion of Online Personas and Stoic Perspective",
  "The Stoic's Approach to Self-Acceptance and Authenticity",
  "The Changing Perception of Reality in a Digital Age",
  "The Virtual and the Real-Stoic Insights",
  "The Stoic's Guide to Mindful Living in a Distracted World",
  "The Stoic Approach to Consumption in a Materialistic World",
  "The Discipline of Desire and Aversion in Today's Society",
  "The Art of Balance: Moderation in the Age of Excess",
  "Navigating Relationships in a Hyperconnected World",
  "Love, Friendship, and Tolerance in Modern Society",
  "The Virtue of Compassion in an Age of Indifference",
  "Understanding Our Sphere of Influence in a Global Society",
  "The Stoic Approach to Social Activism and Change",
  "The Practice of Serenity: Acceptance and Action in a Chaotic World",
  "The Modern Face of Fear and the Stoic Response",
  "Resilience and Endurance in Times of Crisis",
  "The Power of Stoic Optimism in a Pessimistic World",
  "Knowledge vs. Wisdom in the Digital Age",
  "The Stoic Approach to Lifelong Learning and Intellectual Growth",
  "The Practice of Stoic Mindfulness Amidst Constant Distraction",
  "Facing the Reality of Mortality in the Modern World",
  "The Stoic Embrace of Change and Impermanence",
  "The Art of Letting Go: Stoic Insights on Loss and Detachment",
  "The Timeless Wisdom of Marcus Aurelius",
  "The Stoic Path: A Roadmap for Modern Life",
  "Continuing the Journey: Embracing Stoicism in Daily Practice"
];

function headingKey(value) {
  return canonical(value)
    .replace(/\?s\b/g, "'s")
    .replace(/\s*-\s*/g, "-")
    .replace(/\s+/g, " ");
}

const marcusSubheadingKeys = new Set(marcusSubheadingTitles.map(headingKey));

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
    .replaceAll("\u0091", "'")
    .replaceAll("\u0092", "'")
    .replaceAll("\u0093", '"')
    .replaceAll("\u0094", '"')
    .replaceAll("\u0096", "-")
    .replaceAll("\u0097", "-");
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
    .replace(/\u2010|\u2011|\u2012|\u2013|\u2014/g, "-")
    .trim();
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

function summarize(records, fallbackTitle) {
  const paragraph = records.find((record) => !record.asSubheading && record.text.length > 50)?.text ?? fallbackTitle;
  const compact = paragraph.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
  const sentence = compact.match(/^(.{80,220}?[.!?])\s/)?.[1] ?? compact.slice(0, 180);
  return sentence || fallbackTitle;
}

function isFieldCodeNoise(text) {
  return /fldChar|TOC \\|PAGEREF|HYPERLINK|MERGEFORMAT|instrText/i.test(text);
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

function shouldSkipDocxNoise(text) {
  const normalized = normalizeTitle(text);
  return (
    !normalized ||
    /^\d+$/.test(normalized) ||
    /^The Unbridled Prince$/i.test(normalized) ||
    /^A Guide to Self-Belief/i.test(normalized) ||
    /^Kevin L\.?\s+Michel$/i.test(normalized) ||
    /^Copyright\b/i.test(normalized) ||
    /^All rights reserved/i.test(normalized) ||
    /^Contents$/i.test(normalized) ||
    /^References are to sections$/i.test(normalized)
  );
}

function isDocxSubheading(record) {
  const text = normalizeTitle(record.text);
  if (!text || text.length > 150) return false;
  if (/^[IVX]+\.\s+/.test(text)) return true;
  if (/^[A-Z][A-Za-z' -]+:$/.test(text)) return true;
  if (/[.!?]$/.test(text)) return false;
  if (/:/.test(text)) return /^[A-Z0-9]/.test(text);
  return /^[A-Z0-9]/.test(text) && /[a-z]/.test(text) && text.split(/\s+/).length <= 10;
}

function recordToMarkdown(record) {
  const text = normalizeTitle(record.text);
  if (!text) return "";
  if (record.asSubheading) return `## ${text.replace(/:$/, "")}`;
  return cleanText(record.text).replace(/\n/g, "<br />\n");
}

function startSection(sections, current, detected) {
  if (current) sections.push(current);
  return { ...detected, records: [] };
}

function parseUnbridledSections(records) {
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

    const detected = unbridledStarts.get(key);
    if (detected) {
      current = startSection(sections, current, detected);
      continue;
    }

    if (!current || shouldSkipDocxNoise(text)) continue;
    current.records.push({ ...record, asSubheading: isDocxSubheading(record) });
  }

  if (current) sections.push(current);
  return sections.map((section, order) => ({ ...section, order }));
}

function unicodeFromHex(hex) {
  const pieces = [];
  for (let index = 0; index < hex.length; index += 4) {
    const code = Number.parseInt(hex.slice(index, index + 4), 16);
    if (Number.isFinite(code) && code > 0) pieces.push(String.fromCharCode(code));
  }
  return pieces.join("");
}

function extractPdfStreams(pdfBuffer) {
  const streams = new Map();
  const objects = extractPdfObjects(pdfBuffer);

  for (const [objectId, body] of objects) {
    const streamMatch = body.match(/stream\r?\n?([\s\S]*?)\r?\n?endstream/);
    if (!streamMatch) continue;

    const dictionary = body.slice(0, streamMatch.index);
    let buffer = Buffer.from(streamMatch[1], "latin1");

    if (/FlateDecode/.test(dictionary)) {
      try {
        buffer = zlib.inflateSync(buffer);
      } catch {
        continue;
      }
    }

    streams.set(objectId, buffer.toString("latin1"));
  }

  return streams;
}

function extractPdfObjects(pdfBuffer) {
  const pdf = pdfBuffer.toString("latin1");
  const objects = new Map();
  const objectPattern = /(\d+)\s+\d+\s+obj([\s\S]*?)endobj/g;

  for (const match of pdf.matchAll(objectPattern)) {
    objects.set(Number(match[1]), match[2]);
  }

  return objects;
}

function parseCMap(text) {
  const cmap = new Map();

  for (const block of text.matchAll(/beginbfchar([\s\S]*?)endbfchar/g)) {
    for (const pair of block[1].matchAll(/<([0-9A-Fa-f]{4})>\s+<([0-9A-Fa-f]+)>/g)) {
      cmap.set(pair[1].toUpperCase(), unicodeFromHex(pair[2]));
    }
  }

  for (const block of text.matchAll(/beginbfrange([\s\S]*?)endbfrange/g)) {
    for (const range of block[1].matchAll(/<([0-9A-Fa-f]{4})>\s+<([0-9A-Fa-f]{4})>\s+<([0-9A-Fa-f]+)>/g)) {
      const start = Number.parseInt(range[1], 16);
      const end = Number.parseInt(range[2], 16);
      const target = Number.parseInt(range[3], 16);
      for (let code = start; code <= end; code += 1) {
        cmap.set(code.toString(16).padStart(4, "0").toUpperCase(), String.fromCharCode(target + code - start));
      }
    }
  }

  return cmap;
}

function buildContentFontMaps(objects, streams) {
  const fontCMapCache = new Map();
  const contentFontMaps = new Map();

  function cmapForFontObject(fontObjectId) {
    if (fontCMapCache.has(fontObjectId)) return fontCMapCache.get(fontObjectId);
    const fontObject = objects.get(fontObjectId) ?? "";
    const toUnicodeObjectId = Number(fontObject.match(/\/ToUnicode\s+(\d+)\s+0\s+R/)?.[1]);
    const cmap = toUnicodeObjectId && streams.has(toUnicodeObjectId) ? parseCMap(streams.get(toUnicodeObjectId)) : new Map();
    fontCMapCache.set(fontObjectId, cmap);
    return cmap;
  }

  for (const pageObject of objects.values()) {
    if (!/\/Type\s*\/Page\b/.test(pageObject)) continue;
    const contentIds = [...pageObject.matchAll(/\/Contents\s+(?:\[(.*?)\]|(\d+)\s+0\s+R)/g)].flatMap((match) => {
      if (match[2]) return [Number(match[2])];
      return [...match[1].matchAll(/(\d+)\s+0\s+R/g)].map((ref) => Number(ref[1]));
    });
    if (!contentIds.length) continue;

    const fontBlock = pageObject.match(/\/Font\s*<<(.*?)>>/s)?.[1] ?? "";
    const fontMap = new Map();
    for (const fontRef of fontBlock.matchAll(/\/([A-Za-z0-9_]+)\s+(\d+)\s+0\s+R/g)) {
      fontMap.set(fontRef[1], cmapForFontObject(Number(fontRef[2])));
    }

    for (const contentId of contentIds) contentFontMaps.set(contentId, fontMap);
  }

  return contentFontMaps;
}

function decodePdfLiteral(raw) {
  let output = "";
  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];
    if (char !== "\\") {
      output += char;
      continue;
    }

    const next = raw[index + 1];
    if (!next) continue;
    if (next === "n") output += "\n";
    else if (next === "r") output += "\r";
    else if (next === "t") output += "\t";
    else if (next === "b") output += "\b";
    else if (next === "f") output += "\f";
    else if (/[0-7]/.test(next)) {
      const octal = raw.slice(index + 1).match(/^[0-7]{1,3}/)?.[0] ?? next;
      output += String.fromCharCode(Number.parseInt(octal, 8));
      index += octal.length - 1;
    } else output += next;
    index += 1;
  }
  return output;
}

function decodePdfHex(hex, cmap) {
  const clean = hex.replace(/\s+/g, "").toUpperCase();
  const pieces = [];
  for (let index = 0; index < clean.length; index += 4) {
    const code = clean.slice(index, index + 4);
    pieces.push(cmap.get(code) ?? "");
  }
  return pieces.join("");
}

function decodePdfArray(raw, cmap) {
  const pieces = [];
  const tokenPattern = /\(((?:\\.|[^\\()])*)\)|<([0-9A-Fa-f\s]+)>/g;
  for (const token of raw.matchAll(tokenPattern)) {
    if (token[1] !== undefined) pieces.push(decodePdfLiteral(token[1]));
    else pieces.push(decodePdfHex(token[2], cmap));
  }
  return pieces.join("");
}

function extractPdfLines(streamText, fontMap) {
  const lines = [];
  let current = "";
  let currentCMap = new Map();
  const tokenPattern =
    /\/([A-Za-z0-9_]+)\s+\d+(?:\.\d+)?\s+Tf|\[((?:[^\[\]]|\[[^\]]*\])*)\]\s*TJ|<([0-9A-Fa-f\s]+)>\s*Tj|\(((?:\\.|[^\\()])*)\)\s*Tj|\bT\*|\b-?\d+(?:\.\d+)?\s+-?\d+(?:\.\d+)?\s+T[dD]|\b(?:-?\d+(?:\.\d+)?\s+){6}Tm/g;

  function flush() {
    const cleaned = cleanPdfText(current);
    if (cleaned) lines.push(cleaned);
    current = "";
  }

  for (const match of streamText.matchAll(tokenPattern)) {
    if (match[1] !== undefined) {
      flush();
      currentCMap = fontMap.get(match[1]) ?? new Map();
    } else if (match[2] !== undefined) current += decodePdfArray(match[2], currentCMap);
    else if (match[3] !== undefined) current += decodePdfHex(match[3], currentCMap);
    else if (match[4] !== undefined) current += decodePdfLiteral(match[4]);
    else flush();
  }
  flush();

  return lines;
}

function cleanPdfText(value) {
  return cleanText(value)
    .replace(/\b([A-Za-z]+)\?s\b/g, "$1's")
    .replace(/\s*\|\s*/g, " | ")
    .replace(/\s+-\s+/g, "-")
    .replace(/\s+'/g, "'")
    .replace(/Stoic's/gi, (match) => (match[0] === "S" ? "Stoic's" : "stoic's"))
    .replace(/\bTh e\b/g, "The")
    .replace(/\bTh is\b/g, "This")
    .replace(/\bStoic s\b/g, "Stoic's")
    .replace(/\bStoic 's\b/g, "Stoic's")
    .trim();
}

function stripPdfNoise(lines) {
  return lines
    .map((line) => cleanPdfText(line))
    .filter(Boolean)
    .filter((line) => !/^\d+$/.test(line))
    .filter((line) => !/^[ivxlcdm]+$/i.test(line))
    .filter((line) => !/^The Resurrection of Marcus Aurelius$/i.test(line))
    .filter((line) => !/^Modern Meditations$/i.test(line))
    .filter((line) => !/^Kevin L\. Michel$/i.test(line))
    .filter((line) => !/^Contents$/i.test(line))
    .filter((line) => !/^Copyright\b/i.test(line))
    .filter((line) => !/^All rights reserved/i.test(line))
    .filter((line) => !/^Content Development$/i.test(line));
}

function repairMarcusDropCaps(lines) {
  const repaired = [];

  for (let index = 0; index < lines.length; index += 1) {
    const current = lines[index];
    const next = lines[index + 1];
    if (/^[A-Z]$/.test(current) && next && /^[a-z]/.test(next)) {
      repaired.push(`${current}${next}`);
      index += 1;
      continue;
    }
    repaired.push(current);
  }

  for (let index = 0; index < repaired.length; index += 1) {
    repaired[index] = repaired[index]
      .replace(/^T he\b/, "The")
      .replace(/^A s\b/, "As")
      .replace(/^he chill\b/, "The chill")
      .replace(/^s I awaken\b/, "As I awaken")
      .replace(/^s I reflect\b/, "As I reflect")
      .replace(/^n our time\b/, "In our time")
      .replace(/^n this era\b/, "In this era")
      .replace(/^n this age\b/, "In this age")
      .replace(/^n the epoch\b/, "In the epoch")
      .replace(/^n the world\b/, "In the world")
      .replace(/^n the twilight\b/, "In the twilight")
      .replace(/^n the\b/, "In the")
      .replace(/^n this\b/, "In this")
      .replace(/^n our\b/, "In our");
  }

  return repaired;
}

function repairHyphenatedPdfLines(lines) {
  const repaired = [];

  for (let index = 0; index < lines.length; index += 1) {
    const current = lines[index];
    const next = lines[index + 1];
    const afterNext = lines[index + 2];

    if (current === "-" && repaired.length && next) {
      repaired[repaired.length - 1] += next;
      index += 1;
      continue;
    }

    if (next === "-" && afterNext && /[A-Za-z]$/.test(current) && /^[a-z]/.test(afterNext)) {
      repaired.push(`${current}${afterNext}`);
      index += 2;
      continue;
    }

    repaired.push(current);
  }

  return repaired;
}

function stripOpeningTitleLines(lines, section) {
  const removable = new Set([
    canonical(section.title),
    canonical(section.subtitle),
    canonical(section.title.replace("'s", "?s")),
    "conclusion",
    "impermanence",
    "overload",
    "philosophy"
  ]);
  const stripped = [...lines];

  while (stripped.length) {
    const first = canonical(stripped[0]);
    const allCaps = /^[A-Z0-9 ?'&:-]+$/.test(stripped[0]) && stripped[0].length > 6;
    if (removable.has(first) || allCaps) stripped.shift();
    else break;
  }

  return stripped;
}

function repairWrappedMarcusHeadings(lines) {
  const repaired = [];

  for (let index = 0; index < lines.length; index += 1) {
    const current = lines[index];
    const next = lines[index + 1];
    if (next && marcusSubheadingKeys.has(headingKey(`${current} ${next}`))) {
      repaired.push(`${current} ${next}`);
      index += 1;
      continue;
    }
    repaired.push(current);
  }

  return repaired;
}

function isMarcusHeading(line) {
  if (!line || line.length > 110) return false;
  return marcusSubheadingKeys.has(headingKey(line));
}

function pdfLinesToMarkdown(lines) {
  const blocks = [];
  let paragraph = [];

  function flushParagraph() {
    if (!paragraph.length) return;
    const joined = paragraph
      .join(" ")
      .replace(/\s+-\s+/g, "-")
      .replace(/([a-z])-\s+([a-z])/g, "$1$2")
      .replace(/\s+/g, " ")
      .trim();
    if (joined) blocks.push(joined);
    paragraph = [];
  }

  for (const line of lines) {
    if (isMarcusHeading(line)) {
      flushParagraph();
      blocks.push(`## ${line.replace(/:$/, "")}`);
      continue;
    }
    paragraph.push(line);
    if (/[.!?]"?$/.test(line)) flushParagraph();
  }
  flushParagraph();

  return blocks.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
}

function markdownToRecords(markdown) {
  return markdown
    .split(/\n{2,}/)
    .map((block) => ({ text: block.replace(/^##\s*/, ""), asSubheading: block.startsWith("## ") }))
    .filter((record) => record.text);
}

function extractMarcusSections() {
  const outerZip = new AdmZip(sources.marcus);
  const pdfEntry = outerZip.getEntry("resources/res/rsrc8");
  if (!pdfEntry) throw new Error("Unable to find resources/res/rsrc8 inside Marcus KDP block");

  const pdfBuffer = pdfEntry.getData();
  const streams = extractPdfStreams(pdfBuffer);
  const objects = extractPdfObjects(pdfBuffer);
  const contentFontMaps = buildContentFontMaps(objects, streams);

  function resolveContentIds(objectId) {
    if (streams.has(objectId)) return [objectId];
    const object = objects.get(objectId) ?? "";
    const contentIds = [...object.matchAll(/\/Contents\s+(?:\[(.*?)\]|(\d+)\s+0\s+R)/g)].flatMap((match) => {
      if (match[2]) return [Number(match[2])];
      return [...match[1].matchAll(/(\d+)\s+0\s+R/g)].map((ref) => Number(ref[1]));
    });
    return contentIds;
  }

  return marcusSections.map((section, order) => {
    const contentIds = section.objectIds.flatMap(resolveContentIds);
    const missing = contentIds.filter((objectId) => !streams.has(objectId));
    if (missing.length) throw new Error(`Marcus section ${section.title} is missing PDF stream objects: ${missing.join(", ")}`);

    const rawLines = contentIds.flatMap((objectId) =>
      extractPdfLines(streams.get(objectId), contentFontMaps.get(objectId) ?? new Map())
    );
    const lines = stripOpeningTitleLines(
      repairWrappedMarcusHeadings(repairHyphenatedPdfLines(repairMarcusDropCaps(stripPdfNoise(rawLines)))),
      section
    );
    const markdown = pdfLinesToMarkdown(lines);
    const records = markdownToRecords(markdown);

    return { ...section, order, records, markdown };
  });
}

async function writeSections(bookSlug, sections, expectedCount) {
  if (sections.length !== expectedCount) {
    throw new Error(
      `Expected ${expectedCount} ${bookSlug} sections, generated ${sections.length}: ${sections
        .map((section) => section.title)
        .join(" | ")}`
    );
  }

  const outputDir = path.join(outputRoot, bookSlug);
  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });

  for (const section of sections) {
    const filename = `${String(section.order).padStart(2, "0")}-${slugify(section.title)}.md`;
    const body =
      section.markdown ??
      section.records
        .map(recordToMarkdown)
        .filter(Boolean)
        .join("\n\n")
        .trim();

    const markdown = [
      frontmatter({
        bookSlug,
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

  console.log(`${bookSlug}: ${sections.length} sections`);
}

async function main() {
  const unbridledRecords = repairDropCaps(paragraphsFromNestedDocx(sources.unbridled));
  const unbridledSections = parseUnbridledSections(unbridledRecords);
  await writeSections("unbridled-prince", unbridledSections, 10);

  const marcusExtracted = extractMarcusSections();
  await writeSections("resurrection-marcus-aurelius", marcusExtracted, 10);
}

await main();
