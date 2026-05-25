import fs from "node:fs/promises";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import AdmZip from "adm-zip";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath =
  process.env.BOOK_ACCESS_ART_REALITY_WARPING_INPUT ??
  path.join(process.env.USERPROFILE ?? "", "Downloads", "Book Downlo", "the art of reality warping DIGITAL_BOOK_BLOCK");
const outputDir = path.join(root, "src", "content", "book-chapters", "art-of-reality-warping");
const updated = "2026-05-24";

const sections = [
  {
    title: "Introduction",
    subtitle: "Introduction",
    part: "Opening",
    prose: [{ page: 7, dropTitle: true }, { page: 8 }]
  },
  {
    title: "Mind and Reality",
    subtitle: "Chapter 1",
    part: "Perception and Reality",
    poems: [
      { title: "The Power of Perception", pages: [{ page: 10, dropTitle: true }] },
      { title: "The Illusion of Separation", pages: [{ page: 11, dropTitle: true }] },
      { title: "The Nature of Thought", pages: [{ page: 12, dropTitle: true }] }
    ]
  },
  {
    title: "The Science of Reality",
    subtitle: "Chapter 2",
    part: "Perception and Reality",
    poems: [
      { title: "The Dance of the Subatomic Particles", pages: [{ page: 14, dropTitle: true }] },
      { title: "The Quantum Realm", pages: [{ page: 15, dropTitle: true }] },
      { title: "The Paradox of Time", pages: [{ page: 16, dropTitle: true }] },
      { title: "The Legacy of Our Ancestors", pages: [{ page: 18, dropTitle: true }] },
      { title: "The Science of Self-Discovery", pages: [{ page: 19, dropTitle: true }] },
      { title: "The Role of Environmental Factors", pages: [{ page: 20, dropTitle: true }] }
    ]
  },
  {
    title: "The Philosophy of Reality",
    subtitle: "Chapter 3",
    part: "Perception and Reality",
    poems: [
      { title: "The Nature of Reality", pages: [{ page: 22, dropTitle: true }] },
      { title: "The Limits of Knowledge", pages: [{ page: 23, dropTitle: true }] },
      { title: "The Importance of Ethics", pages: [{ page: 24, dropTitle: true }] }
    ]
  },
  {
    title: "The Power of Intention",
    subtitle: "Chapter 4",
    part: "Perception and Reality",
    poems: [
      { title: "The Art of Manifestation", pages: [{ page: 26, dropTitle: true }] },
      { title: "The Law of Attraction", pages: [{ page: 27, dropTitle: true }] },
      { title: "The Power of Gratitude", pages: [{ page: 28, dropTitle: true }] }
    ]
  },
  {
    title: "Your Many Paths",
    subtitle: "Chapter 5",
    part: "Perception and Reality",
    poems: [
      { title: "Reflections on Life", pages: [{ page: 30, dropTitle: true }] },
      { title: "The Beauty of the Universe", pages: [{ page: 31, dropTitle: true }] },
      { title: "The Mystery of Existence", pages: [{ page: 32, dropTitle: true }] },
      { title: "The Journey Within", pages: [{ page: 33, dropTitle: true }, { page: 34 }] }
    ]
  },
  {
    title: "The Blessing of Unconditional Happiness",
    subtitle: "Chapter 6",
    part: "Healing, Courage, and Breath",
    poems: [
      { title: "The Unseen Realms", pages: [{ page: 36, dropTitle: true }] },
      { title: "The Power of Love", pages: [{ page: 37, dropTitle: true }] },
      { title: "The Meaning of Life", pages: [{ page: 38, dropTitle: true }] },
      { title: "The Endless Possibilities", pages: [{ page: 39, dropTitle: true }] }
    ]
  },
  {
    title: "The Grace of Forgiveness",
    subtitle: "Chapter 7",
    part: "Healing, Courage, and Breath",
    poems: [
      { title: "The Beauty of Diversity", pages: [{ page: 42, dropTitle: true }] },
      { title: "The Balance of Life", pages: [{ page: 43, dropTitle: true }] },
      { title: "The Power of Imagination", pages: [{ page: 44, dropTitle: true }, { page: 45 }] }
    ]
  },
  {
    title: "The Courage to Follow Your Dreams",
    subtitle: "Chapter 8",
    part: "Healing, Courage, and Breath",
    poems: [
      { title: "The Power of Forgiveness", pages: [{ page: 46, dropTitle: true }] },
      { title: "The Wonder of Creation", pages: [{ page: 47, dropTitle: true }] },
      { title: "The Beauty of Nature", pages: [{ page: 48, dropTitle: true }] }
    ]
  },
  {
    title: "The Miracle of Mindful Breathing",
    subtitle: "Chapter 9",
    part: "Healing, Courage, and Breath",
    poems: [
      { title: "The Journey to Self-Discovery", pages: [{ page: 50, dropTitle: true }, { page: 51 }] },
      { title: "The Importance of Self-Care", pages: [{ page: 52, dropTitle: true }] }
    ]
  },
  {
    title: "The Beauty of Compassion",
    subtitle: "Chapter 10",
    part: "Healing, Courage, and Breath",
    poems: [
      { title: "The Magic of the Present Moment", pages: [{ page: 54, dropTitle: true }] },
      { title: "The Miracle of Life", pages: [{ page: 55, dropTitle: true }, { page: 56 }] },
      { title: "The Significance of Time", pages: [{ page: 57, dropTitle: true }] }
    ]
  },
  {
    title: "The Power of Purposeful Action",
    subtitle: "Chapter 11",
    part: "Action, Movement, and Transformation",
    poems: [
      { title: "The Meaning of Success", pages: [{ page: 60, dropTitle: true }, { page: 61 }] },
      { title: "The Importance of Kindness", pages: [{ page: 62, dropTitle: true }] },
      { title: "The Power of Mindfulness", pages: [{ page: 63, dropTitle: true }] }
    ]
  },
  {
    title: "The Magic of Mindful Movement",
    subtitle: "Chapter 12",
    part: "Action, Movement, and Transformation",
    poems: [
      { title: "The Power of Positive Thinking", pages: [{ page: 66, dropTitle: true }] },
      { title: "The Path to Inner Peace", pages: [{ page: 67, dropTitle: true }] },
      { title: "The Secret of Happiness", pages: [{ page: 68, dropTitle: true }] }
    ]
  },
  {
    title: "The Journey of Inner Healing",
    subtitle: "Chapter 13",
    part: "Action, Movement, and Transformation",
    poems: [
      { title: "The Importance of Self-Acceptance", pages: [{ page: 70, dropTitle: true }] },
      { title: "The Wonder of the Human Experience", pages: [{ page: 71, dropTitle: true }] },
      { title: "The Strength of the Human Connection", pages: [{ page: 72, dropTitle: true }] }
    ]
  },
  {
    title: "The Strength of Self-Love",
    subtitle: "Chapter 14",
    part: "Action, Movement, and Transformation",
    poems: [
      { title: "The Importance of Play", pages: [{ page: 74, dropTitle: true }] },
      { title: "The Power of Hope", pages: [{ page: 75, dropTitle: true }] },
      { title: "The Journey to Freedom", pages: [{ page: 76, dropTitle: true }] },
      { title: "The Art of Embracing Change", pages: [{ page: 77, dropTitle: true }] }
    ]
  },
  {
    title: "The Path of Personal Transformation",
    subtitle: "Chapter 15",
    part: "Action, Movement, and Transformation",
    poems: [
      { title: "The Magic of Dreams", pages: [{ page: 80, dropTitle: true }] },
      { title: "The Endless Opportunities", pages: [{ page: 81, dropTitle: true }] },
      { title: "The Strength of the Human Spirit", pages: [{ page: 82, dropTitle: true }] }
    ]
  },
  {
    title: "Conclusion",
    subtitle: "Conclusion",
    part: "Closing",
    prose: [{ page: 83, dropTitle: true }]
  }
];

function unicodeFromHex(hex) {
  const pieces = [];
  for (let index = 0; index < hex.length; index += 4) {
    const code = Number.parseInt(hex.slice(index, index + 4), 16);
    if (Number.isFinite(code) && code > 0) pieces.push(String.fromCharCode(code));
  }
  return pieces.join("");
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
    if (next === "\r" || next === "\n") {
      if (next === "\r" && raw[index + 2] === "\n") index += 1;
    } else if (next === "n") output += "\n";
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

function extractPdfObjects(pdfBuffer) {
  const pdf = pdfBuffer.toString("latin1");
  const objects = new Map();
  const objectPattern = /(\d+)\s+\d+\s+obj([\s\S]*?)endobj/g;

  for (const match of pdf.matchAll(objectPattern)) {
    objects.set(Number(match[1]), match[2]);
  }

  return objects;
}

function extractPdfStreams(pdfBuffer, objects) {
  const streams = new Map();

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
    const contentIds = contentIdsFromPageObject(pageObject);
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

function contentIdsFromPageObject(pageObject) {
  return [...pageObject.matchAll(/\/Contents\s+(?:\[(.*?)\]|(\d+)\s+0\s+R)/g)].flatMap((match) => {
    if (match[2]) return [Number(match[2])];
    return [...match[1].matchAll(/(\d+)\s+0\s+R/g)].map((ref) => Number(ref[1]));
  });
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
  const tokenPattern = /\(((?:\\[\s\S]|[^\\()])*)\)|<([0-9A-Fa-f\s]+)>/g;
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
    /\/([A-Za-z0-9_]+)\s+\d+(?:\.\d+)?\s+Tf|\[((?:[^\[\]]|\[[^\]]*\])*)\]\s*TJ|<([0-9A-Fa-f\s]+)>\s*Tj|\(((?:\\[\s\S]|[^\\()])*)\)\s*Tj|\bT\*|\b-?\d+(?:\.\d+)?\s+-?\d+(?:\.\d+)?\s+T[dD]|\b(?:-?\d+(?:\.\d+)?\s+){6}Tm/g;

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

function cleanPdfText(value) {
  return repairMojibake(value)
    .replace(/\u202f|\u2002|\u2003|\u2009|\u200a|\u200b|\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/[ \t]*\n[ \t]*/g, "\n")
    .replace(/\s+([,.;:?!])/g, "$1")
    .replace(/\b([A-Za-z]+)\?s\b/g, "$1's")
    .replace(/\bself-\s+acceptance\b/gi, "self-acceptance")
    .replace(/\bwiping'way\b/gi, "wiping away")
    .replace(/\s*\|\s*/g, " | ")
    .replace(/\s+-\s+/g, "-")
    .replace(/\s+'/g, "'")
    .trim();
}

function isGarbledLine(line) {
  if (!line) return true;
  if (/^[\d\s]+$/.test(line)) return true;
  if (/^Kevin L\. Michel$/i.test(line)) return true;
  if (/^The Art of Reality Warping$/i.test(line)) return true;
  if (/^[A-Z]$/.test(line)) return true;
  if (/^(T|HE|B|OF|C|M|Y|P|R|F|G|MINDFUL|COURAGE)$/i.test(line)) return true;

  const weird = [...line].filter((char) => {
    const code = char.charCodeAt(0);
    return (code < 32 && !/\s/.test(char)) || (code > 126 && !/[’“”—–éáíóúüñç]/.test(char));
  }).length;
  return weird / Math.max(line.length, 1) > 0.16;
}

function stripPageNoise(lines, { dropTitle = false } = {}) {
  const withoutTitle = dropTitle ? lines.slice(1) : lines;
  return withoutTitle.map(cleanPdfText).filter((line) => !isGarbledLine(line));
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

function summarize(markdown, fallbackTitle) {
  const compact = markdown
    .replace(/^##\s+.*$/gm, "")
    .replace(/<br\s*\/>/g, " ")
    .replace(/[#*_`>|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const sentence = compact.match(/^(.{80,220}?[.!?])\s/)?.[1] ?? compact.slice(0, 180);
  return sentence || fallbackTitle;
}

function proseToMarkdown(lines) {
  const blocks = [];
  let paragraph = [];

  function flush() {
    if (!paragraph.length) return;
    const text = paragraph
      .join(" ")
      .replace(/\s+/g, " ")
      .replace(/\s+([,.;:?!])/g, "$1")
      .replace(/\bself-\s+acceptance\b/gi, "self-acceptance")
      .trim();
    if (text) blocks.push(text);
    paragraph = [];
  }

  for (const line of lines) {
    paragraph.push(line);
    if (/[.!?]"?$/.test(line)) flush();
  }
  flush();

  return blocks.join("\n\n").trim();
}

function poemToMarkdown(title, lines) {
  const body = lines.map((line) => `${line}<br />`).join("\n").replace(/<br \/>\n$/g, "").trim();
  return [`## ${title}`, "", body].filter(Boolean).join("\n");
}

function pageTreeOrder(objects) {
  const catalog = objects.get(1) ?? "";
  const rootPagesId = Number(catalog.match(/\/Pages\s+(\d+)\s+0\s+R/)?.[1]);
  if (!rootPagesId) throw new Error("Unable to find PDF page tree root.");

  function kidsOf(objectId) {
    const object = objects.get(objectId) ?? "";
    const kidsBlock = object.match(/\/Kids\s*\[([\s\S]*?)\]/)?.[1] ?? "";
    return [...kidsBlock.matchAll(/(\d+)\s+0\s+R/g)].map((match) => Number(match[1]));
  }

  function walk(objectId, pages = []) {
    const object = objects.get(objectId) ?? "";
    if (/\/Type\s*\/Page\b/.test(object)) {
      pages.push(objectId);
      return pages;
    }
    for (const kid of kidsOf(objectId)) walk(kid, pages);
    return pages;
  }

  return walk(rootPagesId);
}

function extractPages() {
  const outerZip = new AdmZip(sourcePath);
  const pdfEntry = outerZip.getEntry("resources/res/rsrc8");
  if (!pdfEntry) throw new Error(`Unable to find resources/res/rsrc8 inside ${sourcePath}`);

  const pdfBuffer = pdfEntry.getData();
  const objects = extractPdfObjects(pdfBuffer);
  const streams = extractPdfStreams(pdfBuffer, objects);
  const contentFontMaps = buildContentFontMaps(objects, streams);
  const pageObjects = pageTreeOrder(objects);
  const pages = new Map();

  pageObjects.forEach((pageObjectId, index) => {
    const pageObject = objects.get(pageObjectId) ?? "";
    const contentIds = contentIdsFromPageObject(pageObject);
    const lines = contentIds.flatMap((contentId) =>
      extractPdfLines(streams.get(contentId) ?? "", contentFontMaps.get(contentId) ?? new Map())
    );
    pages.set(index + 1, lines);
  });

  return pages;
}

function linesForPageList(pages, pageList) {
  return pageList.flatMap((pageInfo) => stripPageNoise(pages.get(pageInfo.page) ?? [], pageInfo));
}

function sectionMarkdown(section, pages) {
  if (section.prose) return proseToMarkdown(linesForPageList(pages, section.prose));

  return section.poems
    .map((poem) => poemToMarkdown(poem.title, linesForPageList(pages, poem.pages)))
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

async function main() {
  const pages = extractPages();
  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });

  if (sections.length !== 17) {
    throw new Error(`Expected 17 configured sections, found ${sections.length}`);
  }

  for (const [order, section] of sections.entries()) {
    const body = sectionMarkdown(section, pages);
    if (!body) throw new Error(`No body generated for ${section.title}`);

    const filename = `${String(order).padStart(2, "0")}-${slugify(section.title)}.md`;
    const markdown = [
      frontmatter({
        bookSlug: "art-of-reality-warping",
        title: section.title,
        subtitle: section.subtitle,
        part: section.part,
        order,
        summary: summarize(body, section.title),
        updated
      }),
      "",
      body,
      ""
    ].join("\n");
    await fs.writeFile(path.join(outputDir, filename), markdown, "utf8");
  }

  console.log(`art-of-reality-warping: ${sections.length} sections`);
}

await main();
