import type { MascotLifecycle } from '../mascot-lifecycle.js'

export interface MascotState {
  id: string
  category: 'emotion' | 'action' | 'ui' | 'learning' | 'prop' | 'seasonal'
  name: string
  intent: string
  emotion_intensity: 'none' | 'low' | 'medium' | 'high'
  pose: string
  face: string
  stage_compatibility: string[]
  approved_angles: string[]
  applicable_surfaces: string[]
  animation_possible: boolean
  source_assets: string[]
  preview: null
  /** Artwork lifecycle. The template ships every slot as `defined`: described, with no artwork. */
  status: MascotLifecycle
  do: string[]
  dont: string[]
  tags: string[]
  version: string
  owner: string
  mvp: boolean
  description: string
  visual_brief: string
  usage: string
}

export interface MascotStage {
  id: string
  order: number
  name: string
  configuration: 'example'
  summary: string
  silhouette: string
  costume: string
  personality_note: string
  continuity: string
  available_state_rule: string
  transition_brief: string
  status: 'draft'
}

export interface MascotAngle {
  id: string
  name: string
  description: string
  required_for_model_sheet: boolean
  status: 'draft'
}

export interface MascotMotion {
  id: string
  name: string
  trigger: string
  duration_ms: number
  easing: string
  repeat: 'once' | 'loop' | 'ping-pong'
  entrance: string
  exit: string
  audio_cue: string
  reduced_motion: string
  fallback_still: string
  performance_budget: string
  formats: string[]
  status: 'draft'
}

const BASE_DO = [
  'Wait for an approved master tied to this id before using it in product or marketing.',
  'Keep the pose readable at the smallest surface listed.',
]
const BASE_DONT = [
  'Do not generate artwork and mark this catalog row approved.',
  'Do not borrow another brand’s character to fill the preview.',
  'Do not use this state to claim a product feature that is unshipped.',
]

function row(
  category: MascotState['category'],
  slug: string,
  name: string,
  intensity: MascotState['emotion_intensity'],
  intent: string,
  pose: string,
  face: string,
  usage: string,
  mvp: boolean,
  surfaces: string[] = ['product', 'marketing', 'onboarding'],
): MascotState {
  return {
    id: `mascot.${category}.${slug}`,
    category,
    name,
    intent,
    emotion_intensity: intensity,
    pose,
    face,
    stage_compatibility: ['any'],
    approved_angles: [],
    applicable_surfaces: surfaces,
    animation_possible: category !== 'seasonal',
    source_assets: [],
    preview: null,
    status: 'defined',
    do: BASE_DO,
    dont: BASE_DONT,
    tags: ['mascot', category, slug, mvp ? 'mvp' : 'backlog'],
    version: '0.1.0',
    owner: 'design',
    mvp,
    description: `${name} is a proposed ${category} slot. No approved artwork exists in the template.`,
    visual_brief: `EXAMPLE brief only: ${intent} Pose: ${pose}. Face: ${face}. Leave the drawing TBD.`,
    usage,
  }
}

const emotions: Array<[string, string, MascotState['emotion_intensity'], string, boolean]> = [
  ['joyful', 'Joyful', 'high', 'Uncomplicated happiness after a real success.', true],
  ['delighted', 'Delighted', 'high', 'A warmer, smaller surprise than full celebration.', true],
  ['sad', 'Sad', 'medium', 'Quiet disappointment without guilt.', true],
  ['angry', 'Angry', 'high', 'Firm boundary. Not cruelty and not a tantrum aimed at the user.', false],
  ['crying', 'Crying', 'high', 'Visible upset reserved for story moments, not ordinary errors.', false],
  ['surprised', 'Surprised', 'medium', 'Short reaction to something new.', false],
  ['excited', 'Excited', 'high', 'Forward energy before an action starts.', false],
  ['confused', 'Confused', 'medium', 'The character does not understand yet and is not blaming the user.', true],
  ['proud', 'Proud', 'medium', 'Satisfaction in effort, not superiority.', false],
  ['embarrassed', 'Embarrassed', 'low', 'A small mistake, recovered quickly.', false],
  ['determined', 'Determined', 'medium', 'Continuing after friction.', true],
  ['curious', 'Curious', 'medium', 'Attention toward something worth inspecting.', true],
  ['sleepy', 'Sleepy', 'low', 'Rest, end of session, or a gentle pause.', false],
  ['worried', 'Worried', 'medium', 'Concern that invites a next step, not panic.', true],
  ['relieved', 'Relieved', 'medium', 'A problem just became solvable.', false],
  ['frustrated', 'Frustrated', 'medium', 'Stuck, but still respectful.', false],
  ['thankful', 'Thankful', 'low', 'Acknowledgement of help or patience.', false],
  ['playful', 'Playful', 'medium', 'Lightness that must not undercut a serious error.', false],
  ['focused', 'Focused', 'low', 'Working attention with little theatrical emotion.', false],
  ['celebrating', 'Celebrating', 'high', 'A rare peak. Do not use it for routine clicks.', true],
]

const actions: Array<[string, string, string, boolean]> = [
  ['standing', 'Standing', 'Neutral resting stance used as the fallback still.', true],
  ['waving', 'Waving', 'Hello or goodbye without blocking the primary control.', true],
  ['greeting', 'Greeting', 'Arrival posture when a session starts.', false],
  ['pointing', 'Pointing', 'Direct attention to a control or a piece of content.', true],
  ['running', 'Running', 'Movement between places. Not a loading spinner by default.', false],
  ['jumping', 'Jumping', 'A short upward action for delight, not for errors.', false],
  ['flying', 'Flying', 'Optional travel metaphor. Skip if the character cannot leave the ground.', false],
  ['landing', 'Landing', 'End of a move, returning to a stable pose.', false],
  ['dancing', 'Dancing', 'Optional celebration variant. Rare.', false],
  ['thinking', 'Thinking', 'Considering a choice. Pairs with confused or focused faces.', true],
  ['reading', 'Reading', 'Attention on a text object. Do not imply a specific curriculum.', false],
  ['cheering', 'Cheering', 'Encouragement directed at the user’s effort.', true],
  ['sitting', 'Sitting', 'Calm presence beside long-form content.', false],
  ['stretching', 'Stretching', 'Reset or break. Not a medical claim.', false],
  ['hiding', 'Hiding', 'Peeking from an edge. Do not use it to obscure required information.', false],
  ['looking-around', 'Looking around', 'Searching the scene before offering help.', false],
  ['listening', 'Listening', 'Attending to the user or to audio. Silent fallback required.', false],
  ['presenting', 'Presenting', 'Introducing a feature that product status allows.', false],
  ['thumbs-up-equivalent', 'Affirming gesture', 'A culturally careful “yes” gesture. Do not assume a thumbs-up is universal.', false],
  ['resting', 'Resting', 'Done for now. Supports end-of-session and reduced-motion stillness.', false],
]

const uiStates: Array<[string, string, string, boolean]> = [
  ['welcome', 'Welcome', 'First hello on a surface the product actually has.', true],
  ['onboarding', 'Onboarding', 'Guides a first-run step that is in scope.', true],
  ['empty-state', 'Empty state', 'Nothing here yet, with a single next step.', true],
  ['loading', 'Loading', 'Waiting. Must have a non-animated fallback.', true],
  ['offline', 'Offline', 'Connectivity problem, including maintenance if you later split it.', false],
  ['success', 'Success', 'A completed action. Distinct from rare celebration.', true],
  ['failure', 'Failure', 'Something failed. Tone stays respectful.', true],
  ['retry', 'Retry', 'Offers another attempt without blame.', false],
  ['hint', 'Hint', 'Points at help the user did not fail to deserve.', true],
  ['reminder', 'Reminder', 'A nudge that can be dismissed.', false],
  ['notification', 'Notification', 'A small alert. Not a full-screen takeover by default.', false],
  ['level-complete', 'Level complete', 'Only if progression exists. Otherwise leave unused.', false],
  ['streak', 'Streak', 'Only if a streak rule exists. No invented day count.', false],
  ['unlock', 'Unlock', 'A newly available capability that is really shipped.', false],
  ['permission-request', 'Permission request', 'Asks for a device or data permission honestly.', false],
]

const learning: Array<[string, string, string, boolean]> = [
  ['flashcard-practice', 'Flashcard practice', 'Short recall drill. Education-specific.', false],
  ['recall', 'Recall', 'Remembering without showing the answer first.', false],
  ['new-word', 'New word', 'Introducing one new item.', false],
  ['sentence-practice', 'Sentence practice', 'Using an item in a sentence.', false],
  ['quiz', 'Quiz', 'A check, not a trick.', false],
  ['pronunciation', 'Pronunciation', 'Speaking or listening to a form. Needs a silent alternative.', false],
  ['listening', 'Listening', 'Audio-led task with captions or a transcript path.', false],
  ['speaking', 'Speaking', 'User production. No fake fluency score.', false],
  ['writing', 'Writing', 'Text production.', false],
  ['review', 'Review', 'Returning to older material.', false],
  ['spaced-repetition', 'Spaced repetition', 'Only if that method is actually chosen.', false],
  ['hard-word', 'Hard item', 'An item the learner is struggling with. No shame.', false],
  ['lesson-completed', 'Lesson completed', 'The end of a unit that exists in the product.', true],
  ['encouragement', 'Encouragement', 'Support mid-task.', true],
  ['progress', 'Progress', 'Showing movement through a real syllabus.', true],
]

const props: Array<[string, string, string]> = [
  ['book', 'Book', 'A generic book prop. Do not show a real title.'],
  ['pencil', 'Pencil', 'A writing tool.'],
  ['headphones', 'Headphones', 'Audio equipment for listening states.'],
  ['speech-bubble', 'Speech bubble', 'Holds approved copy only. No placeholder jokes in production.'],
  ['trophy', 'Trophy', 'Optional reward object. No invented prize.'],
  ['badge', 'Badge', 'Pairs with the badge rules in iconography.'],
  ['map', 'Map', 'A generic map, not a claim about a market.'],
  ['phone', 'Phone', 'A device frame only when the product is on a phone.'],
  ['star', 'Star', 'A small emphasis mark, not a rating of the user.'],
  ['ticket', 'Ticket', 'An access or event prop. Seasonal campaigns may reuse it.'],
]

const seasonal: Array<[string, string, string]> = [
  ['birthday', 'Birthday', 'Only when a real birthday moment is in scope and appropriate.'],
  ['new-year', 'New year', 'A new-year variant. Do not assume a calendar for the user.'],
  ['winter', 'Winter', 'Seasonal dressing. Not a claim that every market has this season now.'],
  ['spring', 'Spring', 'Seasonal dressing.'],
  ['summer', 'Summer', 'Seasonal dressing.'],
  ['autumn', 'Autumn', 'Seasonal dressing.'],
  ['launch', 'Launch', 'A release moment that product status allows.'],
  ['anniversary', 'Anniversary', 'Only after a real date exists.'],
  ['special-event', 'Special event', 'A named event the owner supplied.'],
  ['community-milestone', 'Community milestone', 'A group achievement with evidence, not a fake user count.'],
]

export function buildMascotCatalog(): MascotState[] {
  const states: MascotState[] = []
  for (const [slug, name, intensity, intent, mvp] of emotions) {
    states.push(
      row('emotion', slug, name, intensity, intent, 'Readable full body or bust, not distorted', intent, `Emotional beat: ${name}.`, mvp),
    )
  }
  for (const [slug, name, intent, mvp] of actions) {
    states.push(row('action', slug, name, 'low', intent, intent, 'Face supports the action and stays on-model.', `Action beat: ${name}.`, mvp))
  }
  for (const [slug, name, intent, mvp] of uiStates) {
    states.push(
      row(
        'ui',
        slug,
        name,
        slug === 'failure' ? 'medium' : 'low',
        intent,
        'Leave room for UI controls. Do not cover the primary button.',
        intent,
        `Product UI situation: ${name}.`,
        mvp,
        ['product'],
      ),
    )
  }
  for (const [slug, name, intent, mvp] of learning) {
    states.push(
      row(
        'learning',
        slug,
        name,
        'low',
        intent,
        'Beside the learning surface, not instead of the content.',
        intent,
        `Learning context: ${name}. Skip the whole category if the sector is not education.`,
        mvp,
        ['product', 'education'],
      ),
    )
  }
  for (const [slug, name, intent] of props) {
    states.push(
      row(
        'prop',
        slug,
        name,
        'none',
        intent,
        `Interacting with a ${name.toLowerCase()} prop that is not a licensed third-party object.`,
        'Expression stays secondary to the prop’s readability.',
        `Prop interaction: ${name}.`,
        slug === 'speech-bubble',
        ['product', 'marketing'],
      ),
    )
  }
  for (const [slug, name, intent] of seasonal) {
    states.push(
      row(
        'seasonal',
        slug,
        name,
        'medium',
        intent,
        'Same character, seasonal accent only. Costume must not break silhouette rules.',
        'Match the campaign emotion the owner approved.',
        `Seasonal or campaign variant: ${name}.`,
        slug === 'launch',
        ['marketing', 'social'],
      ),
    )
  }
  return states
}

export const EXAMPLE_STAGES: MascotStage[] = [
  {
    id: 'example.stage.egg',
    order: 1,
    name: 'Egg / emergence',
    configuration: 'example',
    summary: 'EXAMPLE CONFIGURATION. A contained form before limbs are reliable. Not a universal brand rule.',
    silhouette: 'Simple closed shape. No extra features that later stages cannot explain.',
    costume: 'None beyond the shell motif.',
    personality_note: 'Potential, not competence.',
    continuity: 'A mark introduced here must be drawable later.',
    available_state_rule: 'Prefer resting, curious, and welcome. Avoid complex props.',
    transition_brief: 'To hatchling: a short crack or crossfade. Reduced motion cuts to the next still.',
    status: 'draft',
  },
  {
    id: 'example.stage.hatchling',
    order: 2,
    name: 'Hatchling / beginner',
    configuration: 'example',
    summary: 'EXAMPLE CONFIGURATION. First mobile form. Proportions read as young without caricature.',
    silhouette: 'Large head relative to body only if that rule is approved. Otherwise TBD.',
    costume: 'Minimal, so the body plan stays visible.',
    personality_note: 'Beginner energy. No incompetence jokes.',
    continuity: 'Keep the mark from the egg stage if one was approved.',
    available_state_rule: 'Onboarding, confused, determined, listening.',
    transition_brief: 'To explorer: add one capability cue, not a full costume change.',
    status: 'draft',
  },
  {
    id: 'example.stage.explorer',
    order: 3,
    name: 'Young explorer / early learner',
    configuration: 'example',
    summary: 'EXAMPLE CONFIGURATION. The character can point, read, and travel a short distance.',
    silhouette: 'Stable profile so side angles stay recognizable.',
    costume: 'One optional prop slot.',
    personality_note: 'Curious first.',
    continuity: 'Face proportions do not reset.',
    available_state_rule: 'Most core UI states. Flight only if the body plan allows it.',
    transition_brief: 'To trainee: a small responsibility cue. Placeholder, not an XP cost.',
    status: 'draft',
  },
  {
    id: 'example.stage.trainee',
    order: 4,
    name: 'Trainee / growing competence',
    configuration: 'example',
    summary: 'EXAMPLE CONFIGURATION. More upright posture. Still not an expert.',
    silhouette: 'Slightly taller stance. Do not lose the original mark.',
    costume: 'Training cue that is not a real uniform unless the owner defines one.',
    personality_note: 'Effort is visible. Results are not guaranteed.',
    continuity: 'Hands, face, and mark match the model sheet.',
    available_state_rule: 'Practice, retry, focused, presenting.',
    transition_brief: 'To pilot: one confidence cue. Reduced motion is a cut.',
    status: 'draft',
  },
  {
    id: 'example.stage.pilot',
    order: 5,
    name: 'Skilled pilot / advanced learner',
    configuration: 'example',
    summary: 'EXAMPLE CONFIGURATION. Capable silhouette. “Pilot” is a metaphor in this example, not a product feature.',
    silhouette: 'Controlled, not bulky.',
    costume: 'Functional accent only.',
    personality_note: 'Calm competence.',
    continuity: 'Earlier-stage viewers must still recognize the character.',
    available_state_rule: 'Full MVP set plus travel poses if approved.',
    transition_brief: 'To captain: a responsibility cue, not a crown, unless the owner asks for one.',
    status: 'draft',
  },
  {
    id: 'example.stage.captain',
    order: 6,
    name: 'Professional captain / mastery',
    configuration: 'example',
    summary: 'EXAMPLE CONFIGURATION. The most capable form in the example. Mastery is not a claim about the user.',
    silhouette: 'Distinct from the egg, recognizably the same character.',
    costume: 'Highest complexity allowed by the continuity rules.',
    personality_note: 'Steady. Does not talk down.',
    continuity: 'No new species traits.',
    available_state_rule: 'All catalog states that the owner has not marked out of model.',
    transition_brief: 'No further stage in this example. Loop back only if the owner adds one.',
    status: 'draft',
  },
]

function angle(id: string, name: string, description: string, requiredForModelSheet: boolean): MascotAngle {
  return { id: `mascot.angle.${id}`, name, description, required_for_model_sheet: requiredForModelSheet, status: 'draft' }
}

export const CANONICAL_ANGLES: MascotAngle[] = [
  angle('front', 'Front', 'Primary readable view.', true),
  angle('back', 'Back', 'Confirms the silhouette without the face.', false),
  angle('left-profile', 'Left profile', 'Pure side view, facing left.', false),
  angle('right-profile', 'Right profile', 'Pure side view, facing right.', false),
  angle('front-left-three-quarter', 'Front-left three-quarter', 'Usually the most useful second angle.', true),
  angle('front-right-three-quarter', 'Front-right three-quarter', 'Mirror of the front-left angle, not a flipped accident if the design is asymmetric.', false),
  angle('rear-left-three-quarter', 'Rear-left three-quarter', 'Back corner.', false),
  angle('rear-right-three-quarter', 'Rear-right three-quarter', 'Back corner.', false),
]

function motion(
  id: string,
  name: string,
  trigger: string,
  durationMs: number,
  repeat: MascotMotion['repeat'],
  entrance: string,
  exit: string,
  audioCue: string,
  reducedMotion: string,
): MascotMotion {
  return {
    id: `mascot.motion.${id}`,
    name,
    trigger,
    duration_ms: durationMs,
    easing: 'standard',
    repeat,
    entrance,
    exit,
    audio_cue: audioCue,
    reduced_motion: reducedMotion,
    fallback_still: `Still frame for ${name}. File missing until art exists.`,
    performance_budget: 'TBD. Keep under one lightweight JSON animation or a CSS transform. No video autoplay.',
    formats: ['css', 'svg', 'lottie'],
    status: 'draft',
  }
}

export const CORE_MOTIONS: MascotMotion[] = [
  motion('idle-breathing', 'Idle breathing', 'Character is present and waiting', 2400, 'loop', 'Opacity or a 2px vertical drift', 'Return to the rest pose', 'None', 'Hold the rest still'),
  motion('blinking', 'Blinking', 'Idle life', 180, 'loop', 'Lids close', 'Lids open', 'None', 'Do not blink. Show the open still'),
  motion('waving', 'Waving', 'Greeting', 900, 'once', 'Arm rises', 'Arm returns', 'Optional soft tick, off by default', 'Show the raised-hand still'),
  motion('jump', 'Jump', 'Short delight', 700, 'once', 'Anticipation crouch', 'Landing pose', 'None by default', 'Cut to the landing still'),
  motion('cheering', 'Cheering', 'Encouragement', 1000, 'once', 'Gather', 'Rest', 'None by default', 'Show the cheer still once'),
  motion('sad-reaction', 'Sad reaction', 'Respectful disappointment', 800, 'once', 'Small settle', 'Hold', 'None', 'Show the sad still'),
  motion('confused-thinking', 'Confused thinking', 'Needs a hint', 1200, 'ping-pong', 'Head tilt in', 'Head tilt out', 'None', 'Show the thinking still'),
  motion('walking-running', 'Walking or running', 'Relocation', 800, 'loop', 'First step', 'Last step', 'Optional footsteps, off by default', 'Show a single stride still'),
  motion('flying-moving', 'Flying or moving', 'Optional travel', 1000, 'loop', 'Lift', 'Level motion', 'None', 'Show a static travel pose or skip if the character cannot fly'),
  motion('listening', 'Listening', 'Audio or user speech', 1600, 'loop', 'Attention in', 'Attention hold', 'None. Never require sound', 'Show the listening still and captions elsewhere'),
  motion('celebration', 'Celebration', 'Rare peak', 1400, 'once', 'Gather', 'Settle', 'Optional, user-controlled', 'Show the celebrating still once'),
  motion('level-up', 'Level up', 'Stage or progress change', 1200, 'once', 'Old stage', 'New stage still', 'None until a sound is licensed', 'Crossfade or hard cut'),
  motion('success', 'Success', 'Completed action', 600, 'once', 'Small nod or lift', 'Rest', 'None by default', 'Show the success still'),
  motion('failure', 'Failure', 'Failed action', 600, 'once', 'Small settle', 'Offer pose', 'No buzzer', 'Show the failure still and the next step in UI'),
  motion('loop-transition', 'Loop transition', 'Between two cycles', 320, 'once', 'End of previous loop', 'Start of next loop', 'None', 'Hard cut'),
]

export function catalogCounts(states: MascotState[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const state of states) counts[state.category] = (counts[state.category] ?? 0) + 1
  return counts
}
