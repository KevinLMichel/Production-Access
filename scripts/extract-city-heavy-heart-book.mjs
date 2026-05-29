import AdmZip from "adm-zip";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

// WARNING: Rerunning this extractor overwrites generated City with a Heavy Heart reader sections.
const root = resolve(import.meta.dirname, "..");
const sourceDocx = resolve(
  process.env.PRODUCTION_ACCESS_CITY_HEAVY_HEART_INPUT ??
    "C:/Users/kevin/Downloads/The City with a Heavy Heart writing outline.docx"
);
const outputDir = resolve(root, "src/content/book-chapters/city-with-a-heavy-heart");
const updated = "2026-05-28";

const outlineText = extractDocxText(sourceDocx);
if (!outlineText.includes("The City with a Heavy Heart") || !outlineText.includes("Nia Bell")) {
  throw new Error(`Source outline did not look like the expected City with a Heavy Heart outline: ${sourceDocx}`);
}

const chapters = [
  {
    title: "The N17 Route",
    part: "Part I: The Night the City Stopped",
    pov: "Nia Bell",
    organ: "the whole route",
    place: "the night bus crossing Veyra from the Low Steps to the waterfront and back again",
    opener:
      "By three in the morning, Veyra belonged to those who could not afford daylight. Nia Bell drove them through the city in a bus the color of old bone.",
    function: "A route is supposed to connect what power would rather keep separate.",
    defense: "I only drive the route.",
    exposure: "Seeing had become her profession, and not witnessing had become her survival.",
    transformation: "The windshield darkened until it looked less like glass than an eye refusing to close.",
    confession: "I learned the streets so well that I forgot they were asking me to testify.",
    miko: "Miko asks why the important people have billboards and the tired people have benches.",
    hook: "At 3:17 a.m., every traffic light in Veyra turns red at once.",
    interstitial: ["Transit Notice", "Route N17 delayed due to moral weather. Passengers are advised to keep hold of their names."]
  },
  {
    title: "The Mayor's Speech",
    part: "Part I: The Night the City Stopped",
    pov: "Amara Vale",
    organ: "the Tongue",
    place: "city hall, where emergency language is polished until no one can cut themselves on it",
    opener:
      "Mayor Amara Vale stood before the mirror in her office and practiced grief in a voice that would not frighten investors.",
    function: "The Tongue is supposed to make common purpose speakable.",
    defense: "I preserved order because chaos kills the poor first.",
    exposure: "She had learned to call delay process, fear prudence, and plain speech premature.",
    transformation: "Her tongue grew heavy and black with phrases written small enough to hide inside compassion.",
    confession: "I did not lie because I hated truth. I lied because truth arrived too early for my career.",
    miko: "Miko hears the speech as weather: soft, official, and useless against rain.",
    hook: "When the city stops breathing, Amara is still holding the word resilience in her mouth.",
    interstitial: ["Press Advisory", "The mayor acknowledges pain, announces listening, and asks the wounded to remain available for future consultation."]
  },
  {
    title: "Simultaneous Stillness",
    part: "Part I: The Night the City Stopped",
    pov: "the city chorus",
    organ: "the Heart",
    place: "every district of Veyra at the instant the pulse fails",
    opener:
      "The city did not explode. It did not burn. It simply reached the end of its ability to pretend the heart was not carrying everyone.",
    function: "The Heart is supposed to keep every organ in the same body.",
    defense: "Everyone had a reason.",
    exposure: "A thousand reasons can still become one silence.",
    transformation: "Windows blinked out like cells losing memory, and the avenues folded inward as if the map had become a chest.",
    confession: "We called it normal because every street learned to suffer at the same speed.",
    miko: "Miko watches a woman on the bus freeze between one breath and the next.",
    hook: "The whole city wakes beneath the earth and finds itself already summoned.",
    interstitial: ["Civic Autopsy Note", "The heart shows evidence of chronic displacement. Pain repeatedly moved downward."]
  },
  {
    title: "The Hall Beneath the Foundations",
    part: "Part II: Anatomy of a Civic Body",
    pov: "Nia Bell",
    organ: "the Hall of Measure",
    place: "a chamber beneath all chambers, older than the city's excuses",
    opener:
      "The city lay beneath itself, and that was the first impossibility Nia could understand. The second was worse: it had a body.",
    function: "A judgment hall is supposed to reveal what ordinary daylight has been paid not to show.",
    defense: "This is impossible.",
    exposure: "Impossible things often look impossible only because reality was not permitted to finish speaking.",
    transformation: "The ceiling braided roots, pipes, subway rails, bones, and old promises into a crown over the scales.",
    confession: "I thought Veyra was streets and schedules. It was a body all along.",
    miko: "Miko points to the dark red stone beating on the scale and asks if cities can get sick from lying.",
    hook: "The Feather waits on one pan, pale and severe as a question no office can postpone.",
    interstitial: ["Founding Fragment", "We promise to build no wall that cannot answer a child."]
  },
  {
    title: "The Tongue Is Summoned",
    part: "Part II: Anatomy of a Civic Body",
    pov: "Amara Vale",
    organ: "the Tongue",
    place: "a parliament chamber grown wet behind enormous teeth",
    opener:
      "The first organ called was the Tongue, because Veyra had always believed speech was the beginning of repair.",
    function: "The Tongue is supposed to name danger clearly enough for the body to move.",
    defense: "Words hold a city together.",
    exposure: "Words had held the city together by covering the places where it was tearing.",
    transformation: "Every euphemism Amara had ever approved appeared on the floor like peeled skin.",
    confession: "I taught the city to survive sentences it should have refused.",
    miko: "Miko asks why adults say shared sacrifice when some people only share the sacrifice.",
    hook: "The scale does not move until Amara names the first cost and the first payer.",
    interstitial: ["Public Consultation Transcript", "Speaker thanked. Harm acknowledged. Action deferred."]
  },
  {
    title: "The Witness of the Whole Route",
    part: "Part II: Anatomy of a Civic Body",
    pov: "Nia Bell",
    organ: "the witness",
    place: "the N17 bus parked at the center of the Hall",
    opener:
      "They brought the bus into the Hall as if it had been evidence all along.",
    function: "A witness is supposed to carry what sight alone cannot bear.",
    defense: "I am nobody important.",
    exposure: "Nobody important had crossed every district, counted every silence, and learned the city's weight by brake pedal and farebox.",
    transformation: "Each seat filled with a passenger Nia had once carried past a decision.",
    confession: "I knew the route, and the route knew what I had trained myself not to say.",
    miko: "Miko sits beside her, swinging worn shoes over the dark floor.",
    hook: "The judges name Nia the Witness of the Whole Route, and the title feels heavier than a uniform.",
    interstitial: ["Driver Log", "Delay at Parliament. Delay at Prison Road. Delay at Low Steps. Cause unlisted."]
  },
  {
    title: "The Civic Body Explained",
    part: "Part II: Anatomy of a Civic Body",
    pov: "the Judges of Function",
    organ: "the civic body",
    place: "the map of Veyra redrawn as organs around the scales",
    opener:
      "The Judges did not explain Veyra by districts, taxes, parties, or slogans. They explained it by function.",
    function: "A body lives when each organ serves the whole.",
    defense: "No organ can be blamed for doing its job.",
    exposure: "Injustice begins when an organ mistakes itself for the body.",
    transformation: "The Stomach towered in marble, the Fists clenched at the prison road, and the Feet trembled beneath everything.",
    confession: "We called ourselves a city while each part negotiated its own innocence.",
    miko: "Miko asks whether a body can apologize to its feet without taking off the weight.",
    hook: "The Stomach is summoned first because hunger is the oldest language Veyra still obeys.",
    interstitial: ["Anatomy Plate", "The feet present swelling, cracked skin, and unusual strength. Cause: carrying what others name progress."]
  },
  {
    title: "The Stomach Says Growth",
    part: "Part III: The Confessions of Function",
    pov: "Cassian Venn",
    organ: "the Stomach",
    place: "a financial district transformed into a banquet hall lined with eviction notices",
    opener:
      "Cassian Venn had always trusted hunger. Hunger built his mother's shop, his first warehouse, his first tower, and the smile he wore for cameras.",
    function: "The Stomach is supposed to feed the body and turn labor into shared strength.",
    defense: "I followed incentives. I did not create the system.",
    exposure: "He did not need to command cruelty because the machinery already understood his desire.",
    transformation: "The banquet dishes changed into school funding, unpaid overtime, public land, and rent arrears.",
    confession: "I did not have to say remove them. I only had to say the land was underused.",
    miko: "Miko asks why hunger is noble only before it becomes rich.",
    hook: "When Cassian vomits land deeds, the Feet twitch for the first time.",
    interstitial: ["Procurement Note", "Displacement categorized as site readiness. Community impact deferred to communications."]
  },
  {
    title: "The Eyes Learn to Rank",
    part: "Part III: The Confessions of Function",
    pov: "Lenora Hatch",
    organ: "the Eyes",
    place: "a reform school made of glass, exam papers, locked gates, and shining trophies",
    opener:
      "Lenora Hatch believed in standards because standards had once saved her from being swallowed by the district that raised her.",
    function: "The Eyes are supposed to help children see themselves and one another clearly.",
    defense: "I gave children opportunity.",
    exposure: "She taught the ladder and hid the floor.",
    transformation: "The students inside the glass school could see the towers but not each other.",
    confession: "I preserved the miracle by removing the children who made the miracle harder to measure.",
    miko: "Miko asks whether a school that saves a few by disappearing others is a school or a sorting room.",
    hook: "The next summons opens an endless lecture hall where every seat is occupied by suffering.",
    interstitial: ["School Report", "Student removed from dataset due to transfer. Hunger not included in performance notes."]
  },
  {
    title: "The Intellectual Measures the Wound",
    part: "Part III: The Confessions of Function",
    pov: "Theo Marrek",
    organ: "the Eyes",
    place: "an endless lecture hall where pain appears as citations",
    opener:
      "Professor Theo Marrek had spent forty years teaching the city to distrust simple answers.",
    function: "Thought is supposed to make action more precise, not more postponable.",
    defense: "I was studying the problem.",
    exposure: "He made clarity expensive and placed truth on a shelf high enough that only the comfortable could reach it.",
    transformation: "His footnotes opened into footnotes, each containing real knowledge and no door.",
    confession: "I feared being crude more than I feared being useless.",
    miko: "Miko asks how many pages a thirsty child must read before someone brings water.",
    hook: "The Fists begin to clench before Theo can finish defining violence.",
    interstitial: ["Conference Program", "Panel 4B: Urgency, Temporality, and the Ethics of Deferred Intervention."]
  },
  {
    title: "The Fists Enforce the Shape",
    part: "Part III: The Confessions of Function",
    pov: "Brant Kade",
    organ: "the Fists",
    place: "a prison corridor shaped like a clenched hand",
    opener:
      "Brant Kade entered the Hall with the posture of a man who had spent his life making fear stand in line.",
    function: "The Fists are supposed to protect the body from harm.",
    defense: "I enforced the law.",
    exposure: "He made pain official, then asked why the harmed screamed at the city.",
    transformation: "Each cell became a knuckle, and every knuckle remembered a name filed as incident.",
    confession: "I mistook authorization for innocence.",
    miko: "Miko asks whether a uniform changes what a hand does to a throat.",
    hook: "The corridor opens into raw knees and damp prayer.",
    interstitial: ["Custody Form", "Cause pending. Confidence maintained. Family notified after media inquiry."]
  },
  {
    title: "The Knees Teach Peace",
    part: "Part III: The Confessions of Function",
    pov: "Mother Elian",
    organ: "the Knees",
    place: "a chapel, mosque, temple, and community hall joined by worn floors",
    opener:
      "Mother Elian knew the sound of people arriving with grief folded under their coats.",
    function: "The Knees are supposed to teach reverence without training the harmed to kneel before danger.",
    defense: "I kept people peaceful.",
    exposure: "Peace without protection had become quiet with holy vocabulary.",
    transformation: "The floor showed generations of knees, polished raw by endurance no one had defended.",
    confession: "I called the cage a cross because I did not know how to break the lock.",
    miko: "Miko asks if God likes it when adults tell scared people to be patient with wolves.",
    hook: "The Lungs cough from the other side of the Hall, and every candle flame leans toward them.",
    interstitial: ["Prayer Bulletin", "Peace without protection is only quiet."]
  },
  {
    title: "The Lungs Ask for Air",
    part: "Part III: The Confessions of Function",
    pov: "Yvette Coram",
    organ: "the Lungs",
    place: "hospitals, parks, buses, sick rooms, and every place the city forgot people need breath",
    opener:
      "Yvette Coram did not have a theory of civilization. She had twelve hours on her feet and a patient calling her daughter by mistake.",
    function: "The Lungs are supposed to give the body breath, rest, pause, and recovery.",
    defense: "We kept people alive with what we had.",
    exposure: "The city praised care while rationing the conditions that make care possible.",
    transformation: "Hospital corridors filled with exhaust, unpaid shifts, closed parks, and mothers breathing over fevered children.",
    confession: "We became heroic because ordinary support was denied to us.",
    miko: "Miko asks why applause is cheaper than air.",
    hook: "The Skin shines in the distance, polished and photogenic, hiding the wound beneath banners.",
    interstitial: ["Hospital Notice", "Staff shortage acknowledged. Resilience celebrated. Break room converted to storage."]
  },
  {
    title: "The Skin Beautifies the Wound",
    part: "Part III: The Confessions of Function",
    pov: "Elise Rowan",
    organ: "the Skin",
    place: "the waterfront, tourist district, murals, festivals, zoning maps, and cleanliness campaigns",
    opener:
      "Elise Rowan made the city beautiful enough for outsiders to forgive it.",
    function: "The Skin is supposed to protect the body and let it meet the world without shame.",
    defense: "Beauty restores civic pride.",
    exposure: "The city made wounds visible as art while leaving the knife in place.",
    transformation: "Murals peeled back to reveal eviction letters, and festival lights shone on streets cleaned of the people who lived there.",
    confession: "I learned to frame pain so well that nobody asked who still felt it.",
    miko: "Miko asks whether a wall can be proud of a painting if it hides a locked door.",
    hook: "Behind the painted surface, Memory opens its archive of unpaid names.",
    interstitial: ["Tourism Brief", "Authenticity increased after selective removal of visible distress."]
  },
  {
    title: "The Archive of Unpaid Names",
    part: "Part III: The Confessions of Function",
    pov: "the Recorder of Weight",
    organ: "Memory",
    place: "archives, cemeteries, old maps, sealed reports, erased neighborhoods, and family stories",
    opener:
      "Memory did not look backward in Veyra. It looked downward, where the buried things had learned to wait.",
    function: "Memory is supposed to keep the body from calling old harm new accident.",
    defense: "We commemorated what mattered.",
    exposure: "The city remembered symbols and forgot families.",
    transformation: "Street names bled, old maps unfolded like bandages, and cemeteries spoke in unpaid wages.",
    confession: "We made monuments for the dead and policies that multiplied them.",
    miko: "Miko asks why names become important only after people can no longer answer.",
    hook: "Sera Quill's chant enters the archive before she does, already burning.",
    interstitial: ["Archive Slip", "Neighborhood renamed. Residents dispersed. Ceremony successful."]
  },
  {
    title: "The Burning Throat",
    part: "Part III: The Confessions of Function",
    pov: "Sera Quill",
    organ: "the Burning Throat",
    place: "a protest street filled with candles, riot shields, livestreams, mothers, smoke, and donation links",
    opener:
      "Sera Quill knew the sound a crowd made when it stopped being afraid of its own anger.",
    function: "Resistance is supposed to make the wound impossible to ignore and repair impossible to postpone.",
    defense: "I resisted.",
    exposure: "She did not invent the fire, but she learned how to stand where it lit her face.",
    transformation: "Screens multiplied her until some versions were brave, some branded, some grieving, and some selling.",
    confession: "I began to need betrayal because betrayal proved I was necessary.",
    miko: "Miko asks whether justice still wins if the wound must stay open for the microphone.",
    hook: "The Feet begin to move, and every slogan in the Hall loses its rhythm.",
    interstitial: ["Livestream Caption", "Pain trending. Link in bio. Mutual aid pinned below sponsor message."]
  },
  {
    title: "The Feet Begin to Move",
    part: "Part IV: The Trial Turns",
    pov: "Nia Bell",
    organ: "the Feet",
    place: "the poor districts beneath every organ's weight",
    opener:
      "At first, Nia thought the sound was thunder. Then she understood that the Feet were shifting.",
    function: "The Feet are supposed to carry the body, not disappear beneath it.",
    defense: "We only survived.",
    exposure: "Survival had become the city’s most profitable silence.",
    transformation: "The Low Steps rose beneath the towers, cracked and blistered, muscled from generations of motion.",
    confession: "We carried what we were told was opportunity and called the pain adulthood.",
    miko: "Miko asks why the body gets angry when the feet say they hurt.",
    hook: "The Tongue and Stomach are called together because speech and appetite had been protecting each other.",
    interstitial: ["Footnote to the Body", "The lowest part knows the body's real weight."]
  },
  {
    title: "Cross-Examination of the Tongue and Stomach",
    part: "Part IV: The Trial Turns",
    pov: "Amara Vale and Cassian Venn",
    organ: "the Tongue and the Stomach",
    place: "a chamber where press briefings become contracts and contracts become speeches",
    opener:
      "When Amara and Cassian stood side by side, the Hall showed what the surface city had politely separated.",
    function: "Speech and appetite are supposed to coordinate life, not launder each other.",
    defense: "We needed partnership.",
    exposure: "Partnership had meant public language kneeling beside private hunger.",
    transformation: "Amara's statements wrapped Cassian's deeds like velvet around a blade.",
    confession: "We discovered that no one had to be ordered when everyone understood what the money wanted.",
    miko: "Miko asks why a promise sounds different after it has been paid for.",
    hook: "The Eyes and Fists are summoned next, because the city had learned to rank before it learned to protect.",
    interstitial: ["Memorandum", "Community benefits to be announced after acquisition phase."]
  },
  {
    title: "Cross-Examination of the Eyes and Fists",
    part: "Part IV: The Trial Turns",
    pov: "Lenora Hatch, Theo Marrek, and Brant Kade",
    organ: "the Eyes and the Fists",
    place: "a school corridor that becomes a prison corridor that becomes a lecture hall",
    opener:
      "The Hall placed a desk beside a cell and waited for the city to notice the shared shape.",
    function: "Sight and force are supposed to protect possibility from blindness and harm.",
    defense: "We kept standards. We kept order. We kept thinking.",
    exposure: "The city had built a pipeline out of categories and called each gate neutral.",
    transformation: "Exam papers became incident reports; incident reports became citations; citations became locked doors.",
    confession: "We learned to predict failure, then punished people for fulfilling the prediction.",
    miko: "Miko asks if a child is still free after every adult has already decided what he is.",
    hook: "The Mirror lights up, eager to turn the trial into content.",
    interstitial: ["Data Note", "Risk category updated. Intervention unfunded. Compliance complete."]
  },
  {
    title: "The Marketplace of Approved Anger",
    part: "Part IV: The Trial Turns",
    pov: "Sera Quill and Elise Rowan",
    organ: "the Mirror",
    place: "a media chamber where suffering becomes image and apology becomes clip",
    opener:
      "The Mirror did not reflect the city. It edited the city until every wound knew its best angle.",
    function: "The Mirror is supposed to help the body recognize itself.",
    defense: "Visibility creates change.",
    exposure: "Visibility had become a marketplace where pain was priced before it was answered.",
    transformation: "Protests became thumbnails, apologies became reels, and corporate guilt became a campaign palette.",
    confession: "We made the wound visible while leaving the knife in place.",
    miko: "Miko asks whether seeing something counts if everyone keeps scrolling.",
    hook: "The Animal Under the Table wakes, smelling excuses thick enough to eat.",
    interstitial: ["Campaign Brief", "Authentic anger performs well among aspirational demographics."]
  },
  {
    title: "The Animal Eats the Excuses",
    part: "Part IV: The Trial Turns",
    pov: "the Hall",
    organ: "the Animal Under the Table",
    place: "beneath the judges' table where every evasion drops a crumb",
    opener:
      "No one had noticed the Animal when the trial began. That was because the Animal preferred institutions to become comfortable before it fed.",
    function: "The Animal is supposed to expose the appetite hidden inside respectable language.",
    defense: "It is complex.",
    exposure: "Useful complexity reveals where action must occur. Cowardly complexity makes action seem impossible.",
    transformation: "The Animal grew fat on process, market realities, security concerns, and community engagement.",
    confession: "Every excuse had a flavor, and Veyra had cooked for it well.",
    miko: "Miko laughs once, then stops when the Animal looks hungry in his direction.",
    hook: "The trial turns toward Nia, because even the Feet must confess the silences survival taught them.",
    interstitial: ["Dietary Record", "Primary nutrients: euphemism, delay, plausible deniability, institutional fatigue."]
  },
  {
    title: "Nia Bell's Confession",
    part: "Part V: The Feet Refuse",
    pov: "Nia Bell",
    organ: "the Witness",
    place: "the N17 bus filled with everyone Nia drove past",
    opener:
      "Nia had waited all night for the Hall to finish with important people. Then the bus doors opened, and her brother Davi stepped on.",
    function: "Witness is supposed to make sight answerable.",
    defense: "I had a son to feed.",
    exposure: "The ethics of exhaustion had taught her to call fear professionalism.",
    transformation: "The complaint form appeared in her hands, signed once, withdrawn once, still warm from the night she folded it away.",
    confession: "I did not kill my brother, but I helped the silence learn my handwriting.",
    miko: "Miko asks if being scared makes something less true.",
    hook: "When Nia finishes, the Feet do not forgive the city. They stop moving.",
    interstitial: ["Withdrawn Complaint", "Witness unavailable. Employment risk high. Truth deferred for household survival."]
  },
  {
    title: "The Strike of the Body",
    part: "Part V: The Feet Refuse",
    pov: "the Feet and the city chorus",
    organ: "the Feet",
    place: "the swollen foundation beneath every civic organ",
    opener:
      "The Feet did not march. Marching would have been movement, and movement was what the city had always extracted from them.",
    function: "Refusal is supposed to return weight to the place that created it.",
    defense: "If the Feet stop, the body dies.",
    exposure: "The body had mistaken endurance for consent.",
    transformation: "Towers tilted, prisons loosened, markets spilled, schools shook, and every organ discovered gravity.",
    confession: "We carried you because we were alive. You called that agreement.",
    miko: "Miko says he does not want to inherit their reasons.",
    hook: "The black pool beneath the scales begins to move: the First Mouth is opening.",
    interstitial: ["Emergency Notice", "All routes suspended until weight is redistributed."]
  },
  {
    title: "The First Mouth Opens",
    part: "Part V: The Feet Refuse",
    pov: "Miko Bell and Nia Bell",
    organ: "the First Mouth",
    place: "the buried spring beneath the scales",
    opener:
      "The First Mouth did not open like a door. It opened like water remembering it had once been public.",
    function: "Fearless speech is supposed to begin repair, not replace it.",
    defense: "One true sentence should be enough.",
    exposure: "One sentence can break a spell, but it cannot build the room after the spell is broken.",
    transformation: "Each witness receives one sentence without fear, and the Hall brightens with the terrible mercy of accuracy.",
    confession: "The city does not need better excuses. It needs new weight.",
    miko: "Miko says, I do not want to inherit your reasons.",
    hook: "The Feather finally speaks without sound, and the scale demands a new condition.",
    interstitial: ["Spring Record", "Water restored briefly. Courage not guaranteed after drinking."]
  },
  {
    title: "The New Weight",
    part: "Part VI: Dawn with Conditions",
    pov: "the Recorder of Weight and Nia Bell",
    organ: "the scale",
    place: "the center of the Hall as the civic covenant is rewritten",
    opener:
      "The Recorder of Weight wrote slowly because, for the first time all night, the words were expected to cost something.",
    function: "Judgment is supposed to move responsibility to the place where decisions are made.",
    defense: "Confession should count.",
    exposure: "Confession without changed weight is only weather.",
    transformation: "The heart grew lighter only when each organ accepted a material consequence.",
    confession: "Every law must travel the whole route before it claims to speak for the city.",
    miko: "Miko asks whether the new rule will still matter when everyone is tired tomorrow.",
    hook: "The Hall begins returning Veyra to the surface with memory stitched into its streets.",
    interstitial: ["Covenant Draft", "No organ may call itself the body. No policy may bypass the Feet."]
  },
  {
    title: "Veyra Wakes",
    part: "Part VI: Dawn with Conditions",
    pov: "the city chorus",
    organ: "the waking city",
    place: "surface Veyra at dawn",
    opener:
      "Veyra woke with every clock still arguing about the missing minute.",
    function: "Dawn is supposed to return light without pretending night never happened.",
    defense: "It was only a dream.",
    exposure: "The dream had left fingerprints on policies, bruises on marble, and water under locked doors.",
    transformation: "Traffic lights blinked from red to amber, and the bus route map showed a new stop called First Mouth.",
    confession: "We are awake, not innocent.",
    miko: "Miko finds his shoes damp with black water and refuses to let anyone clean them.",
    hook: "Nia drives toward the public room where courage must learn architecture.",
    interstitial: ["Morning Bulletin", "Normal service resumes with unexplained route changes."]
  },
  {
    title: "The Architecture of Courage",
    part: "Part VI: Dawn with Conditions",
    pov: "Nia Bell",
    organ: "the renewed civic body",
    place: "a public room built where the route, the Feet, and the First Mouth meet",
    opener:
      "The first new room in Veyra was not beautiful. That was how Nia knew it had a chance.",
    function: "Architecture is supposed to make courage easier to practice.",
    defense: "The city has changed.",
    exposure: "The old forces remain: money still wants to eat, power still wants language, anger still wants a stage, fear still wants a wall.",
    transformation: "The floor is designed to be felt through soles, and every law must be spoken first where it will be carried.",
    confession: "Civilization begins again whenever the body refuses to build cowardice into stone.",
    miko: "Miko sits in the front row, not because he is innocent, but because the future should hear first.",
    hook: "Veyra is not saved. Veyra is awake.",
    interstitial: ["Opening Notice", "All speakers must stand where the Feet can hear them. No exception for title, wealth, office, grief, or fame."]
  }
];

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

let totalWords = 0;

for (const [index, chapter] of chapters.entries()) {
  const body = buildChapter(chapter, index);
  totalWords += wordCount(body);
  const fileName = `${String(index).padStart(2, "0")}-${slugify(chapter.title)}.md`;
  const output = [
    "---",
    `bookSlug: "city-with-a-heavy-heart"`,
    `title: "${escapeYaml(chapter.title)}"`,
    `subtitle: "Chapter ${index + 1}"`,
    `part: "${escapeYaml(chapter.part)}"`,
    `order: ${index}`,
    `summary: "${escapeYaml(summaryFor(chapter))}"`,
    `updated: ${updated}`,
    "---",
    "",
    body,
    ""
  ].join("\n");

  await writeFile(resolve(outputDir, fileName), output, "utf8");
}

console.log(`city-with-a-heavy-heart: ${chapters.length} sections, ${totalWords} body words`);

function buildChapter(chapter, index) {
  const prev = chapters[index - 1];
  const next = chapters[index + 1];
  const chapterNumber = index + 1;
  const paragraphs = [];

  paragraphs.push(chapter.opener);
  paragraphs.push(
    `By then, the city had already begun its old trick of making suffering look like arrangement. At ${chapter.place}, the ordinary furniture of Veyra had gathered: locked doors, late buses, cameras that worked when they watched the poor, cameras that failed when the powerful needed privacy, receipts folded into pockets, and windows bright enough to pretend someone was still awake for the right reason.`
  );
  paragraphs.push(
    `The official map called these places districts. Nia would later understand that the Hall had a more honest vocabulary. It called them organs. It asked what each part was for, what it had become, and who paid the difference between function and corruption.`
  );
  paragraphs.push(
    `No one in Veyra thought of themselves as an organ. They thought of themselves as workers, officials, parents, students, investors, believers, tenants, officers, scholars, drivers, citizens, survivors. That was one of the city's most useful protections. A person could be part of a body and still claim not to know what the body was doing.`
  );

  addSceneMovement(paragraphs, chapter, "surface");
  addDefense(paragraphs, chapter, chapterNumber);
  addHallMovement(paragraphs, chapter);
  addWitnessMovement(paragraphs, chapter, prev, next);
  addCivicDeepening(paragraphs, chapter, index);
  addInterstitial(paragraphs, chapter);
  addConsequence(paragraphs, chapter, next);

  return paragraphs.join("\n\n");
}

function addSceneMovement(paragraphs, chapter, phase) {
  paragraphs.push(
    `${chapter.function} That was the clean version, the version the city printed in annual reports and taught to children in murals. The dirtier version was harder to say because it did not sound like crime at first. It sounded like maintenance, prudence, growth, accountability, standards, security, healing, visibility, resilience, or process.`
  );
  paragraphs.push(
    `Veyra had mastered the art of using good words as hiding places. It did not need to announce cruelty when it could arrange it. It did not need a villain at every desk. It needed forms, timetables, incentives, targets, measurements, committees, rooms with glass walls, rooms without windows, and people who knew where not to look.`
  );
  paragraphs.push(
    `The strangeness of the night did not erase the ordinary details. It sharpened them. Shoes scuffed. Fluorescent lights hummed. Someone's phone kept trying to connect to a network that no longer admitted the surface existed. A forgotten cup of coffee cooled beside a document that had ruined three families without using a single violent verb.`
  );
  paragraphs.push(
    `The first temptation was to make the city symbolic too quickly. The Hall refused that. It made every symbol heavy. A policy became a door. A phrase became a stain. A budget became a bowl with a child looking into it. A delay became a hallway long enough to age a person.`
  );
  paragraphs.push(
    `This was how the trial worked. It did not ask whether anyone had meant well. Meaning well was treated as weather: relevant, sometimes beautiful, never enough to hold a bridge. The Hall wanted weight. It wanted the cost named, the payer named, and the place where the burden had been moved.`
  );
  paragraphs.push(
    `Around ${chapter.organ}, the architecture began to answer. The walls did not accuse in speeches. They changed shape. They showed the city's intention beneath its vocabulary. They made euphemism sweat. They made competence tremble. They made every neutral procedure reveal the body it had been leaning on.`
  );
  paragraphs.push(
    `Nia noticed first with her feet. That became important later. Before she understood the scale, before she understood the judges, before she understood why the city had brought her bus below the foundations, she felt the floor remember pressure. It knew who had walked. It knew who had been carried. It knew who had been told to keep moving.`
  );
}

function addDefense(paragraphs, chapter, chapterNumber) {
  paragraphs.push(
    `When the defense came, it did not arrive as a lie. That was the painful part. The representative of ${chapter.organ} said, "${chapter.defense}" Some portion of the Hall had to admit the sentence contained truth. Veyra's worst arrangements had never survived on pure falsehood. They survived because each excuse held a fragment of reality like a hostage.`
  );
  paragraphs.push(
    `The Judges of Function did not interrupt immediately. The Listener tilted its head toward everything unsaid. The Old Woman with Bread watched the sentence for nutrition. The Architect Without Hands studied the walls the sentence had built. The Child Without Shoes waited with the terrible patience of someone who had not yet learned to respect adult performance.`
  );
  paragraphs.push(
    `"Tell us what you were for," said the Recorder of Weight. It wrote nothing yet. It never wrote first answers. First answers in Veyra were usually uniforms. They were clean, fitted, authorized, and designed to make the body beneath them invisible.`
  );
  paragraphs.push(
    `The answer came dressed in public usefulness. It spoke of stability, opportunity, safety, knowledge, growth, peace, care, visibility, or endurance. It sounded like the kind of answer that could survive a panel. It sounded reasonable enough that, above ground, no one would have thrown a chair. That was how Veyra preferred its moral failures: reasonable enough to sit beside.`
  );
  paragraphs.push(
    `Then the Animal Under the Table stirred. It did not roar. It sniffed. It loved the smell of half-truth because half-truth had texture. Full lies were too thin, and full truth rarely fed it. But half-truth had fat in it. It had the flavor of self-protection mixed with civic vocabulary.`
  );
  paragraphs.push(
    `The representative tried again, more carefully. Careful language had saved many careers in Veyra. It could turn a beating into a use-of-force incident, a hunger into a data point, an eviction into revitalization, a child's disappearance into attrition, a bribe into partnership, a cowardice into process.`
  );
  paragraphs.push(
    `Nia listened the way she listened on the bus when two passengers argued without saying what the argument was really about. She had learned that people often defend the first layer because the deeper layer would cost them their picture of themselves. The Hall was not interested in the first layer.`
  );
  paragraphs.push(
    `By Chapter ${chapterNumber}, the city had begun to understand a cruel law of the Hall: a defense was not rejected because it was false. It was rejected when it stopped before reaching the Feet.`
  );
}

function addHallMovement(paragraphs, chapter) {
  paragraphs.push(
    `${chapter.transformation} The change was not decorative. It was diagnosis. The Hall made inner function visible with the indifference of an X-ray. It did not hate the organ. It showed the organ to itself.`
  );
  paragraphs.push(
    `${chapter.exposure} The sentence moved through the chamber and found every place where the city had hidden agreement inside habit. Several people flinched who had not expected to be included. That was another rule of Veyra's trial: if the organ confessed properly, bystanders lost their innocence too.`
  );
  paragraphs.push(
    `The scale responded only to material truth. Tears did not move it. Anger did not move it. Elegant analysis did not move it. A beautiful apology slid across the floor like a dead fish. The Recorder dipped its pen and waited for a sentence that could change where weight rested.`
  );
  paragraphs.push(
    `The Feather remained unbearable. It did nothing dramatic. It simply stayed light. That was its accusation. It did not care who had a difficult childhood, who had inherited a broken office, who feared chaos, who followed market signals, who kept standards, who obeyed orders, who wrote reports, who led chants, who prayed with the grieving. It measured what remained after reasons finished speaking.`
  );
  paragraphs.push(
    `A city can become addicted to reasons. Veyra had. Every institution had reasons stacked behind reasons, and many were not stupid. Some were even compassionate. That made them harder to defeat. A foolish excuse dies quickly under scrutiny. A sophisticated excuse becomes policy.`
  );
  paragraphs.push(
    `The Hall did not ask for purity. It asked for function. It asked whether the part had served the life of the whole or learned to feed itself from the whole. It asked whether the organ had made the Feet pay for its comfort. It asked whether the body could continue without lying about where the pain went.`
  );
  paragraphs.push(
    `"${chapter.confession}" The words did not sound heroic. Confession rarely does when it is real. It sounded smaller than the speeches that came before it, and because it was smaller, it finally had room to be true.`
  );
  paragraphs.push(
    `Something eased, but not enough. The heart on the scale shifted by less than hope wanted. The Old Woman with Bread nodded once, not in forgiveness, but in recognition. One true sentence had entered the room. That was not repair. It was only the first clean tool.`
  );
}

function addWitnessMovement(paragraphs, chapter, prev, next) {
  paragraphs.push(
    `${chapter.miko} The question did what adult questions avoided. It did not respect rank. It did not admire complexity for its own sake. It did not give grief a scholarship, cruelty a title, cowardice a process, or hunger a strategic plan.`
  );
  paragraphs.push(
    `Nia wanted to hush him, partly from habit and partly from fear. Children could ask things that cost adults their jobs. Children could walk into the center of a room and name the furniture everyone had learned to step around. She had spent years teaching Miko how to survive Veyra. The Hall seemed determined to teach him how not to inherit it.`
  );
  paragraphs.push(
    `She thought of the N17 route: prison road, hospital doors, school gates, towers, parliament, waterfront, the Low Steps again. Above ground, it had been a job. Below ground, it was evidence. Every stop had been a witness stand. Every passenger had carried some fraction of the city's confession in their shoes, hands, lungs, receipts, uniforms, badges, badges removed, names spoken, names swallowed.`
  );
  paragraphs.push(
    `If there was mercy in the Hall, it was not softness. It was precision. It did not flatten people into villains. It allowed each representative to show the fear beneath the failure. But it also refused the childish comfort of thinking fear cancels harm. Fear explains why walls are built. It does not make every wall just.`
  );
  paragraphs.push(
    `The chapter before this one had left residue in the room${prev ? `, and ${prev.title} still clung to the walls like smoke` : ""}. The next chamber had already begun announcing itself${next ? `, because ${next.title} was waiting where the current confession could not reach` : ""}. Veyra was learning that no organ sinned alone. Every evasion required circulation.`
  );
  paragraphs.push(
    `Nia placed one hand on the rail of the bus, though the bus was no longer moving. The metal felt warm, almost alive. She wondered how many people had held the same rail while deciding not to say what they saw. She wondered whether survival had made cowards of them, or whether the city had designed survival to feel like cowardice when judged from a safe distance.`
  );
  paragraphs.push(
    `That distinction mattered. The Hall did not ask the Feet to pretend they were pure. It asked the rest of the body to stop treating endurance as permission. It asked the wounded to become truthful without becoming addicted to the wound. It asked the powerful to confess without converting confession into spectacle. It asked everyone to understand that shared guilt does not mean equal guilt.`
  );
}

function addCivicDeepening(paragraphs, chapter, index) {
  const chapterNumber = index + 1;
  const partTones = {
    "Part I: The Night the City Stopped":
      "the first night, when every institution still expected the dark to behave like an inconvenience",
    "Part II: Anatomy of a Civic Body":
      "the anatomy chambers, where metaphor lost the privilege of being harmless",
    "Part III: The Confessions of Function":
      "the long confession, when each function discovered the appetite hiding inside its public virtue",
    "Part IV: The Trial Turns":
      "the turning trial, when explanation became too small for the damage it had carried",
    "Part V: The Feet Refuse":
      "the refusal, when endurance stopped performing the miracle that let everyone else remain reasonable",
    "Part VI: Dawn with Conditions":
      "the conditional dawn, where hope had to become a room, a rule, and a habit before anyone trusted it"
  };
  const civicObjects = [
    "a cracked bus ticket",
    "a receipt with rain-darkened ink",
    "a school badge missing its pin",
    "a brass key no one admitted losing",
    "a folded eviction notice",
    "a child's shoe with salt on the sole",
    "a hospital wristband",
    "a torn campaign flyer",
    "a factory timecard",
    "a feather caught in black water"
  ];
  const object = civicObjects[index % civicObjects.length];
  const tone = partTones[chapter.part] ?? "the trial";

  paragraphs.push(
    `In ${tone}, the Hall made a small object appear beside the scale: ${object}. No one announced it. No judge explained it. The object simply arrived with the cruel modesty of evidence. It was not dramatic enough for a monument, which was why Nia trusted it more than the monuments. Veyra had always known how to carve stone around important lies. It had never known what to do with the small things people carried when policy became weather.`
  );
  paragraphs.push(
    `The object belonged to no single witness and therefore to everyone. That was the genius of the Hall's cruelty. It refused the comfort of one perfect victim, one perfect villain, one perfect lesson. It placed the ordinary thing in the chamber and let the city feel how many hands had passed it along. Somewhere in its history was a clerk who stamped, a manager who delayed, a parent who apologized, a guard who shrugged, a teacher who softened the truth, a leader who promised review, and a child who learned that review meant waiting.`
  );
  paragraphs.push(
    `Nia had spent her life among objects like that. On the N17, people left behind gloves, letters, toys, bottles, lunch tins, court papers, prayer cards, and once, a tiny plastic crown from a birthday cake. She had kept a box at the depot because throwing them away felt too much like joining the city. Every item said: someone was here with a body, a need, a foolish hope, a hurry, a fear, a person waiting at home, a person not waiting anymore.`
  );
  paragraphs.push(
    `That was what ${chapter.organ} had forgotten. It had learned to think in categories large enough to wash fingerprints from harm. The category was efficient. The category looked clean in a report. The category could be mapped, funded, regulated, defended, attacked, revised, and praised. But the Hall kept returning the category to the palm, the throat, the stomach, the lungs, the soles. It kept asking the city to identify the human weight inside its abstractions.`
  );
  paragraphs.push(
    `For a moment, Chapter ${chapterNumber} became smaller than its accusation. Nia saw not a whole city but one person standing at a counter, rehearsing dignity before asking for help. She saw the clerk behind the counter rehearsing exhaustion before refusing it. She saw the policy above them both, framed as if neat language could keep shame from entering the room. The refusal did not look like hatred. It looked like the end of a shift. That was one of Veyra's most successful disguises.`
  );
  paragraphs.push(
    `Miko moved closer to the object, and Nia caught his sleeve before the judges could object. No one did. The Child Without Shoes watched him with a face too old for childhood. Miko did not touch the thing. He looked at it the way children look at evidence adults pretend not to see. He was old enough to understand that something had been done, and young enough not to admire the system that made it complicated.`
  );
  paragraphs.push(
    `"Who carries it now?" he asked. The question entered the chamber more cleanly than any speech. It struck ${chapter.organ}, then the scale, then Nia. Above ground, the answer would have been distributed across departments. Below ground, distribution failed as an alibi. The Hall did not deny complexity. It simply refused to let complexity become a laundry service for responsibility.`
  );
  paragraphs.push(
    `A murmur moved through the witnesses. Some were offended because the question sounded unfair. Others were frightened because it sounded exact. The people who had always carried too much did not murmur at all. They recognized the shape of the question. It was the question their knees had asked every stairwell, their hands had asked every form, their lungs had asked every smoke-heavy room, their children had asked every locked gate: if the city is a body, why do only some parts get to be tired?`
  );
  paragraphs.push(
    `The Feather did not move, but the air around it tightened. Nia began to understand that the Hall's purpose was not to humiliate function. Function was sacred when it served life. A tongue that tells truth can save a body. A stomach that distributes nourishment can make work dignified. Eyes that see the hidden can protect the vulnerable. Fists that restrain violence can defend peace. Feet that carry the whole can teach the whole where it actually lives. Corruption began when function mistook itself for permission.`
  );
  paragraphs.push(
    `That was the quiet wound under the entire trial. Veyra had not become monstrous by abandoning every good purpose. It had become monstrous by letting good purposes travel without shame into systems that rewarded cowardice. Every organ still remembered what it was supposed to be. That memory made confession possible. It also made innocence impossible.`
  );
}

function addInterstitial(paragraphs, chapter) {
  const [label, text] = chapter.interstitial;
  paragraphs.push(`> **${label}:** ${text}`);
  paragraphs.push(
    `The fragment appeared and vanished, but not before the Recorder copied it in a margin. Veyra was full of margins. That was where the city put the facts it needed later, the facts it hoped would not arrive together, the facts that looked small until someone traced the route between them.`
  );
}

function addConsequence(paragraphs, chapter, next) {
  paragraphs.push(
    `The trial moved on because a city cannot be understood in one confession. Each part depended on another part to keep its hands clean. The Tongue needed the Stomach to fund what it softened. The Stomach needed the Skin to beautify what it took. The Eyes needed the Fists to handle those who failed the ranking. The Mirror needed the wound to remain photogenic. The Feet needed to keep walking because stopping had always seemed more dangerous than pain.`
  );
  paragraphs.push(
    `This was the terror of Veyra: not that everyone was equally guilty, but that everyone had been given a vocabulary for their portion. The mayor had order. The merchant had incentives. The intellectual had nuance. The activist had fire. The warden had law. The principal had standards. The nurse had duty. The mother of the church had peace. Nia had survival. Each word had saved someone. Each word had also hidden something.`
  );
  paragraphs.push(
    `The heart on the scale beat once, hard enough to shake dust from the ceiling. Above them, if above still existed, ships drifted offshore, planes circled, and the world watched a dark shape where Veyra had been. Below, the city was discovering that darkness was not absence. It was the place where uncounted things had gathered enough weight to speak.`
  );
  paragraphs.push(
    `Nia did not know whether Veyra deserved to return. The question itself frightened her. She had lived too long inside the city to imagine judging it from outside. Her rent, her grief, her son's school, her mother's medicines, her brother's absence, her uniform, her route, her fear, her pride, all of it had Veyra's fingerprints on it. To condemn the city felt like condemning the room where her life had learned to breathe.`
  );
  paragraphs.push(
    `But the Hall was not asking for condemnation alone. It was asking for accuracy. There is a kind of love that cannot survive accuracy, and there is a kind of love that begins there. Veyra had confused flattery with loyalty for generations. The Feather offered no flattery. That made it the most loyal thing in the room.`
  );
  paragraphs.push(
    `${chapter.hook} The sentence stayed after the voices quieted. It became an object in the chamber, something the next person would have to step around or pick up.`
  );
  paragraphs.push(
    `No one applauded. Applause would have made it too easy. The judges did not close the scene with ceremony. They let the consequence hang in the air until the body felt it. Only then did the walls begin rearranging, preparing the next organ, the next defense, the next place where courage had been outsourced to design.`
  );
  paragraphs.push(
    `And somewhere beneath the whole city, under the weight, the Feet remembered they were not pavement. They were alive.`
  );
}

function summaryFor(chapter) {
  return `${chapter.pov} enters ${chapter.place}, where ${chapter.organ} is tested by the Hall of Measure.`;
}

function extractDocxText(filePath) {
  const zip = new AdmZip(filePath);
  const entry = zip.getEntry("word/document.xml");
  if (!entry) throw new Error(`Could not find word/document.xml in ${filePath}`);
  const xml = entry.getData().toString("utf8");
  return xml
    .replace(/<w:tab\b[^>]*\/>/g, "\t")
    .replace(/<w:br\b[^>]*\/>/g, "\n")
    .replace(/<\/w:p>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function escapeYaml(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function wordCount(value) {
  return value.split(/\s+/).filter(Boolean).length;
}
