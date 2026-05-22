import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import AdmZip from "adm-zip";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultSource = path.join(os.homedir(), "Downloads", "Banzos_Sword_extracted_from_KDP.docx");
const sourceDocx = process.env.BANZOS_SWORD_DOCX ? path.resolve(process.env.BANZOS_SWORD_DOCX) : defaultSource;
const outputDir = path.join(root, "src", "content", "book-chapters", "banzos-sword");
const updated = "2026-05-22";

const sectionsByLabel = new Map([
  [
    "Historical Note",
    {
      order: 0,
      title: "Historical Note",
      subtitle: "Context",
      part: "Opening Note",
      summary: "Sets the Edo-era and Yagyu lineage context behind this original retelling."
    }
  ],
  [
    "Prologue - The Blade in the Rain",
    {
      order: 1,
      title: "The Blade in the Rain",
      subtitle: "Prologue",
      part: "Prologue",
      summary: "Rain, shame, and hunger drive Matajuro toward Banzo's gate."
    }
  ],
  [
    "Part I - Ashes and Ambition",
    {
      order: 2,
      title: "Ashes and Ambition",
      subtitle: "Part I",
      part: "Part I - Ashes and Ambition",
      summary: "Matajuro arrives full of urgency and learns that speed is not the same as readiness."
    }
  ],
  [
    "Part II - The Years Without Steel",
    {
      order: 3,
      title: "The Years Without Steel",
      subtitle: "Through years without steel, the true blade is forged within.",
      part: "Part II - The Years Without Steel",
      summary: "Ordinary labor becomes the dojo where attention, patience, and zanshin begin to form."
    }
  ],
  [
    "Part III - The Rain of Blows",
    {
      order: 4,
      title: "The Rain of Blows",
      subtitle: "Steel is tempered into a sword only by enduring countless blows.",
      part: "Part III - The Rain of Blows",
      summary: "Banzo's sudden strikes teach Matajuro to stop separating practice from life."
    }
  ],
  [
    "Part IV - The Edge Without Edge",
    {
      order: 5,
      title: "The Edge Without Edge",
      subtitle: "The warrior whose spirit is sharp carries an edge no steel can match.",
      part: "Part IV - The Edge Without Edge",
      summary: "Matajuro begins to understand the sword that exists before the weapon is lifted."
    }
  ],
  [
    "Part V - The Sword That Is No Sword",
    {
      order: 6,
      title: "The Sword That Is No Sword",
      subtitle: "The highest victory is won without unsheathing the sword.",
      part: "Part V - The Sword That Is No Sword",
      summary: "The final teaching turns mastery away from display and toward invisible command of the self."
    }
  ],
  [
    "Epilogue - A Blade That Casts No Shadow",
    {
      order: 7,
      title: "A Blade That Casts No Shadow",
      subtitle: "The finest blade leaves neither wound nor shadow.",
      part: "Epilogue",
      summary: "Matajuro carries Banzo's lesson forward as a blade that no longer needs to announce itself."
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
    .replaceAll("Ã¢â‚¬â€œ", "-")
    .replaceAll("Ã¢â‚¬â€", "-")
    .replaceAll("Ã¢â‚¬Â¦", "...")
    .replaceAll("Ã‚", "");
}

function normalizeDashes(value) {
  return value.replace(/[–—]/g, "-").replace(/\s+-\s+/g, " - ").trim();
}

function paragraphStyle(paragraph) {
  return paragraph.match(/<w:pStyle[^>]+w:val="([^"]+)"/)?.[1] ?? "";
}

function stripLiteralXmlTags(value) {
  return value.replace(/<\/?w:[^>]+>/g, "").replace(/<[^>]+>/g, "").trim();
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

  return stripLiteralXmlTags(repairMojibake(pieces.join("").replace(/\u00a0/g, " ").trim()));
}

function paragraphsFromDocumentXml(xml) {
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
    const record = records[index];
    const next = records[index + 1];

    if (/^[A-Z]$/.test(record.text) && next && /^[a-z]/.test(next.text)) {
      repaired.push({
        style: next.style || record.style,
        text: `${record.text}${next.text}`
      });
      index += 1;
      continue;
    }

    repaired.push(record);
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
    .replace(/\bAfew\b/g, "A few")
    .replace(/\bthe old man\b/g, "the old man")
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

const records = repairDropCaps(paragraphsFromDocumentXml(documentEntry.getData().toString("utf8")));
const sections = [];
let current = null;

for (const record of records) {
  const text = record.text.trim();
  const normalized = normalizeDashes(text);
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
    text !== "Banzo's Sword" &&
    text !== "Banzo's Sword" &&
    text !== "Kevin L. Michel" &&
    text !== current.subtitle
  ) {
    current.paragraphs.push(text);
  }
}

if (current) sections.push(current);

if (sections.length !== 8) {
  throw new Error(`Expected 8 sections, found ${sections.length}.`);
}

await fs.rm(outputDir, { recursive: true, force: true });
await fs.mkdir(outputDir, { recursive: true });

for (const section of sections) {
  const slug = section.order === 0 ? "historical-note" : slugify(section.title);
  const filename = `${String(section.order).padStart(2, "0")}-${slug}.md`;
  const markdown = [
    frontmatter({
      bookSlug: "banzos-sword",
      title: section.title,
      subtitle: section.subtitle,
      part: section.part,
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
