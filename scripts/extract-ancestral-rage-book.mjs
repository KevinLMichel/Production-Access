import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

// WARNING: Rerunning this extractor overwrites generated Ancestral Rage reader sections.
const sourceDir = resolve(
  process.env.PRODUCTION_ACCESS_ANCESTRAL_RAGE_INPUT ??
    "C:/Users/kevin/Applications by KLMichel/Ancestral Rage Sacred Purpose/manuscript"
);
const outDir = resolve(import.meta.dirname, "../src/content/book-chapters/ancestral-rage-sacred-purpose");
const updated = "2026-05-28";

const sections = [
  {
    file: "00-introduction-the-call-to-arms.md",
    title: "The Call to Arms",
    subtitle: "Introduction",
    part: "Opening",
    summary:
      "The opening call: inherited story, disciplined rage, attention, and the decision to become harder to lie to."
  },
  {
    file: "01-the-fire-in-your-bones.md",
    title: "The Fire in Your Bones",
    subtitle: "Chapter 1",
    part: "Part I: Rage, Blood, and the Ancestral Account",
    summary: "A fierce naming of ancestral rage, its danger, its truth, and the discipline required to make it useful."
  },
  {
    file: "02-the-account-of-the-ancestors.md",
    title: "The Account of the Ancestors",
    subtitle: "Chapter 2",
    part: "Part I: Rage, Blood, and the Ancestral Account",
    summary: "A ledger of inheritance, debt, sacrifice, survival, and responsibility without fantasy or shame."
  },
  {
    file: "03-the-cast-of-bloodlines.md",
    title: "The Cast of Bloodlines",
    subtitle: "Chapter 3",
    part: "Part I: Rage, Blood, and the Ancestral Account",
    summary: "A map of family roles, inherited scripts, and the characters that keep repeating until they are understood."
  },
  {
    file: "04-the-genealogical-dig.md",
    title: "The Genealogical Dig",
    subtitle: "Chapter 4",
    part: "Part II: Memory, Curriculum, and the Inner Council",
    summary: "A practical descent into records, elders, names, documents, DNA, oral history, and responsible evidence."
  },
  {
    file: "05-the-hidden-curriculum.md",
    title: "The Hidden Curriculum",
    subtitle: "Chapter 5",
    part: "Part II: Memory, Curriculum, and the Inner Council",
    summary: "A study of the lessons institutions, families, silence, money, shame, and media teach without announcing themselves."
  },
  {
    file: "06-archetypes-of-your-blood.md",
    title: "Archetypes of Your Blood",
    subtitle: "Chapter 6",
    part: "Part II: Memory, Curriculum, and the Inner Council",
    summary: "A council of inherited energies, gifts, wounds, masks, and disciplined self-leadership."
  },
  {
    file: "07-the-war-for-your-mind.md",
    title: "The War for Your Mind",
    subtitle: "Chapter 7",
    part: "Part III: The Invisible War for Meaning",
    summary: "Attention becomes the battlefield where appetite, fear, identity, outrage, and purpose are either managed or reclaimed."
  },
  {
    file: "08-the-machine-that-names-reality.md",
    title: "The Machine That Names Reality",
    subtitle: "Chapter 8",
    part: "Part III: The Invisible War for Meaning",
    summary: "A confrontation with naming systems, official stories, media frames, status scripts, and the power to define reality."
  },
  {
    file: "09-duality-as-a-weapon-of-responsibility.md",
    title: "Duality as a Weapon of Responsibility",
    subtitle: "Chapter 9",
    part: "Part III: The Invisible War for Meaning",
    summary: "A chapter on refusing false binaries while still accepting moral responsibility, agency, and disciplined judgment."
  },
  {
    file: "10-the-paradox-of-destiny.md",
    title: "The Paradox of Destiny",
    subtitle: "Chapter 10",
    part: "Part IV: Destiny, Chains, and Sacred Purpose",
    summary: "A meditation on fate, choice, inheritance, limits, command, and the paradox of becoming responsible for what you did not choose."
  },
  {
    file: "11-breaking-the-chain-forging-the-sword.md",
    title: "Breaking the Chain, Forging the Sword",
    subtitle: "Chapter 11",
    part: "Part IV: Destiny, Chains, and Sacred Purpose",
    summary: "The book turns toward action: breaking patterns, forging discipline, and transforming inherited pain into lawful strength."
  },
  {
    file: "12-the-purpose-manifesto.md",
    title: "The Purpose Manifesto",
    subtitle: "Chapter 12",
    part: "Part IV: Destiny, Chains, and Sacred Purpose",
    summary: "A practical manifesto for purpose, standards, vows, 90-day discipline, and a future that can be passed on."
  },
  {
    file: "13-conclusion-the-light-you-pass-on.md",
    title: "The Light You Pass On",
    subtitle: "Conclusion",
    part: "Part IV: Destiny, Chains, and Sacred Purpose",
    summary: "A closing charge to become a clearer ancestor, carry the fire responsibly, and pass on light."
  },
  {
    file: "14-bibliography.md",
    title: "Bibliography",
    subtitle: "Back Matter",
    part: "Back Matter",
    summary: "A bibliography for readers who want to study the historical, psychological, and cultural ground beneath the book."
  }
];

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

let totalWords = 0;

for (const [index, section] of sections.entries()) {
  const source = await readFile(resolve(sourceDir, section.file), "utf8");
  const body = cleanBody(source);
  totalWords += wordCount(body);

  const output = [
    "---",
    `bookSlug: "ancestral-rage-sacred-purpose"`,
    `title: "${escapeYaml(section.title)}"`,
    `subtitle: "${escapeYaml(section.subtitle)}"`,
    `part: "${escapeYaml(section.part)}"`,
    `order: ${index}`,
    `summary: "${escapeYaml(section.summary)}"`,
    `updated: ${updated}`,
    "---",
    "",
    body,
    ""
  ].join("\n");

  await writeFile(resolve(outDir, section.file), output, "utf8");
}

console.log(`ancestral-rage-sacred-purpose: ${sections.length} sections, ${totalWords} body words`);

function cleanBody(markdown) {
  return markdown
    .replace(/^\uFEFF/, "")
    .replace(/^#\s+.+(?:\r?\n)+/, "")
    .replace(/\r\n/g, "\n")
    .trim();
}

function escapeYaml(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function wordCount(value) {
  return value.split(/\s+/).filter(Boolean).length;
}
