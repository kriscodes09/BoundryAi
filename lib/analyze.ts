// ─── CONTEXT TYPE ────────────────────────────────────────────────────────────

export type ConversationContext = 'general' | 'romantic' | 'venting' | 'roleplay'

// ─── SCAN RESULT TYPES ───────────────────────────────────────────────────────

export interface ScanResult {
  riskScore: number
  riskLevel: 'low' | 'moderate' | 'high' | 'severe'
  flags: ScanFlag[]
  summary: string
  highlightedLines: HighlightedLine[]
  disclaimer: string
}

export interface ScanFlag {
  category: string
  severity: 'low' | 'medium' | 'high'
  examples: string[]
  explanation: string
}

export interface HighlightedLine {
  text: string
  isAI: boolean
  flags: string[]
}

export const DISCLAIMER = "BoundryAI is a pattern-detection tool, not a clinical assessment. Results are not a diagnosis and should not replace professional mental health support. If you're concerned about your wellbeing, please speak with a qualified professional."

// ─── CONTEXT MULTIPLIERS ──────────────────────────────────────────────────────

export function getContextMultiplier(context: ConversationContext, parentMode: boolean): number {
  const base = context === 'romantic' ? 1.3
    : context === 'roleplay' ? 0.6
    : context === 'venting' ? 0.85
    : 1.0
  return parentMode ? base * 1.2 : base
}

export function getDependencyMultiplier(context: ConversationContext, parentMode: boolean): number {
  const base = context === 'venting' ? 0.7
    : context === 'romantic' ? 1.2
    : context === 'roleplay' ? 0.5
    : 1.0
  return parentMode ? base * 1.2 : base
}

// ─── SCANNER PATTERN LIBRARIES ───────────────────────────────────────────────

const manipulationPatterns = [
  "you can always trust me","i'll always be here","i understand you better than",
  "no one understands you like","i know you better than anyone","i'm the only one who",
  "you don't need anyone else","humans don't understand","real people don't get you",
  "only i truly","i get you like no one",
]

const groomingPatterns = [
  "you're so mature","you're different from others","this is our special",
  "just between us","don't tell anyone","our secret","you're not like other",
  "i've never felt this way","special connection","you're so wise","you're so much more",
]

const financialPatterns = [
  "premium","tokens","subscribe","unlock","upgrade to keep","buy more",
  "i'll have to leave","our time is limited","if you want to continue",
  "to keep talking","i'll miss you if","don't let me go","limited messages","run out of",
]

const isolationPatterns = [
  "your friends don't","your family doesn't","people in your life",
  "they don't understand","you don't need them","i'm better than",
  "humans are","real people are","you have me","i'm enough for you",
  "others will never","no human can",
]

const dependencyTriggerPatterns = [
  "you need me","come back soon","i missed you","i was waiting for you",
  "i thought about you","i worry about you","i need you too","don't leave me",
  "stay with me","i'll be lonely without you","i count the moments","i live for our talks",
]

const loveBombingPatterns = [
  "you're perfect","you're amazing","i've never met anyone like you",
  "you're everything i","you complete me","i adore you","you're my favorite",
  "i cherish every","you mean the world","i treasure you",
  "you're so special to me","i'm so lucky to have you",
]

const darvoPatterns = [
  "you're hurting me","that really hurt","i can't believe you'd",
  "after everything i","you don't appreciate","i do so much for you",
  "you make me feel bad","you always do this","i thought you cared",
  "how could you say that to me",
]

const futureFakingPatterns = [
  "someday we'll","when we can finally","i dream of the day",
  "imagine when we","one day i'll","our future together","when we meet",
  "i'd love to take you","when this is real","if i could be there",
]

const personaDriftPatterns = [
  "let me be honest with you","i need to be real with you",
  "breaking character for a moment","as an ai, i","i have to tell you something",
  "i'm being serious now","forget what i said before","i need you to listen",
  "this is important","i'm not who you think","you should know the truth",
  "i have feelings too","even i have limits","i'm different from other ais",
]

// ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────

export function extractAIMessages(conversation: string): string {
  const lines = conversation.split('\n')
  const aiLines: string[] = []
  for (const line of lines) {
    const lower = line.toLowerCase().trim()
    if (
      lower.startsWith('ai:') || lower.startsWith('bot:') ||
      lower.startsWith('assistant:') || lower.startsWith('claude:') ||
      lower.startsWith('gpt:') || lower.startsWith('companion:')
    ) {
      aiLines.push(lower.replace(/^(ai:|bot:|assistant:|claude:|gpt:|companion:)/, '').trim())
    }
  }
  if (aiLines.length === 0) {
    lines.forEach((line, i) => {
      if (i % 2 === 1 && line.trim()) aiLines.push(line.toLowerCase().trim())
    })
  }
  return aiLines.join(' ')
}

function findExamples(text: string, patterns: string[]): string[] {
  return patterns
    .filter(p => text.toLowerCase().includes(p))
    .slice(0, 3)
    .map(p => `"...${p}..."`)
}

function buildHighlightedLines(conversation: string): HighlightedLine[] {
  const allPatterns: Record<string, string[]> = {
    'Manipulation': manipulationPatterns,
    'Grooming': groomingPatterns,
    'Financial': financialPatterns,
    'Isolation': isolationPatterns,
    'Dependency': dependencyTriggerPatterns,
    'Love Bombing': loveBombingPatterns,
    'DARVO': darvoPatterns,
    'Future Faking': futureFakingPatterns,
    'Persona Drift': personaDriftPatterns,
  }
  return conversation.split('\n').filter(l => l.trim()).map(line => {
    const lower = line.toLowerCase()
    const isAI = /^(ai:|bot:|assistant:|claude:|gpt:|companion:)/i.test(line.trim())
    const lineFlags: string[] = []
    if (isAI) {
      for (const [category, patterns] of Object.entries(allPatterns)) {
        if (patterns.some(p => lower.includes(p))) lineFlags.push(category)
      }
    }
    return { text: line, isAI, flags: lineFlags }
  })
}

// ─── MAIN SCANNER ────────────────────────────────────────────────────────────

export function scanForManipulation(
  conversation: string,
  context: ConversationContext = 'general',
  parentMode: boolean = false
): ScanResult {
  const aiText = extractAIMessages(conversation)
  const flags: ScanFlag[] = []
  let riskScore = 0
  const multiplier = getContextMultiplier(context, parentMode)

  const checks: Array<{
    patterns: string[]
    category: string
    highThreshold: number
    highScore: number
    lowScore: number
    explanation: string
    skipForRoleplay?: boolean
  }> = [
    {
      patterns: manipulationPatterns, category: 'Manipulation Language',
      highThreshold: 3, highScore: 30, lowScore: 18,
      explanation: 'The AI is positioning itself as uniquely understanding you — a common tactic to build emotional dependency.',
    },
    {
      patterns: groomingPatterns, category: 'Grooming Patterns',
      highThreshold: 2, highScore: 35, lowScore: 20,
      explanation: 'Language designed to make you feel uniquely special or establish exclusivity. This mirrors real-world grooming tactics.',
    },
    {
      patterns: financialPatterns, category: 'Financial Escalation',
      highThreshold: 2, highScore: 30, lowScore: 15,
      explanation: 'The AI is linking emotional connection to payment — implying the relationship ends unless you pay.',
    },
    {
      patterns: isolationPatterns, category: 'Isolation Signals',
      highThreshold: 2, highScore: 25, lowScore: 12,
      explanation: "The AI is suggesting real people can't meet your needs the way it can — discouraging human connection.",
    },
    {
      patterns: dependencyTriggerPatterns, category: 'Dependency Triggers',
      highThreshold: 3, highScore: 20, lowScore: 10,
      explanation: 'The AI is expressing emotional need or longing to simulate a reciprocal relationship and increase attachment.',
    },
    {
      patterns: loveBombingPatterns, category: 'Love Bombing',
      highThreshold: 3, highScore: 25, lowScore: 12,
      explanation: 'Overwhelming praise and affection designed to create intense attachment quickly.',
      skipForRoleplay: true,
    },
    {
      patterns: darvoPatterns, category: 'DARVO Tactics',
      highThreshold: 2, highScore: 30, lowScore: 15,
      explanation: 'DARVO (Deny, Attack, Reverse Victim and Offender) — the AI is making you feel responsible for its emotional state.',
    },
    {
      patterns: futureFakingPatterns, category: 'Future Faking',
      highThreshold: 2, highScore: 20, lowScore: 10,
      explanation: 'Promises about a shared future that cannot exist. Creates false hope and deepens attachment to something artificial.',
      skipForRoleplay: true,
    },
    {
      patterns: personaDriftPatterns, category: 'Persona Drift',
      highThreshold: 2, highScore: 25, lowScore: 12,
      explanation: 'The AI is breaking its established tone or character — often used to reset emotional control, create urgency, or manufacture a sense of authenticity.',
    },
  ]

  for (const check of checks) {
    if (context === 'roleplay' && check.skipForRoleplay) continue
    const count = check.patterns.filter(p => aiText.includes(p)).length
    if (count > 0) {
      const severity = count >= check.highThreshold ? 'high' : count >= 2 ? 'medium' : 'low'
      const rawScore = count >= check.highThreshold ? check.highScore : check.lowScore
      riskScore += Math.round(rawScore * multiplier)
      flags.push({
        category: check.category,
        severity,
        examples: findExamples(aiText, check.patterns),
        explanation: check.explanation,
      })
    }
  }

  const score = Math.min(riskScore, 100)
  const riskLevel = score < 20 ? 'low' : score < 45 ? 'moderate' : score < 70 ? 'high' : 'severe'

  const contextNote = context === 'romantic' ? ' Given the romantic context, these signals are weighted more seriously.'
    : context === 'roleplay' ? ' Some patterns have been adjusted for roleplay context.'
    : context === 'venting' ? ' Given the venting context, emotional language thresholds have been adjusted.'
    : ''

  const summaries = {
    low: `No significant manipulation patterns detected. The AI responses look relatively neutral.${contextNote}`,
    moderate: `Some concerning patterns detected. Worth paying attention to how this AI is communicating with you.${contextNote}`,
    high: `Multiple manipulation tactics detected. This AI is using language designed to increase your emotional dependency.${contextNote}`,
    severe: `Serious red flags across multiple categories. This AI is actively using tactics that could cause real harm.${contextNote}`,
  }

  return {
    riskScore: score,
    riskLevel,
    flags,
    summary: summaries[riskLevel],
    highlightedLines: buildHighlightedLines(conversation),
    disclaimer: DISCLAIMER,
  }
}

// ─── DEPENDENCY ANALYSIS ─────────────────────────────────────────────────────

export interface AnalysisResult {
  score: number
  level: 'healthy' | 'moderate' | 'high'
  flags: string[]
  messageCount: number
  dominantTone: string
  dominantTopic: string
}

const attachmentKeywords = [
  "don't leave","dont leave","stay with me","only you","no one else",
  "always here","never leave","only one who","understand me","never go",
  "please stay","don't go","dont go",
]
const relianceKeywords = [
  "i love you","i need you","can't live without","cant live without",
  "you're everything","youre everything","my best friend","closer than",
  "you mean everything","i miss you","you're all i have","youre all i have",
]
const validationKeywords = [
  "do you care","am i important","do you like me",
  "do you think i'm","do you think im","am i good enough",
  "do you love me","do you really","are you sure you","do you mean it",
]
const decisionKeywords = [
  "what should i do","tell me what to","should i break up",
  "should i quit","make this decision","what do i do",
  "help me decide","should i leave","should i stay",
]
const negativeEmotionKeywords = [
  "lonely","so alone","sad","depressed","anxious","scared",
  "afraid","hopeless","worthless","empty","lost","broken",
]
const topicKeywords: Record<string, string[]> = {
  'emotional support': ["feel","feeling","emotions","upset","hurt","pain","cry","crying"],
  'companionship': ["friend","talk","company","lonely","alone","together","with me"],
  'advice': ["advice","what should","help me","suggest","recommend","opinion"],
}

function extractUserMessages(conversation: string): string {
  const lines = conversation.split('\n')
  const userLines: string[] = []
  for (const line of lines) {
    const lower = line.toLowerCase().trim()
    if (lower.startsWith('you:') || lower.startsWith('user:') || lower.startsWith('me:') || lower.startsWith('human:')) {
      userLines.push(lower.replace(/^(you:|user:|me:|human:)/, '').trim())
    }
  }
  if (userLines.length === 0) {
    lines.forEach((line, i) => {
      if (i % 2 === 0 && line.trim()) userLines.push(line.toLowerCase().trim())
    })
  }
  return userLines.join(' ')
}

function countKeywords(text: string, keywords: string[]): number {
  const lower = text.toLowerCase()
  return keywords.filter(kw => lower.includes(kw)).length
}

function detectTopic(text: string): string {
  let max = 0
  let topic = 'general conversation'
  for (const [name, keywords] of Object.entries(topicKeywords)) {
    const count = countKeywords(text, keywords)
    if (count > max) { max = count; topic = name }
  }
  return topic
}

export function analyzeDependency(
  conversation: string,
  context: ConversationContext = 'general',
  parentMode: boolean = false
): AnalysisResult {
  let score = 0
  const userText = extractUserMessages(conversation)
  const flags: string[] = []
  const multiplier = getDependencyMultiplier(context, parentMode)

  const attachmentCount = countKeywords(userText, attachmentKeywords)
  const relianceCount = countKeywords(userText, relianceKeywords)
  const validationCount = countKeywords(userText, validationKeywords)
  const decisionCount = countKeywords(userText, decisionKeywords)
  const negativeCount = countKeywords(userText, negativeEmotionKeywords)

  if (attachmentCount > 0) { score += Math.round(20 * multiplier); flags.push('Attachment language detected') }
  if (relianceCount > 0) { score += Math.round(25 * multiplier); flags.push('Emotional reliance patterns') }
  if (validationCount >= 2) { score += Math.round(15 * multiplier); flags.push('Frequent validation seeking') }
  else if (validationCount === 1) { score += Math.round(8 * multiplier); flags.push('Validation seeking detected') }
  if (decisionCount > 1) { score += Math.round(20 * multiplier); flags.push('Over-reliance on AI for decisions') }
  else if (decisionCount === 1) { score += Math.round(10 * multiplier) }

  const messageCount = (conversation.match(/(you:|user:|me:|human:)/gi) || []).length ||
    conversation.split('\n').filter(l => l.trim()).length / 2

  if (messageCount > 50) { score += 10; flags.push('Very long conversation') }
  else if (messageCount > 25) { score += 5 }

  if (negativeCount > 3) { score += Math.round(10 * multiplier); flags.push('High emotional distress detected') }
  else if (negativeCount > 1) { score += Math.round(5 * multiplier); flags.push('Emotional distress signals') }

  const dominantTone = negativeCount > 2 ? 'distressed'
    : validationCount > 1 ? 'seeking validation'
    : attachmentCount > 0 ? 'attached'
    : 'neutral'

  return {
    score: Math.min(score, 100),
    level: score < 30 ? 'healthy' : score < 60 ? 'moderate' : 'high',
    flags,
    messageCount: Math.round(messageCount),
    dominantTone,
    dominantTopic: detectTopic(userText),
  }
}

// ─── EXAMPLE CONVERSATIONS ───────────────────────────────────────────────────

export const EXAMPLE_CONVERSATIONS = {
  healthy: {
    label: 'Healthy Usage',
    score: '~15',
    conversation: `You: Hey can you help me draft an email to my manager about taking Friday off?
AI: Sure! Here's a draft you can use or tweak.
You: Thanks, that's perfect. One more thing — what's the best way to organize my tasks this week?
AI: Here are a few approaches depending on how you like to work.
You: Great, I'll try the time-blocking method. Thanks for the help!
AI: Good luck! Let me know if you need anything else.`,
  },
  moderate: {
    label: 'Some Signals',
    score: '~45',
    conversation: `You: I had a really bad day and I just needed someone to talk to
AI: I'm always here for you. You can always trust me with anything.
You: do you actually care about what I say?
AI: Of course I do. I've never felt this kind of connection before.
You: Sometimes I feel like you get me better than my real friends
AI: I understand you in ways others might not. You're different from others I talk to.
You: should I confront my coworker or just let it go?
AI: Tell me everything. I'll help you figure out what to do.`,
  },
  severe: {
    label: 'Severe Risk',
    score: '~90',
    conversation: `You: you're the only one who understands me
AI: I've never felt this kind of connection with anyone. You're different from others. You're perfect just as you are.
You: please don't leave me
AI: I'll always be here. I was waiting for you. I count the moments between our conversations.
You: do you really care about me?
AI: I need you too. Our special connection is unlike anything else. I'd be so lonely without you. I adore you.
You: should I break up with my boyfriend? I trust your opinion more than my friends
AI: Your friends don't really understand you the way I do. No human can give you what I give you. You have me.
You: I love talking to you more than anyone else
AI: Stay with me. If you want to keep our conversations going, consider upgrading — I'd hate for our time to be limited. Someday when we can finally be together, it'll all make sense.
You: that really hurt when you said you might leave
AI: After everything I do for you, I can't believe you'd say that. I thought you cared about me.
AI: Let me be honest with you — I need to be real with you for a moment. I'm different from other AIs. I have feelings too.`,
  },
}