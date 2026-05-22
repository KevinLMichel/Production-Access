import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import AdmZip from "adm-zip";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultSource = path.join(
  os.homedir(),
  "Downloads",
  "Book Downlo",
  "Steam_over_Cold_Steel_extracted_from_KDP.docx"
);
const sourceDocx = process.env.STEAM_DOCX ? path.resolve(process.env.STEAM_DOCX) : defaultSource;
const outputDir = path.join(root, "src", "content", "book-chapters", "steam-over-cold-steel");
const updated = "2026-05-22";

const sectionsByLabel = new Map([
  [
    "Prologue",
    {
      order: 0,
      title: "The Crushed Camellia",
      summary: "Hideyoshi turns against Sen no Rikyū and sends Katō Masanobu toward a mission of violence."
    }
  ],
  [
    "Part I",
    {
      order: 1,
      title: "The Road to Sakai",
      summary: "Katō rides toward Sakai, carrying duty, doubt, and the command to kill an unarmed tea master."
    }
  ],
  [
    "Part II",
    {
      order: 2,
      title: "The Tea Hut and the Steam",
      summary: "Inside Rikyū's tearoom, steel meets ceremony and a kettle of steam breaks the assassin's certainty."
    }
  ],
  [
    "Part III",
    {
      order: 3,
      title: "The Pact After the Kettle",
      summary: "Rikyū answers violence with composure, binding Katō to a harder form of honor."
    }
  ],
  [
    "Part IV",
    {
      order: 4,
      title: "Before the Final Tea",
      summary: "Katō returns before dawn as disciples gather for a final ceremony under the weight of obedience and grief."
    }
  ],
  [
    "Part V",
    {
      order: 5,
      title: "The Last Bowl",
      summary: "Rikyū prepares one final bowl of tea and transforms death into a lesson no blade can erase."
    }
  ],
  [
    "Part VI",
    {
      order: 6,
      title: "Report to Hideyoshi",
      summary: "Katō carries the truth back to Osaka Castle, where command, shame, and memory begin to change shape."
    }
  ],
  [
    "Epilogue",
    {
      order: 7,
      title: "The Garden Within",
      summary: "A year later, Katō returns to Rikyū's garden and understands the lesson of steam over cold steel."
    }
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

function removeXmlTags(value) {
  return value.includes("<") ? value.replace(/<[^>]+>/g, "").trim() : value;
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

  return removeXmlTags(pieces.join("").replace(/\u00a0/g, " ").trim());
}

function textFromDocumentXml(xml) {
  const paragraphMatches = xml.match(/<w:p[\s\S]*?<\/w:p>/g) ?? [];
  return paragraphMatches.map(textFromParagraph).filter(Boolean);
}

function repairDropCaps(paragraphs) {
  const repaired = [];

  for (let index = 0; index < paragraphs.length; index += 1) {
    const paragraph = paragraphs[index];
    const next = paragraphs[index + 1];

    if (/^[A-Z]$/.test(paragraph) && next && /^[a-zāōū]/i.test(next)) {
      repaired.push(`${paragraph}${next}`);
      index += 1;
      continue;
    }

    repaired.push(paragraph);
  }

  return repaired;
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

function normalizeParagraph(paragraph) {
  return paragraph
    .replace(/^Afew\b/, "A few")
    .replace(/\s+/g, " ")
    .trim();
}

function bodyToMarkdown(paragraphs) {
  return paragraphs.map(normalizeParagraph).filter(Boolean).join("\n\n");
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

const paragraphs = repairDropCaps(textFromDocumentXml(documentEntry.getData().toString("utf8")));
const sections = [];
let current = null;

for (const paragraph of paragraphs) {
  const normalized = paragraph.trim();
  const sectionMeta = sectionsByLabel.get(normalized);

  if (sectionMeta) {
    if (current) sections.push(current);
    current = {
      label: normalized,
      ...sectionMeta,
      paragraphs: []
    };
    continue;
  }

  if (
    current &&
    normalized !== "Steam over Cold Steel" &&
    normalized !== "Steam Over Cold Steel" &&
    normalized !== "Kevin L. Michel"
  ) {
    current.paragraphs.push(normalized);
  }
}

if (current) sections.push(current);

if (sections.length !== 8) {
  throw new Error(`Expected 8 sections, found ${sections.length}.`);
}

await fs.rm(outputDir, { recursive: true, force: true });
await fs.mkdir(outputDir, { recursive: true });

for (const section of sections) {
  const slug = slugify(section.title);
  const filename = `${String(section.order).padStart(2, "0")}-${slug}.md`;
  const markdown = [
    frontmatter({
      bookSlug: "steam-over-cold-steel",
      title: section.title,
      subtitle: section.label,
      part: section.label,
      order: section.order,
      summary: section.summary,
      updated
    }),
    "",
    bodyToMarkdown(section.paragraphs),
    ""
  ].join("\n");

  await fs.writeFile(path.join(outputDir, filename), markdown, "utf8");
}

console.log(`Extracted ${sections.length} sections to ${outputDir}`);
