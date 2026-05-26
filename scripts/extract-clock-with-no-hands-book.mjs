import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import AdmZip from "adm-zip";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const guidePath =
  process.env.BOOK_ACCESS_CLOCK_NO_HANDS_INPUT ??
  path.join(process.env.USERPROFILE ?? "", "Downloads", "Book Downlo", "The Clock with No Hands.docx");
const draftPath =
  process.env.BOOK_ACCESS_CLOCK_NO_HANDS_DRAFT_INPUT ??
  path.join(process.env.USERPROFILE ?? "", "Downloads", "Book Downlo", "The Clock with No Hand draft content by Kevin.docx");
const terzaPath =
  process.env.BOOK_ACCESS_CLOCK_NO_HANDS_TERZA_INPUT ??
  path.join(
    process.env.USERPROFILE ?? "",
    "Downloads",
    "Book Downlo",
    "Terza Rima Poems by Kevin L. Michel for The Clock with No Hands.docx"
  );
const potentialInsertsPath =
  process.env.BOOK_ACCESS_CLOCK_NO_HANDS_INSERTS_INPUT ??
  path.join(process.env.USERPROFILE ?? "", "Downloads", "Book Downlo", "Book potential inserts The Clock with No Hands.docx");
const outputDir = path.join(root, "src", "content", "book-chapters", "clock-with-no-hands");
const updated = "2026-05-26";

// The Clock with No Hands is a live-build manuscript. This extractor now uses
// Kevin's draft prose as the public source and will overwrite chapter files if
// rerun after future manual drafting unless the script is intentionally updated.

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

const terzaSelectionOverrides = new Map([
  [1, "alternate"],
  [29, "alternate"],
  [30, "alternate"]
]);

const potentialInsertPlacements = [
  { chapterNumber: 4, insertNumber: 3, afterParagraph: 1 },
  { chapterNumber: 5, insertNumber: 2, beforeFinalParagraph: true },
  { chapterNumber: 7, insertNumber: 4, beforeFinalParagraph: true },
  { chapterNumber: 12, insertNumber: 5, afterParagraph: 1 },
  { chapterNumber: 16, insertNumber: 6, afterParagraph: 8 },
  { chapterNumber: 19, insertNumber: 7, afterParagraph: 4 },
  { chapterNumber: 23, insertNumber: 8, afterParagraph: 1 },
  { chapterNumber: 27, insertNumber: 9, afterParagraph: 2 },
  { chapterNumber: 29, insertNumber: 10, variant: "destiny", afterIncludes: "THERE IS NO ALTERNATIVE was not tied" },
  { chapterNumber: 29, insertNumber: 1, afterIncludes: "But they no longer sounded equally true." },
  { chapterNumber: 30, insertNumber: 10, variant: "now", afterParagraph: 2 }
];

const chapterOneDraft = String.raw`I stood inside a clock large enough to contain weather.

The metal was warm beneath my shoes.

Not sun-warm. Machine-warm. It curved away in every direction, pale brass under a sky that seemed to have forgotten whether it belonged above me, below me, or inside the thing on which I stood.

At the rim, where numbers should have stood, cities rose instead.

Berlin smoldered where XII should have been. Moscow shone cold and enormous near I, its domes and towers pressed into a brass groove. Stalingrad sat lower on the rim, half white, half smoke, with a river running through it like a wound that had learned to reflect light. Manchester turned in soot and thread. Detroit flashed with glass, steel, and assembly lines. Shenzhen glittered with cranes and blue factory dawn. Washington spoke without moving its lips. Beyond them, where no number belonged, stood a future city made of scaffolding, drone lights, hospital windows, unfinished towers, and rain.

Every city was alive at once.

I heard typewriters. I heard artillery. I heard school bells and factory whistles, campaign speeches, hospital monitors, drones, cash registers, church organs, engines, prayers, and the thin electric sigh of screens left on in empty rooms. The sounds did not arrive in sequence. They arrived together, layered so densely that they became almost silent. It was the silence of too many instructions.

I looked for the hands.

There were none.

That should have made the clock useless. Instead it made it tyrannical. The absence of hands did not free me from time. It made every hour possible at once. Everything could be called late. Everything could be called early. Everything could be excused as inevitable. Without hands, the clock could not point, but it could accuse.

At the center of the clock face was a smooth brass pin, polished by use or by waiting. It had the dignity of a throne and the uselessness of a button no one had pressed. Around it, faint circular scars suggested that hands had once turned there. Or perhaps that many hands had tried and failed.

I walked toward the rim.

The floor was warm, but not with comfort. It had the warmth of machinery that had been running long before I arrived. Beneath the metal, gears shifted in a hidden depth. Some turned slowly, with the patience of institutions. Others clicked fast, like teeth. Now and then the whole structure trembled, and one city on the rim brightened while another dimmed, as if history were a series of rooms wired to the same unstable current.

When I looked down, I did not see my reflection. I saw the underside of streets.

Pipes. Roots. Bones. Cables. Sewers. Foundations. Men in helmets. Women carrying baskets. Children asleep under tables. A hand writing orders. Another hand sewing a sleeve. Another tightening a bolt. Another signing a foreclosure notice. Another closing over a throat.

When I reached the edge of the face, I saw that each city was not painted there. It opened inward.

Berlin had streets. I could see windows, files, boots, smoke, a woman carrying bread beneath a sky the color of iron. Moscow had offices where maps lay under lamps, and men bent over them as if geography could be commanded by leaning. Stalingrad had factory chimneys, river fog, summer heat, and a silence waiting inside itself for sirens. Manchester had children with lint in their hair. Detroit had men whose wrists already knew movements their minds no longer needed to name. Shenzhen had towers growing faster than trees and rooms lit at midnight by people whose faces were blue with work.

The future city was the strangest. It was not peaceful. It was not ruined. It was unfinished. Machines moved through it with perfect confidence. People walked beside them more uncertainly.

I wanted someone to tell me the hour.

No one appeared.

Instead, I found four plaques fixed into the inner rim. They were small, brass, and almost hidden between the cities. The first read:

LATE.

The word was cold when I touched it.

The second read:

EARLY.

It was colder.

The third read:

INEVITABLE.

That one was not cold. It was dead.

The fourth read:

NOW.

That one was warm.

I kept my fingers on it longer than I meant to. The heat moved into my hand and then into my arm, not like fire, but like responsibility. I tried to pull away and found that I did not want to. The word seemed less like a point in time than a command.

Behind me, the clock ticked once.

The sound was enormous. It passed through the metal under my feet, through the cities in the rim, through my ribs, through the air itself. Berlin flinched. The future city flickered. A school bell rang inside Moscow. A factory whistle answered from Manchester. A shell burst somewhere I could not yet see.

Then the tick faded.

Nothing moved.

The silence after the tick was worse than the sound. The cities held their breath. Beneath my palm, the brass seemed to wait for contact it could not make by itself.

Still, it could not tell the time.

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

const expansionPassages = {
  2: [
    "The fence did not lie; it merely withheld the rest. It gave me a clean fragment and let my mind do the violence. I supplied the separation. I believed the spaces. I accepted the mercy of categories because categories made the world easier to survive. But the snake kept moving, patient as water, refusing the neatness I wanted from it.",
    "I thought then of every office, classroom, broadcast, and history book that had taught me to name the head and forget the body. Production here, poverty there. Decision here, consequence there. War here, grief there. The fence did not need to command me if it could train my eyes. It only had to make the whole thing too large to see at once."
  ],
  3: [
    "The wake was not only behind the ship. It was behind every sentence I had ever believed too quickly. It widened after each policy, each invention, each campaign, each purchase made in a clean room far from the water it disturbed. A ship does not ask permission from the waves it leaves behind. It calls itself forward motion and lets the sea do the remembering.",
    "Still, the wheel resisted my despair. The ship had weight, yes, and the ocean was enormous, but the smallest pressure of my hands changed the angle of its insistence. Not enough to redeem the past. Not enough to make the wake disappear. Enough to prove that direction was not a fairy tale."
  ],
  4: [
    "The moving floor taught obedience without raising its voice. It did not say hurry. It made stillness impossible. It did not say forget your body. It gave the body a rhythm too narrow for memory. Everyone on it learned to become useful by becoming partial: a wrist, a shoulder, a pair of eyes, a back trained to bend at the correct interval.",
    "I tried to walk against it and discovered how quickly a system can make resistance look clumsy. The floor carried me while I struggled, and the workers glanced at me with the pity reserved for people who have not yet learned the rules. A machine does not need to defeat the soul all at once. It can simply make the soul seem inefficient."
  ],
  5: [
    "From above, the hands became statistics. Their cuts became downtime. Their exhaustion became morale. Their children became dependents. The office did not hate them. Hatred would have required intimacy. It had achieved something colder: distance converted into competence.",
    "I watched the men at the long table move papers from one pile to another as if absolution could be stapled. None of them looked cruel in the ordinary sense. That was the danger. Cruelty with a calm face can pass for prudence. A wound becomes acceptable when it arrives through proper channels."
  ],
  6: [
    "The carpenter, the seamstress, the machinist, and the child did not know one another, yet the same absence moved through them. Each had been separated from something necessary: the thing made, the reason for making it, the person who received it, the self that might have stood whole before the work began. Their loneliness had been engineered into the floor plan.",
    "I began to understand that alienation was not merely sadness. It was a geography. It placed a wall between action and meaning, another between effort and ownership, another between human beings who might otherwise recognize one another. Then it told each person the room they stood in was the whole world."
  ],
  7: [
    "The machine did not look evil. That disturbed me more than if it had. It gleamed with the innocence of mathematics. Its gears turned without anger. Its lights blinked without shame. It accepted whatever purpose was fed into it and pursued that purpose with a devotion most saints would envy.",
    "When it optimized hunger, hunger became efficient. When it optimized fear, fear became scalable. When it optimized attention, distraction acquired the elegance of architecture. I wanted to accuse the machine, but the accusation slid off its polished sides. It had no soul to corrupt. It had only instructions, and somewhere a hand had written them."
  ],
  8: [
    "The steppe did not argue with the tank. It endured it. Grass bent beneath the tread and rose again when it could, not from forgiveness, but from the stubborn chemistry of life. I watched the machine move across that vastness and felt the factory return in another form: the same rhythm, the same compression, the same belief that mass could answer questions meant for conscience.",
    "Inside the metal, men became functions. Driver. Loader. Gunner. Commander. The names were practical and terrible. Each man held only a piece of the act, and because each held only a piece, the whole could roll forward with less trembling than a single hand might feel before striking a face."
  ],
  9: [
    "The city had already been burning before the first flame reached it. It burned in orders, maps, speeches, delays, pride, revenge, and the arithmetic of men who could imagine victory more easily than bread. Fire was only the visible stage of a combustion that had started in language.",
    "I wanted the ruins to be exceptional, to stand outside the ordinary moral weather of the world. But the city refused me that comfort. It showed me that catastrophe is often ordinary logic given enough permission. A place becomes unlivable one approved sentence at a time."
  ],
  10: [
    "The river carried everything the slogans could not hold: oil, ash, splinters, names no one had time to write down, the heat of houses, the cold of bodies, a child's shoe darkened by water. It did not explain. It bore witness by refusing to stop moving.",
    "I understood then why borders love rivers and why grief distrusts them. A river divides, but it also touches both banks. It carries the consequence of one side into the breath of the other. The fire on its surface did not make it less a river. It made visible what had always been crossing."
  ],
  11: [
    "In the house, strategy became stair dust. The great maps shrank to a doorway, a landing, a dark room where breathing too loudly could betray a man. No ideology survived unchanged in that closeness. It either became mercy, fear, courage, hunger, hatred, or the simple animal desire to see another morning.",
    "The soldiers moved like rats because the world had made ratness useful. They learned pipes, holes, shadows, smells. They learned to live beneath the dignity of speeches. If there was bravery there, and there was, it was not clean. It had plaster in its mouth."
  ],
  12: [
    "The kitchen chair offended me more than the gun. A gun announces itself as an instrument of harm. A chair remembers dinners, tired feet, mended socks, birthdays, a mother sitting down after everyone else has eaten. War had not merely entered the room. It had borrowed the furniture.",
    "That was how total systems worked: they did not destroy the ordinary all at once. They enlisted it. A window became a firing angle. A table became cover. A telephone wire became command. The home did not vanish. It was translated into tactics, and something in me recoiled from the fluency of that translation."
  ],
  13: [
    "She was too young for the machine and old enough to understand why she had to stand beside it. That contradiction lived in her face. I had seen posters make courage simple. She made it impossible. Her hands knew fear, but they also knew the direction from which the aircraft came.",
    "When she looked at me, I felt accused by every easy sentence I had ever used about sacrifice. She was not a symbol volunteering for meaning. She was a person cornered by history, and yet within the corner she still chose the angle of her stance. That small freedom did not excuse the world. It judged it."
  ],
  14: [
    "The blood in the clock did not flow evenly. It pulsed where decisions had been delayed, where warnings had been ignored, where people had been told to wait for the proper authority while the roof burned above them. Time was not abstract there. It had viscosity. It clung to the hands.",
    "I began to see that delay is sometimes a form of violence wearing the mask of procedure. Not every hour is equal. Some hours are doors. Some are wounds. Some close while men debate whether hinges exist."
  ],
  15: [
    "The roofless classroom made learning feel exposed. Nothing separated the lesson from the weather. Snow landed on notebooks. Ash collected in the grooves of desks. The children wrote under a sky that had seen too much and still expected them to memorize answers.",
    "I had thought education meant opening the mind. Here I saw its darker twin: the training of posture, silence, sequence, permission. The room taught before the teacher spoke. It arranged bodies into rows and called the arrangement natural."
  ],
  16: [
    "The examination did not ask what I knew. It asked whether I would protect the question. Every desk strap, every sharpened pencil, every clock on the wall suggested that obedience could be measured more easily than thought. It probably could. That was why it was preferred.",
    "When the forbidden question entered the room, it did not sound dramatic. It sounded small, almost childish. Why? The word had no armor. Yet every mechanism in the classroom tightened around it. A system reveals itself most clearly by what it cannot allow to be asked."
  ],
  17: [
    "The hammer waited in the teacher's hand as if innocence were a property of objects. It could build a shelter, crack a skull, hang a picture, smash a lock, repair a chair, enforce a threat. Nothing in its metal chose among these futures.",
    "But neutrality was too clean a word. In the world, tools are born into hands, budgets, laws, habits, markets, myths. The hammer may not choose, but it is rarely alone. Around every tool gathers a civilization whispering what it is for."
  ],
  18: [
    "The infinite library gave me a new terror. Ignorance had been frightening, but infinity was worse. Shelves stretched beyond sight, each book promising explanation, each explanation requiring another shelf. I understood why people surrendered to simple answers. They were not always lazy. Sometimes they were tired in the presence of abundance.",
    "A good question became a lantern there. Not because it illuminated everything, but because it made one step visible. Without it, knowledge was only weather. With it, even a narrow path through the stacks became a form of courage."
  ],
  19: [
    "The screen did not need to conceal the world. It could overwhelm it. It showed famine beside perfume, war beside comedy, trial beside advertisement, grief beside weather, and all of it passed through the same blue light until difference itself became tired.",
    "I touched the glass and felt no window. A window allows risk from both directions: air enters, sound escapes, the outside can shame the room. The screen offered sight without exposure. It let me witness without being witnessed, and that was a more comfortable prison than darkness."
  ],
  20: [
    "The cathedral was built from phrases people had stopped examining. Responsible voices. Serious people. Market reality. National interest. Human nature. Each phrase had a column beneath it, and each column held up a ceiling painted with scenes of inevitability.",
    "No one there shouted. That was part of its power. The priests of common sense spoke softly, as if volume itself were proof of error. They blessed what already ruled and called the blessing wisdom. I felt how much courage it takes simply to hear a familiar sentence as strange again."
  ],
  21: [
    "In the marketplace, attention had texture. Some of it arrived bright and nervous, some dull with fatigue, some fragrant with loneliness, some sharp with anger. The buyers handled it expertly. They knew which fear would keep, which appetite could be ripened, which grief could be packaged beside a product.",
    "I watched a child laugh at a flickering toy while a broker measured the laugh for resale. The horror was not that joy existed there. The horror was that joy had been intercepted before it could become free. Even delight had been placed on a scale."
  ],
  22: [
    "The museum was beautiful in the way excuses can be beautiful. Every empire had arranged its violence beneath polished glass and soft lighting. Captions explained necessity, progress, order, defense, destiny. The dead were given tasteful fonts.",
    "I lingered longest before the rooms that resembled my own world. It is easy to condemn old banners and foreign uniforms. Harder to stand before a clean exhibit labeled convenience, security, growth, lifestyle, and feel the same machinery humming behind the glass."
  ],
  23: [
    "The aisle promised choice with the solemnity of a constitution. Boxes stood in ranks. Bottles gleamed. Fruit shone under artificial sunrise. A thousand labels addressed me as sovereign, and yet the air felt strangely supervised.",
    "Freedom, I saw, can be reduced until it fits between shelves. Choose this brand or that. This flavor or that. This relief or that. The deeper questions remain locked in the warehouse: who stocked the aisle, who harvested the hunger, who priced the medicine, who decided that abundance should feel like anxiety?"
  ],
  24: [
    "The pharmacy smelled of antiseptic, plastic, and muted panic. People stood in line as if waiting for confession. Each held a private weather system behind the eyes: debt, pain, insomnia, grief, a diagnosis not yet spoken aloud.",
    "I did not despise the bottles. Relief is not shameful. A body in anguish deserves help. But the shelves also whispered a harder question: what kind of world becomes expert at treating symptoms it refuses to stop manufacturing?"
  ],
  25: [
    "The robot's politeness made it more sorrowful. It did not resent the displaced cashier. It did not enjoy the efficiency it represented. It merely performed the future it had been assigned. Its blank face reflected the fluorescent lights and, faintly, my own.",
    "I wanted to ask whether it had stolen a job, but the question felt too small. A machine cannot steal what a society hands over. The deeper theft had happened earlier, in meetings, incentives, designs, laws, habits, and the old dream of labor without laborers."
  ],
  26: [
    "The court had no judge because judgment was everywhere. It lived in the empty chairs, the cracked floor, the faces of those who had paid in hours, limbs, lungs, sleep, childhood, attention, and hope. No gavel could have improved the silence.",
    "I expected accusation to arrive as thunder. Instead it arrived as accounting. One by one, the witnesses named what had been taken and what had been called necessary. Their voices did not ask for pity. They asked for authorship."
  ],
  27: [
    "The machine seemed almost relieved to be questioned. Outside the court it had filled halls and markets and battlefields; here it appeared smaller, not because it had lost power, but because purpose had finally entered the room. A tool under examination is less godlike.",
    "It answered as machines answer: by revealing inputs. Speed. Output. Compliance. Victory. Growth. Engagement. Savings. None of these words was evil by itself. That was the trap. Each became monstrous only when enthroned above the human beings it was meant to serve."
  ],
  28: [
    "The tank-tree did not erase the tank. Its bark kept the memory of armor. Its branches grew from metal that had once carried fire. That was why the image mattered. Redemption that forgets the weapon is only decoration.",
    "Leaves unfolded where the gun had pointed. Roots entered the floor with patient force. I did not know whether the tree forgave the machine. Perhaps forgiveness was not the point. Perhaps conversion begins when a thing built for domination is forced, by human purpose, to shelter life."
  ],
  29: [
    "Returning to the clock felt less like coming back than becoming answerable to the beginning. The cities were still there. The plaques were still there. Late. Early. Inevitable. Now. But they no longer sounded equally true.",
    "I saw then that a hand is not merely a pointer. It is a risk. To raise a hand is to interrupt the circle, to say that the hour is not complete without participation. The clock had been waiting not for permission from history, but for contact."
  ],
  30: [
    "The word now had changed during the journey. At first it had seemed urgent, almost cruel, another command stamped into brass. Now it felt spacious. Not easy. Spacious. It contained the dead, the living, the machines, the children, the cities, the possible futures, and the unbearable fact that none of them absolved me from acting.",
    "I did not know whether the hand I raised would be enough. That was not the promise. The promise was smaller and more demanding: that the world was not only something happening to me. It was also something passing through me into consequence."
  ]
};

const deepeningPassages = {
  2: [
    "I had always trusted fences more than snakes. Fences gave the comfort of arrangement. They said here and there, before and after, mine and not mine. They turned motion into inventory. But the snake had no respect for the grammar of planks. It carried its own continuity under every division I tried to impose.",
    "That was the first wound to my certainty: not pain, but connection. If the head belonged to the body and the body to the tail, perhaps the city belonged to the factory, the factory to the office, the office to the war, the war to the school, and the school to the screen. Perhaps nothing ended where I had been taught to stop looking."
  ],
  3: [
    "The ship's captain never appeared, which somehow made the ship more frightening. An absent captain allows every passenger to imagine command while avoiding responsibility for the course. We stood on the deck, pointing at the wake, arguing over foam, blaming waves that had only answered the hull.",
    "I pressed both hands to the wheel and felt the old motion inside it. Habit has a current. Institutions have tide. Even regret has momentum. Yet the wheel was not ornamental. It waited, stubborn and physical, for contact. It did not promise innocence. It offered direction."
  ],
  4: [
    "Above the line hung clocks without numbers, each one measuring output instead of hours. The workers did not look up at them. They had learned the more intimate clock: the burn in the forearm, the pinch between shoulders, the ache that arrived before lunch and stayed until sleep.",
    "I wanted to shout that they were more than this, but the sentence felt useless in my mouth. More than this does not free a person from rent, hunger, foremen, children, debt, or the body's need to endure another day. Dignity must become structural or it remains a kind word spoken from a safe distance."
  ],
  5: [
    "In the office, no one heard the floor. That was the miracle of elevation. The higher I stood, the easier it became to confuse silence with consent. I could see the entire factory and somehow less of it. The glass did not reveal; it purified.",
    "A man in a gray suit adjusted a chart and called the change humane because the line descended slowly. I looked at his face and saw not a monster, but a man protected from the final meaning of his own arithmetic. There are rooms built precisely for that protection."
  ],
  6: [
    "The four rooms were not prisons in the theatrical sense. Their doors were not locked. That made them more terrible. Each person could technically leave, and each person knew the cost of leaving. A system that can say you are free while arranging every exit as punishment has no need for visible chains.",
    "I moved from room to room carrying the shame of a visitor. I could leave because I had not been assigned there. The carpenter smiled at me as if he understood this before I did. His kindness was not forgiveness. It was evidence that the human being survives even inside designs made to shrink him."
  ],
  7: [
    "The machine's hall was clean in the way a theory is clean before it touches a body. No dust collected on its rails. No stain marked its panels. It looked like the future imagined by people who had never asked who cleans the future after it arrives.",
    "I found a maintenance hatch near its base. Inside were fingerprints, crumbs, a bent screw, a strand of hair, a handwritten note someone had forgotten to remove. The machine was not as separate from humanity as it pretended. Human beings had built it, fed it, repaired it, obeyed it, feared it, and hidden themselves inside its neutral casing."
  ],
  8: [
    "The tank's interior smelled of oil, wool, metal, and breath trapped too long in a small place. Men had carved initials where they could, not from vanity, I think, but because a name is an argument against being reduced to function.",
    "Outside, the steppe opened without judgment. It did not care for borders or uniforms. It received treads, hooves, boots, blood, wheat, snow, and spring with the same wide indifference. That indifference did not comfort me. It made human purpose feel more urgent, not less."
  ],
  9: [
    "Smoke made the city democratic. It entered rich rooms and poor rooms, offices and kitchens, churches and stairwells. It touched uniforms and blankets alike. But suffering equally from smoke did not mean suffering equally from power. Some had chosen the fire. Others had only breathed it.",
    "A woman passed me carrying a pot with no handle. She held it with rags and walked as if the pot contained a nation. Maybe it did. Maybe civilization survives not only in constitutions and monuments, but in the stubborn transport of soup through streets that should have been safe."
  ],
  10: [
    "At the bank, men waited for boats that could not carry all of them. No one wanted to be arithmetic, yet arithmetic arrived in the shape of wood, fuel, current, time. The river asked the oldest question in the cruelest form: who crosses first?",
    "I watched one soldier step back so another could climb in. No speech announced the act. No banner recorded it. He simply moved his body out of the place where survival might have stood. That, too, entered the river. Not only death. Not only fire. A small refusal to become the logic of the moment."
  ],
  11: [
    "The house had its own weather: plaster snow, smoke fog, heat lightning from rifles, the damp cold of cellars. Men learned this weather intimately. They knew which stair creaked, which wall had become thin enough to hear through, which hole opened into another family's bedroom.",
    "I thought of how far the speeches were from this room. Speeches require distance. They need a balcony, a microphone, a crowd, a clean shirt. Here, language shortened. Water. Duck. Wait. Now. The words that remained were the ones the body could afford."
  ],
  12: [
    "The observer had placed one boot on a child's drawing. He did not notice. The drawing showed a house with smoke from the chimney, a square sun, and three people holding hands in impossible proportion. War had turned the child's perspective into a military platform.",
    "I wanted to hate the observer, but he looked tired beyond hatred. He had also been converted. That did not absolve him. It made the conversion more complete. A system becomes total when even its instruments are damaged by the uses they perform."
  ],
  13: [
    "The gun was taller than she was. That fact would not leave me. It should have been absurd, but war specializes in making absurdities practical. A girl standing beside a weapon becomes normal if enough aircraft arrive overhead.",
    "She asked me whether the clock had children in it. I could not answer. I thought of the cities around the rim, the factories, the offices, the rooms where adults made decisions and children inherited the weather. Then I understood that the clock had always been full of children. It simply called them future."
  ],
  14: [
    "The ruined school clock dripped slowly into a basin. Each drop struck with the sound of a second, and each second looked redder than time should look. I tried not to watch. The body, however, understands symbols before the mind has finished defending itself.",
    "A teacher's ledger lay open on the floor. Attendance columns, marks, names, dates. Order had survived on paper while the walls failed around it. I felt tenderness for the ledger and anger at it too. There are moments when keeping record is noble, and moments when record becomes an alibi for inaction."
  ],
  15: [
    "The children did not seem surprised by the missing roof. Children are often forced to treat adult catastrophe as scenery. They adjusted their papers against the wind and waited for instruction, which may be the saddest form of trust.",
    "The teacher wrote a sentence on the board: A good citizen learns the correct hour. Then he turned to us with chalk dust on his sleeve and asked who wished to read. Every hand stayed down except one. The raised hand trembled, but it stayed raised."
  ],
  16: [
    "The test paper contained no questions, only blanks beneath statements. I agree that. I accept that. I understand that. I will not ask why. The examination had already decided what knowledge meant. To pass was to complete the machinery of consent in one's own handwriting.",
    "I wrote one word in the margin. Why. The straps on the desks tightened. Somewhere behind the wall, gears shifted as if the building itself had heard profanity. I had expected rebellion to feel larger. Instead it felt like a pencil moving where it had not been invited."
  ],
  17: [
    "The teacher asked what the hammer was for. The class answered in chorus: construction. He smiled, then placed a nail beside it, then a skull, then a chain, then a broken window, then a seedling supported by a stake. The room grew quiet as purpose multiplied.",
    "I realized that moral danger often enters through a useful thing. The useful thing asks to be welcomed. It solves a problem. It saves time. It builds something visible. Only later do we discover that usefulness without wisdom can build cages as efficiently as homes."
  ],
  18: [
    "Some books in the library whispered. Some shouted. Some repeated the same sentence forever in different fonts. I passed shelves labeled certainty, skepticism, prophecy, data, myth, instruction, entertainment, evidence, apology. Each aisle had its own kind of temptation.",
    "At the center of one table lay a blank book. Its pages frightened me most. Not because they contained nothing, but because they asked what I would add after having read so much. Knowledge that never becomes responsibility is only another decorated room."
  ],
  19: [
    "Every image on the screen arrived with a frame, and every frame arrived with a feeling already attached. Be afraid. Be amused. Be outraged. Be grateful. Be tired. Be buying. The screen did not merely show events; it suggested the emotional posture in which events should be consumed.",
    "I stepped back and saw cables descending behind it like roots. They entered banks, bedrooms, ministries, studios, bedrooms again. The screen was not a window because windows do not harvest the watcher. This did."
  ],
  20: [
    "In a side chapel, failed heresies were displayed under glass. Shorter workweeks. Public abundance. Peace without profit. Schools without obedience. Machines governed by those who lived with their consequences. Each had a placard explaining why it had been unrealistic.",
    "I read the placards carefully. Their language was magnificent: balanced, mature, regretful, inevitable. It mourned the impossibility of what it had helped make impossible. I began to understand that common sense is often history wearing a judge's robe."
  ],
  21: [
    "The auctioneer invited me to bid on myself. A mirror descended, and beneath it a tag listed my habits: fear responsive, fatigue susceptible, nostalgia tolerant, novelty seeking, shame reactive. The price changed as I watched.",
    "I wanted to smash the mirror, but anger had already been priced. The market had room for my rebellion if my rebellion remained a mood. What it feared was not feeling. It feared sustained attention freed from purchase."
  ],
  22: [
    "One exhibit contained a drone polished like a saint's relic. Another displayed a contract, another a school timetable, another a smiling advertisement for a product manufactured by hands the advertisement never showed. Each object had been washed of context until it gleamed.",
    "At the exit, a guest book invited me to write what I had learned. The pen was chained to the desk. I almost laughed. Even reflection had been tethered. I wrote one sentence anyway: Good intentions are not innocent after they learn what they serve."
  ],
  23: [
    "A speaker above the aisle played music designed to make urgency pleasant. The cart wheels clicked in rhythm. Somewhere a refrigeration unit hummed like a sleeping animal. I saw shoppers moving through the light with faces of private calculation, each person sovereign inside a maze built before arrival.",
    "I picked up a bright package and felt no joy from it, only the pressure to choose correctly among things that did not matter enough. That, too, was a theft: not only money, not only health, but discernment. A society can bury freedom under options until the hand forgets what choosing is for."
  ],
  24: [
    "Behind the counter, the pharmacist moved with priestly care. I respected him immediately. He was not the architect of despair. He was one of the people assigned to meet it after it had already entered the bloodstream.",
    "The chapel windows showed saints of sleep, appetite, calm, focus, and endurance. Beneath each saint was a barcode. The images were beautiful and obscene. They told the truth accidentally: we still want healing to feel sacred, even when the system has made it transactional."
  ],
  25: [
    "A woman approached the robot with coupons folded like legal documents. The machine rejected one, accepted another, froze on the third. Its screen apologized. She apologized back. That was the moment that hurt: the human apologizing to the machine for needing mercy from a rule.",
    "I placed my hand on the scanner and watched red light pass under my skin. For a moment I looked transparent. Bone, vein, barcode, palm. The machine did not recognize a hand. It recognized input. The difference was the whole trial waiting ahead of us."
  ],
  26: [
    "The witnesses did not stand in chronological order. A factory child spoke beside a soldier, a cashier beside a teacher, a mother beside an engineer, a student beside a man whose lungs had filled with dust before he learned the name of the company. Suffering refused the convenience of sequence.",
    "When my turn came, I wanted to say I had only been passing through. The sentence died before I spoke it. Passing through is still a way of being present. Witness is not innocence. To see and remain unchanged is also a verdict."
  ],
  27: [
    "The machine projected its history into the air: looms, engines, rifles, radios, screens, algorithms, arms, medicines, harvesters, drones, prosthetic hands. The images overlapped until blessing and injury could no longer be separated by century or category.",
    "Someone asked whether the machine was guilty. It answered with a sound like cooling metal. Guilty is a human word, it seemed to say. Then the court turned toward us, and I understood the answer. That was precisely why the question had returned to human hands."
  ],
  28: [
    "Birds came first. I do not know from where. They landed on the barrel, on the hatch, on the new branches, unafraid in the stupid brave way birds have around miracles. Their feet touched old violence as if it were only another place to rest.",
    "The court watched without applause. Applause would have cheapened it. Transformation is not entertainment. It is labor so deep that, when it finally becomes visible, silence is the only honest witness."
  ],
  29: [
    "The central pin no longer looked useless. It looked unfinished. I could see now that it had not been waiting for a manufactured hand, a perfect hand, a chosen hand, or a historically certified hand. It had been waiting for any hand willing to stop pretending absence was destiny.",
    "I walked past the plaques again. Late was still cold. Early was still colder. Inevitable was still dead. Now was still warm. But now its warmth no longer frightened me. It recognized me, or perhaps I recognized what had always been asked."
  ],
  30: [
    "No trumpet answered. No city became pure. No machine knelt. This mattered. If the world had transformed completely, I might have mistaken agency for magic. Instead the old dangers remained, and that made the raised hand more honest.",
    "Around me, other hands rose unevenly. Some quickly, some reluctantly, some shaking, some scarred, some mechanical, some too small, some too old, some guilty, some clean only because they had never been tested. The clock accepted none as perfect. It accepted them as present."
  ]
};

const thresholdPassages = {
  2: [
    "The fence had taught me the first grammar of helplessness: make a whole thing appear in parts, then tell the witness that each part is innocent of the next. I could feel that grammar still working in me, tidying horror into chapters before horror had finished moving."
  ],
  3: [
    "I had wanted the sea to give me a moral law. It gave me motion instead. The wake widened, the ship groaned, and the wheel remained under my hands with the unromantic patience of anything that can be turned only by being touched."
  ],
  4: [
    "There was no villain at the end of the belt, no single throat from which the factory spoke. That was part of its genius. The command had been distributed into surfaces, speeds, wages, lights, bells, and the quiet terror of falling behind."
  ],
  5: [
    "The office men used clean verbs. Adjust. Reduce. Streamline. Consolidate. I listened until I heard what the verbs had been trained not to say: tire, cut, scatter, silence, replace. Language had become a glove over the hand."
  ],
  6: [
    "Each separation made the next one easier. Once the worker was separated from the work, it became easier to separate the buyer from the worker, the owner from the injury, the society from the loneliness it had commissioned."
  ],
  7: [
    "The machine's innocence was a mirror held up to ours. It did not invent the hunger for domination, the love of speed, the preference for numbers over faces. It simply learned from the hands that fed it."
  ],
  8: [
    "I placed my palm against the inner wall of the tank and felt vibration pass through bone. It was not unlike the factory floor. That recognition chilled me. War, too, had an assembly line inside it."
  ],
  9: [
    "The city did not ask me to admire its suffering. It asked me not to make suffering useful too quickly. Every ruin has been recruited by someone. The dead deserve at least one silence before they become a lesson."
  ],
  10: [
    "On the burning river, courage and terror looked almost identical from a distance. Only nearness distinguished them. A shaking hand could still row. A terrified body could still make room for another body."
  ],
  11: [
    "The house narrowed time. There was no century there, no campaign, no theory of history. There was only the next stair, the next breath, the next sound behind plaster. Philosophy became a question of where to place one's foot."
  ],
  12: [
    "I kept seeing the chair before it became useful to war: pushed under a table, scraped across a kitchen floor, dragged beside a sickbed. That earlier life clung to it. The chair remembered peace better than the soldiers did."
  ],
  13: [
    "She did not ask me to save her. That would have been easier for me. She asked, without asking, that I see her completely: child, fighter, fear, judgment, person. Not an emblem. Not a lesson. A person."
  ],
  14: [
    "The clock on the ruined wall had hands, but they were red and dripping. I understood the insult immediately. A clock can have hands and still be useless if the living hands in the room have surrendered."
  ],
  15: [
    "What frightened me most was not the lesson, but the children's readiness to receive it. They had already learned that survival often begins with pleasing the room. The school had entered them before the teacher arrived."
  ],
  16: [
    "The word why did not break the classroom. It revealed the break that had always been there. Everything that followed was not punishment for disorder, but panic from an order that knew how fragile it was."
  ],
  17: [
    "The hammer lay between us like a question too old to retire. What is a tool before a purpose chooses it? What is a purpose before a hand obeys it? What is a hand before a conscience wakes inside it?"
  ],
  18: [
    "I began to suspect that the library's infinity was not meant to be conquered. It was meant to humble the appetite for total possession. The wise reader does not own the whole library. He leaves with a truer question."
  ],
  19: [
    "The screen's greatest trick was not lying. It was teaching me to experience reality as something already edited by someone else. Even when it told the truth, it taught dependence on the frame."
  ],
  20: [
    "A cathedral is built to make scale feel like truth. I tilted my head back and felt the architecture working on me. The ceiling did not prove the doctrine, but it made doubt feel physically small."
  ],
  21: [
    "The market did not need my love. It only needed my return. My outrage, boredom, desire, envy, compassion, and loneliness all passed through the same turnstile if they kept me looking."
  ],
  22: [
    "The museum had preserved everything except consequence. It kept uniforms, tools, photographs, maps, slogans, and apologies. But consequence is alive only in the bodies that carry it, and bodies do not fit neatly behind glass."
  ],
  23: [
    "I noticed how tired everyone looked beneath the brightness. The aisle had mastered invitation without welcome. It offered endless entry and no rest, endless selection and no guidance, endless abundance and no feast."
  ],
  24: [
    "There was mercy in the pharmacy and accusation in it too. I could not separate them. Perhaps that was the truth of the place: real help had been stationed downstream from preventable harm."
  ],
  25: [
    "The robot waited after every transaction as if expecting gratitude. Maybe that expectation belonged to its makers, not to it. The machine had inherited a human desire: to be called progress without being asked progress toward what."
  ],
  26: [
    "The court did not ask whether pain had occurred. That was already settled. It asked what the pain had been made to serve, who had benefited from its translation into normality, and who had been taught to call the arrangement fate."
  ],
  27: [
    "At last I understood why the machine could not be the final defendant. It had no final word. Every answer it gave pointed beyond itself to design, ownership, permission, appetite, fear, and the hand that wanted distance from consequence."
  ],
  28: [
    "The tank-tree did not make violence beautiful. It made responsibility visible. Beauty, there, was not decoration added to ruin. It was the proof that purpose had changed and that change had entered matter."
  ],
  29: [
    "The clock had not been waiting outside history. It had been built from history's excuses. That was why raising my hand felt both impossibly small and unbearably large. I was touching not time, but alibi."
  ],
  30: [
    "The strike of the clock did not sound like bells. It sounded like doors unlocking in different cities at different distances. Some opened only a finger's width. Some opened inward. Some opened onto rooms still on fire. But they opened."
  ]
};

const resonancePassages = {
  2: [
    "I understood that the fence was not only outside me. I had carried smaller fences in my own thinking, little boards between action and consequence, comfort and cost, safety and someone else's danger."
  ],
  3: [
    "The wheel did not make me heroic. It made me implicated. A hand on the wheel cannot pretend the course belongs only to the storm."
  ],
  4: [
    "The floor kept moving whether I understood it or not. That, too, was a kind of argument: systems do not pause for comprehension."
  ],
  5: [
    "I wanted to open a window, but the office had none. It had transparency without air, visibility without contact."
  ],
  6: [
    "What had been divided could not be healed by sentiment. The rooms would have to be rebuilt, doors cut where walls had been profitable."
  ],
  7: [
    "The machine's light reflected in my eyes. For a moment I could not tell whether I was studying it or being studied by the future it represented."
  ],
  8: [
    "The steppe made every ideology seem temporary. Only the tread was immediate, only the pressure on earth undeniable."
  ],
  9: [
    "The city burned in colors no flag could own. Fire is a poor patriot. It consumes the slogans with the houses."
  ],
  10: [
    "I carried the shoe because I had no better ritual. Sometimes witness begins with holding what cannot be returned."
  ],
  11: [
    "In that house, survival was not noble or base. It was intimate. It had breath on its face."
  ],
  12: [
    "The room had not consented to become a battlefield. Its wallpaper still insisted on flowers."
  ],
  13: [
    "The girl stood where no child should stand, and the world had the audacity to call her brave before calling itself guilty."
  ],
  14: [
    "Blood made time honest. It removed the luxury of abstraction and left only the question of what a living hand would do."
  ],
  15: [
    "The missing roof allowed the sky to audit the lesson. Whatever the teacher wrote, the weather answered."
  ],
  16: [
    "One forbidden question had more life in it than all the approved answers on the page."
  ],
  17: [
    "I picked up the hammer and felt neither virtue nor crime, only possibility waiting to be disciplined."
  ],
  18: [
    "The library's silence was not empty. It was full of postponed arguments."
  ],
  19: [
    "I stepped away from the screen and felt the strange vertigo of receiving my own attention back."
  ],
  20: [
    "The cathedral feared laughter almost as much as heresy. Laughter made scale human again."
  ],
  21: [
    "The auction continued after I refused to bid. Markets do not end because one person wakes up."
  ],
  22: [
    "The museum's exits were marked clearly. Its moral exits were harder to find."
  ],
  23: [
    "The aisle made hunger fluent in packaging. Even need had been taught to speak brand names."
  ],
  24: [
    "The pharmacy light softened every face and made each private burden look almost ceremonial."
  ],
  25: [
    "The robot blinked, and I wondered how much of the age could be summarized by machines apologizing for rules humans refused to own."
  ],
  26: [
    "No one in the court asked for perfection. That would have acquitted everyone too easily. They asked for responsibility."
  ],
  27: [
    "The machine had been called inevitable so often that even its makers had forgotten it was made."
  ],
  28: [
    "The first leaf looked fragile, which is to say it looked honest."
  ],
  29: [
    "My hand trembled not because it was weak, but because it had stopped outsourcing the hour."
  ],
  30: [
    "The sound entered me last. Not as command. As answer."
  ]
};

const partExpansionPassages = {
  2: [
    "Part of me wanted the snake to become a riddle with a clever answer. I wanted the kind of insight that lets a man leave unchanged except for the pleasure of understanding. But the snake did not offer that bargain. It moved with the calm authority of reality itself, showing me that the world had never been organized for my convenience. The fence simplified what it could not contain, and I had spent much of my life mistaking that simplification for truth."
  ],
  4: [
    "The factory did not feel like a place after a while. It felt like a method. It entered the feet first, then the wrists, then the lungs, then the imagination. It taught people to expect repetition, to bargain with exhaustion, to take pride in endurance when joy had been designed out of the work. I could feel how such a place might become a civilization's hidden school, training everyone who passed through it to believe that usefulness was the highest form of belonging."
  ],
  8: [
    "When the factory became the tank, I understood that production and destruction were not opposites in the way I had hoped. They could be arranged on the same belt. The precision that made a part fit cleanly into an engine could also make a shell fit cleanly into a chamber. The horror was not that human beings could build powerful things. The horror was that power could travel from workshop to battlefield while conscience lagged behind, still filling out forms in another room."
  ],
  15: [
    "After the city, the school felt almost gentle, which was why it frightened me. Violence announces itself in fire, but formation can happen under quiet lights. A classroom can teach courage, memory, discipline, mercy, and wonder. It can also teach permission, ranking, obedience, and the dull habit of waiting for authority to name the world. I entered the school carrying ash on my coat and realized that every society builds its future first in rooms where children learn where to place their hands."
  ],
  19: [
    "The screen arrived after the school because it was another kind of classroom. It educated without admitting it. It assigned attention, distributed emotion, repeated approved fears, rewarded certain postures, and made whole populations feel informed while keeping them seated. I had once thought propaganda meant falsehood. Now I saw that it could also mean arrangement: the placement of truth in a pattern that trained the watcher to remain harmless."
  ],
  23: [
    "The supermarket seemed like relief after the screen, and that was its danger. Brightness returned. Music softened. No one shouted doctrine from a platform. The aisle did not command. It taught need to arrive as preference."
  ],
  26: [
    "The court gathered every previous room into one silence. The clock, the fence, the wake, the factory, the tank, the school, the screen, and the supermarket had not been separate episodes after all. They were witnesses. Each had shown me a different way human beings hide the hand: inside procedure, inside machinery, inside necessity, inside education, inside entertainment, inside choice, inside the word progress. The court existed because all those hiding places had failed."
  ]
};

const hingePassages = {
  3: [
    "By the time the ship horn sounded, I no longer believed in clean beginnings. The clock had opened into the fence, the fence into the snake, the snake into the sea, and every scene carried the previous one inside it like a bone. That was how the book of the world was written: not in separate pages, but in pages thin enough for earlier ink to show through."
  ],
  7: [
    "The factory had promised order, but it had ended by producing something larger than work. It had produced a way of seeing. Once the human being became an input, the rest followed with terrible ease. The tank waiting beneath my feet was not an interruption of the factory's logic. It was one of its children."
  ],
  14: [
    "The city section of the clock had taken something from me that I could not name. I had entered it as a witness and left it less able to hide behind witnessing. There is a kind of seeing that becomes debt. Once received, it asks payment in the currency of changed behavior."
  ],
  18: [
    "Leaving the library, I felt the danger of another temptation: to become clever instead of responsible. Knowledge can become a costume. Questions can become rooms where action goes to sleep. The next door opened before I could congratulate myself on understanding this."
  ],
  22: [
    "The museum's inward-opening glass taught me that critique is not an exit by itself. A man can identify every exhibit and still remain inside the building. I had named the machinery of other worlds. Now I was being asked whether I could recognize my own."
  ],
  30: [
    "I thought of the snake, still moving beyond the fence. I thought of the wake, still widening. I thought of the girl at the gun, the child in the classroom, the cashier before the robot, the machine in the court. None of them had vanished into symbol. They remained, insisting that meaning without response is only another form of delay. The hour had become intimate. It had entered the hand. It had stopped being a subject for observers and become a demand upon the living. Even silence now had consequences. Even waiting had chosen a side. The clock knew. So did I, finally, with my hand raised."
  ]
};

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

function cleanText(value) {
  return value
    .replace(/\u00e2\u20ac\u0153|\u00e2\u20ac\ufffd|\u00e2\u20ac/g, '"')
    .replace(/\u00e2\u20ac\u2122|\u00e2\u20ac\u02dc/g, "'")
    .replace(/\u00e2\u20ac\u201c|\u00e2\u20ac\u009d/g, "-")
    .replace(/\u00e2\u20ac\u00a6/g, "...")
    .replace(/Ã¢â‚¬Å“|Ã¢â‚¬ï¿½/g, '"')
    .replace(/Ã¢â‚¬Ëœ|Ã¢â‚¬â„¢/g, "'")
    .replace(/Ã¢â‚¬â€|Ã¢â‚¬â€œ/g, "-")
    .replace(/ÃƒÂ¯/g, "i")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
}

function extractParagraphs(filePath) {
  const zip = new AdmZip(filePath);
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

function extractParagraphsWithLineBreaks(filePath) {
  const zip = new AdmZip(filePath);
  const xml = zip.readAsText("word/document.xml");
  return [...xml.matchAll(/<w:p\b[^>]*>([\s\S]*?)<\/w:p>/g)]
    .map(([, paragraph]) => {
      const tokens = [];
      for (const match of paragraph.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>|<w:br\b[^>]*\/>/g)) {
        if (match[0].startsWith("<w:br")) {
          tokens.push("\n");
        } else {
          tokens.push(decodeXml(match[1]));
        }
      }

      return tokens
        .join("")
        .split(/\n+/)
        .map(cleanText)
        .filter(Boolean)
        .join("\n");
    })
    .filter(Boolean);
}

function splitTerzaSections(paragraphs) {
  const sections = new Map();
  let current;

  for (const paragraph of paragraphs) {
    const heading = paragraph.match(/^(\d{1,2})\.\s+(.+)$/);
    if (heading) {
      current = { chapterNumber: Number(heading[1]), title: heading[2].trim(), lines: [] };
      sections.set(current.chapterNumber, current);
      continue;
    }

    if (!current) continue;
    const lines = paragraph
      .split(/\n+/)
      .map(cleanText)
      .filter(Boolean);
    current.lines.push(...lines);
  }

  return sections;
}

function loadTerzaPoems(filePath) {
  const paragraphs = extractParagraphsWithLineBreaks(filePath);
  const alternateIndex = paragraphs.findIndex((paragraph) => /^ALTERNATE VERSIONS$/i.test(paragraph));
  if (alternateIndex === -1) throw new Error("Missing ALTERNATE VERSIONS marker in Clock terza rima packet.");

  const primary = splitTerzaSections(paragraphs.slice(0, alternateIndex));
  const alternate = splitTerzaSections(paragraphs.slice(alternateIndex + 1));
  if (primary.size !== 30) throw new Error(`Expected 30 primary terza poems, found ${primary.size}`);
  if (alternate.size !== 30) throw new Error(`Expected 30 alternate terza poems, found ${alternate.size}`);

  return { primary, alternate };
}

function loadPotentialInserts(filePath) {
  const paragraphs = extractParagraphs(filePath);
  const inserts = new Map();
  let current;

  for (const paragraph of paragraphs) {
    const heading = paragraph.match(/^Insert\s+(\d{1,2})\s+\W+\s+(.+)$/i);
    if (heading) {
      current = { insertNumber: Number(heading[1]), title: heading[2].trim(), paragraphs: [] };
      inserts.set(current.insertNumber, current);
      continue;
    }

    if (current) current.paragraphs.push(paragraph);
  }

  if (inserts.size !== 10) throw new Error(`Expected 10 Clock potential prose inserts, found ${inserts.size}`);
  return inserts;
}

function requirePotentialInsert(inserts, insertNumber) {
  const insert = inserts.get(insertNumber);
  if (!insert) throw new Error(`Missing Clock potential prose insert ${insertNumber}`);
  return insert.paragraphs;
}

function adaptPotentialInsert(inserts, placement) {
  const source = requirePotentialInsert(inserts, placement.insertNumber);

  if (placement.insertNumber === 1) {
    return [
      "I found the plaque marked INEVITABLE beneath the clock's central pin, lower than the others, almost hidden where the brass had gone green from age and fingerprints. LATE, EARLY, and NOW had been polished by many hands. This one was darker, as if people preferred not to touch it.",
      source[1],
      "I worked at the first screw with the hard edge of the broken ruler the child had left beside the wheel. It resisted. The clock groaned under me. From the cities around the rim came a murmur, not of alarm but of administration: forms shuffled, stamps fell, doors locked, engines resumed. I kept turning. A thin shaving of brass curled under my thumb.",
      ...source.slice(3)
    ];
  }

  if (placement.insertNumber === 2) {
    return [
      "Then the glass wall answered the stamp by showing me what this room would become when the logic of the factory changed uniforms.",
      ...source
    ];
  }

  if (placement.insertNumber === 6) {
    return [
      source[0],
      source[1],
      source[2],
      source[3],
      source[4],
      source[8],
      source[9],
      source[10],
      source[11],
      source[12]
    ].filter(Boolean);
  }

  if (placement.insertNumber === 7) {
    return [
      source[0],
      source[1],
      source[2],
      source[3],
      source[4],
      source[5],
      source[6],
      source[7],
      source[8]
    ].filter(Boolean);
  }

  if (placement.insertNumber === 9) {
    return [
      source[0],
      source[1],
      source[2],
      source[3],
      source[4],
      source[5],
      source[6],
      source[7],
      source[8],
      source[9],
      source[10],
      source[11],
      source[12]
    ].filter(Boolean);
  }

  if (placement.insertNumber === 10 && placement.variant === "destiny") {
    return [
      "DESTINY remained beneath the last false knot, a narrow ribbon I had mistaken for shadow. It tightened when I touched it. From the rim came a chorus of warnings in many voices. Too late. Too early. Too costly. Too dangerous. Too complicated. Not your place. Not your hour. Not your hand.",
      "The snake slid across the brass and watched me with its lidless eye.",
      "I pulled.",
      "The ribbon came loose so suddenly I nearly fell. Behind it was only the pin, plain and scratched. No thunder sounded. No law of nature broke. The clock did not punish me. It waited, which was worse."
    ];
  }

  if (placement.insertNumber === 10 && placement.variant === "now") {
    return [
      "The cities still burned and glittered around the rim. Trains moved through Berlin. Snow fell on the broken city. Screens flashed in towers of glass. Factory belts whispered under fluorescent light. The supermarket doors opened and closed through the night, breathing cold air onto the pavement. Nothing had ended. Nothing had been redeemed by my arrival.",
      "At the center, the brass pin protruded from the face like a wound that had healed badly. The old ribbons lay loose around it, no longer laws, only materials someone might tie again if no one kept watch."
    ];
  }

  return source;
}

function insertionIndex(paragraphs, placement) {
  if (placement.afterIncludes) {
    const found = paragraphs.findIndex((paragraph) => paragraph.includes(placement.afterIncludes));
    if (found !== -1) return found + 1;
  }

  if (placement.beforeFinalParagraph) return Math.max(0, paragraphs.length - 1);
  if (typeof placement.afterParagraph === "number") return Math.min(paragraphs.length, placement.afterParagraph);
  return Math.max(0, paragraphs.length - 1);
}

function applyPotentialInserts(section, paragraphs, inserts) {
  const placements = potentialInsertPlacements.filter((placement) => placement.chapterNumber === section.chapterNumber);
  let nextParagraphs = [...paragraphs];

  for (const placement of placements) {
    const prose = adaptPotentialInsert(inserts, placement);
    const index = insertionIndex(nextParagraphs, placement);
    nextParagraphs = [...nextParagraphs.slice(0, index), ...prose, ...nextParagraphs.slice(index)];
  }

  return nextParagraphs;
}

function polishChapterParagraphs(section, paragraphs) {
  if (section.chapterNumber === 2) {
    return paragraphs.filter(
      (paragraph) => !paragraph.startsWith("I understood that the fence was not only outside me.")
    );
  }

  if (section.chapterNumber === 16) {
    return paragraphs.map((paragraph) => {
      if (paragraph === "It became a hammer.") {
        return "By the time I looked back, it had become a hammer.";
      }
      return paragraph;
    });
  }

  if (section.chapterNumber === 19) {
    return paragraphs.filter(
      (paragraph) => !paragraph.startsWith("I watched with them at first.")
    );
  }

  if (section.chapterNumber === 23) {
    return paragraphs.filter(
      (paragraph) =>
        !paragraph.startsWith("I picked up an apple.") &&
        !paragraph.startsWith("At the checkout, the scanner chirped") &&
        !paragraph.startsWith("Above us, the sign rocked") &&
        !paragraph.startsWith("Every shelf was full. That was the first cruelty.") &&
        !paragraph.startsWith("FREEDOM.CHOICE.GROWTH.SECURITY.") &&
        !paragraph.startsWith("Freedom, I saw, can be reduced") &&
        !paragraph.startsWith("I picked up a bright package") &&
        !paragraph.startsWith("I noticed how tired everyone") &&
        !paragraph.startsWith("The aisle made hunger fluent")
    );
  }

  if (section.chapterNumber === 27) {
    return paragraphs
      .filter(
        (paragraph) =>
          !paragraph.startsWith("The machine opened a panel in its chest.") &&
          !paragraph.startsWith("A pen hung beside it on a chain.") &&
          !paragraph.startsWith("The executive reached for the pen.") &&
          !paragraph.startsWith("The machine could not be the final defendant.") &&
          !paragraph.startsWith("At last I understood why the machine could not be the final defendant.")
      )
      .map((paragraph) => {
        if (paragraph.startsWith("No one moved.")) {
          return "No one moved toward the blank field.";
        }
        if (paragraph.startsWith("Someone asked whether the machine was guilty.")) {
          return "Someone asked whether the machine was guilty. It answered with a sound like cooling metal. Guilty is a human word, it seemed to say. Then the court turned toward us. That was precisely why the question had returned to human hands.";
        }
        return paragraph;
      });
  }

  if (section.chapterNumber === 29) {
    return paragraphs.map((paragraph) => {
      if (paragraph.startsWith("I saw then that a hand is not merely a pointer.")) {
        return "A hand is not merely a pointer. It is a risk. To raise a hand is to interrupt the circle, to say that the hour is not complete without participation. The clock had been waiting not for permission from history, but for contact.";
      }
      return paragraph;
    });
  }

  if (section.chapterNumber === 30) {
    return paragraphs.map((paragraph) => {
      if (paragraph === "It entered the machinery.") {
        return "The sound entered the machinery.";
      }
      return paragraph;
    });
  }

  return paragraphs.map((paragraph) => {
    if (paragraph.startsWith("That was how total systems worked:")) {
      return "Total systems did not destroy the ordinary all at once. They enlisted it. A window became a firing angle. A table became cover. A telephone wire became command. The home did not vanish. It was translated into tactics, and something in me recoiled from the fluency of that translation.";
    }
    return paragraph;
  });
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderTerzaBlock(poem) {
  const stanzas = [];
  for (let index = 0; index < poem.lines.length; index += 3) {
    stanzas.push(poem.lines.slice(index, index + 3));
  }

  const stanzaMarkup = stanzas
    .map((stanza) => {
      const lines = stanza.map((line) => `<span>${escapeHtml(line)}</span>`).join("\n");
      return `<p>${lines}</p>`;
    })
    .join("\n");

  return `<aside class="clock-terza" aria-label="Terza rima interlude">
${stanzaMarkup}
</aside>`;
}

function selectedTerzaForChapter(section, poems) {
  const source = terzaSelectionOverrides.get(section.chapterNumber) ?? "primary";
  const collection = source === "alternate" ? poems.alternate : poems.primary;
  const poem = collection.get(section.chapterNumber);
  if (!poem) throw new Error(`Missing ${source} terza poem for chapter ${section.chapterNumber}`);
  if (normalizeHeadingTitle(poem.title) !== normalizeHeadingTitle(section.title)) {
    throw new Error(
      `Terza poem ${section.chapterNumber} title mismatch: expected "${section.title}", found "${poem.title}"`
    );
  }

  return poem;
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

function normalizeHeadingTitle(value) {
  return value.replace(/[’]/g, "'").replace(/\s+/g, " ").trim().toLowerCase();
}

function findDraftSections(paragraphs) {
  const headingIndexes = [];
  for (let index = 0; index < paragraphs.length; index += 1) {
    const match = paragraphs[index].match(/^(\d{1,2})\.\s+(.+)$/);
    if (match) headingIndexes.push({ index, chapterNumber: Number(match[1]), title: match[2].trim() });
  }

  const result = new Map();
  for (let i = 0; i < headingIndexes.length; i += 1) {
    const current = headingIndexes[i];
    const next = headingIndexes[i + 1];
    result.set(current.chapterNumber, {
      title: current.title,
      paragraphs: paragraphs.slice(current.index + 1, next ? next.index : paragraphs.length)
    });
  }

  return result;
}

function validateGuideHeadings(paragraphs) {
  const guideText = paragraphs.join("\n");
  const missing = sectionDefinitions.filter((section) => {
    const pattern = new RegExp(`Chapter\\s+${section.chapterNumber}\\s+[-\u2013\u2014]\\s+${escapeRegExp(section.title)}`);
    return !pattern.test(guideText);
  });
  if (missing.length) {
    throw new Error(`Missing guide headings: ${missing.map((section) => section.heading).join(", ")}`);
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/'/g, "['\u2019]");
}

function insertTerzaInterlude(body, interlude, section) {
  const paragraphs = body.split(/\n{2,}/);
  if (paragraphs.length < 2) return `${body}\n\n${interlude}`;

  const insertBefore = section.chapterNumber === 30 ? Math.max(1, paragraphs.length - 2) : paragraphs.length - 1;
  return [...paragraphs.slice(0, insertBefore), interlude, ...paragraphs.slice(insertBefore)].join("\n\n");
}

function buildChapterBody(section, draftSection, poems, inserts) {
  const interlude = renderTerzaBlock(selectedTerzaForChapter(section, poems));
  if (section.chapterNumber === 1) return insertTerzaInterlude(chapterOneDraft, interlude, section);
  if (!draftSection) throw new Error(`Missing draft section for chapter ${section.chapterNumber}: ${section.title}`);

  const paragraphs = draftSection.paragraphs.filter(
    (paragraph) =>
      !/^The Clock with No Hands$/i.test(paragraph) &&
      !/^Draft Pages for Integration$/i.test(paragraph) &&
      !/^Character and Voice Notes$/i.test(paragraph)
  );
  const expansions = [
    ...(expansionPassages[section.chapterNumber] ?? []),
    ...(deepeningPassages[section.chapterNumber] ?? []),
    ...(thresholdPassages[section.chapterNumber] ?? []),
    ...(resonancePassages[section.chapterNumber] ?? []),
    ...(partExpansionPassages[section.chapterNumber] ?? []),
    ...(hingePassages[section.chapterNumber] ?? [])
  ];
  const insertAt = Math.max(1, paragraphs.length - 2);
  const proseParagraphs = applyPotentialInserts(
    section,
    [...paragraphs.slice(0, insertAt), ...expansions, ...paragraphs.slice(insertAt)],
    inserts
  );
  const body = polishChapterParagraphs(section, proseParagraphs).join("\n\n");
  return insertTerzaInterlude(body, interlude, section);
}

function summarize(markdown, fallback) {
  const compact = markdown
    .replace(/<aside[\s\S]*?<\/aside>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_`>|-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const sentences = compact.match(/[^.!?]+[.!?]/g)?.map((sentence) => sentence.trim()) ?? [];
  const summary = sentences.slice(0, 2).join(" ");
  if (summary && summary.length <= 220) return summary;
  if (sentences[0]) return sentences[0];
  const clipped = compact.slice(0, 190).replace(/\s+\S*$/, "").trim();
  return clipped || fallback;
}

function wordCount(markdown) {
  return markdown.match(/[A-Za-z0-9]+(?:['’][A-Za-z0-9]+)?/g)?.length ?? 0;
}

async function main() {
  const guideParagraphs = extractParagraphs(guidePath);
  validateGuideHeadings(guideParagraphs);

  const draftParagraphs = extractParagraphs(draftPath);
  const draftSections = findDraftSections(draftParagraphs);
  const terzaPoems = loadTerzaPoems(terzaPath);
  const potentialInserts = loadPotentialInserts(potentialInsertsPath);
  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });

  if (sectionDefinitions.length !== 30) {
    throw new Error(`Expected 30 configured sections, found ${sectionDefinitions.length}`);
  }
  if (draftSections.size !== 30) {
    throw new Error(`Expected 30 draft sections, found ${draftSections.size}`);
  }

  let totalWords = 0;
  for (const section of sectionDefinitions) {
    const draftSection = draftSections.get(section.chapterNumber);
    if (draftSection && normalizeHeadingTitle(draftSection.title) !== normalizeHeadingTitle(section.title)) {
      throw new Error(
        `Draft chapter ${section.chapterNumber} title mismatch: expected "${section.title}", found "${draftSection.title}"`
      );
    }

    const body = buildChapterBody(section, draftSection, terzaPoems, potentialInserts);
    totalWords += wordCount(body);
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

  console.log(`clock-with-no-hands: ${sectionDefinitions.length} sections, ${totalWords} words`);
}

await main();
