import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(root, "src", "content", "book-chapters", "the-ok-zone");
const updated = "2026-05-28";

// The OK Zone is generated as a full first-draft manuscript from curated
// chapter definitions. Rerun this extractor only when intentionally rebuilding
// the live draft, because it will overwrite the generated chapter files.

const sections = [
  {
    title: "The Life That Is Good Enough to Cost You Everything",
    subtitle: "Introduction",
    part: "Opening",
    summary:
      "The opening promise: OK is not the same as proud, fulfilled, alive, or honest with your potential.",
    exerciseTitle: "The OK Test",
    exercise:
      "Write down the areas of your life that are OK. For each one, ask: would I deliberately choose this again, or have I simply adjusted to it?",
    takeaway:
      "You do not need a crisis to wake up. You can choose to leave the OK Zone before life forces you out.",
    opening: `If you went on holiday and the resort was OK, would you rush to book the same place next year? Probably not. If you watched a film and it was OK, would you recommend it to your closest friend? Probably not. If you went on a date and the connection was OK, would you feel excited to build a life with that person? Again, probably not.`,
    problem: `Yet many people tolerate an OK life for years. They have an OK job, OK health, OK energy, OK relationships, OK confidence and OK standards. Nothing is collapsing, so nothing feels urgent. There is no fire alarm. There is only that quiet internal sentence: I know I could be doing better.`,
    why: `The danger of OK is that it gives you enough comfort to avoid change and enough dissatisfaction to lose respect for yourself. It is not dramatic. It is not the bottom. It is the middle, and the middle can be more dangerous than the bottom because the bottom normally forces a decision.`,
    reframe: `This book is not about perfection. It is not about never being satisfied. It is not about grinding yourself into the floor, chasing approval or living according to someone else's Instagram version of success. It is about self-respect. It is about asking whether your current life represents who you are capable of becoming.`,
    story: `In my early twenties I had that uncomfortable private knowing. I was working, earning, socialising and functioning. From the outside there was nothing especially tragic about my life. The problem was that I knew I was not doing my best. That was the hard part. If I had genuinely been giving everything I had, I could have respected the situation. But I knew I had more in me, and I was not using it.`,
    method: `The work begins with honesty. Not drama, honesty. Look at the areas of your life and separate what is genuinely chosen from what is merely tolerated. Some people truly want a simple life, and that is fine. I am not here to shame contentment. I am speaking to the person who says they are fine while privately feeling restless, underused and a little disappointed in themselves.`,
    trap: `The common trap is waiting for life to become painful enough. People wait until the relationship breaks, the job disappears, the health warning arrives, the confidence collapses or the regret becomes unbearable. I do not want that for you. Pain can be a teacher, but it is an expensive one.`,
    direct: `So let us be clear from the start: OK is allowed. OK is useful in emergencies. OK can be a resting place. But if OK becomes your permanent address in the areas that matter most, it will slowly teach you to expect less from yourself.`,
    practice: `Throughout this book I will give you practical tools: the Rut Zone, the OK Zone, the Winning Zone, the Minimum Acceptable Standard, the H3 Method, the Confidence Credit Score, the Room Audit and the Weekly Winning Zone Review. None of them are magic. They work only if you use them. That is good news, because it means this book is not asking you to believe harder. It is asking you to act more honestly.`
  },
  {
    title: "The Three Zones",
    subtitle: "Chapter 1",
    part: "Part I - Diagnose the OK Zone",
    summary:
      "The master framework: Rut Zone, OK Zone and Winning Zone.",
    exerciseTitle: "Find Your Zone",
    exercise:
      "Rate career, health, relationship, confidence, money, environment and personal growth as Rut, OK or Winning. Then circle the one area that would most change your self-respect if you raised it.",
    takeaway:
      "The most important question is not, is my life terrible? It is, am I proud of how I am living?",
    opening: `Imagine life as three levels stacked on top of each other. At the bottom is the Rut Zone. In the middle is the OK Zone. At the top is the Winning Zone. Most people think the bottom is the worst place to be. I disagree.`,
    problem: `The Rut is painful, but pain has one strange advantage: it creates urgency. When you lose the job, the relationship breaks, the health problem becomes impossible to ignore or the money situation becomes frightening, you do not sit around asking if you feel motivated. You act because you have to.`,
    why: `The OK Zone is different. It is not painful enough to force you to move. You can stay there for years because the price is paid quietly. You do not wake up every morning in crisis. You wake up slightly flat, slightly numb, slightly aware that life is passing and you are not fully in it.`,
    reframe: `The Winning Zone is not a place where everything is easy. It is the place where you are aligned with what matters, where the work has meaning, where your standards are alive and where you can look back at the end of the day with a decent amount of respect for how you showed up.`,
    story: `When I first began changing my own life, I was not moving from catastrophe. I was moving from OK. That made it harder in some ways because there was always an excuse to stay. I had work. I had friends. I had enough comfort to avoid the truth. But every time I looked honestly, I knew I was not in the Winning Zone. I was surviving respectably while underusing myself.`,
    method: `The first step is diagnosis. You cannot improve a life you refuse to look at clearly. You need to know which areas are in Rut, which areas are in OK and which areas are already in Winning. This stops the whole book becoming vague. You are not changing everything. You are identifying the highest-leverage areas where OK is costing you the most.`,
    trap: `The trap here is pretending that because one area is going well, the whole life is fine. Many people are excellent at work and poor in health. Some are fit and disciplined, but emotionally unavailable. Some make good money and live in a constant fog of stress. Some are loved by everyone except themselves.`,
    direct: `Be fair with yourself. Do not use this framework as a weapon. You are not labelling yourself as a failure. You are mapping your current position so you can choose the next move.`,
    practice: `When you complete the zone map, look for patterns. Are you constantly in OK because you avoid confrontation? Are you in Rut because you have ignored the same warning signs for years? Are you in the Winning Zone only when someone else is holding you accountable? That information is useful. It shows you where the work begins.`
  },
  {
    title: "The Zone of Tolerable Discomfort",
    subtitle: "Chapter 2",
    part: "Part I - Diagnose the OK Zone",
    summary:
      "Why low-grade dissatisfaction can keep people stuck for years.",
    exerciseTitle: "The Tolerable Discomfort Audit",
    exercise:
      "Finish these sentences: I keep tolerating, I complain about, I know I could improve, I have been saying one day about, and I would feel embarrassed if this stayed the same for five more years.",
    takeaway:
      "If you can tolerate it, you can repeat it. If you can name it, you can change it.",
    opening: `Tolerable discomfort is one of the most expensive states in life. It is the job you complain about every week, but never leave. The body you are unhappy with, but keep negotiating with. The relationship pattern that drains you, but never quite breaks. The confidence issue that embarrasses you, but not enough to practise a different way of being.`,
    problem: `People often wait for discomfort to become intolerable. They wait until the pain becomes louder than the fear of change. This is understandable, but it is a poor strategy. It gives your life permission to get worse before you take it seriously.`,
    why: `Tolerable discomfort works because it is familiar. You know how to live with it. You know how to explain it. You know how to make jokes about it. You know how to distract yourself from it. Possibility, on the other hand, asks for effort, risk and a new identity.`,
    reframe: `The way out is not to make yourself miserable. The way out is to raise your honesty. Instead of asking, can I survive this? ask, would I deliberately choose this for another five years? That question changes the room. It forces you to compare tolerance with pride.`,
    story: `I have seen many clients who were not in dramatic trouble. Their problem was more subtle. They had a decent career, decent income, decent relationship or decent health, but the word decent had become a cage. They were not broken. They were bored with their own compromises.`,
    method: `The audit works because it makes the invisible visible. When something stays vague, you can keep negotiating with it. When you write it down, it becomes harder to hide from. I keep tolerating low energy. I keep tolerating poor preparation. I keep tolerating a calendar that belongs to everyone except me. Now we have something to work with.`,
    trap: `The trap is confusing acceptance with resignation. Acceptance means seeing reality clearly. Resignation means using reality as an excuse to stop trying. The OK Zone loves resignation because it sounds mature. It says, this is just life. Sometimes that is wisdom. Sometimes it is fear wearing sensible shoes.`,
    direct: `If you are reading this and thinking, yes, but my situation is complicated, I believe you. Most real situations are. The question is not whether change will be simple. The question is whether the cost of no change is becoming too high.`,
    practice: `Choose one tolerable discomfort and track it for seven days. Every time it appears, write down what happened, what you did, what it cost and what you avoided. By the end of the week you will see the pattern more clearly. You may also realise that the pattern is more changeable than it felt when it lived only in your head.`
  },
  {
    title: "Why Your Brain Chooses OK",
    subtitle: "Chapter 3",
    part: "Part I - Diagnose the OK Zone",
    summary:
      "A practical explanation of comfort, familiar patterns and identity mismatch.",
    exerciseTitle: "What Is This Behaviour Protecting?",
    exercise:
      "Choose one pattern you want to change and ask what it protects: comfort, approval, certainty, identity, avoidance, status, belonging or short-term pleasure.",
    takeaway:
      "The question is not, why am I like this? It is, what is this pattern doing for me, and what is it costing me?",
    opening: `If you have been doing something for months or years, assume there is a reason. That does not mean the behaviour is good. It means it is serving some short-term function. Your brain does not repeat patterns randomly. It repeats what feels familiar, efficient or safe.`,
    problem: `This is why people can sincerely want a better life and still repeat the old one. They want health, but keep choosing convenience. They want confidence, but keep avoiding the situations that would build it. They want a different career, but keep giving their best energy to a job they say they do not want.`,
    why: `Change costs energy. It creates uncertainty. It asks you to behave like someone you are not yet used to being. That creates identity mismatch. Part of you wants the new life, but your habits, environment, language and emotional defaults still belong to the old life.`,
    reframe: `The useful question is not, what is wrong with me? The useful question is, how does this pattern make sense? When you understand the payoff, you can replace it with something better. If avoidance gives you relief, you need a new way to create relief. If scrolling gives you escape, you need a better recovery system. If procrastination protects you from judgement, you need safer ways to practise being seen.`,
    story: `When I started studying personal development, one of the biggest reliefs was realising that I was not set in stone. Who I was, how I showed up, how I communicated, how I worked, how I managed my mind, these things could improve. That was not a motivational slogan for me. It was practical liberation.`,
    method: `Start by separating identity from behaviour. Saying, I am lazy, closes the door. Saying, I have a pattern of avoiding discomfort because it gives me short-term relief, opens the door. One is a prison sentence. The other is a coaching conversation.`,
    trap: `The trap is moralising every weakness. Some people beat themselves up and call that standards. It is not. If condemnation worked, most people would already be transformed. You need responsibility with curiosity. You need to look at the pattern without making excuses and without attacking yourself.`,
    direct: `Be honest about the benefits of your current life. There are always benefits. You get to avoid rejection, avoid effort, avoid uncertainty, avoid difficult conversations or avoid the embarrassment of being a beginner. Until you name the benefits, you will keep choosing them unconsciously.`,
    practice: `Write the behaviour at the top of a page. Then write, this behaviour helps me by... Keep going until you find the real payoff. Then write, this behaviour costs me... The cost must be clear enough to matter. Change becomes possible when the cost of staying honest becomes smaller than the cost of staying stuck.`
  },
  {
    title: "Regret Is a Late Alarm",
    subtitle: "Chapter 4",
    part: "Part I - Diagnose the OK Zone",
    summary:
      "Why fear can become useful when compared with the cost of never acting.",
    exerciseTitle: "The Five-Year Cost",
    exercise:
      "Write what happens if nothing changes for five years. Include confidence, health, relationships, money, skills, pride and lost opportunities.",
    takeaway:
      "Fear is not always the enemy. Sometimes fear is pointing to the life you will regret not attempting.",
    opening: `Regret is a terrible alarm clock because it rings after the moment has passed. It shows up when the opportunity is smaller, the energy is lower, the relationship is gone, the health has deteriorated or the courage has become more expensive.`,
    problem: `Many people are afraid to act. That is normal. Starting a business, changing career, asking for help, speaking in public, ending a pattern, raising a standard, these things can feel risky. But most people compare action with comfort. That is the wrong comparison.`,
    why: `You need to compare the fear of acting with the fear of never acting. Fear of acting is immediate. It has a pulse. It can make your mouth dry and your stomach tight. Fear of never acting is quieter, but it is often much heavier. It is the future version of you asking why you let the years go by.`,
    reframe: `I call this Fear Flipping. You turn the fear around and ask, what if I do not do this? What if I never write the book, never have the conversation, never build the business, never get fit, never practise confidence, never leave the OK Zone? Sometimes the bigger fear is not failure. It is realising too late that you protected yourself from the wrong thing.`,
    story: `I have used this in my own life many times. Moving towards coaching was not obvious at the beginning. There were doubts. Would people take me seriously? Could I make a living? Was coaching even a real path for me? But the thought of staying in work that did not fit me was worse than the uncertainty of trying.`,
    method: `Fear Flipping is not reckless. It is not pretending there are no risks. It is a fuller risk assessment. Most people do half the calculation. They ask what could go wrong if they act. They forget to ask what will almost certainly go wrong if they keep delaying.`,
    trap: `The trap is waiting to feel fearless. I do not know many impressive people who felt fearless before acting. They felt fear and acted with it. Courage is often untidy. It is not a cinematic feeling. Sometimes it is sending the email with your heart beating quickly. Sometimes it is booking the appointment. Sometimes it is admitting what you want out loud.`,
    direct: `If your fear is telling you to prepare, prepare. If your fear is telling you to get help, get help. If your fear is telling you to slow down and think clearly, do that. But if fear is only telling you to remain the same so you do not have to feel exposed, be careful. That fear may be protecting your comfort at the expense of your life.`,
    practice: `Choose one thing you have delayed. Draw two columns. In the first column, write the fear of acting. In the second, write the cost of not acting for one year, five years and ten years. Do not dramatise. Be precise. Then choose one action that respects the fear without obeying it.`
  },
  {
    title: "Define Success Before the World Defines It",
    subtitle: "Chapter 5",
    part: "Part II - Raise the Standard",
    summary:
      "A practical chapter on authenticity, personal success and resisting borrowed goals.",
    exerciseTitle: "Your Real Definition of Success",
    exercise:
      "List five things you say you want. For each one, ask why five times until you reach the emotional reason underneath.",
    takeaway:
      "A successful life that is not yours will eventually feel like another version of failure.",
    opening: `Before you raise your standards, you need to know what game you are playing. Otherwise you can become very disciplined in the wrong direction. You can build a life that looks impressive and still feels strangely empty because it was never truly yours.`,
    problem: `We are constantly being sold definitions of success. More money, better body, bigger business, more status, more attention, more proof that we are doing well. Some of those things may matter to you. Some may be useful. Some may be borrowed from your parents, your friends, your industry or social media.`,
    why: `A borrowed goal can motivate you for a while because approval is powerful. But borrowed success normally creates a private split. On the surface you may look like you are winning. Inside, you feel as if you are performing someone else's life.`,
    reframe: `The question is not, what does success look like? The better question is, what would make me respect the way I am living? Success might mean a profitable business, a strong body, a loving family, a calmer nervous system, better boundaries, more adventure, more mastery, more contribution or more freedom. Your definition must be honest enough to survive comparison.`,
    story: `When clients tell me they want more money, I rarely stop at the money. I ask why. Sometimes money means security. Sometimes it means significance. Sometimes it means freedom. Sometimes it means proving someone wrong. Sometimes it means not feeling trapped. The goal is more useful when we know the real driver.`,
    method: `Use the five whys. I want a bigger business. Why? So I can earn more. Why? So I can feel secure. Why? Because I grew up feeling that money could disappear. Now we are having a real conversation. The business goal may still matter, but it is now connected to a deeper need that can be handled with more intelligence.`,
    trap: `The trap is pretending you are above external validation. Most of us care what other people think. That is human. The point is not to become immune. The point is to stop letting other people's applause choose your direction.`,
    direct: `If you want the big house, say so. If you want a quieter life, say so. If you want to be recognised, be honest. If you want to leave a legacy, name it. Authenticity is not about choosing humble-sounding goals. It is about choosing goals that are actually yours.`,
    practice: `Write your current definition of success in one paragraph. Then write the definition you think your family expected. Then your industry's definition. Then social media's definition. Finally, write the definition you would still respect if nobody clapped. That final paragraph is the one to study.`
  },
  {
    title: "Your Minimum Acceptable Standard",
    subtitle: "Chapter 6",
    part: "Part II - Raise the Standard",
    summary:
      "The Minimum Acceptable Standard as a practical mechanism for self-respect.",
    exerciseTitle: "Set Your M.A.S.",
    exercise:
      "For each important area, define what is no longer acceptable, your new minimum, the action that happens below it and the support that makes it realistic.",
    takeaway:
      "Your standards quietly design your life.",
    opening: `Your life is shaped less by what you wish for and more by what you let yourself get away with. That sentence may be uncomfortable. Good. It should be. Most people do not need more information. They need a clearer standard.`,
    problem: `The Minimum Acceptable Standard, or M.A.S., is the line beneath which action becomes non-negotiable. It is not your fantasy standard. It is not perfection. It is the least you are willing to accept from yourself in an area that matters.`,
    why: `Without a minimum, everything becomes negotiable. You negotiate sleep, movement, preparation, honesty, money, boundaries, focus and follow-through. One exception becomes a week. A week becomes a personality. Eventually you call it just how I am.`,
    reframe: `A good standard is not cruel. It is respectful. It says, I care about this area enough to protect it from my moods. I care about my health enough to move even when I do not feel like becoming an athlete today. I care about my work enough to prepare properly. I care about my relationship enough not to disappear into distraction every evening.`,
    story: `With clients, I often find that the biggest changes begin when the standard becomes explicit. Not vague ambition, explicit standard. I will not leave my calendar to chance. I will not go three days without movement. I will not avoid a hard conversation for months. I will not keep saying yes when I mean no.`,
    method: `Create minimums you can actually keep. If your current health routine is nothing, do not declare that you will train six days a week, eat perfectly and become a different species by Monday. That is ego disguised as commitment. Start with a minimum that builds trust.`,
    trap: `The trap is using standards to attack yourself. Some people hear M.A.S. and become harsh. That is not the point. A standard is there to guide behaviour, not to humiliate you. When you fall below it, you do not collapse into shame. You ask, what happened, what needs adjusting and what is the next action?`,
    direct: `Your minimum standard should make your life better, not smaller. It should create more energy, more clarity and more respect. If your standard only makes you tense, brittle and self-critical, you have built a punishment system. We are building a performance system.`,
    practice: `Choose three areas: health, work and confidence. For each, write your current real standard, not the one you pretend to have. Then write your new minimum. Keep it simple enough that you can act on it this week. The aim is to become someone who keeps promises to themselves.`
  },
  {
    title: "Choose Your Own Hard",
    subtitle: "Chapter 7",
    part: "Part II - Raise the Standard",
    summary:
      "The difference between unchosen discomfort and chosen hardship.",
    exerciseTitle: "Chosen Hardship List",
    exercise:
      "List five discomforts you are willing to choose because they lead somewhere you respect, then choose one to practise this week.",
    takeaway:
      "You do not escape discomfort by staying in OK. You only lose the chance to choose what the discomfort is for.",
    opening: `People sometimes hear OK is not enough and think I am telling them to make life harder for the sake of it. I am not. Life is already hard. The question is whether the hardship is chosen or inherited.`,
    problem: `The OK Zone gives you unchosen discomfort. You get the discomfort of low confidence, low energy, regret, frustration, comparison, boredom and knowing you are capable of more. The Winning Zone gives you chosen discomfort: training, practice, difficult conversations, disciplined focus, honest feedback and the awkward early stage of becoming better.`,
    why: `Most people are trying to avoid discomfort altogether, which is impossible. They choose the familiar pain because it feels safer than the unfamiliar effort. But familiar pain is still pain. It is simply pain you have learned to decorate with explanations.`,
    reframe: `Chosen hardship is different. It has direction. When I train for a marathon or an ultra, parts of it are uncomfortable. Some runs are enjoyable. Some are not. But the discomfort belongs to something I respect. It is connected to a goal, a value and an identity I want to strengthen.`,
    story: `When I was preparing for long races, I did not wake up every day buzzing with motivation. There were runs where I would rather have stayed comfortable. But I had already decided what the discomfort was for. That changes the conversation in your mind. You stop asking, do I feel like it? and start asking, what did I commit to?`,
    method: `Look at any important area of life and you will find two types of hard. Health is hard when you train, plan meals and build discipline. Health is also hard when you feel heavy, tired and disappointed in yourself. Confidence is hard when you practise speaking up. Confidence is also hard when you keep hiding and shrink your life around fear.`,
    trap: `The trap is romanticising ease. People imagine that the right life will feel effortless all the time. It will not. Even work you love has boring parts. Even a strong relationship needs uncomfortable honesty. Even a meaningful business has admin, pressure and problems. The point is not easy. The point is worth it.`,
    direct: `If you are going to struggle either way, choose the struggle that builds something. Choose the discomfort that leads somewhere. Choose the hard that creates self-respect rather than the hard that slowly removes it.`,
    practice: `Write two lists. First, the discomfort you are currently paying for staying in OK. Second, the discomfort you would need to choose to move towards the Winning Zone. Compare them honestly. Which discomfort would you rather pay for over the next year?`
  },
  {
    title: "Your Environment Is Not Neutral",
    subtitle: "Chapter 8",
    part: "Part II - Raise the Standard",
    summary:
      "How rooms, people, comparison and role models shape what feels normal.",
    exerciseTitle: "The Room Audit",
    exercise:
      "Name who normalises OK, who normalises courage, who has the skill or standard you need, and what room you need to enter next.",
    takeaway:
      "The people around you teach you what is normal. Choose your teachers carefully.",
    opening: `Your environment is training you every day. The people around you, the rooms you enter, the content you consume, the conversations you repeat, the standards you observe, all of it is teaching you what normal looks like.`,
    problem: `If everyone around you is tolerating OK, OK will feel sensible. If everyone around you is complaining without changing, that will feel normal too. If everyone around you is growing, training, building, reading, practising and asking better questions, you will feel a different pull.`,
    why: `We are social creatures. We learn by proximity. This can damage us when we compare ourselves to punish ourselves. But comparison can also be useful when we treat it as research. Instead of saying, they are ahead, I am behind, ask, what are they doing that I can learn from?`,
    reframe: `I often use the library effect. If you try to study in a room where everyone is watching television, eating snacks and laughing, studying feels harder. If you study in a library where everyone is focused, the same behaviour feels easier. The environment has not done the work for you, but it has reduced the friction.`,
    story: `When I got into personal development, one of the most powerful things was discovering that people were actively learning skills I thought were fixed. Communication, discipline, confidence, goal setting, mindset, all of these became learnable. That changed the room I was in mentally, even before my physical environment changed.`,
    method: `Do a Room Audit. Who makes your old standards feel normal? Who quietly raises your ambition? Who tells you that your goal is unrealistic because they have never attempted anything similar? Who has already walked the road you are trying to begin?`,
    trap: `The trap is blaming the room while refusing to move. Environment matters, but it is not an excuse. You may not be able to replace everyone in your life, and you should not become arrogant towards people who live differently. But you can choose more of what you expose yourself to. Books are rooms. Podcasts are rooms. Coaches are rooms. Training groups are rooms.`,
    direct: `Be careful whose doubt you borrow. Someone with no business experience may not be the best person to advise you on starting a business. Someone who avoids public speaking may not be the best person to define what is possible for your confidence. Their fear may be sincere, but sincerity does not make it accurate.`,
    practice: `Choose one new room this month. It might be a class, a coaching conversation, a networking group, a training plan, a book, a mentor or a community. The goal is not to become dependent on the room. The goal is to place yourself near a standard that stretches you.`
  },
  {
    title: "Motivation Is Optional",
    subtitle: "Chapter 9",
    part: "Part III - Build the Evidence",
    summary:
      "Why the work needs to continue after motivation disappears.",
    exerciseTitle: "When Motivation Disappears",
    exercise:
      "Pre-write your plan for tired days, bored days, scared days and busy days. Decide what the minimum action is before those days arrive.",
    takeaway:
      "Motivation is useful when it visits. Discipline keeps the door open when motivation leaves.",
    opening: `Motivation is lovely. I enjoy it when it arrives. The problem is that many people build their goals as if motivation will move in permanently. It will not. It visits. It leaves. It comes back. You need a system for the days when it is not there.`,
    problem: `Most goals fail when the work becomes inconvenient, boring or uncomfortable. New Year's resolutions are a perfect example. People set them with enthusiasm, then abandon them when the emotional weather changes. The goal did not necessarily become impossible. It stopped feeling exciting.`,
    why: `Your brain loves novelty. Starting feels good because it gives you a little identity upgrade. I am the kind of person who trains now. I am starting a business. I am writing a book. But after the announcement comes the repetition. That is where the real person is built.`,
    reframe: `The question is not, do I feel motivated today? The question is, what did I commit to and what is the minimum action that keeps me in integrity? You do not need heroic effort every day. You need enough consistency to keep the promise alive.`,
    story: `When I trained for the London Marathon, there were many runs. Some were short. Some were long. Some were wet, boring or inconvenient. If I had waited to feel inspired for every session, the training plan would have fallen apart quickly. The plan mattered because it carried me when motivation was quiet.`,
    method: `Use minimum actions. If the full workout is not possible, what is the smallest version that keeps the identity alive? If writing for two hours is not possible, can you write for twenty minutes? If a difficult call feels too much, can you write the first three bullet points and schedule it?`,
    trap: `The trap is all-or-nothing thinking. People miss one session and decide the week is ruined. They eat badly at lunch and decide the day is gone. They procrastinate in the morning and write off the afternoon. That is childish accounting. A strong standard includes recovery after imperfection.`,
    direct: `You will have days when you are tired. You will have days when you are not in the mood. You will have days when your mind produces very convincing arguments for delaying. Expect this. Plan for it. Do not be surprised by being human.`,
    practice: `Create your no-motivation plan. For one important goal, define the minimum action for four states: tired, bored, scared and busy. Keep each action small enough that you can do it without negotiation. That is not lowering the standard. It is protecting consistency.`
  },
  {
    title: "Heart, Head, Hands",
    subtitle: "Chapter 10",
    part: "Part III - Build the Evidence",
    summary:
      "The H3 Method: why, plan and action working together.",
    exerciseTitle: "The H3 Planning Sheet",
    exercise:
      "For one goal, write Heart: why it matters, Head: the exact goal and milestones, and Hands: the first action, next action and scheduled time.",
    takeaway:
      "A dream without hands stays in your head.",
    opening: `A goal needs three things: Heart, Head and Hands. If one is missing, progress becomes unreliable. Heart gives the goal meaning. Head gives it structure. Hands turn it into action.`,
    problem: `Some people have Heart without Head. They are passionate, but unclear. Some have Head without Heart. They have plans that do not move them. Some have Heart and Head, but no Hands. They know what they want and why it matters, but they never take the next concrete step.`,
    why: `This is why vague goals are so weak. I want to feel better. I want to be more confident. I want to be successful. Fine, but what does that mean? How will you know? What needs to happen? What is the first action? Without specificity, your mind has too much room to negotiate.`,
    reframe: `The H3 Method turns ambition into something you can use. Heart asks, why does this matter enough to justify discomfort? Head asks, what exactly are we building and what is the route? Hands ask, what will I physically do next?`,
    story: `When I set running goals, the emotional reason matters. So does the plan. So does the training. Wanting to complete a marathon means very little until it becomes scheduled runs, nutrition, pacing, recovery and showing up when it rains. That is Heart, Head and Hands working together.`,
    method: `Start with Heart, but do not stay there. Write why the goal matters. Then ask why again. Keep going until you feel the deeper reason. Then move to Head. Define the result, the deadline, the measures and the milestones. Then move to Hands. Put action into the calendar. Decide what happens today.`,
    trap: `The trap is confusing planning with progress. Planning is important, but it can become sophisticated procrastination. If your plan does not create behaviour, it is not a plan yet. It is a beautifully organised delay.`,
    direct: `Ask yourself honestly: which part is missing for you? Do you lack Heart because the goal is borrowed? Do you lack Head because everything is vague? Do you lack Hands because action exposes you to judgement? The missing part tells you what to fix.`,
    practice: `Choose one goal you care about. Fill one page with three headings: Heart, Head, Hands. Under Hands, write an action that can be completed in less than twenty minutes. Then do it today. The goal needs to touch reality quickly.`
  },
  {
    title: "Confidence Is Something You Do",
    subtitle: "Chapter 11",
    part: "Part III - Build the Evidence",
    summary:
      "Confidence as behaviour, competence and evidence.",
    exerciseTitle: "The Confidence Credit Score",
    exercise:
      "For 30 days, do one thing 1 to 3 percent outside your comfort zone. Record the action, result and lesson.",
    takeaway:
      "You do not think your way into confidence. You act your way into evidence.",
    opening: `People often talk about confidence as if it is something you either have or do not have. I do not see it that way. Confidence is something you do. It shows up in your posture, language, focus, preparation, behaviour and willingness to act before certainty arrives.`,
    problem: `If you wait to feel confident before doing the thing, you may wait for years. The interview, the presentation, the conversation, the business idea, the date, the boundary, the pitch, all of these require a little evidence. Evidence comes from doing.`,
    why: `Confidence comes from competence, competence comes from experience and experience comes from action. That does not mean you throw yourself into terrifying situations every day. It means you build a history of small brave actions. Your nervous system needs receipts.`,
    reframe: `I call this the Confidence Credit Score. Every time you do something slightly uncomfortable and survive it, you deposit evidence. Every time you avoid everything that scares you, you teach yourself that avoidance is necessary. The score is not moral. It is behavioural.`,
    story: `One client-style example I often think about is the shy professional who begins with tiny acts of courage. Sitting beside a stranger on a bus. Speaking up once in a meeting. Asking a question. Sharing a small opinion. Then, after enough repetitions, standing in front of a room and speaking calmly. Not because she magically became a different person, but because she practised the behaviours of confidence.`,
    method: `Make the steps small enough to repeat and uncomfortable enough to matter. One to three percent outside your comfort zone is enough. If you go too far too quickly, you may scare yourself back into hiding. If you stay too safe, nothing changes. The art is choosing actions that stretch without snapping.`,
    trap: `The trap is dismissing small actions. People want the big transformation, so they ignore the tiny behaviours that create it. But confidence is built through repetition. Speaking once is useful. Speaking every week changes your identity.`,
    direct: `If you are afraid, good. That means we have material. Fear gives us the edge to practise against. The aim is not to eliminate fear. The aim is to build a track record that says, I can feel fear and still behave in line with my standards.`,
    practice: `Create a 30-day Confidence Credit Score list. Every day, record one action slightly outside your comfort zone. Keep it simple: make the call, ask the question, hold eye contact, publish the post, correct the mistake, say what you mean. At the end of 30 days, read the list. That is evidence.`
  },
  {
    title: "Practice It Until You Become It",
    subtitle: "Chapter 12",
    part: "Part III - Build the Evidence",
    summary:
      "An authentic alternative to fake it till you make it.",
    exerciseTitle: "The Practice Ladder",
    exercise:
      "Choose one identity you want to grow into and design ten practice steps from tiny to genuinely challenging.",
    takeaway:
      "Do not fake the person you want to be. Practise being them until it becomes natural.",
    opening: `I have never liked fake it till you make it. It clashes with authenticity. If you know you are pretending, part of you will feel insecure because you are trying to maintain an act. I prefer something cleaner: practise it until you become it.`,
    problem: `Many people avoid growth because they think they must already feel like the new person before they can behave like the new person. They want to be confident before practising confidence. They want to be a speaker before speaking. They want to be disciplined before building discipline.`,
    why: `That is backwards. Identity often follows repeated behaviour. You become someone who speaks by speaking. You become someone who trains by training. You become someone who leads by practising leadership behaviours. At first it feels deliberate. Then it becomes familiar. Eventually it becomes natural.`,
    reframe: `Practice removes the pressure to pretend. You do not need to announce yourself as a finished product. You can say, I am practising. That is honest. It gives you permission to be a beginner while still taking the work seriously.`,
    story: `When I began running workshops, I was not brilliant at the start. How could I be? Public speaking, facilitation and holding a room are skills. So I practised. I ran sessions. I learned what worked. I learned what did not. Repetition gave me feedback, and feedback created improvement.`,
    method: `Build a practice ladder. Step one should be almost too easy. Step ten should make you nervous. If the identity is public speaker, step one might be recording yourself for one minute. Step five might be speaking in a small meeting. Step ten might be giving a workshop. You climb the ladder, not leap from the floor to the roof.`,
    trap: `The trap is comparing your practice stage with someone else's mastery stage. Masters make things look effortless because you are not seeing the repetitions behind the performance. You see the polished talk, not the awkward first attempts. You see the musician on stage, not the hours of scales.`,
    direct: `Let yourself be seen practising. This is difficult for the ego because the ego wants to appear competent immediately. But the price of protecting your image is often staying average at things you care about.`,
    practice: `Choose the identity you want to practise: confident communicator, disciplined athlete, better leader, organised business owner, calmer partner, courageous creator. Write ten practice steps. Do step one within 24 hours. Keep the ladder visible until step ten has been completed.`
  },
  {
    title: "Talk to Your Mind Like a Coach",
    subtitle: "Chapter 13",
    part: "Part III - Build the Evidence",
    summary:
      "Self-talk, fear, mental redirection and coaching the inner voice.",
    exerciseTitle: "Cross-Examine the Voice",
    exercise:
      "When your mind says you cannot, ask why not, what are the facts, what evidence exists, what support could help and what is the next smallest step.",
    takeaway:
      "You do not have to believe every thought. Some thoughts are just fear trying to sound intelligent.",
    opening: `You are the person you speak to most. That is obvious, but most people do not take it seriously. They let the mind wander, criticise, predict failure, exaggerate danger and then wonder why they feel unmotivated.`,
    problem: `Your mind is not always trying to help you win. Often it is trying to keep you safe. That means it will produce very convincing reasons to avoid risk, effort, exposure and change. It may sound intelligent. It may sound practical. It may simply be fear with a good vocabulary.`,
    why: `If you let the mind run without direction, it will often look for problems. That is not because you are broken. It is because the mind has a bias towards risk detection. Useful in danger. Less useful when you are trying to publish your work, speak in public, build a business or change your body.`,
    reframe: `You can coach the mind. You can give it better questions. Instead of letting it ask, what if I fail? ask, how can I prepare? Instead of, what will people think? ask, who could be helped if I do this well? Instead of, why am I so behind? ask, what is the next useful action?`,
    story: `During long runs, the mind can become noisy. It says, this is hard, stop, slow down, why are we doing this, maybe today is not the day. I do not need to fight every thought. I can question it, redirect it and remind it of the bigger reason. The mind needs a job.`,
    method: `Use coaching questions. What are the facts? What story am I adding? What would I tell a client? What is in my control? What is the next smallest step? Questions change focus. Focus changes state. State changes behaviour.`,
    trap: `The trap is arguing with every negative thought as if every thought deserves a debate. It does not. Some thoughts are weather. Notice them, then return to the road. Other thoughts contain useful information. Study those. Learn the difference.`,
    direct: `Be careful with the language you use on yourself. If you say, I always mess this up, your mind will search for evidence. If you say, I am practising and improving, your mind receives a different instruction. This is not magic. It is attention management.`,
    practice: `For one week, write down the top three sentences your mind uses to keep you in OK. Then rewrite each one as a coaching question. I cannot do this becomes what support, practice or plan would make this more doable? Read the new questions before the old sentences start running the meeting.`
  },
  {
    title: "Failure Is Feedback With Receipts",
    subtitle: "Chapter 14",
    part: "Part III - Build the Evidence",
    summary:
      "How to turn mistakes into confidence, process and learning.",
    exerciseTitle: "The Failure Debrief",
    exercise:
      "After a mistake, write what happened, what was in control, what was not, what can be learned, what changes next time and what this failure made possible.",
    takeaway:
      "A mistake becomes waste only when you refuse to learn from it.",
    opening: `Failures are inevitable unless you are playing extremely safe, and playing extremely safe can become its own failure. If you are building anything worthwhile, you will fumble, flop, misjudge, forget, overreach and occasionally make a mess.`,
    problem: `The issue is not failure itself. The issue is what you do after it. Many people turn failure into identity. I failed becomes I am a failure. One bad presentation becomes I am terrible at speaking. One awkward sales call becomes I cannot sell. That is poor analysis.`,
    why: `Failure hurts because it threatens the image we have of ourselves. We wanted to look capable. We wanted the work to be admired. We wanted the result. When it goes wrong, the ego wants to condemn, hide or explain. None of those responses improve the next attempt.`,
    reframe: `Get curious, not furious. Have compassion, not condemnation. Probe the mistake for specific takeaways. This is how failure becomes valuable. You are not pretending it feels good. You are refusing to waste it.`,
    story: `I once recorded several videos and then realised the audio was unusable. Hours of work gone. It would have been easy to get furious. Instead I had to ask, what is the lesson? The answer was simple: check the equipment, do a trial recording, then begin the full session. Annoying, yes. Useful, also yes.`,
    method: `A good debrief separates facts from drama. What happened? What was in my control? What was not? What did I assume? What did I fail to prepare? What system would prevent this next time? This gives the mind something constructive to do.`,
    trap: `The trap is fake positivity. I am not asking you to smile at every mistake and call it amazing. Some failures are painful. Some cost money, time, trust or opportunity. Respect that. Then learn from it. Pain without learning is just pain.`,
    direct: `If you avoid everything that might fail, your confidence will shrink. If you engage with failure intelligently, your confidence can grow because you learn that mistakes are survivable and instructive.`,
    practice: `Choose one recent mistake. Complete the Failure Debrief. Then identify one process change. Not a vague promise to do better, a specific change: checklist, rehearsal, support, preparation, boundary, reminder, practice session or earlier feedback.`
  },
  {
    title: "Build Your Performance System",
    subtitle: "Chapter 15",
    part: "Part IV - Live in the Winning Zone",
    summary:
      "Turning standards into routines, personal KPIs and weekly review.",
    exerciseTitle: "The Weekly Winning Zone Review",
    exercise:
      "Review what went well, where you settled, what needs attention, which standard to raise and the one action that would make the biggest difference next week.",
    takeaway:
      "Systems are how standards survive real life.",
    opening: `Standards need systems. Without systems, your standards depend on mood, memory and spare energy. That is unreliable. Real life is busy. You will forget. You will get tired. You will become reactive. A good performance system protects the life you say you want.`,
    problem: `People often rely on heroic effort. They wait until things become messy, then try to rescue the week with intensity. That may work occasionally, but it is not a lifestyle. The Winning Zone requires routines, tracking, review and friction reduction.`,
    why: `What gets measured gets managed, but only if you measure the right things. Personal KPIs are not there to turn you into a machine. They are there to give you feedback. Sleep, energy, movement, nutrition, focus, money, time, confidence practice, relationship attention, these are signals.`,
    reframe: `Think of the system as a coach that lives in your week. It asks, what matters? What is slipping? What needs support? What is the next best action? You are not trying to control everything. You are trying to stay awake to the few things that shape everything else.`,
    story: `I have worked with clients who discovered huge amounts of time disappearing into habits they had never measured. Social media, television, vague evenings, constant context switching. Once they saw the numbers, the conversation changed. It was no longer, I do not have time. It was, this is where the time is going.`,
    method: `Build your system around three areas: You, Your Environment and Your Performance. You includes health, energy, mindset and confidence. Your Environment includes people, spaces, distractions and support. Your Performance includes goals, skills, actions and review.`,
    trap: `The trap is overbuilding the system. Some people create dashboards so complicated they need another dashboard to manage them. Keep it simple. Track only what you will actually use. A system should reduce friction, not become another source of guilt.`,
    direct: `If you want a better life, stop leaving your week to accident. Calendar the actions. Protect the energy. Review the evidence. Adjust quickly. The Winning Zone is not maintained by inspiration. It is maintained by design.`,
    practice: `Every Sunday, complete the Weekly Winning Zone Review. Keep it to fifteen minutes. What did I do well? Where did I settle? What needs attention? What is one standard I will raise next week? What is the one action that would make the biggest difference? Then schedule it.`
  },
  {
    title: "Stay Out of OK",
    subtitle: "Chapter 16",
    part: "Part IV - Live in the Winning Zone",
    summary:
      "How to notice drift, reset early and keep returning to the Winning Zone.",
    exerciseTitle: "The OK Zone Early Warning System",
    exercise:
      "Identify your signs of drifting, excuses, first corrective action, accountability person, reset ritual and next standard.",
    takeaway:
      "You do not leave the OK Zone once. You learn how to notice it, challenge it and move again.",
    opening: `You will re-enter the OK Zone. I want to say that clearly because otherwise this book becomes another unrealistic fantasy. You will drift. You will get comfortable. You will negotiate with standards. You will lose focus sometimes. That is normal.`,
    problem: `The goal is not permanent intensity. I do not want you living like every day is a motivational video. The goal is quicker awareness and quicker correction. You notice the drift earlier. You act before the cost becomes dramatic.`,
    why: `The OK Zone is patient. It does not usually drag you back in one obvious decision. It uses small negotiations. Skip the review. Delay the conversation. Miss the workout. Let the sleep slide. Avoid the plan. Say yes when you mean no. Each decision is small. Together, they rebuild the old life.`,
    reframe: `Staying out of OK means building an early warning system. What are your signs? Mine may be different from yours. For some people it is messy mornings. For others it is irritability, avoidance, too much scrolling, poor food, lost training, vague goals or resentment.`,
    story: `I have learned not to treat drift as a character failure. Drift is information. If I notice it early, I can reset. If I ignore it, the reset becomes bigger and more painful. This is true in health, work, relationships, confidence and business.`,
    method: `Create a reset ritual. It can be simple: review the week, clean the environment, train, write the next three actions, speak to an accountability person, return to the minimum standard. The ritual matters because it removes negotiation. You know what to do when you notice the signs.`,
    trap: `The trap is shame spiralling after drift. People fall off for a week and decide they have failed. No. You have information. Use it. A strong person is not someone who never drifts. A strong person returns faster.`,
    direct: `The Winning Zone is not a trophy you win once. It is a way of living. Some weeks you will be closer to it than others. The question is whether you keep telling the truth and keep moving.`,
    practice: `Write your Early Warning System on one page. My signs of drifting are... My common excuses are... My first corrective action is... The person I can tell is... My reset ritual is... The next standard I return to is... Keep this page where you can find it.`
  },
  {
    title: "Do Not Wait Until You Have To",
    subtitle: "Conclusion",
    part: "Closing",
    summary:
      "A direct closing invitation to leave the OK Zone before crisis makes the decision.",
    exerciseTitle: "The First Move",
    exercise:
      "Choose one area, one standard, one action and one time in the next 24 hours. Make the book touch reality immediately.",
    takeaway:
      "The Winning Zone is the place where you respect who you are becoming.",
    opening: `At the beginning I asked why you would tolerate an OK life when you would not rush back to an OK holiday, rewatch an OK film or recommend an OK meal. The question still stands, but now it is more personal. Where are you tolerating OK because it is easier than telling the truth?`,
    problem: `You do not need a crisis to begin. You do not need perfect confidence. You do not need to know every step. You do not need a dramatic reinvention. You need honesty, standards, action and support.`,
    why: `The OK Zone will always offer reasons to wait. Later, when work is calmer. Later, when money is better. Later, when confidence arrives. Later, when the timing is cleaner. Later is sometimes wisdom. Often it is avoidance with a calendar.`,
    reframe: `Leaving OK does not mean rejecting your life. It means taking responsibility for it. It means asking what you are capable of and then building enough structure, courage and evidence to move towards it.`,
    story: `I am not writing this as someone who has finished the work. I practise these ideas too. I set goals, review standards, train, question my mind, fail, adjust and keep going. That is the point. The Winning Zone is not perfection. It is participation with your best available self.`,
    method: `You now have the method. Diagnose the zone. Name the tolerable discomfort. Understand what the pattern protects. Flip the fear. Define success for yourself. Set your Minimum Acceptable Standard. Choose your own hard. Audit the room. Stop depending on motivation. Use Heart, Head and Hands. Build confidence through evidence. Practise it until you become it. Coach your mind. Debrief failure. Build the system. Notice drift early.`,
    trap: `The final trap is making this book another interesting thing you read. Do not do that. If something landed, act. If something annoyed you, study it. If something made you uncomfortable, there may be truth in it. Respect that signal.`,
    direct: `One day, whether we like it or not, the window narrows. Energy changes. Options change. Time moves. I do not say that to scare you. I say it because it is clarifying. If the life you want matters, begin before life forces you to begin.`,
    practice: `Choose one first move. Not a life overhaul. One move. One email. One walk. One conversation. One page. One training session. One boundary. One appointment. One standard restored. Do it within 24 hours so this book becomes part of your evidence, not part of your entertainment.`,
  }
];

const figuresByTitle = new Map([
  [
    "The Life That Is Good Enough to Cost You Everything",
    {
      file: "ok-test-comfort-cost-meter.png",
      after: "opening",
      alt: "Hand-drawn OK Test and comfort cost meter showing OK holiday, OK film, OK life, and the hidden cost of staying comfortable.",
      caption: "The OK Test makes the opening question visible: why reject an OK holiday or OK film, but tolerate an OK life?"
    }
  ],
  [
    "The Three Zones",
    {
      file: "three-zones-silent-trap.png",
      after: "opening",
      alt: "Hand-drawn Three Zones map showing Rut Zone, OK Zone, Winning Zone, and the silent trap of comfort.",
      caption: "The core map: the Rut hurts, the Winning Zone grows, and the OK Zone quietly hides the cost."
    }
  ],
  [
    "The Zone of Tolerable Discomfort",
    {
      file: "tolerable-discomfort-jar.png",
      after: "method",
      alt: "Hand-drawn tolerable discomfort jar and five-year drift line showing small tolerated problems becoming heavier over time.",
      caption: "Tolerable discomfort accumulates slowly; the audit helps you see the weight before it becomes a crisis."
    }
  ],
  [
    "Why Your Brain Chooses OK",
    {
      file: "brain-safety-board.png",
      after: "reframe",
      alt: "Hand-drawn brain safety board and pattern protection diagram showing why old behaviour protects certainty, identity, approval, and comfort.",
      caption: "Old patterns survive because they protect something. The work is to understand the protection and choose a better cost."
    }
  ],
  [
    "Regret Is a Late Alarm",
    {
      file: "regret-late-alarm.png",
      after: "reframe",
      alt: "Hand-drawn fear flipping scale and future-self alarm clock comparing fear of acting with fear of never acting.",
      caption: "Fear Flipping asks a sharper question: what will it cost if you never try?"
    }
  ],
  [
    "Define Success Before the World Defines It",
    {
      file: "borrowed-goals-real-goals.png",
      after: "method",
      alt: "Hand-drawn borrowed goals versus real goals shelves and five whys root drill ending in freedom.",
      caption: "A goal becomes yours when you know why it matters, not just how impressive it looks."
    }
  ],
  [
    "Your Minimum Acceptable Standard",
    {
      file: "minimum-acceptable-standard.png",
      after: "method",
      alt: "Hand-drawn minimum acceptable standard line and standards thermostat connected to work, health, relationships, and habits.",
      caption: "Your life adjusts to the lowest standard you keep accepting."
    }
  ],
  [
    "Choose Your Own Hard",
    {
      file: "choose-your-own-hard.png",
      after: "reframe",
      alt: "Hand-drawn chosen hard versus unchosen hard paths with a discomfort trade-off board.",
      caption: "You do not avoid hard; you choose which hard to live with."
    }
  ],
  [
    "Your Environment Is Not Neutral",
    {
      file: "environment-room-audit.png",
      after: "method",
      alt: "Hand-drawn room audit sketch and normal is contagious diagram showing how spaces, cues, and people train behaviour.",
      caption: "Your environment is already coaching you. The Room Audit helps you decide what it is coaching you toward."
    }
  ],
  [
    "Motivation Is Optional",
    {
      file: "motivation-system-bridge.png",
      after: "reframe",
      alt: "Hand-drawn motivation weather versus system bridge and boring day machine showing progress without waiting for inspiration.",
      caption: "Motivation comes and goes; a system keeps you moving across the boring days."
    }
  ],
  [
    "Heart, Head, Hands",
    {
      file: "heart-head-hands-h3-method.png",
      after: "method",
      alt: "Hand-drawn H3 Method triangle and goal wiring diagram connecting heart, head, and hands.",
      caption: "Heart gives the why, Head gives the plan, Hands turn the goal into real-world progress."
    }
  ],
  [
    "Confidence Is Something You Do",
    {
      file: "confidence-credit-score.png",
      after: "reframe",
      alt: "Hand-drawn confidence credit score and evidence bank showing confidence built through action and evidence.",
      caption: "Confidence grows when action creates evidence."
    }
  ],
  [
    "Practice It Until You Become It",
    {
      file: "practice-until-you-become-it.png",
      after: "reframe",
      alt: "Hand-drawn practice ladder comparing fake it with practise it and showing identity built through repetition.",
      caption: "Identity grows through repetition, not pretence."
    }
  ],
  [
    "Talk to Your Mind Like a Coach",
    {
      file: "inner-coach-vs-inner-critic.png",
      after: "reframe",
      alt: "Hand-drawn inner coach versus inner critic and fear translation tool.",
      caption: "A coaching mind gives fear a job to do instead of letting it run the room."
    }
  ],
  [
    "Failure Is Feedback With Receipts",
    {
      file: "failure-feedback-receipts.png",
      after: "method",
      alt: "Hand-drawn failure debrief sheet and mistake to method conveyor turning reflection into improved strategy.",
      caption: "A mistake becomes useful when it is reviewed."
    }
  ],
  [
    "Build Your Performance System",
    {
      file: "performance-system-dashboard.png",
      after: "method",
      alt: "Hand-drawn weekly Winning Zone review dashboard and you environment performance system gears.",
      caption: "A strong week is built by a working system."
    }
  ],
  [
    "Stay Out of OK",
    {
      file: "stay-out-of-ok-warning-system.png",
      after: "method",
      alt: "Hand-drawn OK Zone early warning system and reset ritual loop.",
      caption: "Stay out of OK by noticing drift early and resetting fast."
    }
  ],
  [
    "Do Not Wait Until You Have To",
    {
      file: "first-move-method-map.png",
      after: "method",
      alt: "Hand-drawn first move and complete method map from diagnosing the zone through reset and a stronger Winning Zone.",
      caption: "The closing map: you do not need a crisis, you need a first move."
    }
  ]
]);

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeYaml(value) {
  return String(value).replace(/"/g, '\\"');
}

function wordCount(value) {
  return (value.match(/\b[\w’']+\b/g) ?? []).length;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function figureFor(section, after) {
  const figure = figuresByTitle.get(section.title);

  if (!figure || figure.after !== after) {
    return "";
  }

  return [
    `<figure class="ok-zone-figure">`,
    `  <img src="/images/the-ok-zone/${figure.file}" alt="${escapeHtml(figure.alt)}" loading="lazy" />`,
    `  <figcaption>${escapeHtml(figure.caption)}</figcaption>`,
    `</figure>`
  ].join("\n");
}

function buildBody(section) {
  return [
    section.opening,
    figureFor(section, "opening"),
    section.problem,
    section.why,
    purposeBridge(section),
    `Let me make the distinction practical. There is a difference between a life that is quiet because you chose peace and a life that is quiet because you stopped asking for more. There is a difference between patience and passivity. There is a difference between contentment and resignation. The OK Zone often hides in those differences.`,
    section.reframe,
    figureFor(section, "reframe"),
    coachingLens(section),
    section.story,
    `This is where many ambitious people need a little kindness and a little challenge. Kindness, because the old pattern probably helped you survive or feel safe at some point. Challenge, because the fact that something once helped you does not mean it should keep leading your life. Gratitude for the old strategy does not require loyalty to it.`,
    section.method,
    figureFor(section, "method"),
    practicalWindow(section),
    `The same principle will look different in each window. In work, it might mean preparing properly instead of improvising and hoping nobody notices. In health, it might mean making the walk non-negotiable before you try to become an athlete. In relationships, it might mean saying the sentence you keep editing out. In confidence, it might mean doing the small brave thing today rather than waiting for a personality transplant.`,
    `I want to keep bringing you back to behaviour because behaviour is where self-respect is either built or lost. It is easy to agree with an idea while reading. It is harder to live it at 7:00 on a cold morning, during an awkward meeting, after a poor night's sleep, or when nobody is going to praise you for doing the right thing. That is exactly why those moments matter.`,
    `You may also notice a little resistance here. Good. Resistance is often the sign that the conversation has become real. The part of you that wants change will lean forward. The part of you that wants familiarity will look for exceptions. It will say, this sounds good, but not this week. It will say, I already know this. It will say, my situation is different. Sometimes your situation is different. Sometimes that sentence is simply the OK Zone defending its territory.`,
    `A practical question I like is this: what would the person I respect do next? Not the perfect person. Not the imaginary superhero version of you. The person you respect. That question usually gives a cleaner answer than, what do I feel like doing? Feelings matter, but they are not always good leaders. They are signals. You listen, then you decide.`,
    `Another useful question is: what would make this easier to repeat? Many people design change in a way that depends on willpower. They make the new behaviour too vague, too large, too hidden, too easy to avoid. Then they blame themselves when it collapses. Better design beats louder self-criticism. Put the shoes by the door. Put the session in the calendar. Put the phone in another room. Tell the person who will ask you about it. Make the behaviour visible enough that it can begin.`,
    `If you are an ambitious person, there is another trap: turning every principle into a massive project. You read one chapter and decide to reorganise your whole life. It feels powerful for a day, then the size of it becomes too much. I would rather you make one clean change and keep it than make ten dramatic promises and abandon all of them by next week.`,
    `The OK Zone is often maintained by tiny permissions. I will do it later. This does not really matter. I had a hard day. Nobody will know. I can catch up tomorrow. Sometimes those sentences are reasonable. Sometimes they are the language of drift. You need to learn the difference between recovery and excuse. Recovery restores you. Excuse protects avoidance.`,
    `This is why I keep returning to evidence. Your future confidence will not be built from intentions. It will be built from remembered proof. Proof that you showed up. Proof that you corrected yourself. Proof that you asked for help. Proof that you could do something clumsy and continue. Proof that you did not disappear the moment the work became uncomfortable.`,
    discomfortBridge(section),
    `There is also an important kindness in this work. You do not have to hate the version of you that adapted to OK. That version probably did the best it knew with the tools it had. Thank it if you need to. Then upgrade the tools. The next version of your life does not require self-hatred. It requires better leadership.`,
    `Leadership of yourself is not dramatic. It is mostly small decisions made repeatedly. Go to bed. Tell the truth. Prepare. Move your body. Ask the better question. Do the first repetition. Review the week. Repair the mistake. Say no. Say yes. Study. Practise. Begin again. The basics are not glamorous, but they are where the life changes.`,
    `A useful way to make this real is to stop asking whether you are generally doing well and start asking where the standard is visible. If someone watched your last seven days, what would they think you value? Not what would they think you believe, or what would they think you intend, but what would they think you actually value from the way you spent your time, protected your energy, used your attention and followed through? That question can be uncomfortable, but it is also freeing because it brings the work back to reality.`,
    `Remember, the aim is not to become intense about everything. That would be exhausting and probably unbearable to live with. The aim is to stop being casual about the few areas that shape the rest of your life. For most people those areas are health, work, relationships, confidence, environment and the ability to keep promises to themselves. If those begin to improve, the whole life starts to feel different because the person living it starts to feel different.`,
    `There are always two conversations happening. The first is the surface conversation: I want to be fitter, I want to earn more, I want to be more confident, I want to find direction, I want to communicate better. The second is the deeper conversation: who do I need to become so this result is natural for me? What standards, habits and environments belong to that person? What would they stop tolerating? What would they practise even when nobody is watching?`,
    section.trap,
    `I want you to notice how often the mind tries to protect the current identity. It will say you are being realistic when you are actually being scared. It will say you are being patient when you are actually delaying. It will say you are too busy when you are actually avoiding the discomfort of starting. Sometimes the mind is right. Sometimes the mind is a lawyer for the OK Zone. Your job is to cross-examine it.`,
    section.direct,
    `This is also where standards become compassionate. A standard is not a whip. A standard is an agreement with the person you want to become. It says, this matters enough that I will not leave it to mood. It says, even on an ordinary Tuesday, even when there is no applause, even when the first attempt is clumsy, I will still behave like this life is mine to build.`,
    section.practice,
    figureFor(section, "practice"),
    `Do not make this theoretical. The OK Zone loves theory because theory can feel like progress without asking for risk. Read, reflect, then move. One small action taken today will teach you more than another week of thinking about what kind of person you might become.`,
    `### Apply This: ${section.exerciseTitle}`,
    section.exercise,
    `Keep the exercise simple enough that you can complete it without turning it into a project. Write the answer by hand if you can. Be honest, not impressive. Then choose one visible action that proves you are taking the insight seriously.`,
    finalTurn(section),
    `**Takeaway:** ${section.takeaway}`
  ].filter(Boolean).join("\n\n");
}

function purposeBridge(section) {
  if (section.part === "Opening") {
    return `The conversation begins with one uncomfortable standard: if your life is technically fine but quietly shrinking you, fine is no longer good enough. I am not asking you to invent a crisis. I am asking you to stop outsourcing your wake-up call to pain.`;
  }

  if (section.part.includes("Diagnose")) {
    return `The first job is to name the pattern without making it your identity. Diagnosis is not condemnation. It is the moment you stop arguing with the facts and start using them.`;
  }

  if (section.part.includes("Raise")) {
    return `Raising the standard does not mean becoming harsh with yourself. It means becoming specific enough that your better life has something to organise around.`;
  }

  if (section.part.includes("Build")) {
    return `This is where the work becomes visible. A stronger standard has to become a calendar entry, a conversation, a training session, a prepared room, a repeated behaviour, or it remains a nice idea with no legs.`;
  }

  if (section.part.includes("Winning")) {
    return `The Winning Zone is maintained by review, recovery and honest correction. You do not stay there by hype. You stay there by noticing earlier and returning faster.`;
  }

  return `The closing question is simple: what will you do with what you now know? Insight only becomes self-respect when it changes the next decision.`;
}

function coachingLens(section) {
  const title = section.title.toLowerCase();

  if (title.includes("three zones")) {
    return `With clients, I often start by getting the map out of the clouds and into real life. Where are you drifting? Where are you genuinely progressing? Where are you telling yourself a comforting story because nothing has broken loudly enough yet? The map gives us a place to begin.`;
  }

  if (title.includes("brain")) {
    return `I do not ask people to hate their own mind. I ask them to understand its strategy. What does the pattern protect? What discomfort does it avoid? What reward does it get immediately, even if the long-term cost is high?`;
  }

  if (title.includes("regret")) {
    return `In coaching, regret is useful only if it arrives early enough to change behaviour. I want you to borrow wisdom from your future self before the bill becomes painful.`;
  }

  if (title.includes("environment")) {
    return `When a client is stuck, I look at the room, the routines and the people around the routine. Not as blame, but as design. A better environment reduces the amount of heroism required.`;
  }

  if (title.includes("motivation")) {
    return `If someone tells me they only act when they feel motivated, I know the system is fragile. We have to build something sturdier than mood: reminders, standards, scheduling, accountability and a next action small enough to begin.`;
  }

  if (title.includes("failure")) {
    return `After a mistake, I want specifics. Not, I am useless. Not, everything is ruined. What happened? What was controllable? What was not? What did the result reveal about preparation, process or support?`;
  }

  if (title.includes("performance system") || title.includes("stay out")) {
    return `A good system gives you feedback before life has to shout. It lets you catch the drift while it is still a small correction, not a dramatic rescue mission.`;
  }

  return `I am not looking for drama here. I am looking for facts. What is happening? What keeps happening? What do you say you want? What do you actually do? What does your calendar reveal? What does your body reveal? What do your relationships reveal? The facts are not there to shame you. They are there to give you something honest to work with.`;
}

function practicalWindow(section) {
  const title = section.title.toLowerCase();

  if (title.includes("environment")) {
    return `Look around the rooms you live and work in. What does each room make easier? What does it make harder? A room can coach you into movement or sedate you into drift. Your environment is already training you; the question is whether it is training the life you say you want.`;
  }

  if (title.includes("confidence")) {
    return `Confidence needs a ledger. Where have you kept a promise? Where have you practised when nobody was watching? Where have you done the awkward repetition? Your self-belief becomes sturdier when your memory has receipts.`;
  }

  if (title.includes("motivation")) {
    return `When motivation is high, use it. When it is low, do not worship its absence. Ask what the system says. Ask what the standard says. Ask what the next small action is. That is how you stop making mood the manager of your future.`;
  }

  if (title.includes("failure")) {
    return `A useful debrief has three windows: what happened, what did I learn, and what do I adjust next time? If you only punish yourself, you waste the data. If you only excuse yourself, you waste the lesson.`;
  }

  return `Use the idea through four practical windows: work, health, relationships and confidence. At work, ask where OK has become the default standard. In health, ask what your body has been trying to tell you politely before it has to shout. In relationships, ask where you have confused peace with avoidance. In confidence, ask what you keep waiting to feel before you are willing to practise.`;
}

function discomfortBridge(section) {
  const title = section.title.toLowerCase();

  if (title.includes("fear")) {
    return `If fear appears, do not automatically obey it and do not automatically fight it. Ask what it is protecting, what it is exaggerating, and what a brave but intelligent next move would look like.`;
  }

  if (title.includes("standard") || title.includes("hard")) {
    return `If a higher standard makes you uncomfortable, listen carefully. Sometimes discomfort means too much too soon. Sometimes it means the old identity has been asked to give up the steering wheel.`;
  }

  if (title.includes("stay out")) {
    return `When you notice drift, do not dramatise it. Correct it. Shame wants a whole courtroom. Leadership needs one clean next action.`;
  }

  return `If the idea makes you uncomfortable, do not rush to make the discomfort go away. Sit with it long enough to hear what it is saying. Sometimes discomfort says, I am being attacked. Sometimes it says, I have been found out. Sometimes it says, I want more, but I am scared of the cost. That last one is usually worth listening to.`;
}

function finalTurn(section) {
  if (section.part === "Closing") {
    return `Let the first move be small enough to do and meaningful enough to count. A better life does not begin when everything changes. It begins when you stop negotiating with the one thing you already know is true.`;
  }

  if (section.part.includes("Winning")) {
    return `Review is not punishment. It is maintenance. If you keep a system alive long enough, it begins to keep you alive in return.`;
  }

  if (section.part.includes("Build")) {
    return `Do the practice before you feel ready. The point is not to impress yourself with intensity. The point is to give your future self one more piece of evidence.`;
  }

  if (section.part.includes("Raise")) {
    return `Do not let the standard remain a sentence. Give it a behaviour. Give it a time. Give it a place. Give it enough structure to survive your mood.`;
  }

  return `This is where diagnosis earns its keep. Once you have named the pattern, do not leave it as information. Turn it into one cleaner decision.`;
}

async function main() {
  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });

  let totalWords = 0;

  for (const [index, section] of sections.entries()) {
    const body = buildBody(section);
    totalWords += wordCount(body);
    const slug = `${String(index).padStart(2, "0")}-${slugify(section.title)}`;
    const frontmatter = [
      "---",
      'bookSlug: "the-ok-zone"',
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

    await fs.writeFile(path.join(outputDir, `${slug}.md`), frontmatter, "utf8");
  }

  console.log(`the-ok-zone: ${sections.length} sections, ${totalWords} body words`);
}

await main();
