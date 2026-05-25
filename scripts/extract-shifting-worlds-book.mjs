import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import AdmZip from "adm-zip";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath =
  process.env.BOOK_ACCESS_SHIFTING_WORLDS_INPUT ??
  path.join(process.env.USERPROFILE ?? "", "Downloads", "Book Downlo", "Shifting Worlds.docx");
const outputDir = path.join(root, "src", "content", "book-chapters", "shifting-worlds");
const updated = "2026-05-24";

const sections = [
  {
    marker: "Introduction - The World You Live In Is the World You Model",
    sourceMarker: "Introduction — The World You Live In Is the World You Model",
    title: "The World You Live In Is the World You Model",
    subtitle: "Introduction",
    part: "Opening"
  },
  {
    marker: "Chapter 1 - The Mind as a Reality Engine",
    sourceMarker: "Chapter 1 — The Mind as a Reality Engine",
    title: "The Mind as a Reality Engine",
    subtitle: "Chapter 1",
    part: "Part I - The Model-Making Mind"
  },
  {
    marker: "Chapter 2 - Parallel Worlds as Competing Models",
    sourceMarker: "Chapter 2 — Parallel Worlds as Competing Models",
    title: "Parallel Worlds as Competing Models",
    subtitle: "Chapter 2",
    part: "Part I - The Model-Making Mind"
  },
  {
    marker: "Chapter 3 - The Little Machine in the Head",
    sourceMarker: "Chapter 3 — The Little Machine in the Head",
    title: "The Little Machine in the Head",
    subtitle: "Chapter 3",
    part: "Part I - The Model-Making Mind"
  },
  {
    marker: "Chapter 4 - Attention: The Spotlight That Builds the Stage",
    sourceMarker: "Chapter 4 — Attention: The Spotlight That Builds the Stage",
    title: "Attention: The Spotlight That Builds the Stage",
    subtitle: "Chapter 4",
    part: "Part II - The Science of Shifting Worlds"
  },
  {
    marker: "Chapter 5 - Emotion: The Weather System of the Inner World",
    sourceMarker: "Chapter 5 — Emotion: The Weather System of the Inner World",
    title: "Emotion: The Weather System of the Inner World",
    subtitle: "Chapter 5",
    part: "Part II - The Science of Shifting Worlds"
  },
  {
    marker: "Chapter 6 - Language: Words as World-Building Instruments",
    sourceMarker: "Chapter 6 — Language: Words as World-Building Instruments",
    title: "Language: Words as World-Building Instruments",
    subtitle: "Chapter 6",
    part: "Part II - The Science of Shifting Worlds"
  },
  {
    marker: "Chapter 7 - The Law of Attraction Reframed as Model Attraction",
    sourceMarker: "Chapter 7 — The Law of Attraction Reframed as Model Attraction",
    title: "The Law of Attraction Reframed as Model Attraction",
    subtitle: "Chapter 7",
    part: "Part II - The Science of Shifting Worlds"
  },
  {
    marker: "Chapter 8 - The Success Model: Purpose, Probability, Practice",
    sourceMarker: "Chapter 8 — The Success Model: Purpose, Probability, Practice",
    title: "The Success Model: Purpose, Probability, Practice",
    subtitle: "Chapter 8",
    part: "Part III - Building Success Models"
  },
  {
    marker: "Chapter 9 - The Identity Model: Becoming the Person Who Lives There",
    sourceMarker: "Chapter 9 — The Identity Model: Becoming the Person Who Lives There",
    title: "The Identity Model: Becoming the Person Who Lives There",
    subtitle: "Chapter 9",
    part: "Part III - Building Success Models"
  },
  {
    marker: "Chapter 10 - The Opportunity Model: Seeing Doors Where Others See Walls",
    sourceMarker: "Chapter 10 — The Opportunity Model: Seeing Doors Where Others See Walls",
    title: "The Opportunity Model: Seeing Doors Where Others See Walls",
    subtitle: "Chapter 10",
    part: "Part III - Building Success Models"
  },
  {
    marker: "Chapter 11 - The Resilience Model: Setbacks as Data from Another World",
    sourceMarker: "Chapter 11 — The Resilience Model: Setbacks as Data from Another World",
    title: "The Resilience Model: Setbacks as Data from Another World",
    subtitle: "Chapter 11",
    part: "Part III - Building Success Models"
  },
  {
    marker: "Chapter 12 - The Wellness Model: The Body as a World-Shifting Instrument",
    sourceMarker: "Chapter 12 — The Wellness Model: The Body as a World-Shifting Instrument",
    title: "The Wellness Model: The Body as a World-Shifting Instrument",
    subtitle: "Chapter 12",
    part: "Part IV - Building Wellness Models"
  },
  {
    marker: "Chapter 13 - Stress Worlds and Peace Worlds",
    sourceMarker: "Chapter 13 — Stress Worlds and Peace Worlds",
    title: "Stress Worlds and Peace Worlds",
    subtitle: "Chapter 13",
    part: "Part IV - Building Wellness Models"
  },
  {
    marker: "Chapter 14 - The Balance Model: Dynamic Harmony, Not Perfect Stillness",
    sourceMarker: "Chapter 14 — The Balance Model: Dynamic Harmony, Not Perfect Stillness",
    title: "The Balance Model: Dynamic Harmony, Not Perfect Stillness",
    subtitle: "Chapter 14",
    part: "Part IV - Building Wellness Models"
  },
  {
    marker: "Chapter 15 - Visualization as World Rehearsal",
    sourceMarker: "Chapter 15 — Visualization as World Rehearsal",
    title: "Visualization as World Rehearsal",
    subtitle: "Chapter 15",
    part: "Part V - The Practice of Shifting Worlds"
  },
  {
    marker: "Chapter 16 - Mental Model Engineering",
    sourceMarker: "Chapter 16 — Mental Model Engineering",
    title: "Mental Model Engineering",
    subtitle: "Chapter 16",
    part: "Part V - The Practice of Shifting Worlds"
  },
  {
    marker: "Chapter 17 - The Daily Shift Protocol",
    sourceMarker: "Chapter 17 — The Daily Shift Protocol",
    title: "The Daily Shift Protocol",
    subtitle: "Chapter 17",
    part: "Part V - The Practice of Shifting Worlds"
  },
  {
    marker: "Chapter 18 - Relationships as Shared Worlds",
    sourceMarker: "Chapter 18 — Relationships as Shared Worlds",
    title: "Relationships as Shared Worlds",
    subtitle: "Chapter 18",
    part: "Part V - The Practice of Shifting Worlds"
  },
  {
    marker: "Chapter 19 - Work, Wealth, and Creative Worlds",
    sourceMarker: "Chapter 19 — Work, Wealth, and Creative Worlds",
    title: "Work, Wealth, and Creative Worlds",
    subtitle: "Chapter 19",
    part: "Part V - The Practice of Shifting Worlds"
  },
  {
    marker: "Chapter 20 - The Ideal Parallel World",
    sourceMarker: "Chapter 20 — The Ideal Parallel World",
    title: "The Ideal Parallel World",
    subtitle: "Chapter 20",
    part: "Part V - The Practice of Shifting Worlds"
  },
  {
    marker: "Conclusion - You Are the Modeler, the Traveler, and the World",
    sourceMarker: "Conclusion — You Are the Modeler, the Traveler, and the World",
    title: "You Are the Modeler, the Traveler, and the World",
    subtitle: "Conclusion",
    part: "Closing"
  }
];

const introDraft = String.raw`
Two people can stand in the same room and still live in different worlds.

The facts may be identical. The walls, the weather, the bank account, the email, the doctor's warning, the rejection, the opportunity, the quiet look on another person's face: all of it may be the same. Yet one person feels trapped while another feels summoned. One sees insult. One sees information. One sees danger. One sees training. One sees proof that life is against them. One sees the next experiment.

This is not because one person is honest and the other is delusional. It is because the human mind does not simply receive reality. It models reality.

A model is not the whole world. It is a little world inside the mind. It tells you what matters, what is possible, what is dangerous, what is worth attempting, and who you believe yourself to be inside the situation. It predicts. It edits. It filters. It whispers, usually before you notice it whispering: this is safe, this is hopeless, this is beneath you, this is your chance, this is impossible, this is familiar, this is who you are.

Then the body follows.

Your shoulders rise or soften. Your breath shortens or deepens. Your voice tightens or becomes clear. Your attention narrows around threat or opens toward possibility. You choose, but not from infinity. You choose from the world your mind has made available to you.

That is the first promise of this book: change the inner model, and the outer world does not magically obey, but it does become newly available. You notice different signals. You speak different words. You attempt different actions. You tolerate different levels of uncertainty. You recover faster. You stop worshiping the first interpretation that appears in your nervous system.

The world shifts because the model shifts.

## Change your inner model, change your outer world

Shifting Worlds grows out of my earlier work with parallel-world thinking: the idea that a life contains many possible trajectories, and that a person is always moving toward one of them through attention, emotion, language, action, and identity. But this book is more mechanical, more practical, and, in a useful way, less mystical. It asks a direct question:

What is the operating model that keeps producing your current world?

Not your dream. Not your mood. Not the slogans you repeat when you are trying to force yourself into optimism. The model. The little simulator. The set of assumptions that tells your mind what is possible before you have even tested the day.

If your model says, "People like me do not succeed," then success will feel foreign even when opportunity appears. If your model says, "Wellness means laziness," then rest will feel like guilt. If your model says, "Pressure means danger," then your body will treat every challenge as an attack. If your model says, "Money is proof of corruption," then part of you may keep pushing wealth away even while another part claims to want it.

The model does not need to be true to be powerful. It only needs to be repeated.

That is why bad models can feel like facts. They have rehearsed themselves inside you. They have gathered evidence, ignored counter-evidence, trained your posture, selected your memories, and shaped your expectations. By the time you call something "reality," your mind may already have edited the file.

This book is a guide to opening the file.

## The sequence of a world

A world is not built all at once. It is built by sequence.

Thought becomes interpretation. Interpretation becomes emotion. Emotion becomes body state. Body state changes perception. Perception selects evidence. Evidence reinforces identity. Identity drives action. Action produces outcomes. Outcomes return to the model and say, "See? I told you."

This loop can imprison you. It can also liberate you.

If the model is "I always fail under pressure," pressure becomes threat. Threat creates tension. Tension creates overthinking or avoidance. Avoidance produces weak evidence. Weak evidence returns to the model and strengthens it.

But if the model is "Pressure is energy looking for direction," the same physical arousal becomes usable. Your heart is not betraying you. It is preparing you. Your body is not announcing doom. It is offering fuel. The moment has not changed, but the world inside the moment has changed. That new world makes different action available.

This is not positive thinking in the shallow sense. It is model engineering.

## Success without self-destruction

Many people try to change their lives by demanding more force from an unchanged model. They push harder while still believing they are doomed. They chase achievement while treating the body like an inconvenience. They repeat affirmations while their daily language continues to describe life as a prison. They visualize the result but never rehearse the identity, systems, and recovery patterns that would make the result livable.

That kind of ambition burns people down.

The goal here is different: success without self-destruction; wellness without passivity; ambition with inner coherence.

Success matters. Direction matters. Discipline matters. But a person cannot build a new world with a nervous system that is always at war with itself. The model must include the body. It must include recovery. It must include language. It must include relationships. It must include the way you interpret failure, money, attention, stress, conflict, and possibility.

The world you are trying to enter must be supported by the person you are becoming.

## How to read this book

This is a live draft, which means it is also a live workshop. Some chapters are already moving toward full prose. Others are structured as working models, exercises, and chapter promises that will expand through later passes. That is appropriate for this book because the method itself is iterative: name the model, test the model, keep what works, discard what weakens, build a better model, and install it through repetition.

Read it the same way.

Do not rush to believe everything. Test it. Do not use the idea of "shifting worlds" to escape responsibility. Use it to take more precise responsibility. Do not pretend the outer world has no force. It does. But also do not surrender your inner simulator to the first fear, old story, or inherited script that walks into the room.

You do not merely move through the world.

You move through the world your mind has made available to you.

And if that is true, then there is a profound practical question waiting at the threshold of every day:

What world am I practicing now?

## Opening practice: Name the world

Choose one area of life: health, money, career, relationships, creativity, learning, leadership, or peace.

Write three sentences:

- The world I currently believe I am in is...
- The rules of this world seem to be...
- The version of me who lives here is...

Then write one more:

- A better model of this world would be...

Do not make it grand. Make it usable. A better model is not the most flattering story. It is the story that helps you see more accurately, act more courageously, recover more quickly, and become more aligned with the life you intend to build.
`.trim();

const chapterOneDraft = String.raw`
A mental model is a reality engine.

It is not merely an opinion floating in the mind. It is a working simulator. It takes a few pieces of information, fills in the gaps, predicts what will happen next, and prepares the body to respond. It is part map, part lens, part calculator, part little machine in the head.

The map tells you where you are.

The lens tells you what to notice.

The calculator estimates cost, danger, reward, and probability.

The machine turns assumptions into emotions, emotions into behaviors, and behaviors into evidence.

This is why a person can be surrounded by opportunity and still feel trapped. The outer room may be full of doors, but the inner model may be built to recognize only walls.

## The brain predicts before it records

We often imagine the mind as a camera. Reality appears, the mind records it, and then we respond. That picture is too passive.

The brain is not only a recorder. It is a predictor. It constantly asks, "What is this like? What happened last time? What matters here? What should I prepare for? What can be ignored?" It simplifies reality because reality is too large to process raw. If you had to consciously evaluate every sensation, memory, possibility, risk, tone of voice, body signal, and social cue, you would freeze before breakfast.

So the mind builds shortcuts.

Those shortcuts are useful. They keep you alive. They let you drive, speak, work, love, read, cook, and move through familiar environments without calculating every inch of existence. But the same power that makes the mind efficient can also make it rigid. A model that once protected you can later imprison you. A model that helped you survive one world may keep you from entering another.

The question is not whether you have models.

You do.

The question is whether your models are accurate enough, useful enough, and alive enough to serve the life you are now trying to build.

## Map, lens, calculator, machine

A model works first as a map.

If your map says, "This workplace is hostile," you will walk differently than if your map says, "This workplace is demanding but navigable." If your map says, "My body is broken," you will treat pain, fatigue, and discipline differently than if your map says, "My body is communicating, adapting, and trainable." If your map says, "Money is scarce and mysterious," you will move differently than if your map says, "Money is a system of value, exchange, skill, trust, timing, and behavior."

Then the model works as a lens.

It selects evidence. The defeated model notices proof of defeat. The disciplined model notices the next repetition. The creative model notices material. The healed model notices where the old wound no longer needs to govern the room.

Then the model works as a calculator.

It estimates what is worth attempting. A person with a low-probability model may not apply, ask, practice, publish, negotiate, rest, or repair. The opportunity is not rejected after rational analysis. It is rejected before it becomes visible as opportunity.

Finally, the model works as a machine.

Put one assumption into the machine, and a pattern comes out.

Input: "I always fail under pressure."

Processing: threat, tension, avoidance, overthinking, narrowed attention.

Output: weaker performance, confirming evidence, reinforced identity.

New input: "Pressure is energy looking for direction."

Processing: arousal, focus, preparation, challenge, breath, aim.

Output: stronger performance, new evidence, updated identity.

This is the machinery of shifting worlds. You are not trying to decorate the old machine with inspiring phrases. You are learning to change the input, study the processing, and test the output.

## Why bad models can feel true

Bad models often feel true because they are familiar, emotionally charged, and evidence-rich.

If you have lived for years inside a model of rejection, your mind has collected rejection the way a magnet collects filings. It may have ignored acceptance, kindness, luck, progress, or neutral ambiguity. Not because you are foolish, but because the model told attention what to gather.

The model says, "Look for danger."

Attention obeys.

The model says, "They are judging you."

The body tightens.

The model says, "Do not try unless success is guaranteed."

Action shrinks.

Then life becomes smaller, and the model points to the smallness as proof.

This is why arguing with yourself rarely works. The old model is not just a sentence. It is a whole environment. It has emotional weather, body posture, memory selection, vocabulary, and behavioral habits. To change it, you must do more than deny it. You must build a better world with enough repetition that the nervous system begins to recognize it as real.

## Empowering models are not fantasies

An empowering model is not a fantasy if it produces clearer perception and better action.

That distinction matters. This book is not asking you to pretend that obstacles are imaginary. Obstacles are real. Systems are real. Bodies have limits. Money matters. Time matters. History matters. People can be unfair. Pain can be heavy. A useful model does not erase reality. It helps you meet more of it.

A fantasy model says, "Nothing can hurt me."

A powerful model says, "I can train, prepare, recover, ask for help, adapt, and continue."

A fantasy model says, "I am already successful, so I do not need discipline."

A powerful model says, "I am becoming the kind of person who can sustain success."

A fantasy model says, "The world must change because I want it."

A powerful model says, "My wanting becomes real through attention, language, practice, relationship, timing, courage, and repeated contact with the world."

The difference is action.

If a model makes you less honest, less disciplined, less compassionate, less embodied, or less willing to test reality, it is not empowering. It is anesthesia. But if a model helps you see more clearly, choose more wisely, endure discomfort, recover from setbacks, and move toward what matters, then it is not merely positive. It is functional.

## Practice: The Model Audit

Choose one area of life: health, money, career, relationships, creativity, learning, leadership, or peace.

Complete the following prompts:

- The world I currently believe I am in is...
- The rules of this world seem to be...
- The version of me who lives here is...
- The emotions this model repeatedly creates are...
- The actions this model repeatedly encourages are...
- The outcomes this model tends to produce are...
- A better model of this world would be...

Now test the better model with one small action.

Do not try to transform your whole life in one dramatic gesture. A model becomes believable through evidence. Give yourself one piece of evidence today. Make the call. Take the walk. Rewrite the sentence. Ask the question. Practice for twenty minutes. Prepare the meal. Send the proposal. Rest without apology.

The world begins to shift when the model stops being theory and becomes behavior.
`.trim();

function decodeXml(value) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function extractParagraphs() {
  const zip = new AdmZip(sourcePath);
  const document = zip.getEntry("word/document.xml");
  if (!document) throw new Error(`Unable to find word/document.xml inside ${sourcePath}`);
  const xml = document.getData().toString("utf8");
  const paragraphs = [];

  for (const paragraph of xml.matchAll(/<w:p[\s\S]*?<\/w:p>/g)) {
    const parts = [];
    const tokenPattern = /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|<w:tab\s*\/>|<w:br\s*\/>/g;
    for (const token of paragraph[0].matchAll(tokenPattern)) {
      if (token[1] !== undefined) parts.push(decodeXml(token[1]));
      else if (token[0].startsWith("<w:tab")) parts.push("\t");
      else parts.push("\n");
    }
    const text = parts.join("").replace(/\r\n/g, "\n").trim();
    if (text) paragraphs.push(cleanSourceText(text));
  }

  return paragraphs;
}

function cleanSourceText(value) {
  return value
    .replace(/\u2014/g, "-")
    .replace(/\u201c|\u201d/g, '"')
    .replace(/\u2018|\u2019/g, "'")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/[ \t]*\n[ \t]*/g, "\n")
    .trim();
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

function normalizeMarker(value) {
  return cleanSourceText(value);
}

function sectionSlice(paragraphs, section, index) {
  const start = paragraphs.findIndex((paragraph) => normalizeMarker(paragraph) === section.marker);
  if (start === -1) throw new Error(`Unable to find section marker: ${section.sourceMarker}`);

  const laterMarkers = new Set(sections.slice(index + 1).map((entry) => entry.marker));
  const endOffset = paragraphs.slice(start + 1).findIndex((paragraph) => laterMarkers.has(normalizeMarker(paragraph)));
  const end = endOffset === -1 ? paragraphs.length : start + 1 + endOffset;
  return paragraphs.slice(start + 1, end);
}

function parseOutline(body) {
  const keyIndex = body.findIndex((line) => /^Key sections:?$/i.test(line));
  const exerciseIndex = body.findIndex((line) => /^(Exercise|Final exercise):/i.test(line));
  const closingIndex = body.findIndex((line) => /^Closing line:?$/i.test(line));
  const synthesisIndex = body.findIndex((line) => /^The conclusion lands with a synthesis:?$/i.test(line));

  const firstBreak = [keyIndex, exerciseIndex, closingIndex, synthesisIndex].filter((index) => index >= 0).sort((a, b) => a - b)[0];
  const overview = body.slice(0, firstBreak ?? body.length).filter(Boolean);
  const keyEnd = [exerciseIndex, closingIndex].filter((index) => index > keyIndex).sort((a, b) => a - b)[0] ?? body.length;
  const keySections = keyIndex >= 0 ? body.slice(keyIndex + 1, keyEnd).filter(Boolean) : [];
  const exerciseTitle = exerciseIndex >= 0 ? body[exerciseIndex].replace(/^(Exercise|Final exercise):\s*/i, "").trim() : "";
  const exerciseEnd = closingIndex >= 0 && closingIndex > exerciseIndex ? closingIndex : body.length;
  const exerciseBody = exerciseIndex >= 0 ? body.slice(exerciseIndex + 1, exerciseEnd).filter(Boolean) : [];
  const closing = closingIndex >= 0 ? body.slice(closingIndex + 1).filter(Boolean) : [];
  const synthesis = synthesisIndex >= 0 ? body.slice(synthesisIndex + 1, closingIndex >= 0 ? closingIndex : body.length).filter(Boolean) : [];

  return { overview, keySections, exerciseTitle, exerciseBody, synthesis, closing };
}

function bulletList(items) {
  if (!items.length) return "";
  return items.map((item) => `- ${item.replace(/\n/g, " / ")}`).join("\n");
}

function paragraphBlock(items) {
  return items.map((item) => item.replace(/\n/g, "\n\n")).join("\n\n").trim();
}

function workingDraftMarkdown(section, body) {
  const parsed = parseOutline(body);
  const blocks = [
    `> Live draft note: this section is currently in structured-outline form. It is public so the book can be built in the open, then expanded through developmental, style, and practice-clarity passes.`,
    "",
    "## Chapter Promise",
    paragraphBlock(parsed.overview) || `${section.title} will develop this part of the Shifting Worlds framework.`,
    ""
  ];

  if (parsed.keySections.length) {
    blocks.push("## Key Sections", bulletList(parsed.keySections), "");
  }

  if (parsed.exerciseTitle) {
    blocks.push(`## Practice: ${parsed.exerciseTitle}`, paragraphBlock(parsed.exerciseBody), "");
  }

  if (parsed.synthesis.length) {
    blocks.push("## Closing Synthesis", paragraphBlock(parsed.synthesis), "");
  }

  if (parsed.closing.length) {
    blocks.push("## Closing Line", parsed.closing.map((line) => `> ${line.replace(/\n/g, " / ")}`).join("\n"), "");
  }

  return blocks.join("\n").trim();
}

function sectionMarkdown(section, body, order) {
  if (order === 0) return introDraft;
  if (order === 1) return chapterOneDraft;
  return workingDraftMarkdown(section, body);
}

function summarize(markdown, fallback) {
  const compact = markdown
    .replace(/^>.*$/gm, "")
    .replace(/^##\s+.*$/gm, "")
    .replace(/[#*_`>|-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const summary = compact.match(/^(.{90,220}?[.!?])\s/)?.[1] ?? compact.slice(0, 190);
  return summary || fallback;
}

async function main() {
  const paragraphs = extractParagraphs();
  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });

  if (sections.length !== 22) throw new Error(`Expected 22 configured sections, found ${sections.length}`);

  for (const [order, section] of sections.entries()) {
    const body = sectionSlice(paragraphs, section, order);
    const markdownBody = sectionMarkdown(section, body, order);
    if (!markdownBody) throw new Error(`No body generated for ${section.title}`);
    const filename = `${String(order).padStart(2, "0")}-${slugify(section.title)}.md`;
    const markdown = [
      frontmatter({
        bookSlug: "shifting-worlds",
        title: section.title,
        subtitle: section.subtitle,
        part: section.part,
        order,
        summary: summarize(markdownBody, section.title),
        updated
      }),
      "",
      markdownBody,
      ""
    ].join("\n");
    await fs.writeFile(path.join(outputDir, filename), markdown, "utf8");
  }

  console.log(`shifting-worlds: ${sections.length} sections`);
}

await main();
