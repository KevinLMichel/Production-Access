import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import AdmZip from "adm-zip";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath =
  process.env.BOOK_ACCESS_CLOCK_NO_HANDS_INPUT ??
  path.join(process.env.USERPROFILE ?? "", "Downloads", "Book Downlo", "The Clock with No Hands.docx");
const outputDir = path.join(root, "src", "content", "book-chapters", "clock-with-no-hands");
const updated = "2026-05-26";

// The Clock with No Hands is a live-build manuscript. This extractor creates
// the initial scaffold from Kevin's writing guide and will overwrite chapter
// files if rerun after future manual drafting.

const chapterOneDraft = String.raw`I stood inside a clock large enough to contain weather.

There was no waking, no door, no first explanation. I was already there, standing on a face of pale metal that curved beneath my shoes like the floor of a cathedral, or the deck of a ship, or the underside of a sky that had forgotten which way to fall.

The clock rose around me in a great circular wall. Its rim vanished into cloud. Its numerals were not numerals. They were cities.

Berlin smoldered where XII should have been. Moscow shone cold and enormous near I, its domes and towers pressed into a brass groove. Stalingrad sat lower on the rim, half white, half smoke, with a river running through it like a wound that had learned to reflect light. Manchester turned in soot and thread. Detroit flashed with glass, steel, and assembly lines. Shenzhen glittered with cranes and blue factory dawn. Washington spoke without moving its lips. Beyond them, where no number belonged, stood a future city made of scaffolding, drone lights, hospital windows, unfinished towers, and rain.

Every city was alive at once.

I heard typewriters. I heard artillery. I heard school bells and factory whistles, campaign speeches, hospital monitors, drones, cash registers, church organs, engines, prayers, and the thin electric sigh of screens left on in empty rooms. The sounds did not arrive in sequence. They arrived together, layered so densely that they became almost silent. It was the silence of too many instructions.

I looked for the hands.

There were none.

At the center of the clock face was a smooth brass pin, polished by use or by waiting. It had the dignity of a throne and the uselessness of a button no one had pressed. Around it, faint circular scars suggested that hands had once turned there. Or perhaps that many hands had tried and failed.

I walked toward the rim.

The floor was warm, but not with comfort. It had the warmth of machinery that had been running long before I arrived. Beneath the metal, gears shifted in a hidden depth. Some turned slowly, with the patience of institutions. Others clicked fast, like teeth. Now and then the whole structure trembled, and one city on the rim brightened while another dimmed, as if history were a series of rooms wired to the same unstable current.

When I reached the edge of the face, I saw that each city was not painted there. It opened inward.

Berlin had streets. I could see windows, files, boots, smoke, a woman carrying bread beneath a sky the color of iron. Moscow had offices where maps lay under lamps, and men bent over them as if geography could be commanded by leaning. Stalingrad had factory chimneys, river fog, summer heat, and a silence waiting inside itself for sirens. Manchester had children with lint in their hair. Detroit had men whose wrists already knew movements their minds no longer needed to name. Shenzhen had towers growing faster than trees and rooms lit at midnight by people whose faces were blue with work.

The future city was the strangest. It was not peaceful. It was not ruined. It was unfinished. Machines moved through it with perfect confidence. People walked beside them more uncertainly.

I wanted someone to tell me the hour.

No one appeared.

Instead, I found three plaques fixed into the inner rim. They were small, brass, and almost hidden between the cities. The first read:

LATE.

The word was cold when I touched it.

The second read:

EARLY.

It was colder.

The third read:

NOW.

That one was warm.

I kept my fingers on it longer than I meant to. The heat moved into my hand and then into my arm, not like fire, but like responsibility. I tried to pull away and found that I did not want to. The word seemed less like a point in time than a command.

Behind me, the clock ticked once.

The sound was enormous. It passed through the metal under my feet, through the cities in the rim, through my ribs, through the air itself. Berlin flinched. The future city flickered. A school bell rang inside Moscow. A factory whistle answered from Manchester. A shell burst somewhere I could not yet see.

Then the tick faded.

Nothing moved.

That was when I understood the first thing, though I did not yet have words for it. A clock without hands can still make noise. A civilization without agency can still produce urgency. It can still hurry, still threaten, still measure, still accuse. It can say late. It can say early. It can say now.

But it cannot tell the time.

I knelt beside the central pin and looked more closely. Around its base were scratches, thousands of them, thin and overlapping. Some looked like numbers. Some like signatures. Some like tally marks left by prisoners. A few had been rubbed almost smooth by years of explanation. I traced one with my thumb and felt a sting in my palm, as if the brass had remembered a wound before I had received it.

From the rim, voices rose.

"It is too late," said one city.

"It is too early," said another.

"It has always been this way," said a third.

"It cannot be otherwise," said a fourth.

The future city said nothing. Its cranes moved slowly against a sky without stars.

I stood again.

The clock face beneath me shifted from vertical wall to tilted floor, and then to something like a road. The cities leaned inward. Their sounds thickened. The brass pin at the center seemed farther away than before, though I had not moved from it. I looked for an exit and found only more circumference.

Near the plaque marked NOW, a seam opened in the metal.

It was narrow at first, no wider than a line drawn by a ruler. Then the line widened into a fence. Planks rose from the clock face, weathered, gray, and ordinary. They did not belong there, and because they did not belong, they appeared more real than anything else.

Behind the fence something moved.

I heard a dry hiss, gentle and exact, like silk being pulled across dust.

I stepped toward it.

The clock did not stop me. The cities did not answer. The plaque beneath my hand cooled as I let it go.

Through a slit in the fence, I saw the head of a snake pass from left to right. Then came the body, scale after scale, each one dark, each one catching a little light from the brass. Then came the tail.

Head. Body. Tail.

It seemed simple enough.

Then the same head appeared again.

The tick behind me became a hiss, and the hiss became almost a voice.

I leaned closer to the slit, trying to see what made one part summon the next, and the fence smelled of old rain, old wood, old lessons. Somewhere beyond it, a child laughed softly, not because anything was funny, but because someone had mistaken a narrow view for the whole world.

I did not yet know how to answer that laugh.

So I watched the snake pass again, head, body, tail, while the clock with no hands waited behind me, enormous and warm, making its useless, civilized sound.`;

const sectionDefinitions = [
  ["PART I - THE CLOCK", "Chapter 1 - The Rim of Cities"],
  ["PART I - THE CLOCK", "Chapter 2 - The Snake Through the Fence"],
  ["PART I - THE CLOCK", "Chapter 3 - The Wake"],
  ["PART II - THE FACTORY", "Chapter 4 - The Floor That Moved"],
  ["PART II - THE FACTORY", "Chapter 5 - The Office Above the Hands"],
  ["PART II - THE FACTORY", "Chapter 6 - The Four Separations"],
  ["PART II - THE FACTORY", "Chapter 7 - The Machine That Learned to Optimize"],
  ["PART III - THE TANK AND THE CITY", "Chapter 8 - The Steppe"],
  ["PART III - THE TANK AND THE CITY", "Chapter 9 - The City That Was Already Burning"],
  ["PART III - THE TANK AND THE CITY", "Chapter 10 - The River on Fire"],
  ["PART III - THE TANK AND THE CITY", "Chapter 11 - Rats' War"],
  ["PART III - THE TANK AND THE CITY", "Chapter 12 - The Kitchen Chair"],
  ["PART III - THE TANK AND THE CITY", "Chapter 13 - The Girl at the Gun"],
  ["PART III - THE TANK AND THE CITY", "Chapter 14 - Time Is Blood"],
  ["PART IV - THE SCHOOL", "Chapter 15 - The Classroom Without a Roof"],
  ["PART IV - THE SCHOOL", "Chapter 16 - The Examination of Obedience"],
  ["PART IV - THE SCHOOL", "Chapter 17 - The Hammer"],
  ["PART IV - THE SCHOOL", "Chapter 18 - The Infinite Library"],
  ["PART V - THE SCREEN", "Chapter 19 - The Screen Was Not a Window"],
  ["PART V - THE SCREEN", "Chapter 20 - The Cathedral of Common Sense"],
  ["PART V - THE SCREEN", "Chapter 21 - The Audience Commodity"],
  ["PART V - THE SCREEN", "Chapter 22 - The Museum of Good Intentions"],
  ["PART VI - THE SUPERMARKET", "Chapter 23 - The Aisle of Freedom"],
  ["PART VI - THE SUPERMARKET", "Chapter 24 - The Pharmacy of Despair"],
  ["PART VI - THE SUPERMARKET", "Chapter 25 - The Robot at Checkout"],
  ["PART VII - THE COURT AND THE HAND", "Chapter 26 - The Court of Those Who Paid"],
  ["PART VII - THE COURT AND THE HAND", "Chapter 27 - The Trial of the Machine"],
  ["PART VII - THE COURT AND THE HAND", "Chapter 28 - The Tank-Tree"],
  ["PART VII - THE COURT AND THE HAND", "Chapter 29 - The Clock Again"],
  ["PART VII - THE COURT AND THE HAND", "Chapter 30 - Now"]
].map(([part, heading], order) => {
  const [, chapterNumber, title] = heading.match(/^Chapter\s+(\d+)\s+-\s+(.+)$/);
  return { part: formatPart(part), chapterNumber: Number(chapterNumber), title, heading, order };
});

function formatPart(value) {
  const match = value.match(/^PART\s+([IVX]+)\s+-\s+(.+)$/i);
  if (!match) return value;
  return `Part ${match[1]} - ${titleCase(match[2])}`;
}

function titleCase(value) {
  const smallWords = new Set(["and", "of", "the"]);
  return value
    .toLowerCase()
    .split(/\s+/)
    .map((word, index) => (index > 0 && smallWords.has(word) ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(" ");
}

function decodeXml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function normalizeDash(value) {
  return value.replace(/[—–]/g, "-").replace(/[‘’]/g, "'");
}

function cleanText(value) {
  return value
    .replace(/â€œ|â€�/g, '"')
    .replace(/â€˜|â€™/g, "'")
    .replace(/â€”|â€“/g, "-")
    .replace(/Ã¯/g, "i")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
}

function extractParagraphs() {
  const zip = new AdmZip(sourcePath);
  const xml = zip.readAsText("word/document.xml");
  return [...xml.matchAll(/<w:p\b[^>]*>([\s\S]*?)<\/w:p>/g)]
    .map(([, paragraph]) =>
      [...paragraph.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)]
        .map((match) => decodeXml(match[1]))
        .join("")
    )
    .map(cleanText)
    .filter(Boolean);
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

function findSectionSlices(paragraphs) {
  const normalized = paragraphs.map((paragraph) => normalizeDash(paragraph));
  const result = new Map();

  for (const section of sectionDefinitions) {
    const start = normalized.findIndex((paragraph) => paragraph === section.heading);
    if (start === -1) throw new Error(`Missing source heading: ${section.heading}`);
    const next = sectionDefinitions[section.order + 1];
    const end = next
      ? normalized.findIndex((paragraph, index) => index > start && paragraph === next.heading)
      : normalized.findIndex((paragraph, index) => index > start && paragraph === "Character and Voice Notes");
    result.set(section.title, paragraphs.slice(start + 1, end === -1 ? paragraphs.length : end));
  }

  return result;
}

function sectionBefore(lines, stops) {
  const stopIndex = lines.findIndex((line) => stops.some((stop) => stop.test(line)));
  return stopIndex === -1 ? lines : lines.slice(0, stopIndex);
}

function collectAfter(lines, marker, stops) {
  const start = lines.findIndex((line) => marker.test(line));
  if (start === -1) return [];
  return sectionBefore(lines.slice(start + 1), stops).filter((line) => !/^Narrative beats continued:?$/i.test(line));
}

function parseGuide(lines) {
  const stops = [
    /^Narrative beats:?$/i,
    /^Narrative beats continued:?$/i,
    /^Purpose:/i,
    /^Transition:/i,
    /^Craft note:/i,
    /^Narrator development:/i,
    /^Transformations:/i,
    /^Final line options:/i,
    /^Best final line:/i
  ];
  const targetLength = lines.find((line) => /^Target length:/i.test(line))?.replace(/^Target length:\s*/i, "");
  const openingImage = lines.find((line) => /^Opening image:/i.test(line))?.replace(/^Opening image:\s*/i, "");
  const purpose = lines.find((line) => /^Purpose:/i.test(line))?.replace(/^Purpose:\s*/i, "");
  const transition = lines.find((line) => /^Transition:/i.test(line))?.replace(/^Transition:\s*/i, "");
  const craftNote = lines.find((line) => /^Craft note:/i.test(line))?.replace(/^Craft note:\s*/i, "");
  const narratorDevelopment = lines.find((line) => /^Narrator development:/i.test(line))?.replace(/^Narrator development:\s*/i, "");
  const bestFinalIndex = lines.findIndex((line) => /^Best final line:/i.test(line));
  const bestFinalInline = bestFinalIndex >= 0 ? lines[bestFinalIndex].replace(/^Best final line:\s*/i, "").trim() : "";
  const bestFinalLine =
    bestFinalInline ||
    (bestFinalIndex >= 0
      ? lines.slice(bestFinalIndex + 1).find((line) => line.trim() && !/^Character and Voice Notes/i.test(line))
      : "");

  const firstContent = lines.findIndex((line) => /^Target length:/i.test(line));
  const sceneStart = Math.max(firstContent + 1, 0);
  const sceneArchitecture = sectionBefore(
    lines
      .slice(sceneStart)
      .filter((line) => !/^Opening image:/i.test(line)),
    stops
  ).filter(Boolean);

  const beats = [
    ...collectAfter(lines, /^Narrative beats:?$/i, stops.filter((stop) => !/^\/\^Narrative beats:\?/.test(String(stop)))),
    ...collectAfter(lines, /^Narrative beats continued:?$/i, stops)
  ];
  const transformations = collectAfter(lines, /^Transformations:?$/i, stops);
  const finalOptions = collectAfter(lines, /^Final line options:?$/i, [/^Best final line:/i, /^Character and Voice Notes/i]).filter(
    (line) => !/^Or:?$/i.test(line)
  );

  return {
    targetLength,
    openingImage,
    sceneArchitecture,
    beats,
    transformations,
    purpose,
    transition,
    craftNote,
    narratorDevelopment,
    finalOptions,
    bestFinalLine
  };
}

function paragraphBlock(lines) {
  return lines.map((line) => line.trim()).filter(Boolean).join("\n\n");
}

function bulletList(lines) {
  return lines.map((line) => `- ${line.trim()}`).join("\n");
}

function blueprintMarkdown(section, guide) {
  const blocks = [
    "> Live build note: this chapter is currently a public blueprint for the novella. It preserves the scene architecture, moral pressure, and transition logic while the full prose draft is built iteratively.",
    "",
    "## Chapter Promise",
    guide.purpose || `${section.title} develops the next movement in the narrator's passage from witness to agency.`,
    ""
  ];

  if (guide.targetLength || guide.openingImage) {
    blocks.push("## Draft Frame");
    if (guide.targetLength) blocks.push(`Final prose target: ${guide.targetLength}.`);
    if (guide.openingImage) blocks.push(`Opening image: ${guide.openingImage}`);
    blocks.push("");
  }

  if (guide.sceneArchitecture.length) {
    blocks.push("## Scene Architecture", paragraphBlock(guide.sceneArchitecture), "");
  }

  if (guide.beats.length) {
    blocks.push("## Key Narrative Beats", bulletList(guide.beats), "");
  }

  if (guide.transformations.length) {
    blocks.push("## Transformations", bulletList(guide.transformations), "");
  }

  if (guide.narratorDevelopment) {
    blocks.push("## Narrator Movement", guide.narratorDevelopment, "");
  }

  if (guide.craftNote) {
    blocks.push("## Craft Constraint", guide.craftNote, "");
  }

  if (guide.transition) {
    blocks.push("## Transition", guide.transition, "");
  }

  if (guide.finalOptions.length || guide.bestFinalLine) {
    blocks.push("## Ending Cadence");
    if (guide.finalOptions.length) blocks.push(bulletList(guide.finalOptions));
    if (guide.bestFinalLine) blocks.push(`Best final line: ${guide.bestFinalLine}`);
    blocks.push("");
  }

  return blocks.join("\n").trim();
}

function summarize(markdown, fallback) {
  const compact = markdown
    .replace(/^>.*$/gm, "")
    .replace(/^##\s+.*$/gm, "")
    .replace(/[#*_`>|-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const sentence = compact.match(/^(.{90,220}?[.!?])\s/)?.[1];
  return sentence || compact.slice(0, 190) || fallback;
}

async function main() {
  const paragraphs = extractParagraphs();
  const slices = findSectionSlices(paragraphs);
  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });

  if (sectionDefinitions.length !== 30) {
    throw new Error(`Expected 30 configured sections, found ${sectionDefinitions.length}`);
  }

  for (const section of sectionDefinitions) {
    const sourceLines = slices.get(section.title);
    const guide = parseGuide(sourceLines ?? []);
    const body = section.order === 0 ? chapterOneDraft : blueprintMarkdown(section, guide);
    const subtitle = `Chapter ${section.chapterNumber}`;
    const filename = `${String(section.order).padStart(2, "0")}-${slugify(section.title)}.md`;
    const markdown = [
      frontmatter({
        bookSlug: "clock-with-no-hands",
        title: section.title,
        subtitle,
        part: section.part,
        order: section.order,
        summary: summarize(body, section.title),
        updated
      }),
      "",
      body,
      ""
    ].join("\n");
    await fs.writeFile(path.join(outputDir, filename), markdown, "utf8");
  }

  console.log(`clock-with-no-hands: ${sectionDefinitions.length} sections`);
}

await main();
