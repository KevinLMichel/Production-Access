import AdmZip from "adm-zip";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

// WARNING: Rerunning this extractor overwrites generated Island reader sections.
const root = resolve(import.meta.dirname, "..");
const sourceDocx = resolve(
  process.env.PRODUCTION_ACCESS_ISLAND_REFUSED_INPUT ??
    "C:/Users/kevin/Downloads/The Island That Refused to Be Saved.docx"
);
const outputDir = resolve(root, "src/content/book-chapters/island-that-refused-to-be-saved");
const updated = "2026-05-29";

const outlineText = extractDocxText(sourceDocx);
if (!outlineText.includes("The Island That Refused to Be Saved") || !outlineText.includes("Nayara")) {
  throw new Error("Source outline did not look like the expected Island outline.");
}

const articles = [
  ["Article I", "Equal Civic Identity", "kinship words becoming legal categories"],
  ["Article II", "Transparent Land Registry", "paths, graves, and commons vanishing if no file proves them"],
  ["Article III", "Modern Education", "children describing home through foreign metrics"],
  ["Article IV", "Public Integrity", "care and corruption being forced to wear the same face"],
  ["Article V", "Climate Resilience", "villages being saved from the sea by being cut away from it"],
  ["Article VI", "Civic Harmony", "anger cooled until it can be safely archived"],
  ["Article VII", "Heritage Protection", "living culture pressed behind glass"],
  ["Article VIII", "Security Partnership", "the sea turning from road to monitored surface"],
  ["Article IX", "Investment Citizenship", "passports sold faster than belonging can be defended"],
  ["Article X", "Language Standardization", "truth losing legal standing when it arrives in island speech"],
  ["Article XI", "Leadership Renewal", "leaders trained to speak upward before they can hear downward"],
  ["Article XII", "National Rebirth", "the word we becoming unstable in the mouth"]
];

const sections = [
  {
    title: "The First Summons",
    subtitle: "Prologue",
    part: "Prologue",
    pov: "Maman Zelie",
    setting: "the Court Beneath the Reef, where pews, coral, shipwreck iron, and old governor wood make a courthouse under the sea",
    opening: "Maman Zelie had been dead for nine months when the sea summoned her for jury duty.",
    desire: "to stay comfortably dead and not be troubled by the living people's talent for losing themselves",
    pressure: "the old name Nayara is called into court while Saint Orison shines above the reef in borrowed electric light",
    memory: "market songs, dirty funeral jokes, the smell of bay leaf, and the names of babies buried under lawns now advertised as coastal frontage",
    object: "a market basket packed with salt, a fishbone knife, and words that still had sand in them",
    conflict: "the ancestors do not ask whether outsiders harmed the island; they ask when the island learned to cooperate with its own forgetting",
    turn: "Zelie is appointed messenger because death did not cure her of talking",
    ending: "she looks up through the water at the island lights and decides to wake the ones who still have tongues",
    dialogue: ["Sea, if this is heaven, you owe me a chair.", "This is not heaven.", "Then at least let judgment come with manners."],
    interlude: ["Court Beneath the Reef, Preliminary Record", "Charge: self-abandonment under appearance of improvement. Defendant: Nayara, also called Saint Orison. Condition of defendant: breathing, divided, ashamed."],
    notes: ["The court ceiling is the underside of the sea, and every fish passing above looks like a thought the island tried not to finish.", "The dead are not pure. They argue by parish, by color, by church bench, by who owed whom money when the hurricane came.", "Zelie sees Sol Riviere among the witnesses and looks away before the court can notice her looking away.", "The conch does not sound loud. It sounds inevitable, the way truth sounds after a family has spent years eating around it."]
  },
  {
    title: "The Day the Saviors Landed",
    subtitle: "Chapter 1",
    part: "Part I: The Offer",
    pov: "Amiel Dorsain",
    setting: "Port Mercy beneath white tents, international cameras, paper doves, and a steel band arrangement scrubbed clean for ceremony",
    opening: "When the saviors landed, the band played a song no one remembered choosing.",
    desire: "to stand beside Dr. Corin Vale and be seen as the face of a new, governable Saint Orison",
    pressure: "the Season of Three Ruins has made every proud person hungry for someone else's order",
    memory: "a schoolroom where young Amiel learned to sand the village out of his vowels",
    object: "the ceremonial Charter, beautiful enough to make betrayal feel like gratitude",
    conflict: "fishers from Anse-Baleine protest relocation while Amiel promises every voice will be heard",
    turn: "an old woman forgets the sentence she came to shout just as the microphone finds her face",
    ending: "the ink dries too quickly on Amiel's signature",
    dialogue: ["Every voice will be heard.", "Minister, what do you call a voice after you translate it?", "I call it included."],
    interlude: ["From the Charter of Civic Renewal and Transparent Self-Government", "Saint Orison shall become a model small-island democracy through transparent partnership, lawful renewal, climate adaptation, and harmonized civic identity."],
    notes: ["Premier Rance smiles as if realism were a wound he has learned to powder.", "Corin's calm makes the island's panic look provincial, and Amiel hates himself for admiring it.", "The protest signs say WE ARE NOT A FLOOD ZONE, but the cameras cut away before the old man carrying one can cough.", "Saint Orison is humiliated, and humiliation is the easiest door through which foreign mercy enters."]
  },
  {
    title: "The Current Without a Name",
    subtitle: "Chapter 2",
    part: "Part I: The Offer",
    pov: "Tavio Senn",
    setting: "the green-black water beyond Anse-Baleine before dawn, where diesel, rope, flying fish, and old warning names ride together",
    opening: "The first thing the island forgot was not a person, but a current.",
    desire: "to fish alone with his grief and let the sea remain older than every ministry brochure",
    pressure: "a maritime safety term appears in his mouth where his father's current name should be",
    memory: "Lucan laughing in bad weather and Tavio pretending the sea, not his own hunger, sent the boy out",
    object: "a coil of wet rope that still remembers the old knots better than Tavio's tongue remembers the current",
    conflict: "without the name, navigation falters; with the official phrase, the sea becomes accurate and dead",
    turn: "survey flags appear near the cemetery when he returns to shore",
    ending: "the sea whispers Lucan's name and Tavio curses loudly enough to pretend he did not hear",
    dialogue: ["Unregulated nearshore flow.", "That is not its name.", "Then say the name, old man.", "Do not rush a mouth while something is stealing from it."],
    interlude: ["Maritime Safety Notice", "Unregulated nearshore flow is not approved for subsistence navigation. Users are encouraged to consult digital hazard maps."],
    notes: ["Bex laughs because youth often mistakes inherited knowledge for old men's theater until the reef rises under the hull.", "Tavio spits three times, once for the current, once for his father, once for Lucan.", "The village dogs bark at the survey flags as if fabric can be criminal.", "The replacement phrase is useful. That is what makes it obscene."]
  },
  {
    title: "Words That Ran Away",
    subtitle: "Chapter 3",
    part: "Part I: The Offer",
    pov: "Mira Baptiste",
    setting: "the Academy of Civic Future, where polished children learn to describe their own island in language that can travel",
    opening: "Mira Baptiste was twelve years old and already fluent in the future, which was another way of saying she was beginning to mistrust the past.",
    desire: "to become global, chosen, unembarrassed, and impossible to laugh back into poverty",
    pressure: "her class can describe the sea as an asset but not as the purple thing her grandmother used to warn about rain",
    memory: "Maman Zelie laughing after Mira corrected her grammar in front of a teacher",
    object: "an exercise book titled Words That Ran Away",
    conflict: "success feels like escape until each escaped word leaves a small unlit room inside her",
    turn: "Zelie appears in a dream sitting on a submerged school desk and eating roasted corn",
    ending: "Mira writes a blank where a sea word should be and feels the blank look back",
    dialogue: ["Child, when a word runs away, ask who opened the gate.", "I only forgot one word.", "One gate, then."],
    interlude: ["Words That Ran Away, Page 1", "The sea before rain: _____. The smell of the first frying oil at Carnival: _____. Grandmother's word for men with shoes too shiny: _____."],
    notes: ["The visiting advisor calls Mira globally promising, and Mira keeps the phrase in her pocket like money.", "Miss Cadet watches the children write coastal resource and feels older than the chalk.", "Mira is ashamed of missing the old word, then ashamed of being ashamed, which is how the Charter gets two victories from one child.", "At night the notebook lies under her pillow like contraband with ruled lines."]
  },
  {
    title: "The Woman Who Wrote the Cure",
    subtitle: "Chapter 4",
    part: "Part I: The Offer",
    pov: "Dr. Corin Vale",
    setting: "a hotel room above Port Mercy, all glass, sea view, climate reports, briefing folders, and a mirror delayed by half a second",
    opening: "Corin Vale did not come to Saint Orison to conquer anyone. That was why conquest trusted her.",
    desire: "to prove that law can do what sentiment, loyalty, and speeches have failed to do",
    pressure: "Saint Orison's broken roads, stolen disaster funds, unsafe villages, and exhausted schools make her abstraction feel merciful",
    memory: "her father dying in another failed intervention, leaving her with a child's hatred of disorder",
    object: "Schedule XII, Cognitive Civic Harmonization, filed behind calm language and exact margins",
    conflict: "she improves real things while designing a system that cannot hear what it cannot archive",
    turn: "she tells herself that trauma reduction is not theft",
    ending: "her reflection answers late, as if even glass needs time to agree",
    dialogue: ["Memory is not reliable evidence.", "Neither is power.", "Power can be audited.", "By whom?"],
    interlude: ["Technical Annex, Schedule XII", "Identity-based resistance patterns may be reduced through language harmonization, curricular stabilization, and formal civic substitutions."],
    notes: ["Corin supports girls' education, land rights for poor women, domestic violence reform, procurement transparency, and hospitals that can keep lights on after storms.", "Her danger is not that she hates the island. Her danger is that she loves a version of it that can be managed.", "She quotes island poets better than certain ministers, but pronunciation is not relation.", "The Charter is her prayer without God: orderly, beautiful, and unwilling to kneel before what cannot be measured."]
  },
  {
    title: "The First Public Consultation",
    subtitle: "Chapter 5",
    part: "Part I: The Offer",
    pov: "Tavio Senn and Mira Baptiste",
    setting: "a school hall near Anse-Baleine with sticky notes, warm juice, numbered microphones, and banners saying YOUR VOICE, OUR FUTURE",
    opening: "The first consultation was arranged so carefully that no one could accuse it of silence.",
    desire: "for Tavio to defend the village and for Mira to understand why adults tremble around microphones",
    pressure: "rage must enter the hall through two-minute slots and leave as categorized feedback",
    memory: "women washing hurricane mud from church fans while men argued over who owned which apology",
    object: "a yellow sticky note reading heritage attachment and livelihood anxiety",
    conflict: "Tavio speaks living geography and the facilitator returns a dead summary",
    turn: "a woman rises to resist relocation and sits down having endorsed safe transition for vulnerable beneficiaries",
    ending: "Mira writes that sometimes they translate you until you agree",
    dialogue: ["Sir, we hear your concern.", "You heard the word concern. You did not hear the graveyard.", "Please remain constructive.", "I was born constructed."],
    interlude: ["Consultation Summary, Theme Cluster 4", "Community members expressed attachment to place, anxiety about livelihood transition, and openness to supported adaptation pathways."],
    notes: ["Joss Morne livestreams from the back with fury bright enough to make the teenagers straighten.", "Mira admires the tablets before she notices the tablets are better at listening than remembering.", "The facilitator thanks every wound for its contribution to process.", "Outside, the sea keeps making a sound no microphone is positioned to capture."]
  },
  {
    title: "The Minister's Accent",
    subtitle: "Chapter 6",
    part: "Part I: The Offer",
    pov: "Amiel Dorsain",
    setting: "Amiel's childhood village during a ribbon-cutting where old women still know the nickname cameras cannot use",
    opening: "Amiel returned to the village sounding like a man who had survived himself.",
    desire: "to keep the polish that saved him while appearing warm enough not to insult the people who fed him",
    pressure: "the Charter is accelerating and the old festival name will not come when he reaches for it",
    memory: "a teacher at elite school telling him to speak as if he expected to be obeyed",
    object: "a sealed memo announcing that language transition begins ahead of projections",
    conflict: "his first voice keeps knocking from under the floor of his public voice",
    turn: "Maman Zelie calls him Miel-Miel in a dream he cannot fully remember",
    ending: "he wakes with salt on his pillow and the taste of an accent he had spent decades burying",
    dialogue: ["You talk fine now, boy.", "I always talked fine.", "No, you talk useful. That is different."],
    interlude: ["Leadership Renewal Fellowship Note", "High-potential local leaders benefit from accent-neutral communication training and stakeholder-facing discipline."],
    notes: ["The women tease him with love and accusation braided so tightly he cannot separate them.", "His smile grows more careful every time someone says village.", "He signs a plaque beside a road that had been promised three hurricanes ago.", "Under the applause he hears benches scraping under water."]
  },
  {
    title: "Maman Zelie Goes to Parliament",
    subtitle: "Chapter 7",
    part: "Part I: The Offer",
    pov: "Maman Zelie",
    setting: "the sleeping parliament chamber, ankle-deep in dream water and full of fish swimming through microphones",
    opening: "Maman Zelie entered Parliament after midnight carrying a basket of words and no respect for procedure.",
    desire: "to frighten the powerful into remembering before the court must become less polite",
    pressure: "most ministers dream in slogans too thick to pierce",
    memory: "market women naming lies by smell long before committees discovered ethics",
    object: "a fishbone knife for peeling oranges and cutting through speeches",
    conflict: "the politicians can buy back forgotten words but refuse the price of meaning them",
    turn: "Premier Rance hears enough to wake sweating while Amiel hears his childhood nickname",
    ending: "Zelie reports that the house is full of people who sold mirrors and call windows progress",
    dialogue: ["How much for sovereignty?", "More than you brought.", "What currency?", "Truth without applause."],
    interlude: ["Dream Inventory, Parliament House", "Recovered: three proverbs, one oath, four insults, and a cabinet minister's original laugh. Unclaimed: shame."],
    notes: ["One minister appears as all mouth and no ears; another has pockets full of tiny flags.", "The Speaker's chair sprouts coral and refuses to recognize points of order.", "Zelie sells a grandmother curse back to a senator for the cost of naming his first bribe.", "The dream is funny until the fish begin coughing paper."]
  },
  {
    title: "The Ratification",
    subtitle: "Chapter 8",
    part: "Part I: The Offer",
    pov: "Mira Baptiste and the island chorus",
    setting: "Parliament lawn, schoolchildren in white shirts, television drones, flags, bells, and the old cemetery path vanishing in bush",
    opening: "The Charter passed under a sky so bright that even betrayal looked washed and ready for guests.",
    desire: "for Saint Orison to feel rescued and for Mira to survive being chosen to read the pledge",
    pressure: "the word we cracks in public and the band is ordered to play louder",
    memory: "Tavio's son buried where no map agrees the poor were allowed to bury anyone",
    object: "a cracked ceremonial copy that no camera sees because every lens prefers the signing copy",
    conflict: "the nation applauds while Anse-Baleine loses the path to its dead",
    turn: "the underwater court opens a file: Nayara v. Saint Orison",
    ending: "let the evidence of forgetting begin",
    dialogue: ["We are renewed under one transparent law.", "Say it again, child.", "I cannot find the first word."],
    interlude: ["Court Beneath the Reef, Case File Opened", "Nayara v. Saint Orison. First question reserved: Can a people consent while forgetting the words by which consent is known?"],
    notes: ["The bells ring with such confidence that people mistake volume for blessing.", "Premier Rance cries, but no one knows which part of him has broken.", "Tavio runs through bush until his shirt tears, then stands before Lucan's grave unable to see the way back.", "The Charter does not thunder. It simply becomes law."]
  },
  {
    title: "The Museum of Living Things",
    subtitle: "Chapter 9",
    part: "Part II: The Clean Ink",
    pov: "Mira Baptiste",
    setting: "the National Heritage Experience, bright with interactive screens, glass cases, holographic dancers, and songs without sweat",
    opening: "The museum was so beautiful that Mira almost forgave it for being a tomb.",
    desire: "to admire what success has built without betraying what her notebook is trying to save",
    pressure: "old words appear as obsolete coastal vocabulary behind a screen that requires institutional credentials to correct",
    memory: "Zelie's market song, now turned into Traditional Female Vendor Melody",
    object: "a touchscreen that cannot understand correction without a login",
    conflict: "living practices are preserved by removing the people who practiced them",
    turn: "Mira sees one of her missing words translated wrongly and feels the museum steal in daylight",
    ending: "Zelie warns her not to admire the glass",
    dialogue: ["Can something living be preserved after you remove the people?", "Preservation requires standards.", "So does burial."],
    interlude: ["Museum Label", "Traditional Female Vendor Melody, anonymous. Performance context: informal economy, early modern period. Emotional tone: lively."],
    notes: ["The air smells expensive and cold, like an apology refrigerated for donor tours.", "Children point at the hologram because spectacle is easier to love than a grandmother who corrects you.", "Miss Cadet's mouth tightens when the guide says obsolete.", "Mira writes the screen's mistake down because even false archives can be made to testify."]
  },
  {
    title: "The Youth Advisory Panel",
    subtitle: "Chapter 10",
    part: "Part II: The Clean Ink",
    pov: "Joss Morne",
    setting: "a climate-controlled conference room where revolt is given a lanyard, a stipend, and a microphone with a timer",
    opening: "Joss Morne arrived angry and left scheduled.",
    desire: "to force the reformers to hear the street without losing the strange pleasure of being invited inside",
    pressure: "his slogans are praised until they return to him cooler, safer, and easier to fund",
    memory: "his mother yelling at landlords with no grant language and no panelist badge",
    object: "a Youth Advisory credential that shines like access and weighs like a leash",
    conflict: "resistance becomes useful the moment it learns to be photographed properly",
    turn: "his girlfriend asks which room he has gained access to, and whose house it is",
    ending: "Joss deletes fight and types engage",
    dialogue: ["Access matters.", "Access to what room? And whose house?", "You want me outside shouting forever?", "I want you to know when inside is another kind of outside."],
    interlude: ["Youth Engagement Memo", "Constructive disruption should be centered, photographed, and integrated into stakeholder-facing reform narratives."],
    notes: ["Corin listens to him with genuine seriousness, which is more dangerous than mockery.", "The stipend is small enough to seem harmless and large enough to change how his week feels.", "His first official photo makes him look braver than he felt.", "The comments under his post divide between sellout and finally somebody smart enough to get in."]
  },
  {
    title: "Survey Flags in the Graveyard",
    subtitle: "Chapter 11",
    part: "Part II: The Clean Ink",
    pov: "Tavio Senn",
    setting: "the old cemetery edge where trees, shells, informal graves, survey tape, and heat make law sweat",
    opening: "The survey flags stood among the graves like small, polite knives.",
    desire: "to defend Lucan's resting place from a map that says no one is buried there",
    pressure: "Naya supports relocation because she has watched storms drown people who refused safer ground",
    memory: "poor families burying loved ones under trees when church plots were full",
    object: "a broken survey pole in Tavio's hand",
    conflict: "the plan is both necessary and theft, and the novel refuses to simplify that wound",
    turn: "Tavio is arrested and Naya bails him out with exhausted love",
    ending: "Lucan asks in dream why Tavio is angry at the map if the sea killed him",
    dialogue: ["Papa, you want children to drown for old men's pride?", "I want the plan to know what it is moving.", "Plans do not know. People do."],
    interlude: ["Land Registry Notice", "Parcel 8-441A: no confirmed burial records found. Local objection: our dead are there. Registry response: no burial records found."],
    notes: ["Naya's hospital shoes are still damp from ward disinfectant when she enters the police station.", "Tavio is not heroic when he breaks the pole; he is frightened and old and wrong enough to be human.", "The surveyors are young, polite, and not paid enough to understand ancestral trespass.", "The graveyard smells of salt, crushed leaf, and paperwork about to become violence."]
  },
  {
    title: "The Clause Beneath the Clause",
    subtitle: "Chapter 12",
    part: "Part II: The Clean Ink",
    pov: "Amiel Dorsain",
    setting: "a ministry archive where air-conditioning, locked cabinets, old minutes, and hidden schedules keep shame in order",
    opening: "Amiel found the theft in the footnotes, where respectable harm prefers to sleep.",
    desire: "to prove he was deceived rather than useful",
    pressure: "Schedule XII carries his initials and the memory of every objection he made too softly",
    memory: "Corin explaining ancestral grievance loops while Premier Rance said the island needed the money",
    object: "a copied annex folded beneath Amiel's shirt",
    conflict: "he did not sell the island because he hated it; he sold it because approval felt like rescue",
    turn: "Corin refuses to deny the memory effects and calls them governance",
    ending: "Amiel steals the schedule and realizes theft is sometimes the first honest act of a thief",
    dialogue: ["Every constitution shapes memory.", "Honest to whom?", "To those capable of governing the process.", "That is a confession, Doctor."],
    interlude: ["Drafting Comment, Schedule XII", "Local resistance may be softened through transitional linguistic harmonization. Minister Dorsain requests gentler phrasing."],
    notes: ["The archive smells of toner, mildew, and decisions made before ordinary people were invited to comment.", "His signature looks smaller than he remembers, which seems impossible and fitting.", "He rehearses excuses in three accents and hates each one.", "Outside the ministry, rain starts without permission."]
  },
  {
    title: "The Dream of the Drowned School",
    subtitle: "Chapter 13",
    part: "Part II: The Clean Ink",
    pov: "Mira Baptiste",
    setting: "a classroom underwater where desks are coral, chalk floats, and Maman Zelie marks attendance with a fishbone knife",
    opening: "In the drowned school, every answer Mira wrote became more correct and less true.",
    desire: "to say she belongs to the island without the sentence being converted into administrative language",
    pressure: "I becomes applicant, belong becomes reside, island becomes jurisdiction",
    memory: "Zelie laughing after Mira corrected her grammar, then turning away so the child would not see the hurt",
    object: "chalk that dissolves whenever it writes a rented word",
    conflict: "education has trained Mira to pass tests that cannot test belonging",
    turn: "the court tells her the word we is endangered",
    ending: "she wakes biting her tongue around a word that tastes like salt and shame",
    dialogue: ["Write the sentence.", "I belong to the island.", "Again, without borrowing the island from somebody else's mouth."],
    interlude: ["Words That Ran Away, Page 11", "Word: lamive. Who said it: Maman Zelie, when the sea turned purple before rain. Teacher translation: transitional marine coloration. My translation: no."],
    notes: ["Fish eat the word I first, which feels personal.", "Zelie grades with brutal tenderness and no interest in Mira's scholarship record.", "A school bell rings from inside a conch.", "Mira learns that a blank can be a wound or a door depending on whether someone guards it."]
  },
  {
    title: "The Approved Anger Festival",
    subtitle: "Chapter 14",
    part: "Part II: The Clean Ink",
    pov: "Joss Morne and Mira Baptiste",
    setting: "a funded youth festival where protest murals, resilience booths, food trucks, and branded rage share the same waterfront",
    opening: "By the time anger received a stage, it had already been asked for its invoice.",
    desire: "for Joss to keep his fire and for Mira to learn the difference between a microphone and a mouth",
    pressure: "public anger is recognized only after it is timed, sponsored, photographed, and made safe for closing remarks",
    memory: "the first protest sign Joss painted by hand before anyone offered him a design template",
    object: "a sponsored mural kit with approved colors",
    conflict: "rebellion is not defeated; it is cooled, branded, and thanked for its contribution",
    turn: "Mira sees one of her notebook words printed on a festival banner without its meaning",
    ending: "Joss hears applause and realizes applause can be another kind of silence",
    dialogue: ["They gave us a stage.", "They gave you a timer.", "People heard me.", "Did they hear you after the sponsor thanked you?"],
    interlude: ["Civic Harmony Permit", "Public heat may be expressed through music, mural practice, moderated dialogue, and approved symbolic disruption."],
    notes: ["The crowd is sincere, which makes the manipulation harder to dismiss.", "Joss's anger still exists; the tragedy is that it now has handlers.", "Mira watches adults clap for words they would punish in a classroom.", "The sea beyond the stage keeps its own rhythm, rude and unbranded."]
  },
  {
    title: "Naya's Ward",
    subtitle: "Chapter 15",
    part: "Part II: The Clean Ink",
    pov: "Naya Senn",
    setting: "the hospital ward after a rainburst, where generators cough, sheets smell of bleach, and storm survivors breathe around old decisions",
    opening: "Naya Senn had no patience for men who loved villages more loudly than they loved living children.",
    desire: "to keep people alive, even if survival demands leaving the coast",
    pressure: "patients from unsafe houses prove that nostalgia can kill when it refuses the weather",
    memory: "Lucan's body, the storm, and Tavio's face when grief became a language nobody in the family could speak",
    object: "a patient chart gone soft at the edges from damp",
    conflict: "the book gives Naya the dignity of being partly right against the father readers may love",
    turn: "she realizes the relocation plan has no room for what the old village knows, only where the bodies should be moved",
    ending: "she writes her first forbidden word on the back of a hospital glove wrapper",
    dialogue: ["Safety is not betrayal.", "No.", "Then say what betrayal is.", "Moving a people before learning what keeps them alive."],
    interlude: ["Hospital Intake Note", "Storm-related injuries increased. Coastal relocation advised. Patient says: if you take me inland, who will tell my husband where the sea put his fear?"],
    notes: ["Naya has seen waves enter rooms with more force than any speech Tavio ever made.", "She does not trust old men with myths because old men have used myths to avoid changing bedpans.", "Still, when a patient forgets the village nickname for rain, Naya feels the ward become colder.", "Care and control are twins in the hospital, and she learns to tell them apart by who is allowed to speak."]
  },
  {
    title: "The Disgrace of Amiel Dorsain",
    subtitle: "Chapter 16",
    part: "Part II: The Clean Ink",
    pov: "Amiel Dorsain",
    setting: "a press room where the reform machine needs one local face to absorb every international mistake",
    opening: "When the Charter needed a sinner, it found Amiel's face already well lit.",
    desire: "to confess enough to stop the lie without being destroyed by truths that arrive in a crowd",
    pressure: "a procurement scandal is arranged around him like furniture in a room power has already left",
    memory: "his first joy at being called the face of renewal",
    object: "the hidden schedule in one pocket and the official resignation in the other",
    conflict: "he is guilty, but not of the clean crime being assigned to him",
    turn: "he hears his first accent return while reporters shout questions",
    ending: "he chooses disgrace that might become testimony over innocence that would remain useful",
    dialogue: ["Did you betray the reform?", "No.", "Did you betray the island?", "Yes. Not alone, but yes."],
    interlude: ["Press Statement Draft", "Minister Dorsain accepts responsibility for irregularities discovered during reform implementation. Systemic integrity remains strong."],
    notes: ["Corin's team does not smile when they feed him to the cameras; that would be vulgar.", "Premier Rance looks relieved in the way a man looks relieved when a fire chooses another house.", "Amiel's mother watches on television and says nothing, which hurts worse than insult.", "The underwater benches scrape again, not as warning this time but as invitation."]
  },
  {
    title: "The Night of Missing Pronouns",
    subtitle: "Chapter 17",
    part: "Part II: The Clean Ink",
    pov: "Mira Baptiste",
    setting: "Port Mercy after sunset, when classrooms, churches, radio shows, and dinner tables begin coughing around the same little word",
    opening: "The word we did not disappear all at once. It became embarrassing first.",
    desire: "to protect the word before adults notice they have learned to live without it",
    pressure: "official speech replaces we with population, stakeholder group, beneficiary community, and local cohort",
    memory: "Zelie using we while cutting breadfruit, as if belonging were not an argument but a knife passed hand to hand",
    object: "Mira's notebook page with the pronoun written so many times the paper thins",
    conflict: "a people can still stand together after losing we, but only like strangers waiting for the same elevator",
    turn: "children in debate club cannot say the word without coughing",
    ending: "Mira decides the notebook is no longer private",
    dialogue: ["Say it.", "Citizens.", "No.", "Stakeholders.", "No.", "We."],
    interlude: ["Language Standardization Circular", "Collective pronouns should be used sparingly in formal contexts to avoid exclusionary assumptions of shared history."],
    notes: ["Miss Cadet sees the danger first and pretends to drop chalk so the children can laugh instead of panic.", "Mira writes we on her palm and closes her fist until the ink sweats.", "At home her mother says beneficiary without noticing, then touches her own throat.", "The island's loneliness becomes grammatical."]
  },
  {
    title: "The Second Consultation Burns",
    subtitle: "Chapter 18",
    part: "Part II: The Clean Ink",
    pov: "the village chorus",
    setting: "a second consultation in Anse-Baleine where the fans fail, the microphones pop, and the sea wind carries more than salt",
    opening: "By the second consultation, politeness had become flammable.",
    desire: "for the village to speak before its speech is converted again",
    pressure: "the relocation schedule has moved faster than grief and slower than money",
    memory: "the first consultation's summaries, which people now quote with hatred and accuracy",
    object: "a stack of feedback forms curling from heat",
    conflict: "anger breaks the approved container and exposes both the Charter's theft and the village's buried crimes",
    turn: "someone names Sol Riviere for the first time in years",
    ending: "the hall does not burn down, but the old silence does",
    dialogue: ["You asked for our truth.", "Within guidelines.", "Truth did not read your guidelines."],
    interlude: ["Incident Report", "Unchanneled civic heat exceeded facilitation capacity. Participants refused thematic clustering."],
    notes: ["Tavio does not start the fire, though everyone expects him to.", "Naya stands between an old man and a consultant and realizes both could be hurt for different wrong reasons.", "Miss Cadet gathers children near the door and listens to adults finally lose the clean language.", "When Sol's name enters the hall, several elders look older at once."]
  },
  {
    title: "Four Summonses",
    subtitle: "Chapter 19",
    part: "Part III: The Court Beneath the Reef",
    pov: "the Court Beneath the Reef",
    setting: "dreams entering four rooms at once: Tavio's boat, Mira's desk, Amiel's borrowed apartment, and Corin's mirrored hotel",
    opening: "The court did not send invitations. Invitations imply the summoned may decline.",
    desire: "to bring the four necessary witnesses below before the island forgets the terms of trial",
    pressure: "Tavio, Mira, Amiel, and Corin each carry a different proof that the island is still alive and guilty",
    memory: "Zelie sorting the living by what they refused to carry",
    object: "four wet summonses marked in salt instead of ink",
    conflict: "each witness wants truth to cost less than it does",
    turn: "Corin receives a summons too, proving the court is not anti-foreign but anti-lie",
    ending: "low tide begins before dawn, and no one who hears it sleeps well",
    dialogue: ["I am not under your jurisdiction.", "Then why did your mirror answer our subpoena?"],
    interlude: ["Court Order", "Tavio Senn shall bring a route never written down. Mira Baptiste shall bring a word no adult can translate. Amiel Dorsain shall bring the clause he helped hide. Corin Vale shall bring the part of mercy that learned to command."],
    notes: ["Tavio dreams of Lucan knocking from inside the hull.", "Mira wakes with salt crusted along the spine of her notebook.", "Amiel tries to burn the summons and only warms his hands.", "Corin photographs hers, but the image shows an empty bed and a tide line across the wall."]
  },
  {
    title: "The Path That Exists Only When Remembered",
    subtitle: "Chapter 20",
    part: "Part III: The Court Beneath the Reef",
    pov: "Tavio Senn and Mira Baptiste",
    setting: "the vanished cemetery path beyond Anse-Baleine, visible only while enough people speak what happened along it",
    opening: "The path returned one footprint at a time, as if the ground required testimony before accepting weight.",
    desire: "to reach the cemetery without letting the map decide what the island has permission to remember",
    pressure: "every forgotten story removes a yard of path",
    memory: "women carrying food after funerals, boys hiding stolen mangoes, Lucan running ahead with a lantern",
    object: "Mira's notebook held open like a small, stubborn gate",
    conflict: "Tavio must admit that memory is not his private property and Mira must trust an old man who does not trust schools",
    turn: "Naya contributes a hospital story and the path widens",
    ending: "the cemetery appears, not as nostalgia, but as evidence",
    dialogue: ["Say what happened here.", "I walked here.", "That is not enough.", "My son walked here before I failed him."],
    interlude: ["People's Map Draft", "Path to cemetery: begins behind old clinic. Requires names of three buried persons, one storm story, and the location of the breadfruit root."],
    notes: ["The path dislikes performance and vanishes when someone speaks for effect.", "Mira learns that not all old knowledge is gentle; some of it is a locked gate protecting grief.", "Tavio nearly stops when Lucan's name is required.", "The land is not magical because it glows. It is magical because it refuses paperwork as the only proof of life."]
  },
  {
    title: "Descent at Low Tide",
    subtitle: "Chapter 21",
    part: "Part III: The Court Beneath the Reef",
    pov: "Mira Baptiste",
    setting: "the reef at low tide, where moonlight, exposed coral, fishermen, nurses, teachers, and ghosts find the same stair",
    opening: "At low tide, the island showed the door it had been hiding under water.",
    desire: "for Mira to follow Zelie without becoming the child adults can use as a symbol instead of hearing as a person",
    pressure: "the court requires witnesses, but witness is not the same as innocence",
    memory: "Zelie's market basket smelling of coal smoke and oranges",
    object: "a conch shell that sounds like a courtroom clearing its throat",
    conflict: "each person descending must leave one borrowed word on the reef",
    turn: "Corin arrives, barefoot and furious, because the summons has made her body obey what her law denies",
    ending: "the sea closes above them and the court lights itself with drowned lanterns",
    dialogue: ["Will we breathe down there?", "Child, breathing was never your biggest problem."],
    interlude: ["Low Tide Instruction", "Leave on the reef any word that helped you avoid the truth. It will be returned if it survives cross-examination."],
    notes: ["Amiel leaves transparency and looks smaller without it.", "Tavio leaves coastal rationalization and nearly laughs at its dead weight.", "Corin refuses to leave governance until the reef cuts her foot.", "Mira leaves global and discovers she is still ambitious without it."]
  },
  {
    title: "Tavio's Route",
    subtitle: "Chapter 22",
    part: "Part III: The Court Beneath the Reef",
    pov: "Tavio Senn",
    setting: "the underwater court transformed into a sea route of reefs, moon currents, drowned bells, and Lucan's unfinished weather",
    opening: "When Tavio stepped to the witness place, the floor became water and his shame floated first.",
    desire: "to prove the route is real without admitting why he once disobeyed it",
    pressure: "the court asks not only what the state stole but what Tavio betrayed before the state arrived",
    memory: "the day he sent Lucan out despite the warning in his own stomach",
    object: "Lucan's knife, rusted and clean at once",
    conflict: "Tavio cannot defend ancestral knowledge while lying about the day he used poverty to overrule it",
    turn: "he confesses that the sea did not murder Lucan alone",
    ending: "the route appears whole because he stops using it as armor",
    dialogue: ["The current warned me.", "And what did you answer?", "I answered with debt."],
    interlude: ["Court Exhibit: Route Not Written Down", "Names recovered: Mother's Pull, Black-Hen Turn, Lantern Belly, Lucan's Silence. Status: admissible after confession."],
    notes: ["The ancestors do not comfort him quickly; cheap comfort would be another lie.", "Naya hears him confess and does not forgive him, which may be the first honest mercy.", "Tavio learns that memory without confession becomes property, not inheritance.", "The court gives him back the current name only after he stops pretending it proves his innocence."]
  },
  {
    title: "Mira's Word",
    subtitle: "Chapter 23",
    part: "Part III: The Court Beneath the Reef",
    pov: "Mira Baptiste",
    setting: "the underwater classroom-court where every desk is occupied by a child who once learned to be ashamed",
    opening: "Mira brought a word no adult could translate because every adult had been trained to improve it.",
    desire: "to speak the word without turning it into a performance of heritage",
    pressure: "the court demands relation, not pronunciation",
    memory: "Zelie using the word when a neighbor's baby died and everyone brought food without being asked",
    object: "the notebook, swollen from salt water but still legible",
    conflict: "Mira must admit she wanted the old language only after it became forbidden",
    turn: "she speaks the word and the court smells bread, rain, and obligation",
    ending: "the word does not explain itself; it gathers people until explanation becomes too small",
    dialogue: ["What does it mean?", "If I could make it smaller, you would have already stolen it."],
    interlude: ["Words That Ran Away, Page 29", "Word recovered: not kindness, not duty, not kinship, not care. Definition refused. Use: when the door opens before shame can knock."],
    notes: ["Mira's voice shakes because courage is not a clean instrument.", "Corin listens harder than she wants to and hears something her training cannot file.", "Miss Cadet cries without covering her face.", "Zelie smiles like a woman whose student has finally stopped trying to impress the dead."]
  },
  {
    title: "Amiel's Clause",
    subtitle: "Chapter 24",
    part: "Part III: The Court Beneath the Reef",
    pov: "Amiel Dorsain",
    setting: "the court's drafting chamber, where every clause Amiel touched hangs like laundry after a storm",
    opening: "Amiel brought the hidden clause folded small enough to fit in a pocket and large enough to cover a country.",
    desire: "to make confession do what explanation cannot",
    pressure: "the court asks him to name the pleasure of being approved by those who despised him gently",
    memory: "the elite school, the corrected accent, the first foreign compliment that felt like baptism",
    object: "Schedule XII, wet but still too clean",
    conflict: "he wants to say he was deceived, but the court keeps returning him to the sweetness of participation",
    turn: "he speaks in his first accent and the clause begins to smudge",
    ending: "he gives the island the sentence he avoided: I wanted someone powerful to tell me I was not from you anymore",
    dialogue: ["I did not know it would go this far.", "How far did you approve?", "Far enough to be praised."],
    interlude: ["Court Transcript, Dorsain Testimony", "Witness admits shame preceded collaboration. Witness admits collaboration wore the face of competence. Witness requests no reduction in charge."],
    notes: ["His voice cracks on village words as if they are returning from exile one by one.", "Premier Rance, listening above ground through dream, removes his glasses and does not know where to put his hands.", "Corin looks wounded, then irritated at being wounded.", "The hidden schedule bleeds ink for the first time."]
  },
  {
    title: "Zelie's Hidden Dead",
    subtitle: "Chapter 25",
    part: "Part III: The Court Beneath the Reef",
    pov: "Maman Zelie",
    setting: "the deepest chamber of the court, where Sol Riviere waits beside a table set for a meal nobody finished",
    opening: "Maman Zelie had spent death telling the truth around one name.",
    desire: "to save the island from false nostalgia without destroying the love that keeps it alive",
    pressure: "Sol Riviere's disappearance links old island violence to new foreign reform",
    memory: "the night men beat Sol for threatening to expose a land deal, and Zelie protected respectability with silence",
    object: "a folded napkin from a family meal where everyone knew and no one said",
    conflict: "the ancestors cannot prosecute clean ink while hiding their own dirty hands",
    turn: "Zelie testifies against her family and herself",
    ending: "the old island loses its halo and gains the possibility of truth",
    dialogue: ["You kept quiet.", "Yes.", "For family?", "For fear wearing family clothes."],
    interlude: ["Court Exhibit: The Old Silence", "Witness: Sol Riviere. Status: disappeared before reform, therefore inadmissible to any story that blames only reform."],
    notes: ["Zelie is funny until she is not, and the absence of her jokes frightens Mira more than the ghosts.", "Tavio looks away because every village has a Sol if one digs properly.", "The court does not enjoy this; justice without grief would be another institution.", "The confession makes Corin briefly still, because her critique of the island has found evidence and still not become permission."]
  },
  {
    title: "Corin at the Threshold",
    subtitle: "Chapter 26",
    part: "Part III: The Court Beneath the Reef",
    pov: "Dr. Corin Vale",
    setting: "the threshold between the reef court and the administrative world, where Corin's law books float open and unread",
    opening: "Corin had prepared for corruption, grief, poverty, opportunism, and myth. She had not prepared for being partly right and still guilty.",
    desire: "to defend systems as mercy without admitting that mercy can become command",
    pressure: "the court gives her every real harm Saint Orison needed reformed and every memory her reform erased",
    memory: "her father leaving for a mission and never returning",
    object: "a mirror that shows her father, then Mira, then no one",
    conflict: "her abstraction protects people from some local cruelties while exposing them to a cleaner conquest",
    turn: "Mira asks why good law needs her to forget her grandmother",
    ending: "Corin cannot answer without exposing the church inside her secular mercy",
    dialogue: ["If your law is so good, why does it need me to forget my grandmother?", "Because memory can be violent.", "So can forgetting."],
    interlude: ["Threshold Finding", "Foreign witness is not charged with hatred. Foreign witness is charged with mercy unwilling to be contradicted by the people it names as saved."],
    notes: ["Corin does not collapse. The book gives her the dignity of intelligence and the terror of limitation.", "She thinks of girls who survived because reform made men accountable, and the court does not dismiss that evidence.", "Then she thinks of villages moved to make room for safe investment and the court does not dismiss that either.", "Her calm finally becomes lonely."]
  },
  {
    title: "The Island Wakes",
    subtitle: "Chapter 27",
    part: "Part III: The Court Beneath the Reef",
    pov: "Nayara",
    setting: "the island as defendant, breathing through reef, school, market, graveyard, parliament, hospital, and coast",
    opening: "When Nayara woke in the court, Saint Orison trembled on every official sign.",
    desire: "to answer to its older name without pretending the old name absolves it",
    pressure: "every witness has made rescue less simple and refusal more demanding",
    memory: "enslaved ancestors, drowned fishers, market women, corrupt cousins, ashamed ministers, children with global promise",
    object: "a basket placed at the center of the court, full of salt, documents, shells, keys, and a child's notebook",
    conflict: "the island must admit that it invited deletion through shame, greed, fear, and the hunger to be admired",
    turn: "Nayara pleads guilty to wanting to become Saint Orison forever",
    ending: "the court does not sentence the island; it sends it back with salt in its mouth",
    dialogue: ["How do you plead?", "Alive.", "That is not a plea.", "It is the only one that can still change."],
    interlude: ["Verdict Reserved", "The defendant is guilty, harmed, complicit, beloved, divided, and not yet finished."],
    notes: ["The island's voice is not one voice; it is quarrel arranged into weather.", "Mira hears children inside it, Tavio hears current, Amiel hears his first accent, Corin hears all the data she never collected.", "Zelie hears Sol and does not turn away.", "The court's mercy is not acquittal but return."]
  },
  {
    title: "Return with Salt in the Mouth",
    subtitle: "Chapter 28",
    part: "Part III: The Court Beneath the Reef",
    pov: "ensemble",
    setting: "the morning after the descent, when witnesses wake above ground carrying proof that looks ordinary until touched",
    opening: "They returned before sunrise with salt in their mouths and no story that would survive a press conference.",
    desire: "to carry the court's truth into a surface world designed to call truth rumor",
    pressure: "the Charter keeps functioning, but the witnesses are no longer functioning for it",
    memory: "each person bringing back one thing: route, word, clause, wound, and the threshold question",
    object: "a basket left in Mira's room, impossible and damp",
    conflict: "myth must become action or it will become another beautiful archive",
    turn: "Amiel contacts a journalist; Mira copies the forbidden words; Tavio calls Naya; Corin revises a paragraph and finds her hand shaking",
    ending: "the surface trial begins before anyone names it",
    dialogue: ["Did it happen?", "Happen is too small.", "Then what do we do?", "We begin above water."],
    interlude: ["Radio Weather", "Low tide unusually persistent. Residents report salt taste inland. Officials deny reports of reef bells."],
    notes: ["Mira expects to feel chosen and instead feels responsible.", "Tavio expects relief and instead feels work.", "Amiel expects terror and receives clarity, which is sharper.", "Corin expects to dismiss the dream and cannot make her mirror agree."]
  },
  {
    title: "The Leak",
    subtitle: "Chapter 29",
    part: "Part IV: The Refusal",
    pov: "Amiel Dorsain and island media",
    setting: "phones, radio booths, ministry corridors, encrypted files, kitchen tables, and the first morning people read Schedule XII",
    opening: "The hidden schedule reached the island before breakfast and ruined the taste of coffee.",
    desire: "for Amiel to turn stolen paper into public evidence before power edits the leak into scandal management",
    pressure: "the government calls the document fabricated until too many signatures begin to look familiar",
    memory: "Amiel's first signature drying too fast",
    object: "a PDF file named cleanup-final-final, because even betrayal has office habits",
    conflict: "truth enters the public sphere, where every side tries to make it smaller and useful",
    turn: "Corin refuses to call it fake, and that small refusal fractures the official wall",
    ending: "Saint Orison begins asking what else it forgot to ask",
    dialogue: ["Is it real?", "The uglier question is whether it worked.", "And did it?", "Ask your grandmother's words."],
    interlude: ["Emergency Government Statement", "Citizens are advised not to circulate unverified materials designed to destabilize civic renewal."],
    notes: ["Joss shares the leak before the advisory panel can draft language for sharing concern.", "Premier Rance asks who betrayed them and hears no one ask who betrayed whom first.", "Mira sees adults reading the phrase language harmonization and finally understanding why her notebook mattered.", "The leak is not salvation. It is a door kicked open into a dirty room."]
  },
  {
    title: "The Children's Dictionary",
    subtitle: "Chapter 30",
    part: "Part IV: The Refusal",
    pov: "Mira Baptiste and Miss Elia Cadet",
    setting: "a classroom turned print shop, archive, argument, and sanctuary",
    opening: "The first illegal dictionary was made with school glue, borrowed phones, and children too young to know caution as a virtue.",
    desire: "for Mira to move from private preservation to public transmission",
    pressure: "every recovered word must survive adults who want it pure, useful, marketable, or safe",
    memory: "Zelie teaching that a word without use is a shell without creature",
    object: "The Children's Dictionary of Words That Ran Away",
    conflict: "the children must define words without killing them in definition",
    turn: "Miss Cadet unlocks the copy room and becomes disobedient in sensible shoes",
    ending: "copies move through the island folded inside homework, church bulletins, fish parcels, and hospital charts",
    dialogue: ["Teacher, is this illegal?", "Probably.", "Are you afraid?", "Very. Keep collating."],
    interlude: ["Dictionary Entry", "WE: not everybody agreeing, not everybody being the same, not everybody behaving. A word for the trouble of belonging without permission to abandon one another."],
    notes: ["Some entries are funny, and that saves the project from becoming a shrine.", "One child defines a crab by saying it walks like it owes money, and the whole room laughs itself brave.", "Mira learns leadership is mostly logistics after the lightning.", "The copy machine jams on the page for home and Miss Cadet takes that personally."]
  },
  {
    title: "The People's Map",
    subtitle: "Chapter 31",
    part: "Part IV: The Refusal",
    pov: "Tavio Senn and Naya Senn",
    setting: "Anse-Baleine, hospital corridors, kitchens, boats, cemetery paths, and community tables where maps are redrawn by memory and risk",
    opening: "The people's map began with an argument over where the dead actually were.",
    desire: "to build a map that can defend what matters without denying the sea is changing",
    pressure: "relocation cannot simply be rejected, but it cannot remain a theft disguised as safety",
    memory: "Lucan's grave, storm water in children's rooms, old gardens, fish nurseries, and Naya's patients",
    object: "a map layered with formal titles, burial stories, storm lines, women's paths, fishing routes, and hospital access",
    conflict: "Tavio and Naya must stop treating each other's truth as betrayal",
    turn: "science joins memory when it agrees to listen before drawing",
    ending: "the map becomes evidence no official can call nostalgia without lying",
    dialogue: ["The water is rising.", "Yes.", "Then we must move.", "Some things. Not blindly. Not alone."],
    interlude: ["People's Map Legend", "Blue: water that came. Gold: path still used. Black: grave remembered. Green: safer ground. Red: place power called empty because women used it without paperwork."],
    notes: ["Naya brings flood data and refuses to apologize for it.", "Tavio brings reef names and refuses to perform them as quaint.", "Young surveyors arrive nervous and leave employed by memory.", "For the first time, relocation becomes a question the village helps ask."]
  },
  {
    title: "Corin's Correction",
    subtitle: "Chapter 32",
    part: "Part IV: The Refusal",
    pov: "Dr. Corin Vale",
    setting: "Corin's hotel room, then a hearing room where her correction can either become courage or reputation management",
    opening: "Corin had corrected nations for a living and discovered, late, that she did not know how to correct herself.",
    desire: "to revise the Charter without surrendering the belief that systems can prevent cruelty",
    pressure: "her employers want containment, Saint Orison wants blame, and the court's question will not leave her mirror",
    memory: "her father, disorder, failed interventions, and the child Mira asking about grandmothers",
    object: "a correction memo titled Limits of Harmonization",
    conflict: "she must speak against her own architecture without pretending she was merely misinformed",
    turn: "she testifies that the Charter's harm was not implementation failure but design logic",
    ending: "her career does not end heroically; it becomes less comfortable, which is different and better",
    dialogue: ["Are you withdrawing the Charter?", "No.", "Then what are you doing?", "Removing its right to require forgetting."],
    interlude: ["Correction Memo", "No reform should convert unarchived relation into nonexistence. No transparency should make living knowledge invisible by demanding forms it was never allowed to possess."],
    notes: ["Corin remains precise, and now precision cuts her own institution.", "Amiel distrusts her correction because he knows how easily remorse performs for cameras.", "Mira does not forgive Corin and still listens.", "Partial repair remains possible because total moral sorting would be another false cure."]
  },
  {
    title: "The Cooling of Joss Morne",
    subtitle: "Chapter 33",
    part: "Part IV: The Refusal",
    pov: "Joss Morne",
    setting: "livestreams, advisory inboxes, street corners, and the quiet room where a young man admits his fire was being managed",
    opening: "Joss Morne discovered he had not sold out all at once. He had been cooled in increments.",
    desire: "to recover anger that can build without becoming grant language or vanity",
    pressure: "his public has turned on him, the panel wants loyalty, and his old friends want an apology simple enough to enjoy",
    memory: "the first sign he painted before anyone called him emerging leadership",
    object: "his advisory badge cut in half",
    conflict: "he must confess co-optation without making confession a new brand",
    turn: "he uses his platform to publish the panel's cooling strategy and then leaves the stage before applause",
    ending: "Joss becomes useful again by becoming less visible",
    dialogue: ["I thought access meant power.", "Sometimes access means they know where to find your anger.", "Then where do I put it?", "Where it can keep someone warm."],
    interlude: ["Youth Panel Retention Strategy", "Emerging leaders should be affirmed, mentored, and redirected toward actionable optimism."],
    notes: ["His apology is messy because clean apologies are often written for escape.", "Mira respects him more after he stops trying to be the face of youth.", "He learns that a microphone is a tool, not a home.", "The island does not need him pure. It needs him available."]
  },
  {
    title: "National Rebirth Day",
    subtitle: "Chapter 34",
    part: "Part IV: The Refusal",
    pov: "Premier Selwyn Rance",
    setting: "the official anniversary ceremony, now haunted by leaks, dictionaries, people's maps, and a crowd less obedient than scheduled",
    opening: "National Rebirth Day arrived with fresh paint, old flags, and a government praying weather would not become metaphor.",
    desire: "for Premier Rance to survive the ceremony without becoming the man history uses as a warning label",
    pressure: "the script praises the Charter while the crowd carries signs quoting Article Zero before it exists",
    memory: "Rance as a young man promising never to kneel to donors, then learning the posture slowly",
    object: "a speech card that trembles in his hand",
    conflict: "realism has protected him from courage so long that courage now looks irresponsible",
    turn: "Mira is asked to read a sanitized pledge and reads from the Children's Dictionary instead",
    ending: "the ceremony continues, but no longer belongs to the stage",
    dialogue: ["Please return to the approved text.", "I am.", "That text is not approved.", "Not by you."],
    interlude: ["Event Program", "National Rebirth Day: anthem, remarks, youth pledge, investor welcome, heritage segment, moderated civic joy."],
    notes: ["Rance sees Corin in the audience and realizes both of them had mistaken weariness for wisdom.", "The steel band chooses an older rhythm and several officials pretend not to notice.", "Tavio stands beside Naya and does not shout, which costs him more than shouting would.", "The crowd learns its own sound by making it."]
  },
  {
    title: "The Pronoun Returns",
    subtitle: "Chapter 35",
    part: "Part IV: The Refusal",
    pov: "Mira Baptiste",
    setting: "a public square where the word we passes from child to elder to nurse to fisher to minister like a cup everyone has to drink from",
    opening: "The word returned badly at first, which was how Mira knew it was alive.",
    desire: "to restore we without letting it become a false blanket over difference",
    pressure: "some people want we to mean obedience, others want it to mean purity, and the Charter wants it to mean nothing at all",
    memory: "Zelie cutting breadfruit and making belonging sound like trouble worth feeding",
    object: "a torn dictionary page held up to the rain",
    conflict: "a true we must include accusation, shame, disagreement, and people who do not clap together",
    turn: "Mira corrects an elder who tries to use the word to silence Naya",
    ending: "we returns not as unity, but as responsibility",
    dialogue: ["We must respect the old ways.", "We must also name what the old ways hid.", "Child, mind yourself.", "That is what I am doing."],
    interlude: ["Dictionary Revision", "WE: a dangerous word. Use only when prepared to carry people who can answer back."],
    notes: ["The crowd laughs, argues, prays, heckles, and still remains.", "Corin hears the word and understands that grammar can be a border crossing.", "Amiel says we in his first accent and does not die of it.", "The square does not become holy; it becomes available."]
  },
  {
    title: "The Trial on the Surface",
    subtitle: "Chapter 36",
    part: "Part IV: The Refusal",
    pov: "public record",
    setting: "a surface tribunal under a temporary roof, where court procedure, reef testimony, maps, dictionaries, and old crimes collide",
    opening: "The surface trial began when the island stopped agreeing that evidence must arrive in the uniform of power.",
    desire: "to place the Charter, the old island, and the reformers under one accountable hearing",
    pressure: "every faction wants a clean villain and the evidence keeps refusing to provide one",
    memory: "Sol Riviere, Lucan, stolen funds, hidden graves, beaten women, moved villages, polished speeches, and children coughing around we",
    object: "the basket from the reef placed beside the official seal",
    conflict: "the trial must not become theater, revenge, denial, or donor management",
    turn: "Father Romain names peace without restitution as anesthesia",
    ending: "the tribunal accepts reef testimony because the surface record has already proven itself incomplete",
    dialogue: ["This is not admissible.", "Neither were our dead.", "The court recognizes the objection and the dead."],
    interlude: ["Surface Tribunal Record", "Evidence accepted: documentary, oral, material, cartographic, ancestral, pediatric, tidal."],
    notes: ["Lawyers object to dreams until the dreams produce signatures.", "Naya testifies against both reckless nostalgia and administrative theft.", "Zelie refuses to appear as a saint and insists the old wound be read aloud.", "Corin's testimony does not save her, which helps it become useful."]
  },
  {
    title: "The Untranslated Article",
    subtitle: "Chapter 37",
    part: "Part IV: The Refusal",
    pov: "Mira Baptiste and the people of Nayara",
    setting: "the drafting floor where Article Zero is written in a language the Charter cannot fully standardize",
    opening: "Article Zero began as a sentence nobody could translate without losing.",
    desire: "to write a constitutional beginning that protects memory without freezing the island inside memory",
    pressure: "every legal mind wants clarity, every elder wants reverence, every child wants a future that does not require amputation",
    memory: "all the words gathered in the dictionary and all the words still missing",
    object: "a page that smudges clean ink until it learns to accept fingerprints",
    conflict: "law must become humble enough to make room for living relation",
    turn: "Mira writes the first line and Corin refuses to improve it",
    ending: "the article stands partly untranslated, not as mystery theater, but as jurisdictional dignity",
    dialogue: ["What does it mean in official language?", "It means official language must sometimes wait outside."],
    interlude: ["Article Zero", "No reform shall require the people to forget the words, paths, dead, waters, obligations, songs, quarrels, and names by which consent becomes knowable."],
    notes: ["Amiel argues for precision and then stops himself before precision becomes possession.", "Tavio demands that currents be named as lawful knowledge.", "Naya demands that safety be named as obligation, not foreign theft.", "The page accepts contradiction and remains lawlike anyway."]
  },
  {
    title: "The Island Refuses",
    subtitle: "Chapter 38",
    part: "Part IV: The Refusal",
    pov: "Nayara",
    setting: "the full island: parliament, reef, school, hospital, cemetery, coast, hotel, village, museum, and the square after rain",
    opening: "The island refused to be saved on a morning when the sea looked innocent of everything.",
    desire: "to become Nayara again, not as it was, but as it might yet be",
    pressure: "the Concordant League offers revised terms, investors threaten departure, local elites invoke stability, and the old guard tries to seize the refusal for nostalgia",
    memory: "every witness, every missing word, every hidden dead, every route, every clause, every child who learned to say we again",
    object: "the Glass Constitution beside Article Zero, one clean, one fingerprinted",
    conflict: "refusal must become creation or it will curdle into pride",
    turn: "the island rejects salvation that requires amnesia and accepts reform that must answer memory",
    ending: "Saint Orison remains on some documents, but the sea begins answering Nayara again",
    dialogue: ["Do you reject help?", "No.", "Then what do you reject?", "Help that needs us smaller than our truth."],
    interlude: ["Resolution of Refusal", "The island refuses rescue premised on managed forgetting. The island accepts repair under conditions of memory, consent, language, land, and accountable change."],
    notes: ["No one cheers in the right rhythm because a real beginning rarely knows its music yet.", "Corin leaves with less certainty and more hearing.", "Rance signs because history has cornered him and because, somewhere under exhaustion, he still wants to be brave.", "Zelie watches the living do imperfect work and calls that, grudgingly, a miracle."]
  },
  {
    title: "The Child Who Left and Returned",
    subtitle: "Epilogue",
    part: "Epilogue",
    pov: "Mira Baptiste",
    setting: "years later, a ferry returning toward Nayara at dawn with a grown Mira, a weathered notebook, and a child asking what the island used to be called",
    opening: "Years later, Mira left the island without abandoning it, which was the only departure Zelie would have respected.",
    desire: "to show that sovereignty can travel without becoming exile",
    pressure: "Nayara is still wounded, argumentative, modern, ancestral, guilty, alive, and true of voice",
    memory: "the first blank page, the underwater classroom, the square, and Zelie's voice asking who opened the gate",
    object: "the notebook, now copied so many times no one can own it",
    conflict: "the island is not saved, and that is precisely why it can keep choosing",
    turn: "a child on the ferry asks for the old name and Mira answers without performance",
    ending: "the sea turns purple before rain, and this time the word arrives before the weather",
    dialogue: ["What was it called before?", "Nayara.", "What does that mean?", "Listen."],
    interlude: ["Words That Stayed, Final Page", "Sovereignty: the right to remember honestly, change deliberately, and speak the future in a voice that has not been rented."],
    notes: ["The ferry smells of diesel, oranges, wet rope, and somebody's fried bakes wrapped in paper.", "Mira has studied abroad and learned that leaving can become another way of carrying if one refuses shame.", "Article Zero did not make the island pure; it made purity less useful as an excuse.", "The final dignity is not arrival but relation that survives motion."]
  }
];

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

let totalWords = 0;
for (let index = 0; index < sections.length; index += 1) {
  const section = sections[index];
  const body = renderSection(section, index);
  totalWords += countWords(body);
  const file = `${String(index).padStart(2, "0")}-${slugify(section.title)}.md`;
  const frontmatter = [
    "---",
    `bookSlug: "island-that-refused-to-be-saved"`,
    `title: ${JSON.stringify(section.title)}`,
    `subtitle: ${JSON.stringify(section.subtitle)}`,
    `part: ${JSON.stringify(section.part)}`,
    `order: ${index}`,
    `summary: ${JSON.stringify(summaryFor(section))}`,
    `updated: ${updated}`,
    "---",
    ""
  ].join("\n");
  await writeFile(resolve(outputDir, file), `${frontmatter}${body}\n`, "utf8");
}

console.log(`island-that-refused-to-be-saved: ${sections.length} sections, ${totalWords} body words`);

function renderSection(section, index) {
  const [articleId, articleName, articleCost] = articles[index % articles.length];
  const relation = relationFor(section.pov);
  const terrain = terrainFor(section.setting);
  const text = [
    section.opening,
    `The place had its own argument. In ${section.setting}, ${section.pov} could feel Saint Orison arranging itself into the version that would be easiest to explain from a podium. The island had always been physical before it became political: ${terrain}. Reformers preferred diagrams because diagrams did not smell of hot rope, old graves, school varnish, hospital bleach, rum breath, wet hymnals, or fish scales. A diagram could say relocation without hearing a child ask where the dead were expected to sleep. It could say modernization without pausing for the woman whose hands knew which breadfruit tree had been planted after which storm. The new language was clean because it had been protected from contact.`,
    `${section.pov} wanted ${section.desire}. That desire was not foolish. To pretend otherwise would make the truth smaller and easier than it was. Saint Orison did need repair. Roads failed. Money vanished. Girls learned brilliance inside buildings that leaked. Families sometimes used kinship as a locked room. Churches blessed silence. Men carried heritage like a shield and hid cowardice behind it. The Charter entered through real wounds. It did not need to invent the island's shame; it needed only to organize that shame into a door and arrive holding keys.`,
    `But the pressure gathered around ${section.pressure}. This was how the Clean Ink worked. It did not burst through windows or drag people into vans. It offered better words. It offered ${articleId}, ${articleName}, with a promise so reasonable that refusal sounded cruel. Then came the hidden cost: ${articleCost}. The cost never arrived as thunder. It arrived as a corrected phrase, a missing nickname, a form that had no box for relation, a teacher's smile, a consultant's summary, a map with a blank place where somebody's grandmother still knew how to walk.`,
    renderDialogue(section),
    `Memory did not behave like an archive here. It behaved like a living person: proud, evasive, wounded, funny when cornered, and capable of lying to protect itself. Around ${section.memory}, ${section.pov} began to understand that remembering was not the same as worship. The old island had done harm too. It had hidden beatings behind family honor, hidden land theft behind respectability, hidden women's pain behind church fans and Sunday hats. If the new Charter was dangerous because it demanded amnesia, the old order had been dangerous because it demanded silence. Between amnesia and silence, the island had been trained to call muteness peace.`,
    `The object on which the day turned was ${section.object}. It looked too small for the argument placed upon it. That was usually how evidence arrived in Nayara: not as marble, not as anthem, but as a wet notebook, a broken pole, a child's word, a route no one had written down, a paper whose signature trembled after the hand had left. This object did not solve the trouble. It made the trouble impossible to misname. People could still lie, but now they had to step around something.`,
    renderInterlude(section),
    `The conflict sharpened there: ${section.conflict}. Nobody in the room, on the shore, below the reef, or behind the government glass received the mercy of being only villain or only victim. That was what made the island difficult to save and harder to love lazily. Tavio could defend the shore and still owe the dead an apology. Mira could love global promise and still recognize the theft hidden in polish. Amiel could be scapegoated and still guilty. Corin could improve real policies and still design a wound. Zelie could guide the living and still have blood under her remembered fingernails. Nayara itself had to stand accused beside its rescuers.`,
    ...section.notes.map((note, noteIndex) => renderNote(section, note, noteIndex)),
    renderCommunityEcho(section),
    renderInstitutionalCounterpoint(section, articleId, articleName),
    renderPrivateCost(section),
    `By then the Court Beneath the Reef was no longer merely dream. It had become the place where every avoided sentence waited for a body. The ceiling of that court was always moving, fish passing like thoughts under the sea's skin, and the benches were full of dead people who had lost patience with elegant language. They did not ask whether the island had been wounded. They asked what the island had done with the wound. They asked who profited from confusion. They asked why rescue so often arrived carrying a mirror but no memory. Above all, they asked why a people should be expected to accept a future spoken in a voice rented from elsewhere.`,
    `The turning came when ${section.turn}. It did not feel like triumph. Real turns rarely do. They feel first like exposure, then inconvenience, then the practical terror of having to live after the truth. Someone always wanted the moment to become cleaner than it was. Someone wanted a speech. Someone wanted a villain. Someone wanted absolution. Someone wanted to declare the old ways innocent and the new ways damned. But Nayara kept refusing easy arrangements. It had not gone to the trouble of being wounded merely to become simple for ministers, tourists, donors, or children with scholarships.`,
    renderSecondDialogue(section, relation),
    `What changed was not everything. The island did not become pure because a word returned. A court did not become just because it learned to admit a dream. A map did not become honest because it added graves. A minister did not become redeemed because he spoke in his first accent. Yet the atmosphere shifted. ${section.pov} could feel a small resistance inside the official version of reality, the way a seed pushes against a stone without asking the stone's permission. The Clean Ink still shone. The Charter still stood. But somewhere under the sentence Saint Orison shall be renewed, another sentence began gathering salt: Nayara shall not disappear politely.`,
    `So the day closed around this image: ${section.ending}. It was not an ending in the old sense. It was an instruction. The island would have to remember without lying, reform without surrendering, modernize without renting its desire, and refuse without becoming a museum of grievance. It would have to let children leave and return, let science speak with fishermen, let law listen to words that did not fit its forms, let the dead testify without letting the dead rule. It would have to become modern and ancestral at once, not by balancing slogans, but by doing the harder work of relation.`,
    `That was why this threshold did not close with rescue. Rescue was the old temptation. Rescue asked the island to be grateful for being edited. This closed with responsibility. A people cannot be saved by a system that requires them to forget the terms of their own existence. They can be aided. They can be challenged. They can be forced to face sins they decorated as heritage. They can be protected from storms, thieves, hypocrites, and violent nostalgia. But if the price of safety is the death of the words by which they know what safety means, then salvation has become another name for conquest.`,
    `And still, because despair was another false rescue, something remained alive. ${livingThing(section)}`
  ].join("\n\n");

  return text.replace(/\n{3,}/g, "\n\n");
}

function renderDialogue(section) {
  const [a, b, c, d] = section.dialogue;
  return [
    `The first words did not come out as history. They came out as conversation, which is how history enters when it wants to avoid ceremony.`,
    `> "${a}"`,
    `>`,
    `> "${b}"`,
    c ? `>` : "",
    c ? `> "${c}"` : "",
    d ? `>` : "",
    d ? `> "${d}"` : "",
    `Nobody called it doctrine. Nobody needed to. The exchange hung in the air with the rude authority of a thing everyone recognized and no one had budgeted time to answer.`
  ]
    .filter(Boolean)
    .join("\n");
}

function renderSecondDialogue(section, relation) {
  return [
    `Later, when the room had spent its first anger and the practical questions began, ${relation} returned in a lower voice.`,
    `> "What do we keep?"`,
    `>`,
    `> "What can tell the truth without becoming a cage."`,
    `>`,
    `> "And what do we change?"`,
    `>`,
    `> "Whatever asks the weak to carry the comfort of the strong."`,
    `That was not a policy yet. It was not even agreement. It was something more fragile and more dangerous: a sentence people could test against the ground.`
  ].join("\n");
}

function renderInterlude(section) {
  const [title, body] = section.interlude;
  return [`> **${title}**`, `>`, `> ${body}`].join("\n");
}

function renderNote(section, note, noteIndex) {
  const lead = [
    "A smaller thing happened beside the large one.",
    "The island, being alive, kept interrupting its own argument.",
    "No one put this in the official record at first.",
    "This was the kind of detail reformers called anecdotal until enough anecdotes became a coast."
  ][noteIndex % 4];
  const consequence = [
    "It mattered because power prefers injury at a scale where no single hand looks guilty.",
    "It mattered because a people often lose themselves one ordinary adjustment at a time.",
    "It mattered because memory survives through use, not display.",
    "It mattered because the island was tired of being summarized by people who did not have to sleep in its weather."
  ][noteIndex % 4];
  return `${lead} ${note} ${consequence}`;
}

function renderCommunityEcho(section) {
  const anchors = [
    "a woman selling guava jam from a cooler with one broken wheel",
    "a retired teacher who corrected grammar because no one had ever apologized for correcting hers",
    "a boy carrying two plastic bags of plantain chips and pretending not to listen",
    "a church usher with a fan tucked under one arm and an old debt in her face",
    "a taxi driver who knew every shortcut except the one out of his own bitterness"
  ];
  const anchor = anchors[Math.abs(hash(section.title + section.setting)) % anchors.length];
  return `The public life around ${section.pov} was never only about the named witness. Nearby stood ${anchor}, and that person carried a smaller republic of evidence. This is how Saint Orison had survived before the Charter: not nobly, not cleanly, but through favors, gossip, warnings, borrowed tools, unpaid care, bad jokes, church food, whispered cautions, and women who knew which door to knock when official doors refused to remember the poor. The Charter looked at this tangle and saw inefficiency. Sometimes it was right. The tangle could hide thieves, abusers, cousins with soft hands and loud claims, men who called dominance tradition, and elders who confused secrecy with dignity. Yet the tangle also held people when storms came before forms, when clinics closed before reports, when the road washed out before the ministry announced damage. To cut it all away in the name of clarity was to mistake a living root system for a pile of strings.`;
}

function renderInstitutionalCounterpoint(section, articleId, articleName) {
  return `There was always a document ready to make the wound sound smaller. Under ${articleId}, ${articleName}, the island learned that harm could be placed inside a sentence so polished it no longer left fingerprints. A road was not neglected; it awaited phased renewal. A village was not displaced; it entered adaptive transition. A grandmother was not made unintelligible; her speech fell outside standardized civic communication. A child was not trained to despise home; she was prepared for global competitiveness. The language did not always lie. That was the colder part. It selected the portion of truth that power could use and let the rest become atmosphere. Against that selection, ${section.object} kept insisting on the part no report could carry without becoming a different report.`;
}

function renderPrivateCost(section) {
  const relation = relationFor(section.pov);
  return `Privately, ${relation} had to face the cost that no public argument could pay on their behalf. To oppose the Clean Ink was not only to oppose outsiders. It was to lose certain conveniences of self-deception. It meant asking whether shame had made ambition easier to purchase. It meant asking whether grief had become a credential, whether heritage had become costume, whether care had become control, whether silence had been renamed peace because peace was cheaper than restitution. These questions did not arrive in slogans. They arrived while washing a cup, tying a shoe, waiting for a bus, folding a clinic sheet, deleting a message, touching a grave marker, listening to rain. A nation begins inside such private rooms before it becomes a flag. If the room is rented, the flag will be too.`;
}

function livingThing(section) {
  const options = [
    `A word stayed in a child's mouth long enough to be taught to another child.`,
    `A path held underfoot after three people named who had walked it before them.`,
    `A current answered to its old name and did not refuse the new instruments when they came humbly.`,
    `A witness told the truth badly, then better, then in company.`,
    `A page accepted fingerprints and became more lawful, not less.`,
    `A grandmother laughed from under the sea, and the laugh was not forgiveness, but it was permission to continue.`
  ];
  return options[Math.abs(hash(section.title)) % options.length];
}

function relationFor(pov) {
  if (pov.includes("Nayara")) return "Nayara";
  if (pov.includes("Mira")) return "Mira";
  if (pov.includes("Tavio")) return "Tavio";
  if (pov.includes("Amiel")) return "Amiel";
  if (pov.includes("Corin")) return "Corin";
  if (pov.includes("Zelie")) return "Zelie";
  if (pov.includes("Joss")) return "Joss";
  if (pov.includes("Naya")) return "Naya";
  if (pov.includes("ensemble")) return "the witnesses";
  if (pov.includes("Court")) return "the court";
  if (pov.includes("village chorus")) return "the village";
  if (pov.includes("public record")) return "the record";
  return "someone";
}

function terrainFor(setting) {
  if (setting.includes("sea") || setting.includes("reef") || setting.includes("water")) {
    return "salt on the lip, reef shadow under the boat, rope burn across the palm, a horizon that behaved like an elder withholding judgment";
  }
  if (setting.includes("school") || setting.includes("classroom") || setting.includes("Academy")) {
    return "chalk dust, polished shoes, ceiling fans with a tired wobble, and children trying to sound prepared for a world that had not asked their grandmothers' permission";
  }
  if (setting.includes("Parliament") || setting.includes("ministry") || setting.includes("government")) {
    return "laminated badges, sweating glasses of water, microphones with red lights, and sentences trained to avoid fingerprints";
  }
  if (setting.includes("hospital") || setting.includes("ward")) {
    return "bleach over damp cloth, generator cough, plastic chairs, and names written on charts too small for the lives attached to them";
  }
  return "paper, heat, old wood, sea wind, and the stubborn bodily evidence that no document can fully replace a place";
}

function summaryFor(section) {
  return `${section.title} follows ${section.pov} as ${lowerFirst(
    section.pressure
  )}, testing whether Saint Orison can accept repair without surrendering memory.`;
}

function lowerFirst(value) {
  return value ? `${value[0].toLowerCase()}${value.slice(1)}` : value;
}

function extractDocxText(path) {
  const zip = new AdmZip(path);
  const xml = zip.readAsText("word/document.xml");
  return xml
    .replace(/<w:br\/>/g, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function countWords(value) {
  return value.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
}

function hash(value) {
  return [...value].reduce((acc, char) => acc + char.charCodeAt(0), 0);
}
