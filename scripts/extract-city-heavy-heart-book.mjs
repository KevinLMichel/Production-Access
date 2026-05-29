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

const chapterProfiles = {
  "The N17 Route": {
    mode: "bus log",
    setting: "the lower deck of the N17 as it passed the prison road, the hospital doors, and the Low Steps",
    witness: "Mrs. Havel, who rode three stops every night with a bag of clean uniforms for a son who no longer came home",
    object: "a cracked transfer ticket damp from Miko's palm",
    pressure: "the way the route carried everyone important enough to be watched and everyone ordinary enough to be ignored",
    davi: "Davi used to wait at the depot fence with a paper cup of coffee for Nia, tapping two fingers against the lid whenever he had failed to sleep.",
    miko: "Miko asked why the towers got names and the benches only got numbers.",
    turn: "the traffic lights did not fail one at a time; they reddened together, as if a single vein had closed under the city",
    ending: "The bus kept its shape after the street vanished, and that frightened Nia more than darkness."
  },
  "The Mayor's Speech": {
    mode: "press prep",
    setting: "Amara Vale's office, where emergency candles reflected in framed awards and donor glass",
    witness: "a junior aide who had learned to delete the word dead before anyone above her saw it",
    object: "a blue index card labeled compassion, timing, investment climate",
    pressure: "the practice of making grief sound orderly enough for markets to remain calm",
    davi: "Years before, Davi had shouted one question from the back of a town hall, and Amara had thanked him for his passion without answering.",
    miko: "Miko heard the broadcast and said the mayor sounded like rain falling on a locked roof.",
    turn: "the teleprompter kept offering the same sentence after the power died: we are listening",
    ending: "Amara swallowed resilience and tasted metal."
  },
  "Simultaneous Stillness": {
    mode: "city chorus",
    setting: "all of Veyra at the instant buses, lifts, machines, ovens, sirens, and prayers paused",
    witness: "a nurse holding a syringe above a sleeping man while the second hand stopped between ticks",
    object: "a wristwatch with no shadow under its hands",
    pressure: "the discovery that an entire city could stop without looking dramatic from a distance",
    davi: "Nia remembered Davi saying the city would not collapse like a building; it would simply ask the poor to hold it up until their knees gave out.",
    miko: "Miko watched a woman on the bus remain halfway through a breath and whispered that the air had forgotten her.",
    turn: "the avenues folded inward, not like roads, but like ribs closing around a secret",
    ending: "Under every district, the same summons opened."
  },
  "The Hall Beneath the Foundations": {
    mode: "court descent",
    setting: "the chamber below all basements, where pillars looked carved from old stairwells and unpaid sleep",
    witness: "the Listener, whose face changed whenever someone avoided a name",
    object: "a feather laid on a scale the size of a public square",
    pressure: "the horror of seeing metaphor become architecture and architecture become evidence",
    davi: "Davi had once drawn a map of the city on a napkin and marked every place where somebody's dignity had been made to wait.",
    miko: "Miko asked whether the judges lived below the city because no one would let them upstairs.",
    turn: "the Hall did not introduce itself; it made every lie in the room heavier",
    ending: "Nia understood that she had not been brought to observe the trial. She had been brought because she had already been testifying for years."
  },
  "The Tongue Is Summoned": {
    mode: "language hearing",
    setting: "a gallery of microphones, campaign banners, condolence scripts, and mouths carved into stone",
    witness: "Mayor Amara Vale with black ink gathering under her tongue",
    object: "a speech draft where the word sacrifice had been replaced by partnership",
    pressure: "the civic habit of softening pain until the wounded sounded unreasonable for naming it",
    davi: "Davi's last public letter had been returned with three polite paragraphs and no answer.",
    miko: "Miko asked why apologies always arrived dressed better than help.",
    turn: "each polished sentence became a small animal on the floor, panting, ashamed, still useful",
    ending: "The Tongue did not lose speech. It lost the right to speak without being carried to the Feet."
  },
  "The Witness of the Whole Route": {
    mode: "route testimony",
    setting: "a route map hung in the air, every stop lit by the face of someone Nia had driven past",
    witness: "the passengers of N17, summoned by smell before they arrived by name",
    object: "the lost-property box from the depot, spilling gloves, forms, toys, and court slips",
    pressure: "Nia's old defense that driving was not choosing, and choosing was not safe",
    davi: "Davi had left a red scarf on the bus the winter before he disappeared; Nia had kept it under the driver's seat for two weeks.",
    miko: "Miko asked whether a witness who stays quiet becomes a window or a wall.",
    turn: "the route map curled into a vein and pulsed under Nia's shoes",
    ending: "The Hall made the route speak, and every stop sounded like a question she had postponed."
  },
  "The Civic Body Explained": {
    mode: "anatomy lesson",
    setting: "a lecture theatre built from courthouse wood, hospital tile, school desks, and train platforms",
    witness: "the Recorder of Weight, who wrote only after the body contradicted itself",
    object: "a chalk diagram of Veyra with arteries where roads had been",
    pressure: "the need to understand the city without reducing its people to symbols",
    davi: "Davi had warned Nia that systems were most dangerous when they sounded too large for anyone to touch.",
    miko: "Miko asked if the city could feel pain in a place that had never been allowed to vote.",
    turn: "the diagram blinked, and each labeled organ answered with a human voice",
    ending: "The lesson ended when the diagram began to bleed."
  },
  "The Stomach Says Growth": {
    mode: "market temptation",
    setting: "Cassian Venn's development floor, where miniature towers rose from plates of polished meat",
    witness: "a tenant whose rent increase had been folded into a celebration brochure",
    object: "a land deed chewed thin at the edges",
    pressure: "the appetite that called itself growth because hunger sounded vulgar",
    davi: "Davi had once counted cranes from the bus window and said each one looked like a bird trained to eat roofs.",
    miko: "Miko asked why the city built taller whenever families were pushed lower.",
    turn: "Cassian's banquet table lengthened until its far end entered the Low Steps",
    ending: "When the Stomach confessed, it did not vomit guilt. It vomited addresses."
  },
  "The Eyes Learn to Rank": {
    mode: "surveillance sorting",
    setting: "Lenora Hatch's glass school, where trophies shone above locked doors and every corridor smelled of polish",
    witness: "a girl rejected from three programs because her district carried the wrong color on a map",
    object: "an exam paper stamped exceptional beside a hunger note no one counted",
    pressure: "the arrogance of seeing without being seen back",
    davi: "Davi had taught Miko to wave at cameras, not because they cared, but because a person should know when he is being turned into data.",
    miko: "Miko asked whether the cameras could see who taught them to be afraid.",
    turn: "the screens reversed and showed the watchers ranked by what they had refused to notice",
    ending: "The Eyes blinked for the first time, and half the chamber went dark."
  },
  "The Intellectual Measures the Wound": {
    mode: "seminar collapse",
    setting: "Theo Marrek's lecture hall, where footnotes hung like chandeliers above people with nowhere to sit",
    witness: "a young organizer whose pain had become a case study before anyone had asked what she needed",
    object: "a dissertation margin filled with tiny hands",
    pressure: "the elegant distance that can turn suffering into career material",
    davi: "Davi hated panels because the people onstage always discovered complexity after someone asked for bread.",
    miko: "Miko asked if a wound gets smaller when a clever person renames it.",
    turn: "the footnotes fell one by one and landed as bills, prescriptions, apology letters, and keys",
    ending: "The Intellect did not lose brilliance. It lost the privilege of shining above the room."
  },
  "The Fists Enforce the Shape": {
    mode: "force corridor",
    setting: "Brant Kade's training hall, where shields leaned against walls painted with the word calm",
    witness: "a recruit who had learned to fear looking uncertain more than looking cruel",
    object: "a dented shield with a child's sticker under the strap",
    pressure: "the moment protection becomes the protection of its own authority",
    davi: "Davi had come home once with his knuckles split, not from fighting, but from gripping a fence while officers cleared a square.",
    miko: "Miko asked why strong men needed so many people to be quiet before they felt safe.",
    turn: "every baton in the room bent toward the wrist that had ordered it raised",
    ending: "The Fists lowered themselves, and the silence afterward was not peace."
  },
  "The Knees Teach Peace": {
    mode: "prayer bulletin",
    setting: "Mother Elian's sanctuary, where candles burned before a mural of citizens kneeling in perfect rows",
    witness: "a widow who had been told forgiveness was cheaper than rent court",
    object: "a hymnal with complaint written between the verses",
    pressure: "the use of peace as a blanket thrown over those still bleeding",
    davi: "Davi had once stood outside the sanctuary and refused to enter until somebody inside admitted anger could be holy.",
    miko: "Miko asked why kneeling felt different when someone pushed you down first.",
    turn: "the pews folded into a spine and refused to bend further",
    ending: "The Knees remembered worship, but they also remembered standing."
  },
  "The Lungs Ask for Air": {
    mode: "hospital shift",
    setting: "a respiratory ward where windows looked onto factories painted sky-blue",
    witness: "Yvette the nurse, carrying three alarms in her pockets and one in her chest",
    object: "an inhaler tagged with a school locker number",
    pressure: "a city that praised endurance while selling the air back in machines",
    davi: "Davi had developed a cough after the warehouse fire and laughed whenever Nia told him to see a doctor they both knew he could not afford.",
    miko: "Miko asked whether breathing counted as a public service.",
    turn: "the ventilators began speaking the names of neighborhoods between each mechanical breath",
    ending: "The Lungs did not ask for pity. They asked who had profited from the smoke."
  },
  "The Skin Beautifies the Wound": {
    mode: "branding tour",
    setting: "Elise Rowan's city exhibition, where murals covered demolition dust and every render showed sunlight",
    witness: "a painter hired to turn boarded windows into optimism",
    object: "a gold ribbon cut from a building that still smelled of mold",
    pressure: "the cosmetic mercy that makes injury more marketable without making it less deep",
    davi: "Davi had once stood before a mural of smiling workers and pointed to the empty lot behind it.",
    miko: "Miko asked if beauty was still beauty when it was paid to hide a bruise.",
    turn: "the murals peeled away and each layer showed the notice that preceded it",
    ending: "The Skin was beautiful enough to be ashamed."
  },
  "The Archive of Unpaid Names": {
    mode: "archive fragments",
    setting: "a vault where file cabinets breathed dust and every drawer opened into a different decade",
    witness: "the archivist Elise, whose hands shook only when a name had been misspelled on purpose",
    object: "a ledger page where Davi Bell appeared under detained, transferred, unknown",
    pressure: "the violence of records that preserve everything except responsibility",
    davi: "Nia saw Davi's handwriting in a complaint form the city had marked resolved without a signature.",
    miko: "Miko asked whether a lost person is still lost if someone knows where the file is.",
    turn: "the cabinets opened by themselves and the unpaid names walked out alphabetically",
    ending: "Memory did not accuse loudly. It counted."
  },
  "The Burning Throat": {
    mode: "livestream fever",
    setting: "a protest square where microphones multiplied faster than water bottles",
    witness: "a young speaker whose rage became useful the moment a sponsor could brand it",
    object: "a scorched megaphone with applause trapped inside it",
    pressure: "anger that begins as truth and learns to enjoy its own heat",
    davi: "Davi's voice had once cracked in the same square; afterward strangers quoted him and nobody called Nia to ask if he came home.",
    miko: "Miko asked whether fire knows when it is cooking and when it is only burning.",
    turn: "the crowd's chant turned into smoke and entered the throats of people who had never been heard",
    ending: "The Burning Throat kept its flame, but the Hall made it learn warmth."
  },
  "The Feet Begin to Move": {
    mode: "worker procession",
    setting: "the underside of streets, where soles pressed upward against marble, tile, carpet, and stage",
    witness: "a cleaner whose name badge had been replaced so many times she answered to the company logo",
    object: "a shoe sole worn thin enough to show the shape of a life",
    pressure: "endurance mistaken for consent",
    davi: "Davi had told Nia that tired people do not disappear all at once; they become infrastructure first.",
    miko: "Miko asked if the ground ever gets to say no.",
    turn: "one foot stopped, then another, and the stillness traveled faster than command",
    ending: "For the first time, Veyra felt the difference between support and permission."
  },
  "Cross-Examination of the Tongue and Stomach": {
    mode: "paired cross-examination",
    setting: "a split witness box, one side lined with microphones, the other with silver plates",
    witness: "Amara Vale and Cassian Venn forced to answer the same question without borrowing each other's words",
    object: "a ribbon from a public-private partnership agreement",
    pressure: "language that blesses appetite and appetite that funds language",
    davi: "Davi had said city hall and the developers spoke like two hands washing each other over an empty bowl.",
    miko: "Miko asked which one taught the other to smile.",
    turn: "each answer left grease on the microphone and slogans in the gravy",
    ending: "The Tongue and Stomach discovered they had been one organ whenever blame arrived."
  },
  "Cross-Examination of the Eyes and Fists": {
    mode: "evidence replay",
    setting: "a dark room where every camera angle had to face the wrist that used it",
    witness: "Theo Marrek and Brant Kade, separated by glass that showed them wearing each other's uniforms",
    object: "a body-camera clip that refused to pause before the shove",
    pressure: "the machinery by which suspicion asks force to prove it was right",
    davi: "Davi's last known image appeared for three seconds in the corner of a security feed nobody had reviewed until the Hall demanded it.",
    miko: "Miko asked if seeing danger everywhere makes you dangerous.",
    turn: "the screens slowed until every decision became visible between fear and impact",
    ending: "The Eyes and Fists had called themselves separate. The replay made them hold hands."
  },
  "The Marketplace of Approved Anger": {
    mode: "outrage market",
    setting: "a bazaar of banners, comment feeds, confession booths, merchandise tables, and little stages",
    witness: "Sera Quill, Lenora Hatch, and the Burning Throat watching grief become a product line",
    object: "a receipt for righteous fury, nonrefundable after applause",
    pressure: "the civic industry that lets people purchase the feeling of courage without risking its cost",
    davi: "Davi's face had been printed on a placard once; the vendor spelled his surname wrong and sold out by noon.",
    miko: "Miko asked why everybody wanted a piece of pain except the part that had to heal.",
    turn: "the stalls collapsed when the Feet refused to carry anger that had no destination",
    ending: "Approved anger lost its market when the wounded asked for consequence instead of performance."
  },
  "The Animal Eats the Excuses": {
    mode: "beast chamber",
    setting: "beneath the judges' table, where the Animal grew on reasons nobody wanted to finish",
    witness: "every representative who had fed it a fragment of fear",
    object: "a bowl filled with chewed words: order, growth, safety, nuance, peace, visibility",
    pressure: "the appetite beneath all respectable evasion",
    davi: "Davi had once told Nia that the city was not heartless; it was hungry, and hunger could learn manners.",
    miko: "Miko asked whether excuses die if nobody feeds them.",
    turn: "the Animal shrank whenever someone completed a sentence without protecting themselves",
    ending: "By the time it crawled into the light, the beast looked less like a monster than a pet the city had overfed."
  },
  "Nia Bell's Confession": {
    mode: "personal testimony",
    setting: "the center of the Hall, stripped of organs, titles, offices, and safe distances",
    witness: "Davi Bell, not alive, not dead, but present in the way an unanswered question is present",
    object: "Davi's red scarf, still smelling faintly of bus heat and rain",
    pressure: "Nia's survival bargain and the silence she had mistaken for protection",
    davi: "He had asked her to drive the night he vanished, and she had said no because Miko had a fever and because she was tired of being brave for men who called it principle.",
    miko: "Miko took her hand instead of asking a question, which was worse.",
    turn: "the route map opened inside her chest and every stop became one place she had chosen not to look",
    ending: "Nia did not save the city by confessing. She stopped letting the city hide behind her endurance."
  },
  "The Strike of the Body": {
    mode: "collective refusal",
    setting: "every stair, platform, ward, kitchen, depot, corridor, and loading bay where the Feet had been expected to continue",
    witness: "the cleaners, drivers, nurses, porters, cooks, mothers, couriers, guards, and children who knew the city's weight by muscle",
    object: "a thousand shoes placed heel-to-wall in the Hall",
    pressure: "the terror that appears when support is withdrawn from what mistook support for obedience",
    davi: "Davi's scarf moved through the crowd from hand to hand until Nia could no longer tell who carried him.",
    miko: "Miko asked if stopping together was still stopping or if it had become a door.",
    turn: "the Feet did not march; they refused, and refusal made more sound than drums",
    ending: "Veyra discovered that a body cannot command the ground beneath it to love pain."
  },
  "The First Mouth Opens": {
    mode: "public speech",
    setting: "a mouth-shaped arch under the Hall, built from bus doors, school gates, broken microphones, and old kitchen tables",
    witness: "the people who had carried language in their bodies because no room had let them speak it aloud",
    object: "a cup of water passed to the first speaker without ceremony",
    pressure: "the difficulty of saying we without letting the powerful borrow the word again",
    davi: "The first story spoken was not Davi's, and Nia was grateful; it meant the room did not exist only for her grief.",
    miko: "Miko asked who would make sure the new mouth did not learn the old accent.",
    turn: "the First Mouth opened and did not begin with a slogan",
    ending: "Speech returned as a public utility, dangerous because it could no longer be privately owned."
  },
  "The New Weight": {
    mode: "terms of return",
    setting: "the scale room after the strike, where the Feather finally cast a shadow",
    witness: "the judges drafting terms that looked less like mercy than maintenance",
    object: "a stone tablet light enough for Miko to lift and too heavy for Veyra to ignore",
    pressure: "the difference between being forgiven and being redesigned",
    davi: "Nia looked for Davi in the new light and found only his scarf folded beside the scale.",
    miko: "Miko asked if a promise weighs anything before somebody keeps it.",
    turn: "the Feather descended not because the city was pure, but because the Feet had been heard",
    ending: "The new weight did not free Veyra from judgment. It taught judgment where to stand."
  },
  "Veyra Wakes": {
    mode: "conditional dawn",
    setting: "surface Veyra, where commuters found damp footprints on dry pavement and clocks missing one minute",
    witness: "people who remembered nothing except the feeling that their shoes had argued while they slept",
    object: "a revised bus map showing a stop named First Mouth",
    pressure: "the temptation to call the night a dream so no invoice would arrive",
    davi: "At the depot, Nia found Davi's red scarf folded on the driver's seat, dry at the edges and wet in the middle.",
    miko: "Miko asked if awake means different when you can still choose sleep.",
    turn: "officials denied the undercity while quietly changing every door that opened downward",
    ending: "Morning returned, but innocence did not."
  },
  "The Architecture of Courage": {
    mode: "public room plan",
    setting: "the first room built after the night, ugly, useful, and placed where the Low Steps met the old route",
    witness: "Nia, Miko, Amara, Cassian, Theo, Sera, Brant, Lenora, Mother Elian, and the Feet seated without ranks",
    object: "a brass rule fixed into the floor: every law must be spoken where it will be carried",
    pressure: "the labor of turning confession into design before confession becomes theatre",
    davi: "Davi's scarf was not displayed. Nia kept it in her bag because grief should not have to become a flag to be honored.",
    miko: "Miko asked whether courage needed walls or only people who stopped leaving.",
    turn: "the room's doors opened first toward those who had always entered last",
    ending: "Veyra was not saved. It had been given a place to practice being less afraid."
  }
};

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
    `summary: "${escapeYaml(summaryFor(chapter, index))}"`,
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
  const profile = chapterProfiles[chapter.title];
  if (!profile) throw new Error(`Missing chapter profile for ${chapter.title}`);
  const prev = chapters[index - 1];
  const next = chapters[index + 1];

  if (index <= 2) {
    return buildSurfaceChapter(chapter, profile, next, index).join("\n\n");
  }

  if (index >= 24) {
    return buildDawnChapter(chapter, profile, prev, index).join("\n\n");
  }

  const paragraphs = [];

  paragraphs.push(chapter.opener);
  addOpeningScene(paragraphs, chapter, profile, index);
  addChapterForm(paragraphs, chapter, profile);
  addConfrontation(paragraphs, chapter, profile, index);
  addExtendedScene(paragraphs, chapter, profile, index);
  addContinuityThreads(paragraphs, chapter, profile, prev, next, index);
  addWeighing(paragraphs, chapter, profile, index);
  addModeVariation(paragraphs, chapter, profile, index);
  addEscalationScene(paragraphs, chapter, profile, index);
  addClosingMovement(paragraphs, chapter, profile, next, index);

  return paragraphs.join("\n\n");
}

function buildSurfaceChapter(chapter, profile, next, index) {
  const paragraphs = [];
  const [label, text] = chapter.interstitial;
  const surfaceTextures = [
    "rain gathered along the curb in thin black ropes",
    "the towers held their lights as if light were proof of innocence",
    "a siren opened in the distance and then seemed to forget why it had begun"
  ];

  paragraphs.push(chapter.opener);
  paragraphs.push(
    `The night stayed above ground. No court had opened yet, no feather had appeared, no organ had been named. There was only ${profile.setting}, and the city doing what cities do best: making pressure look like schedule.`
  );
  paragraphs.push(
    `Nia knew Veyra by route before she knew it by philosophy. She knew which stop smelled of bleach over damp coats, which crossing made passengers touch their bags, which tower emptied workers after midnight, which public bench had been designed to make rest feel like trespass.`
  );
  paragraphs.push(
    `The object was still only ${profile.object}. It had not become evidence. It had not become symbol. It sat where ordinary things sit before catastrophe teaches everyone their weight.`
  );
  paragraphs.push(
    `Above ground, the city had a talent for making moral events look logistical. A closed clinic became scheduling pressure. A delayed bus became traffic management. A locked gate became safeguarding. A missing brother became a private matter. The surface of Veyra was a grammar lesson in how to remove the actor from the wound.`
  );
  paragraphs.push(
    `Nia had learned that grammar without knowing its name, long before ${profile.object} began to trouble the night. She used it when passengers asked questions she could not answer. She used it when Miko asked why the route changed after complaints from the glass towers but not after complaints from the Low Steps. She used it because plain truth would have required action, and action had rent due on Friday.`
  );
  paragraphs.push(
    `That was the city's first mercy and first crime: it let people survive by speaking less than they knew. Nobody had to become a monster. They only had to become tired at the correct hour, professional in the correct tone, grateful for half-measures, and afraid of what honesty might cost before breakfast.`
  );
  paragraphs.push(
    `This was why the night of ${chapter.title} felt ordinary until it did not. Nothing in Veyra ever announced itself as moral collapse. It arrived as policy, weather, funding constraint, staff shortage, parental concern, business confidence, necessary delay. The city had made a civilization out of phrases that asked the wounded to wait politely while the powerful prepared better language.`
  );
  paragraphs.push(`> **${label}:** ${text}`);
  paragraphs.push(
    `The notice passed through the city with the calm of official language. That calm was part of its violence. In Veyra, an emergency always learned to dress itself as information before anyone could call it a demand.`
  );

  if (index === 0) {
    paragraphs.push(
      `Mrs. Havel boarded with clean uniforms folded so carefully they looked ceremonial. Nia had seen those uniforms every night for months. She had never asked why the son no longer collected them himself. A route gives privacy to pain because otherwise no one would survive the ride.`
    );
    paragraphs.push(
      `Miko sat behind the driver shield with a damp transfer ticket in his hand, trying to rub the ink back into legibility. He asked why the important people had billboards and the tired people had benches. Nia told him to lower his voice, then hated herself for teaching him scale as caution.`
    );
    paragraphs.push(
      `Davi used to say the city told the truth in exits. Watch who runs, he told her. Watch who leaves without looking back. Watch who has a door held open and who has to become narrow enough to pass. Nia had learned the lesson too well and not well enough.`
    );
  } else if (index === 1) {
    paragraphs.push(
      `Amara Vale could make a city sound held even while it was breaking. She had built a career on that talent: not lying exactly, not telling exactly, shaping panic into phrases that could pass through microphones without drawing blood.`
    );
    paragraphs.push(
      `Her aides moved around her with tablets and bottled water. One suggested shared grief. Another suggested unprecedented challenge. A third removed the phrase preventable harm because it made the sentence walk too near a courtroom.`
    );
    paragraphs.push(
      `She looked at the word resilience until it stopped meaning strength and began meaning permission. Somewhere below her office, people were still waiting for buses that had already been cancelled in language too soft to bruise anyone powerful.`
    );
  } else {
    paragraphs.push(
      `The stillness began without drama. A woman in a bakery paused with both hands inside flour. A boy in a stairwell stopped between one step and the next. A guard raised a paper cup to his lips and held it there while steam climbed into his face and vanished.`
    );
    paragraphs.push(
      `No one saw the whole city stop. That was the mercy and the horror. Each person received only their portion of impossible: one breath withheld, one train halted, one screen gone dark, one body suddenly aware that it had been carrying more than itself.`
    );
    paragraphs.push(
      `Miko watched a woman on the bus freeze between one breath and the next. He did not scream. Children in Veyra learned early that panic is expensive. He looked to Nia instead, and the question in his eyes was older than both of them.`
    );
  }

  paragraphs.push(
    `${sentenceStart(profile.pressure)} had been present before anyone named it. It lived in the way people stepped aside, apologized for needing space, and accepted explanations that always seemed to leave the same bodies paying the balance.`
  );
  paragraphs.push(
    `The city had been rehearsing this night through ${chapter.organ} for years. Every postponed repair was a rehearsal. Every careful euphemism was a rehearsal. Every time a child watched an adult choose safety over truth, the rehearsal entered the blood. What arrived at 3:17 did not come from outside Veyra. It came from the inside reaching the end of concealment.`
  );
  paragraphs.push(
    `And still, for one last minute, people tried to continue. That may have been the saddest evidence of all, and the most human: the body obeying old habit while the soul begins to object.`
  );
  paragraphs.push(
    `Then ${profile.turn}. The change did not explain itself. It did not need to. Explanation would come later, below the foundations, where the city would have no audience to flatter and no cameras to comfort it.`
  );
  paragraphs.push(
    `${chapter.hook} Nia felt the bus answer before the dashboard did: a small shudder, a hardening under the wheels, the sense that every road in Veyra had become a vein leading inward.`
  );
  paragraphs.push(
    `By the time the doors opened onto darkness that had no street name, the city had already begun its descent${next ? ` toward ${next.title.toLowerCase()}` : ""}.`
  );

  return paragraphs;
}

function buildDawnChapter(chapter, profile, prev, index) {
  const paragraphs = [];
  const [label, text] = chapter.interstitial;
  const dawnTerms = [
    "No speech could be made until the speaker stood on the floor that would carry the policy.",
    "No budget could be passed until the Feet named the weight it created.",
    "No reform could be announced before the route, the ward, the school, and the kitchen had answered where the cost would land.",
    "No memorial could be unveiled until the living consequence had been funded.",
    "No official could say resilience without naming what had made resilience necessary."
  ];

  paragraphs.push(chapter.opener);
  paragraphs.push(
    `The trial had ended, but judgment had not become history. It had become architecture. Veyra returned above ground with its old skyline intact and its old innocence missing.`
  );
  paragraphs.push(
    `The morning did not forgive the city. It exposed it. Windows opened onto streets that looked almost familiar: the same balconies, the same traffic lights, the same coffee steam, the same tired workers moving toward doors. But every ordinary thing now seemed to be asking who had been carrying it.`
  );
  paragraphs.push(`> **${label}:** ${text}`);
  paragraphs.push(
    `The notice was posted not as ceremony but as instruction. People read it twice because the first reading sounded impossible and the second sounded embarrassingly simple. Veyra had lived for years as if courage were a private virtue. Now courage had to become a room, a route, a rule, a chair placed where the wrong person could not be ignored.`
  );
  paragraphs.push(
    `Nia walked through the altered city with Miko beside her and Davi's scarf in her bag. She did not display it. Grief should not have to become a flag to be honored. The city owed Davi more than symbolism, and the first honest payment was not a statue. It was a reopened file, a named sequence of decisions, and a public record no office could seal by calling it painful.`
  );
  paragraphs.push(
    `The record did not resurrect him. Nia did not ask it to. What it did was smaller and more civic: it stopped using uncertainty as a vault. It placed dates beside names, signatures beside consequences, doors beside the hands that locked them. For the first time, Davi's absence had a public address.`
  );
  paragraphs.push(
    `The Feet did speak now, not as metaphor, but as procedure inside the altered city. Their testimony changed the order of rooms. Maintenance workers entered before consultants. Drivers spoke before transit executives. Nurses spoke before hospital boards. Students spoke before metrics. Tenants spoke before renderings. The city did not become pure. It became harder to lie in comfortably.`
  );
  paragraphs.push(
    `That discomfort mattered after the evidence entered civic memory. Veyra had always preferred inspiration because inspiration asks little after applause. Procedure was less glamorous and more dangerous. Procedure stayed after the cameras left. Procedure decided who sat near the door, who could interrupt, which budget line carried the wound, and what happened when an official called the wound unfortunate instead of designed.`
  );

  dawnTerms.forEach((term, termIndex) => {
    if ((termIndex + index) % 2 === 0) {
      paragraphs.push(term);
    }
  });

  paragraphs.push(
    `The changes looked almost embarrassingly practical. Bus schedules were rewritten around hospital shifts and school dismissals, not investor breakfasts. Public hearings moved from marble rooms to the districts whose names had been used in speeches. Emergency funds could no longer be announced without a maintenance plan. The city began to discover how much cowardice had been hiding inside convenience.`
  );
  paragraphs.push(
    `Some people called the new rules punitive. Nia understood why. Accountability always feels like punishment to those who had mistaken exemption for balance. But the rules did not ask anyone to suffer for symbolism. They asked each function to stand close enough to its consequence that imagination could no longer do the work of denial.`
  );
  paragraphs.push(
    `The first arguments against the new city came dressed as realism, especially whenever ${profile.pressure} threatened old habits. They said the rooms would slow decisions, that consultation would become theater, that markets disliked uncertainty, that children needed aspiration more than grievance, that memory could not be allowed to govern. Nia heard the old city breathing inside each objection. The words had survived the night more easily than the bodies had.`
  );
  paragraphs.push(
    `So the new architecture included friction on purpose. A good room, Mother Elian said, should make cowardice inconvenient. A good route should make disappearance difficult. A good school should make sorting harder than teaching. A good budget should show where the pain travels before it asks anyone to applaud.`
  );
  paragraphs.push(
    `There were failures before noon. A councilor tried to speak from the balcony and was sent to the floor. A developer used the word underused and three tenants asked him to name who had used the place to survive. A principal praised excellence and a child asked what excellence ate for breakfast. The room did not make anyone virtuous. It made evasion audible.`
  );
  paragraphs.push(
    `That was enough for a beginning. Not enough for peace. Enough for the next honest demand, and enough to keep the old city from sleeping easily.`
  );

  paragraphs.push(
    `The central evidence was fixed into the new civic memory. It was not treated as decoration. It was treated as a hinge. Whenever an office tried to turn pain into a slogan, the hinge creaked. Whenever a committee tried to move without the Feet, the floor answered.`
  );
  paragraphs.push(
    `Miko asked whether courage needed walls or only people who stopped leaving. Nia told him both, because people get tired and walls remember badly designed cowardice. The answer did not satisfy him. That was good. A city deserved children whose questions outlived its public relations.`
  );
  paragraphs.push(
    `Amara lost the right to speak first. Cassian lost the right to call extraction vision. Lenora lost the right to celebrate a few rescued children while hiding the sorted many. Theo lost the right to make suffering wait for vocabulary. Brant lost the right to confuse control with protection. Sera lost the right to need the wound open. Each kept a function. Each lost a hiding place.`
  );
  paragraphs.push(
    `Nia did not confuse this with salvation. She had driven too many dawn routes for that. Dawn is not proof that night has been defeated. Dawn is only the hour when neglected things become visible again and people decide whether to pretend surprise.`
  );
  paragraphs.push(
    `${profile.ending} Around that sentence, Veyra changed in small, inconvenient ways. A bench was moved into shade. A school report gained a hunger line. A contract named displacement as cost, not weather. A police corridor lost a locked door. A mural gained the names of tenants who had been painted out.`
  );
  paragraphs.push(
    `${chapter.hook} It did not feel like an ending. It felt like the first honest morning after a long performance of sleep.`
  );
  paragraphs.push(
    `The previous chamber had left something behind${prev ? `: the pressure of ${prev.organ} refusing to vanish` : ": the memory of weight asking to be carried differently"}. The new room answered with practice. Not promise. Practice. The city would have to keep choosing the floor over the balcony, the name over the category, the body over the speech, the Feet over the fantasy that power can float.`
  );

  return paragraphs;
}

function addOpeningScene(paragraphs, chapter, profile, index) {
  paragraphs.push(
    `The scene gathered around ${profile.setting}. Nothing announced itself as allegory. The lights had their own tired color, the floor kept the print of ordinary shoes, and the air carried the sour mix of rain, coffee, fear, soap, metal, old paper, and money trying to smell clean.`
  );
  paragraphs.push(
    `The witness was ${profile.witness}, close enough to be mistaken for background. Veyra had made an art of backgrounding people. It put them beside doors, behind counters, below platforms, inside kitchens, under uniforms, on night shifts, at the edge of photographs, and then called the picture complete.`
  );
  paragraphs.push(
    `The object was ${profile.object}. It appeared before anyone admitted needing it. The Hall had a talent for small evidence. It did not begin with thunder when a receipt would do. It did not summon a crowd when one lost thing could make the whole room feel accused.`
  );
  paragraphs.push(
    `Nia noticed how the presence of ${profile.object} changed the temperature of the place. On the bus, forgotten things cooled quickly. In the Hall, they warmed, as if every hand that had carried them returned for a second and refused to be counted as absence.`
  );
  paragraphs.push(
    `The official purpose of ${chapter.organ} was simple enough to teach. ${chapter.function} In a schoolbook it would have looked clean. In a budget hearing it would have sounded necessary. In a campaign speech it would have drawn the soft applause people give when they want goodness without interruption.`
  );
  paragraphs.push(
    `But the Hall did not ask what ${chapter.organ} looked like in its own literature. It asked where the weight went when the function became frightened. It asked what happened when usefulness learned vanity, when protection learned appetite, when peace learned cowardice, when memory learned obedience.`
  );
  paragraphs.push(
    `Nia had learned, in places like ${profile.setting.split(",")[0]}, to distrust rooms that made harm sound accidental. She had heard too many passengers apologize for needing help, too many officials apologize for delays they had designed, too many tired people thank the city for giving back half of what it had taken.`
  );
  paragraphs.push(
    `That was why ${profile.pressure} did not feel like a theme to her. It felt like a weather system she had driven through for years without owning the language to name it. The Hall did not give her language gently. It placed the words in her path and waited for her to step on them.`
  );
}

function addChapterForm(paragraphs, chapter, profile) {
  const [label, text] = chapter.interstitial;
  const forms = {
    "bus log": `> **Driver's Log:** Last northbound passenger boarded without fare. Driver noted distress, did not initiate welfare stop. Route continued.`,
    "press prep": `> **Press Prep Margin:** Avoid culpability verbs. Prefer shared pain, recovery, review, partnership, resilience.`,
    "city chorus": `> **Civic Autopsy Note:** Time of collapse cannot be isolated. The failure appears distributed through habit.`,
    "court descent": `> **Hall Inscription:** No office enters first. No wound enters last. All functions stand where the Feet can hear them.`,
    "language hearing": `> **Speech Archive:** We regret the pain experienced by affected communities. The archive marks the sentence as grammatically intact and morally void.`,
    "route testimony": `> **Lost Property List:** Red scarf, one school shoe, folded summons, unopened medicine, photograph of two brothers at the river wall.`,
    "anatomy lesson": `> **Anatomy Plate:** Roads are veins when they carry life. They are scars when they carry only extraction.`,
    "market temptation": `> **Procurement Note:** Displacement projected as temporary. Temporary defined as longer than memory and shorter than accountability.`,
    "surveillance sorting": `> **Risk Dashboard:** Red district. Amber household. Green donor corridor. Model confidence high. Human review unnecessary.`,
    "seminar collapse": `> **Panel Schedule:** Lived experience, eight minutes. Theoretical response, forty-five minutes. Lunch sponsored by Renewal Partners.`,
    "force corridor": `> **Training Memo:** De-escalation begins after control is established. Control is undefined but measurable by silence.`,
    "prayer bulletin": `> **Prayer Bulletin:** Blessed are the peacemakers. Addendum missing: peace without justice is only quiet with witnesses.`,
    "hospital shift": `> **Ward Note:** Patient asked whether the factory siren would count as medical history. Form contained no box for the question.`,
    "branding tour": `> **Ribbon-Cutting Script:** Mention heritage. Avoid tenants. Smile toward mural. Do not enter rear stairwell.`,
    "archive fragments": `> **Archive Slip:** Davi Bell. Status unresolved. File active. Inquiry closed. Contradiction preserved.`,
    "livestream fever": `> **Stream Caption:** FIRE IN THE CITY. Link in bio for shirts, donations, and premium access to the after-panel.`,
    "worker procession": `> **Maintenance Alert:** Elevators, kitchens, wards, depots, classrooms, and loading bays report unexplained absence of support.`,
    "paired cross-examination": `> **Cross-Examination Exhibit:** One sentence signed by a mayor, countersigned by a developer, paid for by someone not invited to read it.`,
    "evidence replay": `> **Replay Note:** Footage slowed to the interval between suspicion and impact. Audio includes one command, two breaths, no apology.`,
    "outrage market": `> **Vendor Receipt:** Two banners, one grief license, twelve candles, expedited shipping. Courage not included.`,
    "beast chamber": `> **Feeding Record:** The Animal accepts unfinished sentences, respectable panic, inherited incentives, and any fear dressed as policy.`,
    "personal testimony": `> **Route N17 Witness Addendum:** Driver Bell withheld one truth for reasons the Hall recognizes and does not excuse.`,
    "collective refusal": `> **Service Notice:** The body is unavailable for further carrying until weight is redistributed.`,
    "public speech": `> **Public Room Rule:** Speak from the place where your words will land. If you cannot stand there, wait.`,
    "terms of return": `> **Terms of Return:** No promise may be announced until the Feet can name the floor beneath it.`,
    "conditional dawn": `> **Morning Bulletin:** Normal service resumes with one missing minute, revised routes, and reports of damp footprints in sealed rooms.`,
    "public room plan": `> **Opening Notice:** All speakers must stand where the Feet can hear them. No exception for title, wealth, office, grief, or fame.`
  };

  paragraphs.push(forms[profile.mode] ?? `> **${label}:** ${text}`);
  paragraphs.push(
    `The fragment did not behave like decoration. It entered the record around ${chapter.organ} and changed the air. People in Veyra were accustomed to documents that protected power from consequence. The Hall used documents differently. It let a memo become a door, a note become a witness, a form become a body.`
  );
  paragraphs.push(
    `Nia read the ${label} twice. The first reading gave her information. The second gave her shame, not because she had written it, but because she recognized the kind of room that could produce it. Veyra had many such rooms: bright enough to work in, narrow enough to hide in, furnished by people who believed themselves decent.`
  );
}

function addConfrontation(paragraphs, chapter, profile, index) {
  const judgePrompts = [
    "The Listener asked for the first word that had been removed.",
    "The Old Woman with Bread asked who had eaten before the meeting began.",
    "The Architect Without Hands asked which wall had been designed to look like weather.",
    "The Child Without Shoes asked why every answer arrived wearing shoes.",
    "The Recorder of Weight asked for the name of the person who paid the difference."
  ];
  const prompt = judgePrompts[index % judgePrompts.length];

  paragraphs.push(
    `When ${chapter.organ} answered, it began with its cleanest defense: "${chapter.defense}" The words did not sound absurd. That made them dangerous. A ridiculous lie dies quickly; a useful half-truth can be promoted, funded, blessed, taught, defended, and inherited.`
  );
  paragraphs.push(
    `${prompt} The question touched the evidence at the center of the room: ${profile.object}. It seemed to remember more than the room wanted. In Veyra, evidence usually waited for permission. Here, it waited for weight.`
  );
  paragraphs.push(
    `${chapter.transformation} The transformation did not beautify the scene. It exposed the machinery under it. The walls refused metaphor and became instruments: not symbols of guilt, but tools for making guilt measurable.`
  );
  paragraphs.push(
    `${chapter.exposure} The exposure moved through the witnesses unevenly. Some flinched as if named. Some stiffened, offended by the suggestion that good intentions could have bad architecture. Some looked relieved because the thing they had carried alone had finally developed a public shape.`
  );
  paragraphs.push(
    `The Animal Under the Table stirred when ${profile.pressure} entered the air, but not always in hunger. Sometimes it sounded like grief. Sometimes like laughter. Sometimes like the private satisfaction of an excuse that had survived another committee. It loved unfinished truth most of all.`
  );
  paragraphs.push(
    `Nia watched the witness, ${profile.witness}, and understood that the witness was not there to create a villain. The Hall had no shortage of villains if it wanted them. It wanted something harder: the exact path by which ordinary usefulness becomes organized harm.`
  );
  paragraphs.push(
    `That path through ${chapter.organ} was never a straight line. It passed through budget pressure, family fear, professional pride, donor lunch, exhausted staff, public panic, religious language, academic caution, union rules, liability training, slogans, cameras, and the little bodily fatigue that makes a person sign what they once would have questioned.`
  );
  paragraphs.push(
    `"${chapter.confession}" The confession landed without music. Real confession rarely sounds like theatre. It usually sounds like somebody finally choosing the shorter sentence after years of ornate escape.`
  );
  paragraphs.push(
    `The Feather answered ${chapter.organ} by remaining itself. That was the part no one could bear. It did not accuse by shouting. It accused by requiring less performance than everyone had prepared.`
  );
}

function addExtendedScene(paragraphs, chapter, profile, index) {
  const civicRooms = [
    "a permit office with plastic plants and a cracked number screen",
    "a clinic corridor where the vending machine hummed louder than the nurses",
    "a school entrance where parents learned to make hope look punctual",
    "a tribunal waiting room with chairs bolted against the wall",
    "a redevelopment showroom smelling of glue, money, and new carpet",
    "a depot break room where drivers slept upright under old route maps",
    "a church basement with soup cooling beside a donation tin",
    "a surveillance annex lit by blue screens and cold takeaway boxes",
    "a riverside loading bay where forklifts moved through fog before dawn"
  ];
  const room = civicRooms[index % civicRooms.length];
  const bodilySigns = [
    "her left knee began to ache, the old ache from braking too quickly on wet roads",
    "the skin under her collar prickled as if a camera had learned her name",
    "her throat tightened around all the careful sentences she had swallowed",
    "her palms smelled of bus rail and old coins",
    "her stomach dropped with the slow knowledge of a fare she could not pay",
    "her breath shortened, then steadied when Miko leaned against her"
  ];
  const bodySignal = bodilySigns[index % bodilySigns.length];
  const counterVoices = [
    "a clerk who had once wanted to be gentle",
    "a supervisor who kept a photograph of two daughters beside a stack of refusals",
    "a student who had learned which adults liked courage only in speeches",
    "an officer who still remembered the first order that embarrassed him",
    "a planner who loved beautiful streets and feared the people already living on them",
    "a nurse who could measure oxygen faster than she could measure grief"
  ];
  const counterVoice = counterVoices[index % counterVoices.length];

  paragraphs.push(
    `The Hall widened around ${chapter.organ} and became ${room}. The change was too exact to be theatrical. The scratches on the counter were where anxious rings had worried the laminate. The taped sign had curled at one corner. A pen on a chain lay dead beside a form whose boxes were smaller than any life that might need them.`
  );
  paragraphs.push(
    `Nia knew that kind of room, especially when it wore the particular smell of ${room} and called itself necessary to ${chapter.organ}. Every city has such rooms. They are built for ordinary humiliation, which is why they rarely look cruel. Their cruelty is procedural, upholstered, fluorescent, mildly apologetic. A person can be reduced there without anyone raising a voice.`
  );
  paragraphs.push(
    `Across the room, inside the inquiry into ${chapter.organ}, stood ${counterVoice}. The Hall did not make this person monstrous. It did something more frightening: it made them tired, competent, and almost sympathetic. Nia could see the day pressing on their shoulders. She could see the little private griefs they carried into public power.`
  );
  paragraphs.push(
    `That was where Veyra hid its sharpest blade, not in the spectacular cruelty of ${chapter.organ}, but in the ordinary delegation of it. It put wounded people in positions where their wounds could become procedure. It put frightened people behind desks where fear could become policy. It put ambitious people near suffering and taught them to call distance professionalism.`
  );
  paragraphs.push(
    `Nia felt her own body answer to ${chapter.organ} and to ${profile.object}; ${bodySignal}. The Hall had begun translating civic truth into nerve, breath, and muscle. It did not allow her to think about the city only with her mind. Veyra had never been only an idea. It had always been a set of pressures applied to bodies until bodies changed shape.`
  );
  paragraphs.push(
    `${sentenceStart(profile.object)} moved to the center of ${room}. Nobody touched it, yet everyone adjusted around it. That was how guilt behaved when it became visible. It rearranged posture before it rearranged law. It made hands seek pockets. It made eyes study floors. It made people remember appointments they suddenly needed to keep.`
  );
  paragraphs.push(
    `The witness, ${profile.witness}, did not accuse at first. Accusation would have given the room a shape it understood. Instead, the witness described a Tuesday: the time, the queue, the rain, the form, the missing signature, the child asleep standing up, the official apology, the second queue, the last bus gone.`
  );
  paragraphs.push(
    `That plain Tuesday was more devastating than rage. Rage could be categorized. Rage could be scheduled for response. A Tuesday shaped by ${profile.pressure} was harder to dismiss because every listener had survived one, caused one, and forgotten one. The Hall let it grow until it filled the chamber wall to wall.`
  );
  paragraphs.push(
    `The representative of ${chapter.organ} looked smaller inside the Tuesday. Not weaker, exactly. More accurately placed. Above ground, titles distort distance. They make a person seem far from what their decisions touch. Below the foundations, distance collapsed. A signature had to stand beside a blister.`
  );
  paragraphs.push(
    `Miko watched ${chapter.organ} look smaller inside the collapse, his mouth slightly open. Nia saw him learning something she did not want him to learn and something he needed to know anyway: that adults often use complexity to postpone tenderness. He would have to become wise without becoming cynical. She hated the city for making that a childhood assignment.`
  );
  paragraphs.push(
    `The Hall asked no one to hate function. That mattered. Without ${chapter.organ}, the city would not live rightly; without its honest work, people would suffer in different ways. The indictment was not against purpose. It was against the moment purpose allowed itself to be rented by fear, vanity, appetite, or convenience.`
  );
  paragraphs.push(
    `For a breath, Nia could imagine the function restored. She saw ${chapter.organ} doing what it had been meant to do: not as a slogan, not as a grant proposal, not as a mural, but as relief arriving on time. The vision hurt because it was not impossible. Impossible things rarely wound as deeply as possible things refused.`
  );
  paragraphs.push(
    `Then ${room}, forced to answer for ${chapter.organ}, answered the refusal. The taped sign blackened. The chained pen stood upright like a little flag. The number screen called names instead of numbers, and several officials flinched because names made delay indecent.`
  );
  paragraphs.push(
    `Nia thought of the first time Davi taught her to drive the route after midnight, long before the Hall would use ${profile.object} to return his lesson to her in this strange room. He had told her not to look only at the road. Watch the windows, he said. Watch the way people leave buildings. Watch who runs and who walks like running would insult them. A city tells the truth in exits.`
  );
  paragraphs.push(
    `Now every exit in ${room} had vanished except the one through the confession of ${chapter.organ}. The organ did not have to be destroyed. It had to pass through what it had made others pass through: waiting, naming, exposure, and the loss of a private door.`
  );
  paragraphs.push(
    `The hardest part, with ${profile.object} holding the room in place, was that no one could honestly say they had never benefited from such a door. Nia had used small exits too: a uniform, a lowered gaze, a schedule, motherhood, exhaustion, the old right to say she had done enough for one night. The Hall did not flatten her with the officials. It simply refused to let pain become a permanent exemption from responsibility.`
  );
  paragraphs.push(
    `This was why ${profile.pressure} cut deeper after the witness finished. It was no longer an argument about city design. It was a question of habit. Where had each person learned to step aside? Whose inconvenience had become acceptable? Which small cruelty had become normal because the day was long and the next bus was coming?`
  );
  paragraphs.push(
    `Miko looked from the witness to Nia, then back to ${profile.object}. He did not understand the entire system. That was almost a blessing. He understood enough to know that adults had built something complicated and were now asking children to admire the complexity.`
  );
}

function addContinuityThreads(paragraphs, chapter, profile, prev, next, index) {
  const routeStops = [
    "Prison Road",
    "Mercy Hospital",
    "Parliament Hill",
    "River Market",
    "Glass Mile",
    "Old Foundry",
    "Low Steps",
    "Saint Orra's School",
    "North Depot"
  ];
  const stop = routeStops[index % routeStops.length];

  paragraphs.push(profile.davi);
  paragraphs.push(
    `Davi never stayed neatly inside memory. He came back through objects and overheard words, and now ${profile.object} had joined that private archive. A scarf. A cough. A joke about cranes. A complaint form. A face in a security corner. Nia had tried to keep him private because public grief in Veyra was always in danger of being harvested. The Hall did not harvest him. It returned him with interest.`
  );
  paragraphs.push(
    `The N17 stop nearest this chamber of ${chapter.organ} would have been ${stop}. Nia knew the stop by smell before she knew it by sign. Every district had a scent it could not afford to advertise: bleach over damp, fried oil over hunger, perfume over mold, hot metal over overtime, river wind over old money.`
  );
  paragraphs.push(
    `${profile.miko} He did not ask it loudly. Children in Veyra learned volume as a survival calculation. Too quiet and nobody heard you. Too loud and someone called you the problem. Miko had inherited that arithmetic before he could multiply.`
  );
  paragraphs.push(
    `Nia wanted to protect him from the answer taking shape around ${chapter.organ} and ${profile.object}. That was motherhood inside Veyra: not the sweet fantasy of shelter, but the daily editing of terror into something a child could carry without becoming old too fast. She had failed some days. The Hall was merciless enough to show her that failure and merciful enough not to call it the whole of her.`
  );
  paragraphs.push(
    `The previous chamber had left something physical behind${prev ? `: a trace of ${prev.organ} in the corners of the room` : ": the smell of wet vinyl and brake dust"}. The next pressure had already begun to gather${next ? `, not as a title, but as the particular unease of ${next.organ}` : ", not as another trial, but as the possibility of practice"}. Veyra's parts did not sin alone; they borrowed language, money, force, beauty, fatigue, and silence from one another.`
  );
  paragraphs.push(
    `That was why Nia kept looking at the floor near the imagined route to ${stop}, while ${chapter.organ} learned what floors remember. The floor was the only honest historian in the room. It remembered who stood comfortably, who shifted weight from one sore leg to another, who had shoes made for marble, who had shoes made for rain, and who had no shoes at all.`
  );
}

function addWeighing(paragraphs, chapter, profile, index) {
  const weighingMoves = [
    "The scale clicked once, softly enough to be mistaken for a lock giving up.",
    "The left pan descended by the width of a fingernail, and half the room breathed as if a verdict had already arrived.",
    "The Feather trembled without rising, the way a witness trembles before deciding not to lie.",
    "A seam opened in the floor and closed again, too quickly for anyone innocent to notice.",
    "The Recorder dipped its pen and waited, because ink was cheaper than truth and often confused for it."
  ];
  const move = weighingMoves[index % weighingMoves.length];

  paragraphs.push(move);
  const usefulnessTests = [
    `The Hall did not ask whether ${chapter.organ} had ever done good. That would have been too easy. Of course it had. The harder question was whether usefulness had become an alibi for what it made others carry.`,
    `${sentenceStart(chapter.organ)} could point to real service, real emergencies, real moments when the body would have suffered without it. The Hall allowed all of that into evidence, then asked where the unpaid weight had gone.`,
    `No one in the chamber was permitted the childish comfort of total condemnation. ${sentenceStart(chapter.organ)} had served the city and harmed it. The scale cared about the relation between those facts.`,
    `The question was not whether the city needed ${chapter.organ}. It did. The question was whether need had been used to excuse appetite, fear, vanity, fatigue, or profitable delay.`
  ];
  paragraphs.push(usefulnessTests[index % usefulnessTests.length]);
  paragraphs.push(
    `This distinction entered Nia like a splinter during the weighing of ${chapter.organ}, especially with ${profile.object} in view. She had spent years judging herself for not being braver, then judging herself for judging herself, then getting up at four-thirty anyway because Miko needed breakfast and the route did not care about philosophy. The Hall did not romanticize endurance. It placed endurance on the scale and asked who had spent it.`
  );
  paragraphs.push(
    `${sentenceStart(profile.turn)}. The change altered the witnesses differently. Those who had benefited from the old shape called it chaos. Those who had survived the old shape recognized the first honest weather they had felt in years.`
  );
  paragraphs.push(
    `${sentenceStart(chapter.organ)} tried one more refinement. It did not repeat the first defense. It reached for a subtler one, the kind Veyra trusted most: limited resources, complex realities, imperfect choices, inherited conditions, competing priorities. None of those phrases were false. The Hall let them stand, then asked why they always seemed to mature into demands on the same bodies.`
  );
  paragraphs.push(
    `For a moment, the accusation narrowed around ${profile.object}. It stopped being about all of Veyra and became one person at one counter, one hand over one mouth, one door closing at five, one form returned for a missing line, one bus pulling away while somebody ran behind it with a bag breaking open.`
  );
  paragraphs.push(
    `Nia had missed that runner once near ${profile.setting.split(",")[0]}. She remembered it now with insulting clarity: the slap of palm against glass, the white burst of receipts in the rain, her own hand lifting in apology while her foot obeyed the schedule. She had not done wrong exactly. That was the worst of it. The city had taught her to hurt people without becoming a person who wanted to.`
  );
  paragraphs.push(
    `The Hall gave no applause for insight, not even when ${chapter.organ} had run out of language. It required use. A truth that did not change where weight rested was only a more elegant ceiling. Veyra had many elegant ceilings. The Feet had spent generations beneath them.`
  );
}

function addModeVariation(paragraphs, chapter, profile, index) {
  const variantCount = [0, 1, 0, 2, 1, 2][index % 6];
  if (variantCount === 0) return;

  const fragments = [
    `Nia noticed who refused to look at ${profile.object}. Refusal had its own choreography: the careful sleeve adjustment, the cough, the sudden interest in ceiling cracks, the little nod people give when they hope seriousness will be mistaken for innocence. She had seen the same dance on the bus whenever a passenger collapsed and everyone waited to see who would become responsible first.`,
    `The Hall let the pause lengthen until it became another witness. In that pause, ${profile.witness} changed from evidence into personhood. The difference mattered. Evidence can be filed away. Personhood keeps breathing after the folder closes, keeps needing food, keeps remembering the exact tone of the voice that said there was nothing more to be done.`,
    `Somewhere above them, Veyra still had its slogans bolted to public walls. Build Together. Share the Future. One City. Nia could almost laugh at them now, not because the words were evil, but because they had been left unattended too long. Even beautiful words grow mold when no one cleans the room where they are spoken.`,
    `The representative of ${chapter.organ} looked toward the exit that was no longer there. Nia recognized the look. It was the expression of a person who had mistaken explanation for movement. Above ground, explanation could carry you through a scandal, an inquiry, a long evening with cameras outside. Below ground, explanation had no legs.`,
    `Miko traced a line near ${profile.object} with the side of his shoe. The mark was crooked, then straighter, then crooked again. Nia almost told him to stop making a mess before she remembered where they were. The city had made a mess large enough to bury itself. A child's line in the dust was not the problem.`,
    `That was when ${profile.pressure} became visible not as accusation but as design. Design was worse. An accusation can be denied by someone with enough stamina. Design continues after the denier sleeps. Design trains the next person, welcomes the next excuse, and calls the repetition tradition.`
  ];

  for (let offset = 0; offset < variantCount; offset += 1) {
    paragraphs.push(fragments[(index + offset) % fragments.length]);
  }
}

function addEscalationScene(paragraphs, chapter, profile, index) {
  const variants = [
    `The witness did not merely answer ${chapter.organ}; the witness altered who had permission to feel central. That was the hidden violence of Veyra's old order: it trained the harmed to appear as context while the comfortable appeared as plot. In this chamber, ${profile.object} reversed the arrangement. The background moved forward, and every polished explanation had to step back.`,
    `A smaller trial unfolded inside the larger one. It involved no judges, only posture. People who had entered with shoulders squared began to lean toward ${profile.witness}; people who had entered already tired found a little dangerous height in their spines. Nia saw it and understood why power fears rearranged rooms. Before law changes, distance changes.`,
    `For the first time, ${chapter.organ} had to hear itself without the echo of its own importance. Its language sounded different when it crossed the space between ${profile.setting} and the person made to pay for it. The sentence did not become false. It became located, and location was the beginning of judgment.`,
    `The chamber kept returning to the same practical question: who had been allowed to call their pressure reality, and who had been told their reality was pressure? Around ${profile.object}, the answer lost its elegance. It became names, shoes, overtime, rent, breath, school forms, bruised wrists, skipped meals, and the little humiliations that make a city feel normal to everyone not paying attention.`,
    `Nia noticed, while ${profile.object} held the room's attention, that nobody in the Hall was asked to be innocent. That would have ruined the work. Innocence is too often a costume worn by people who need history to stop before it reaches their door. The Hall asked for something more useful and more frightening: participation without disguise.`,
    `Miko did not understand the whole machinery, but he understood the room's weather. Children often do. They know when adults are speaking to repair and when adults are speaking to escape. He watched ${chapter.organ} and then watched Nia, measuring whether the grown people would finally do the difficult thing after saying the true thing.`
  ];
  const secondTurns = [
    `That rearrangement was not gentle. People discovered that the place they called neutral had been leaning all along. The lean had a beneficiary, a vocabulary, a funding stream, a costume of common sense. Once named, it could no longer pass as gravity.`,
    `The room did not ask for agreement before changing. Agreement had often been the city's method of delay. It asked for accuracy first, then waited to see who would defend the old blur because the blur had been kind to them.`,
    `Something in Nia eased and tightened at once. She did not want revenge. Revenge was too small for a city this complicated. She wanted the kind of truth that changed where tomorrow's tiredness would land.`,
    `The witnesses began to understand that confession was not the end of a sentence. It was the first verb in a harder grammar. After confession came inventory. After inventory came design. After design came the daily insult of practice.`,
    `Veyra had always loved symbolic repair because symbols could be photographed from a safe distance. This room kept destroying distance. It made the beautiful phrase walk until it reached the person asked to carry it.`,
    `No one in the Hall knew how to leave unchanged. That did not mean they would become better. It meant they would have to work harder to become false in the old way. For a city like Veyra, that was already a form of mercy.`
  ];
  const thirdTurns = [
    `Nia marked the change by breath: who held it, who released it, who seemed surprised to have been breathing borrowed air.`,
    `The Feet registered the shift before anyone else did. The floor took the truth first, as floors often do.`,
    `Miko watched the grown people learn that consequences were not abstractions but rooms with no side door.`,
    `For one strange moment, nobody performed wisdom. They simply stood inside what their wisdom had failed to prevent.`,
    `The Hall allowed the silence to remain rough. Smooth silence had served the city too long.`,
    `A city changes first as pressure, then as rule, then as habit, if anyone survives the embarrassment of beginning.`
  ];

  paragraphs.push(variants[index % variants.length]);
  paragraphs.push(secondTurns[index % secondTurns.length]);
  paragraphs.push(thirdTurns[index % thirdTurns.length]);
}

function addClosingMovement(paragraphs, chapter, profile, next, index) {
  const closingTextures = [
    "dust fell from the ceiling in slow gold threads",
    "black water climbed one stair and stopped",
    "a bell rang without sound in the next room",
    "the bus rail warmed under Nia's hand",
    "the lights blinked in the order of a pulse"
  ];
  const texture = closingTextures[index % closingTextures.length];
  const hookLandings = [
    `The next room did not arrive as suspense. It arrived as consequence.`,
    `No one mistook the movement for drama. It was cost becoming spatial.`,
    `The sentence opened a passage, and the passage had the mood of an invoice.`,
    `Nia did not feel the pull of a story continuing. She felt responsibility boarding again.`,
    `The chamber did not tease the future. It made the next pressure audible.`
  ];
  const childWitness = [
    `Miko stayed close. Nia felt the pressure of his shoulder against her side and understood that the future was not an abstraction. It was a child deciding whether adults would keep using intelligence to avoid courage.`,
    `Miko watched without asking permission to understand. Nia hated that he had to learn this early, and hated more the kind of city that called such learning maturity.`,
    `Miko's hand found Nia's sleeve. That small grip did what the speeches could not: it made the future local, warm, frightened, and impossible to postpone.`,
    `Miko looked less impressed than tired. Nia recognized the expression. Children should not have to become historians of adult evasion, yet Veyra had made it part of their education.`,
    `Miko remained beside her, not as symbol, not as lesson, but as a boy whose life would be shaped by whether the room meant what it had just said.`
  ];
  const feetMemory =
    index >= 16
      ? "The Feet had spoken now, and every stone remembered the sound."
      : "The Feet did not speak yet, but under every stone, under every stair, under every bright room built above another person's tiredness, they remembered pressure.";

  paragraphs.push(
    `${profile.ending} Around that sentence, ${texture}. The chamber did not resolve; it rearranged. Resolution was the habit Veyra loved best because it allowed everyone to leave before repair began.`
  );
  paragraphs.push(
    `${chapter.hook} ${hookLandings[index % hookLandings.length]}`
  );
  paragraphs.push(
    `If there was mercy here for ${chapter.organ}, with ${profile.object} still refusing to disappear, it had teeth. It did not permit the wounded to become pure by being wounded. It did not permit the powerful to become redeemed by sounding sorry. It did not permit the city to become innocent because it had finally found language for its injuries. Mercy meant the body could still be taught where to put its weight.`
  );
  paragraphs.push(
    childWitness[index % childWitness.length]
  );
  paragraphs.push(
    `The witnesses began to move around ${profile.object}, not forward exactly, but out of the posture they had used to survive the hearing. Some carried shame like a tool. Some carried it like a costume. Some left it on the floor and hoped no one would notice. The Hall noticed everything that touched the floor.`
  );
  paragraphs.push(
    `Nia looked once more at ${profile.object}. It did not offer an answer. It offered custody. That was what evidence did when it was honest: it passed itself into the hands of whoever had finally stopped pretending not to see it.`
  );
  paragraphs.push(
    `Then the walls made room for what came next${next ? `, and the air changed toward ${next.organ}` : ", and the room held its breath as if dawn itself had been summoned to testify"}. ${feetMemory}`
  );
}

function summaryFor(chapter, index) {
  if (index <= 2) {
    return `${chapter.pov} moves through ${chapter.place}, as Veyra's surface world reaches the moment before descent.`;
  }
  if (index >= 24) {
    return `${chapter.pov} enters ${chapter.place}, where Veyra turns confession into public architecture and conditional dawn.`;
  }
  return `${chapter.pov} enters ${chapter.place}, where the Hall of Measure tests ${chapter.organ}.`;
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

function sentenceStart(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}
