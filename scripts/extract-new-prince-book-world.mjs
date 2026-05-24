import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot =
  process.env.BOOK_ACCESS_NEW_PRINCE_SOURCE ??
  "C:\\Users\\kevin\\Applications by KLMichel\\new-prince-hard-times\\src\\content";
const outputDir = path.join(root, "src", "content", "book-chapters", "new-prince-hard-times");
const updated = "2026-05-24";

const chapterDir = path.join(sourceRoot, "chapters");
const appendixDir = path.join(sourceRoot, "appendices");
const endnoteDir = path.join(sourceRoot, "endnotes");
const bibliographyPath = path.join(sourceRoot, "notes", "source-bibliography.md");

function splitFrontmatter(markdown, filePath) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    throw new Error(`Missing frontmatter in ${filePath}`);
  }
  return { frontmatter: match[1], body: match[2].replace(/\r\n/g, "\n").trim() };
}

function parseScalar(rawValue) {
  const value = rawValue.trim();
  if (/^".*"$/.test(value)) return value.slice(1, -1);
  if (/^\d+$/.test(value)) return Number(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (/^\[.*\]$/.test(value)) {
    return value
      .slice(1, -1)
      .split(",")
      .map((item) => item.trim().replace(/^"|"$/g, ""))
      .filter(Boolean);
  }
  return value;
}

function parseSimpleFrontmatter(frontmatter) {
  const data = {};
  for (const line of frontmatter.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (!match) continue;
    data[match[1]] = parseScalar(match[2]);
  }
  return data;
}

function frontmatter(data) {
  const lines = ["---"];
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "number") {
      lines.push(`${key}: ${value}`);
    } else {
      lines.push(`${key}: ${JSON.stringify(value)}`);
    }
  }
  lines.push("---");
  return lines.join("\n");
}

function slugSuffix(fileName) {
  return fileName.replace(/^\d+-/, "").replace(/\.md$/i, "");
}

function normalizeBody(body) {
  return body
    .replace(/\r\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

async function markdownFiles(directory) {
  const files = await fs.readdir(directory);
  return files.filter((file) => file.endsWith(".md")).sort((a, b) => a.localeCompare(b));
}

async function writeSection(fileName, data, body) {
  const target = path.join(outputDir, fileName);
  const content = `${frontmatter({
    bookSlug: "new-prince-hard-times",
    title: data.title,
    ...(data.subtitle ? { subtitle: data.subtitle } : {}),
    part: data.part,
    order: data.order,
    summary: data.summary,
    updated: data.updated ?? updated
  })}\n\n${normalizeBody(body)}\n`;
  await fs.writeFile(target, content, "utf8");
}

async function copyChapters() {
  const files = await markdownFiles(chapterDir);
  for (const file of files) {
    const source = path.join(chapterDir, file);
    const { frontmatter: rawFrontmatter, body } = splitFrontmatter(await fs.readFile(source, "utf8"), source);
    const data = parseSimpleFrontmatter(rawFrontmatter);
    await writeSection(
      file,
      {
        title: data.title,
        subtitle: data.subtitle,
        part: data.part,
        order: data.order,
        summary: data.summary ?? data.dek ?? data.title,
        updated: data.updated
      },
      body
    );
  }
  return files.length;
}

async function copyAppendices(startOrder) {
  const files = await markdownFiles(appendixDir);
  for (const [index, file] of files.entries()) {
    const source = path.join(appendixDir, file);
    const { frontmatter: rawFrontmatter, body } = splitFrontmatter(await fs.readFile(source, "utf8"), source);
    const data = parseSimpleFrontmatter(rawFrontmatter);
    const order = startOrder + index;
    const appendixNumber = index + 1;
    await writeSection(
      `${String(order).padStart(3, "0")}-${slugSuffix(file)}.md`,
      {
        title: data.title,
        subtitle: `Appendix ${appendixNumber}`,
        part: "Appendices - Field Worksheets",
        order,
        summary: data.summary ?? "A public field worksheet from The New Prince of Hard Times.",
        updated: data.updated
      },
      body
    );
  }
  return files.length;
}

function parseEndnoteItems(frontmatterText) {
  const items = [];
  const pattern =
    /-\s+marker:\s*"([^"]+)"\s*\n\s*text:\s*"([\s\S]*?)"\s*\n\s*sources:\s*\n((?:\s*-\s*"[^"]+"\s*\n?)*)/g;
  for (const match of frontmatterText.matchAll(pattern)) {
    const sources = Array.from(match[3].matchAll(/-\s*"([^"]+)"/g)).map((sourceMatch) => sourceMatch[1]);
    items.push({ marker: match[1], text: match[2], sources });
  }
  return items;
}

async function writeEndnotes(order) {
  const files = await markdownFiles(endnoteDir);
  const blocks = [];

  for (const file of files) {
    const source = path.join(endnoteDir, file);
    const { frontmatter: rawFrontmatter } = splitFrontmatter(await fs.readFile(source, "utf8"), source);
    const data = parseSimpleFrontmatter(rawFrontmatter);
    const notes = parseEndnoteItems(rawFrontmatter);
    if (!notes.length) continue;

    blocks.push(`## Chapter ${data.chapterOrder}: ${data.chapterTitle}`);
    for (const note of notes) {
      blocks.push(`- **${note.marker}.** ${note.text}`);
      if (note.sources.length) {
        blocks.push(`  Sources: ${note.sources.join("; ")}`);
      }
    }
    blocks.push("");
  }

  await writeSection(
    `${String(order).padStart(3, "0")}-endnotes.md`,
    {
      title: "Endnotes",
      subtitle: "Source Notes",
      part: "Endnotes and Sources",
      order,
      summary: "Chapter-level public source notes for selected contemporary examples.",
      updated
    },
    blocks.join("\n")
  );

  return 1;
}

async function writeBibliography(order) {
  const { body } = splitFrontmatter(await fs.readFile(bibliographyPath, "utf8"), bibliographyPath);
  await writeSection(
    `${String(order).padStart(3, "0")}-source-bibliography.md`,
    {
      title: "Source Bibliography",
      subtitle: "Bibliography",
      part: "Endnotes and Sources",
      order,
      summary: "Public source map and bibliography for future evidence passes.",
      updated
    },
    body
  );
  return 1;
}

await fs.rm(outputDir, { recursive: true, force: true });
await fs.mkdir(outputDir, { recursive: true });

const chapterCount = await copyChapters();
const appendixCount = await copyAppendices(chapterCount + 1);
const endnotesCount = await writeEndnotes(chapterCount + appendixCount + 1);
const bibliographyCount = await writeBibliography(chapterCount + appendixCount + endnotesCount + 1);
const total = chapterCount + appendixCount + endnotesCount + bibliographyCount;

if (chapterCount !== 16) throw new Error(`Expected 16 chapters, generated ${chapterCount}.`);
if (appendixCount !== 13) throw new Error(`Expected 13 appendices, generated ${appendixCount}.`);
if (total !== 31) throw new Error(`Expected 31 total sections, generated ${total}.`);

console.log(`Generated ${total} New Prince sections in ${outputDir}`);
