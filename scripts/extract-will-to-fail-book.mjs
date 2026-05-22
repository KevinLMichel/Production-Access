import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import AdmZip from "adm-zip";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultSource = path.join(os.homedir(), "Downloads", "The_Will_to_Fail_extracted_from_KDP.docx");
const sourceDocx = process.env.WILL_TO_FAIL_DOCX ? path.resolve(process.env.WILL_TO_FAIL_DOCX) : defaultSource;
const outputDir = path.join(root, "src", "content", "book-chapters", "will-to-fail");
const updated = "2026-05-22";

const summaries = new Map([
  ["prologue", "A direct opening challenge to the hidden loyalty that keeps failure familiar."],
  ["failure-is-a-decision", "Names failure as a pattern of choices and begins the work of reclaiming agency."],
  ["why-some-brains-crave-ruin", "Explores the darker psychological and neurological rewards that can make ruin feel familiar."],
  ["comfort-of-the-cell", "Exposes the false safety, sympathy, and lowered expectations that make failure feel comfortable."],
  ["identity-as-anchor", "Shows how old labels, group loyalties, and familiar self-stories can pull success back down."],
  ["sabotage-tool-kit", "Identifies the daily tools of self-sabotage: procrastination, drama, delay, excuses, and escape."],
  ["when-teams-love-to-lose", "Examines social environments that quietly reward shared defeat and punish upward movement."],
  ["low-dopamine-mornings-high-agency-days", "Builds practical routines for agency, discipline, and momentum before old cravings take over."],
  ["the-chaos-baseline-index", "Offers a way to measure chaos tolerance and lower the need to manufacture crisis."],
  ["from-will-to-fail-will-to-forge", "Turns the argument toward the stronger will: deliberate action, forged identity, and chosen authority."]
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
    .replaceAll("â€™", "’")
    .replaceAll("â€˜", "‘")
    .replaceAll("â€œ", "“")
    .replaceAll("â€", "”")
    .replaceAll("â€“", "–")
    .replaceAll("â€”", "—")
    .replaceAll("â€¦", "…")
    .replaceAll("Â", "");
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

  return stripLiteralXmlTags(repairMojibake(pieces.join("").replace(/\u00a0/g, " ").trim()));
}

function stripLiteralXmlTags(value) {
  return value.replace(/<\/?w:[^>]+>/g, "").trim();
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

function parseHeading(text) {
  if (text === "Prologue") {
    return {
      order: 0,
      title: "Prologue",
      subtitle: "Prologue"
    };
  }

  const match = text.match(/^Chapter\s+(\d+):\s*(.+)$/i);
  if (!match) return null;

  return {
    order: Number(match[1]),
    title: match[2].trim(),
    subtitle: `Chapter ${match[1]}`
  };
}

function normalizeParagraph(paragraph) {
  return paragraph
    .replace(/\bhalffinished\b/gi, "half-finished")
    .replace(/\blongterm\b/gi, "long-term")
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
let currentPart = "Opening - The Confession";
let current = null;

for (const record of records) {
  if (record.style === "PartHeading") {
    currentPart = record.text;
    continue;
  }

  if (record.style === "Heading1") {
    if (current) sections.push(current);
    const heading = parseHeading(record.text);

    if (!heading) {
      throw new Error(`Unable to parse heading: ${record.text}`);
    }

    current = {
      ...heading,
      part: heading.order === 0 ? "Opening - The Confession" : currentPart,
      paragraphs: []
    };
    continue;
  }

  if (
    current &&
    record.text !== "The Will to Fail" &&
    record.text !== "by Kevin L. Michel" &&
    record.text !== "Kevin L. Michel"
  ) {
    current.paragraphs.push(record.text);
  }
}

if (current) sections.push(current);

if (sections.length !== 10) {
  throw new Error(`Expected 10 sections, found ${sections.length}.`);
}

await fs.rm(outputDir, { recursive: true, force: true });
await fs.mkdir(outputDir, { recursive: true });

for (const section of sections) {
  const slug = slugify(section.title);
  const filename = `${String(section.order).padStart(2, "0")}-${slug}.md`;
  const markdown = [
    frontmatter({
      bookSlug: "will-to-fail",
      title: section.title,
      subtitle: section.subtitle,
      part: section.part,
      order: section.order,
      summary: summaries.get(slug) ?? `A section from The Will to Fail: ${section.title}.`,
      updated
    }),
    "",
    bodyToMarkdown(section.paragraphs),
    ""
  ].join("\n");

  await fs.writeFile(path.join(outputDir, filename), markdown, "utf8");
}

console.log(`Extracted ${sections.length} sections to ${outputDir}`);
