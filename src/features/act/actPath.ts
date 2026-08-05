export type PathLessonId =
  | 'path-1'
  | 'path-2'
  | 'path-3'
  | 'path-4'
  | 'path-5'
  | 'path-6'

export interface PathSection {
  heading: string
  body: string
}

export interface PathLesson {
  id: PathLessonId
  part: number
  title: string
  theme: string
  story: PathSection[]
  reflectionPrompt: string
  closingThought: string
}

export const PATH_LESSONS: PathLesson[] = [
  {
    id: 'path-1',
    part: 1,
    title: 'How Sleep Actually Works',
    theme: 'Sleep is biology, not a performance',
    story: [
      {
        heading: 'The hourglass',
        body: `From the moment you wake up, a molecule called adenosine begins quietly building up in your brain — a byproduct of the energy your neurons burn all day. The longer you're awake, the more it accumulates, like sand filling an hourglass. By evening, if you've been awake long enough, that pressure is substantial.\n\nThis is "sleep pressure," one of two systems that decide when you'll feel sleepy. Coffee doesn't drain the hourglass — it just blocks the sensors that detect the sand, which is often why tiredness returns all at once when it wears off.`,
      },
      {
        heading: 'The internal clock',
        body: `The second system is a roughly 24-hour clock in your brain — the circadian rhythm — that runs almost independent of how tired you feel. It's set mainly by light. When your eyes register dimming light in the evening, a signal reaches the pineal gland, which releases melatonin: a hormone that tells the rest of the body "night has started."\n\nMelatonin isn't a sedative — it doesn't knock you out. It opens a biological window during which sleep becomes easier to fall into, especially once combined with enough accumulated sleep pressure.`,
      },
      {
        heading: 'Why mornings happen on their own',
        body: `Near the end of a full night's sleep, a third player shifts: cortisol — often thought of only as a "stress hormone" — begins rising a few hours before you naturally wake. This is the cortisol awakening response, a completely normal, healthy signal that prepares your body for daytime activity.\n\nIf you've ever woken slightly before your alarm feeling alert, that's often this system doing exactly what it's built to do — not a sign that something is wrong with your sleep.`,
      },
      {
        heading: `Sleep isn't something you do`,
        body: `Put together: sleep pressure builds all day, melatonin opens a window as darkness falls, and cortisol closes the night down again in the morning. None of this requires your effort. You don't manufacture sleep the way you complete a task — you create conditions (time, darkness, a quieter nervous system), and your biology handles the rest.\n\nThis matters because so much of nighttime struggle comes from treating sleep like a project to force. It isn't. It's closer to digestion, or a cut healing — a background process that runs when you stop interfering with it. Every lesson ahead builds on exactly this idea.`,
      },
    ],
    reflectionPrompt: `Knowing that sleep pressure, melatonin, and cortisol are running quietly in the background whether or not you "try" — what's one thing you've been doing that might be interfering with a process that's already built to work?`,
    closingThought: `You don't have to make sleep happen. You only have to stop getting in its way.`,
  },
  {
    id: 'path-2',
    part: 2,
    title: 'Giving Up the Struggle',
    theme: 'The paradox of control',
    story: [
      {
        heading: 'The ritual',
        body: `Picture someone lying awake at midnight. Phone face-down. Counting breaths. Calculating hours left before the alarm. They've tried warm milk, lavender spray, a no-blue-light app, special socks. Each thing seemed to help for a night — then stopped.\n\nThis is nearly everyone with bad sleep. Not because they're doing it wrong, but because they keep doing something at all.`,
      },
      {
        heading: 'The control trap',
        body: `The human mind is brilliant at solving problems. It evolved to find solutions, repeat what works, and fix what's broken. That works beautifully for most things.\n\nBut sleep isn't a problem you solve. It's something that happens when the problem-solving mind steps back. The harder the mind tries, the more awake it keeps you — because trying is itself a signal that something is wrong.`,
      },
      {
        heading: 'The paradox',
        body: `Try right now to yawn. Can you force one? Try to sneeze. Try to genuinely laugh at something that isn't funny.\n\nSome important things happen on their own. Sleep is one of them. The very effort to make it happen signals your nervous system that something is urgent — and it responds by keeping you alert.\n\nThe control strategy that feels most responsible is often what's making things worse.`,
      },
      {
        heading: 'An invitation',
        body: `What if the work wasn't to try harder, but to stop fighting?\n\nNot giving up. Not accepting defeat. Just loosening the grip — even for a moment — to see what happens when you stop treating the night like something to conquer.\n\nYou don't have to believe this yet. Just hold it as a possibility.`,
      },
      {
        heading: 'Tonight',
        body: `You don't have to overhaul everything at once. If you catch yourself reaching for a control strategy tonight — checking the clock, recalculating hours left, forcing your eyes shut harder — just notice it. "There's the old strategy again."\n\nYou don't need to stop it perfectly. Noticing is the whole practice for tonight.`,
      },
    ],
    reflectionPrompt: `What sleep control strategy have you relied on most? Honestly — what has it cost you, and what has it actually delivered?`,
    closingThought: `The first move in ACT-for-sleep isn't a technique. It's noticing that control has been the direction — and wondering if there's another way.`,
  },
  {
    id: 'path-3',
    part: 3,
    title: 'The Part That Watches',
    theme: 'You are the sky, not the weather',
    story: [
      {
        heading: 'The room in the storm',
        body: `Imagine a small room during a storm. Rain batters the window. Lightning flashes. Thunder shakes the walls. The storm is real, loud, impossible to ignore.\n\nBut the room itself doesn't get swept away. It holds the storm. It doesn't become it.`,
      },
      {
        heading: 'Thoughts are weather',
        body: `When sleep won't come, the mind generates weather: anxious predictions, replayed conversations, tomorrow's problems lined up in a row. Your heart rate rises. Your chest tightens. You feel like you are the storm.\n\nBut there is always something in you that notices. Something that watches the anxious thoughts without being made of them. A quieter presence beneath the noise.`,
      },
      {
        heading: `The witness that doesn't sleep`,
        body: `Think back to sleepless nights over the years. There was a part of you present for all of them — watching, noticing, sometimes suffering. That part stayed consistent while thoughts came and went.\n\nACT calls this the "observing self." It's not a technique. It's something you already have. You've just been so caught in the weather that you forgot about the room.`,
      },
      {
        heading: 'Finding the space',
        body: `Right now, notice the part of you reading these words. Not the thoughts that arise as you read — just the presence that's aware of them.\n\nIn a hard night, you can return here: "I notice I'm having these thoughts. I'm not these thoughts."\n\nThat noticing space can hold a lot without being destroyed by it.`,
      },
      {
        heading: 'Tonight',
        body: `When a thought pulls you into the storm, try silently naming it: "a thought about tomorrow," "a worry about work," "a fear about not sleeping." Naming is a small way of stepping back into the room, rather than becoming the weather.\n\nYou don't need to solve the thought — just notice you're the one noticing it.`,
      },
    ],
    reflectionPrompt: `What does "the part that watches" feel like for you? Can you sense it now — the one that has been here through every night, observing?`,
    closingThought: `The sky doesn't fight the clouds. You are the sky.`,
  },
  {
    id: 'path-4',
    part: 4,
    title: 'The Permission',
    theme: `Acceptance isn't surrender — it's stopping the second fight`,
    story: [
      {
        heading: 'Swimming against the river',
        body: `Picture someone dropped into a fast river, fighting the current with everything they have. Every stroke burns. They're exhausted within minutes. The river isn't changed — but they are.\n\nNow picture someone who stops fighting and floats. They're still in the same river. They haven't "won." But they're no longer burning everything on a battle they can't win.`,
      },
      {
        heading: `What acceptance isn't`,
        body: `Acceptance doesn't mean "I'm fine with being awake." It doesn't mean giving up, or pretending insomnia doesn't hurt.\n\nAcceptance means: "I'm going to stop fighting the fact that I'm awake right now." Stopping the second fight — the one with your own experience — on top of the discomfort that's already there.`,
      },
      {
        heading: 'Two layers of suffering',
        body: `When you can't sleep, there's the wakefulness itself: a tired body, a mind that won't quiet. That's real and hard.\n\nThen there's the second layer: "This is terrible. I can't cope. Why is this happening? I have to fix this." That second layer is optional — and often hurts more than the first.\n\nAcceptance targets only that second layer.`,
      },
      {
        heading: 'The experiment',
        body: `Try this, right now: for 60 seconds, completely allow yourself to be awake. Not fighting it, not hoping it stops, not planning what to try next. Just being awake — noticing the sensations of an awake body in a quiet room.\n\nYou might notice something surprising. The body, when it stops fighting itself, often softens — not into sleep, but into rest.`,
      },
      {
        heading: 'Tonight',
        body: `If sleep doesn't come quickly, try the 60-second experiment again, for real: stop trying, stop checking, and let yourself simply be awake in the dark. Not as defeat — as an experiment in reducing the second fight.\n\nSee what, if anything, softens.`,
      },
    ],
    reflectionPrompt: `What does it feel like in your body when you stop fighting wakefulness, even briefly? What's the second fight you most often add on top of the first?`,
    closingThought: `Willingness isn't about liking the situation. It's about choosing not to add more struggle on top.`,
  },
  {
    id: 'path-5',
    part: 5,
    title: 'The Radio',
    theme: `Defusion — changing your relationship with thoughts`,
    story: [
      {
        heading: 'The midnight broadcast',
        body: `Imagine a radio in your bedroom that turns on at 2 a.m. It plays one kind of programming: "You're not going to sleep tonight. You'll be useless tomorrow. This is ruining you."\n\nThe voice is confident, authoritative, detailed. It sounds like truth. It sounds exactly like you.`,
      },
      {
        heading: 'You are not the radio',
        body: `The radio is your mind — brilliant at pattern recognition, very motivated to prepare you for danger, and sometimes stuck on a late-night loop.\n\nDefusion isn't about turning the radio off. It's about recognizing: this is the radio, not reality. You can hear it without believing every word it broadcasts.`,
      },
      {
        heading: 'Techniques are just handles',
        body: `You've already tried some tools: "I'm having the thought that…", passengers on the bus, leaves on a stream. These aren't magic — they're different ways of holding the radio at arm's length.\n\nThe insight beneath all of them is the same: thoughts are events in your mind. They have a shape and a tone — but they are not facts, and you are not obligated to act on them.`,
      },
      {
        heading: 'The noticing moment',
        body: `When the midnight radio starts: pause. Notice it: "There it is. Thanks, mind — that's the catastrophizing channel again."\n\nThen ask: what do I actually need right now, this moment? The answer is often simple: breathe, feel the bed, let the night be.\n\nThe radio may keep playing. That's allowed. You just don't have to hand it the wheel.`,
      },
      {
        heading: 'Tonight',
        body: `Give your midnight radio a name if it starts broadcasting — something a little playful takes the edge off its authority. "Oh, it's the 3 a.m. Doom Report again."\n\nYou're not arguing with the broadcast or turning it off. You're just recognizing whose voice it actually is.`,
      },
    ],
    reflectionPrompt: `What does your midnight radio broadcast most often? Can you hear it — right now — as just a voice, rather than a fact? What's the difference?`,
    closingThought: `You can't delete a thought. You can change how much of your life it drives.`,
  },
  {
    id: 'path-6',
    part: 6,
    title: 'The Compass',
    theme: 'When sleep becomes everything',
    story: [
      {
        heading: 'The narrowed life',
        body: `When insomnia gets bad, sleep gradually becomes the center of everything. Decisions get filtered through "will this help me sleep?" Energy is budgeted carefully. Social plans become risks. Exercise becomes a calculation.\n\nInsomnia doesn't just take your nights. Quietly, slowly, it can begin to take your days too.`,
      },
      {
        heading: 'The hidden tax',
        body: `What have you given less of yourself to since sleep became a problem? Evenings with people you love. Creative work quietly shelved. Physical activity that felt too risky. Experiences you passed on — to protect sleep that didn't come anyway.\n\nSleep anxiety has a tax. It's paid in the currency of things that actually matter to you.`,
      },
      {
        heading: 'The compass points elsewhere',
        body: `ACT-for-sleep isn't about curing insomnia so you can get back to your life. It's about noticing that your life is already happening — and that your values are still there, pointing somewhere, even on the hardest nights.\n\nPresence with people. Craft and creativity. Showing up with care. Moving your body. None of these require perfect sleep. They require direction.`,
      },
      {
        heading: `The driver's seat`,
        body: `Sleep has been in the driver's seat. Your values — what you'd want your life to be about if sleep was already fine — those are the compass.\n\nEven a small move in a valued direction on a tired day is significant. Not because it fixes sleep. Because it reclaims something insomnia has been quietly taking from you.`,
      },
      {
        heading: 'Tonight',
        body: `Before you turn off the light, name one value tomorrow could serve — regardless of how you sleep tonight. You don't need energy to remember it.\n\nYou just need to let it be the compass you check in with tomorrow, tired or not.`,
      },
    ],
    reflectionPrompt: `What's one area of your life sleep anxiety has quietly taxed most? What's one small, specific thing you could do tomorrow — regardless of tonight — that moves toward what matters?`,
    closingThought: `Sleep becomes less tyrannical when life has direction beyond it.`,
  },
]

export function getPathLesson(id: string): PathLesson | undefined {
  return PATH_LESSONS.find((l) => l.id === id)
}
