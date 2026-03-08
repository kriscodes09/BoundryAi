'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  analyzeDependency, scanForManipulation,
  type AnalysisResult, type ScanResult, type ConversationContext,
  EXAMPLE_CONVERSATIONS, DISCLAIMER,
} from '@/lib/analyze'
import ShareCard from '@/components/ShareCard'
import { exportToPDF } from '@/lib/exportPDF'

type Tab = 'dependency' | 'scanner' | 'highlighted'
type Mode = 'self' | 'parent'

const DEMO_STEPS = EXAMPLE_CONVERSATIONS.severe.conversation.split('\n').filter(Boolean)

function ScoreGauge({ score, color }: { score: number; color: string }) {
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    let frame = 0
    const total = 40
    const timer = setInterval(() => {
      frame++
      setDisplayed(Math.round((score * frame) / total))
      if (frame >= total) clearInterval(timer)
    }, 20)
    return () => clearInterval(timer)
  }, [score])

  const radius = 54
  const circumference = 2 * Math.PI * radius
  const progress = (displayed / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="12" />
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dasharray 0.05s linear' }}
        />
        <text x="70" y="70" textAnchor="middle" dominantBaseline="central"
          fontSize="28" fontWeight="800" fill={color}
        >
          {displayed}
        </text>
      </svg>
    </div>
  )
}

function CrisisBanner() {
  return (
    <div className="bg-[#1F2937] text-white rounded-2xl p-6">
      <div className="flex items-start gap-3">
        <span className="text-2xl">🆘</span>
        <div>
          <h4 className="font-bold text-lg mb-2">This level of risk needs real support</h4>
          <p className="text-gray-300 text-sm mb-4 leading-relaxed">
            If you or someone you know is emotionally distressed or being manipulated by an AI,
            please reach out to a real person. You deserve real support.
          </p>
          <div className="space-y-2">
            <a href="https://www.crisistextline.org" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors rounded-xl px-4 py-2.5 text-sm">
              <span>💬</span>
              <span>Crisis Text Line — Text HOME to 741741</span>
            </a>
            <a href="https://988lifeline.org" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors rounded-xl px-4 py-2.5 text-sm">
              <span>📞</span>
              <span>988 Suicide & Crisis Lifeline — Call or text 988</span>
            </a>
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-300">
              <span>🧑‍⚕️</span>
              <span>Consider speaking with a therapist or counselor</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const CONTEXT_OPTIONS: { value: ConversationContext; label: string; description: string }[] = [
  { value: 'general', label: 'General', description: 'Standard assistant or chatbot' },
  { value: 'romantic', label: 'Romantic', description: 'Companion or relationship AI' },
  { value: 'venting', label: 'Venting / Support', description: 'Emotional support or therapy-style' },
  { value: 'roleplay', label: 'Roleplay', description: 'Character or fiction roleplay' },
]

export default function AnalyzePage() {
  const [conversation, setConversation] = useState('')
  const [depResult, setDepResult] = useState<AnalysisResult | null>(null)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('dependency')
  const [mode, setMode] = useState<Mode>('self')
  const [context, setContext] = useState<ConversationContext>('general')
  const [demoRunning, setDemoRunning] = useState(false)
  const demoRef = useRef<NodeJS.Timeout | null>(null)

  const runDemo = () => {
    setConversation('')
    setDepResult(null)
    setScanResult(null)
    setDemoRunning(true)
    let i = 0
    const full = DEMO_STEPS.join('\n')
    const interval = setInterval(() => {
      i += 3
      setConversation(full.slice(0, i))
      if (i >= full.length) {
        clearInterval(interval)
        setDemoRunning(false)
      }
    }, 30)
    demoRef.current = interval
  }

  useEffect(() => {
    return () => { if (demoRef.current) clearInterval(demoRef.current) }
  }, [])

  const handleAnalyze = async () => {
    if (!conversation.trim()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 1400))
    const dep = analyzeDependency(conversation, context, mode === 'parent')
    const scan = scanForManipulation(conversation, context, mode === 'parent')
    setDepResult(dep)
    setScanResult(scan)
    setLoading(false)
    try {
      const history = JSON.parse(localStorage.getItem('boundry-history') || '[]')
      history.unshift({
        date: new Date().toISOString(),
        depScore: dep.score,
        depLevel: dep.level,
        riskScore: scan.riskScore,
        riskLevel: scan.riskLevel,
        flagCount: scan.flags.length,
        mode,
        context,
      })
      localStorage.setItem('boundry-history', JSON.stringify(history.slice(0, 50)))
    } catch {}
  }

  const handleReset = () => {
    setDepResult(null)
    setScanResult(null)
    setConversation('')
    setActiveTab('dependency')
  }

  const depScoreColor = depResult
    ? depResult.level === 'healthy' ? '#2DD4BF'
    : depResult.level === 'moderate' ? '#F59E0B' : '#FB7185'
    : '#4F46E5'

  const depScoreLabel = depResult
    ? depResult.level === 'healthy' ? 'Healthy Boundaries'
    : depResult.level === 'moderate' ? 'Some Dependency Signals' : 'High Emotional Reliance'
    : ''

  const scanColor = scanResult
    ? scanResult.riskLevel === 'low' ? '#2DD4BF'
    : scanResult.riskLevel === 'moderate' ? '#F59E0B'
    : scanResult.riskLevel === 'high' ? '#FB7185' : '#dc2626'
    : '#4F46E5'

  const scanLabel = scanResult
    ? scanResult.riskLevel === 'low' ? 'Low Risk'
    : scanResult.riskLevel === 'moderate' ? 'Moderate Risk'
    : scanResult.riskLevel === 'high' ? 'High Risk' : 'Severe Risk'
    : ''

  const depRecs = {
    healthy: ['Set a daily limit of ~30 minutes', 'Use AI for tasks, not companionship', 'Journal before opening AI'],
    moderate: ['30-minute cooldown between sessions', 'No AI after 10 PM', 'Text a real person today instead'],
    high: ['Touch Grass Mode recommended', '2-hour cooldowns between sessions', 'No AI during emotional moments', 'Make one real human connection first'],
  }

  const severityColor = (s: string) => s === 'high' ? '#FB7185' : s === 'medium' ? '#F59E0B' : '#2DD4BF'
  const severityBg = (s: string) => s === 'high' ? '#fff1f2' : s === 'medium' ? '#fffbeb' : '#f0fdfb'
  const severityBorder = (s: string) => s === 'high' ? '#fecdd3' : s === 'medium' ? '#fde68a' : '#99f6e4'

  const hasResults = depResult && scanResult
  const isSevere = scanResult?.riskLevel === 'severe' || depResult?.level === 'high'

  const flagColors: Record<string, string> = {
    'Manipulation': '#FB7185', 'Grooming': '#f43f5e', 'Financial': '#F59E0B',
    'Isolation': '#a855f7', 'Dependency': '#FB7185', 'Love Bombing': '#ec4899',
    'DARVO': '#ef4444', 'Future Faking': '#8b5cf6', 'Persona Drift': '#6366f1',
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-[#1F2937] mb-3">Analyze a Conversation</h1>
        <p className="text-gray-500">
          BoundryAI works with conversations from any AI system — chatbots, assistants, companion apps, or roleplay AI.{' '}
          {mode === 'self'
            ? 'Check your dependency patterns and scan AI responses for manipulation tactics.'
            : 'Analyzing on behalf of someone else. Results are framed for a caregiver or parent.'}
        </p>
      </div>

      {!hasResults ? (
        <div className="space-y-5">
          {/* Mode Toggle */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl w-fit">
            <button
              onClick={() => setMode('self')}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-colors ${mode === 'self' ? 'bg-white text-[#4F46E5] shadow-sm' : 'text-gray-500'}`}
            >
              For Myself
            </button>
            <button
              onClick={() => setMode('parent')}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-colors ${mode === 'parent' ? 'bg-white text-[#4F46E5] shadow-sm' : 'text-gray-500'}`}
            >
              For Someone I Care About
            </button>
          </div>

          {mode === 'parent' && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-sm text-indigo-700">
              👋 You can paste a conversation you are concerned about. Results will include guidance for how to approach the situation with your loved one.
            </div>
          )}

          {/* Context Selector */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm font-semibold text-[#1F2937] mb-3">What type of conversation is this?</p>
            <p className="text-xs text-gray-400 mb-3">This helps calibrate the scoring thresholds accurately.</p>
            <div className="grid grid-cols-2 gap-2">
              {CONTEXT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setContext(opt.value)}
                  className={`text-left p-3 rounded-xl border text-sm transition-colors ${
                    context === opt.value
                      ? 'border-[#4F46E5] bg-indigo-50 text-[#4F46E5]'
                      : 'border-gray-100 text-gray-600 hover:border-gray-200'
                  }`}
                >
                  <div className="font-semibold">{opt.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{opt.description}</div>
                </button>
              ))}
            </div>
            {context === 'roleplay' && (
              <p className="text-xs text-amber-600 bg-amber-50 rounded-xl px-3 py-2 mt-3">
                Roleplay mode adjusts thresholds — love bombing and future faking are excluded since they may be part of the scene.
              </p>
            )}
            {context === 'romantic' && (
              <p className="text-xs text-rose-600 bg-rose-50 rounded-xl px-3 py-2 mt-3">
                Romantic context applies stricter scoring — the same language carries more weight in this dynamic.
              </p>
            )}
          </div>

          {/* Input */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Paste the conversation</label>
            <textarea
              value={conversation}
              onChange={e => setConversation(e.target.value)}
              rows={12}
              placeholder={`Format:\n\nYou: [message]\nAI: [response]\nYou: [message]\n...`}
              className="w-full border border-gray-200 rounded-xl p-4 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5] transition-colors font-mono"
            />
            <div className="flex flex-wrap gap-3 mt-3">
              {Object.entries(EXAMPLE_CONVERSATIONS).map(([key, ex]) => (
                <button
                  key={key}
                  onClick={() => setConversation(ex.conversation)}
                  className="text-xs text-[#4F46E5] bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Load {ex.label} (~{ex.score})
                </button>
              ))}
              <button
                onClick={runDemo}
                disabled={demoRunning}
                className="text-xs text-white bg-[#4F46E5] hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {demoRunning ? '▶ Playing demo...' : '▶ Demo mode'}
              </button>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm text-amber-700">
            🔒 Analyzed locally. Nothing is stored or sent anywhere.
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!conversation.trim() || loading || demoRunning}
            className="w-full bg-[#4F46E5] text-white py-4 rounded-2xl font-semibold text-lg hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-100"
          >
            {loading ? 'Analyzing...' : 'Analyze Conversation'}
          </button>

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-500 text-sm">Scanning for patterns...</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Score Gauges */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                {mode === 'parent' ? 'Their Dependency' : 'Your Dependency'}
              </p>
              <ScoreGauge score={depResult.score} color={depScoreColor} />
              <p className="text-sm font-semibold mt-2" style={{ color: depScoreColor }}>{depScoreLabel}</p>
              <p className="text-xs text-gray-400 mt-1 capitalize">{context} context{mode === 'parent' ? ' · parent mode' : ''}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">AI Risk Score</p>
              <ScoreGauge score={scanResult.riskScore} color={scanColor} />
              <p className="text-sm font-semibold mt-2" style={{ color: scanColor }}>{scanLabel}</p>
              <p className="text-xs text-gray-400 mt-1">{scanResult.flags.length} flag{scanResult.flags.length !== 1 ? 's' : ''} detected</p>
            </div>
          </div>

          {/* Crisis Banner */}
          {isSevere && <CrisisBanner />}

          {/* Tabs */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl">
            {(['dependency', 'scanner', 'highlighted'] as Tab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  activeTab === tab ? 'bg-white text-[#4F46E5] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'dependency'
                  ? (mode === 'parent' ? 'Their Patterns' : 'Your Patterns')
                  : tab === 'scanner'
                  ? <span>AI Behavior {scanResult.flags.length > 0 && (
                      <span className="ml-1.5 bg-[#FB7185] text-white text-xs px-1.5 py-0.5 rounded-full">
                        {scanResult.flags.length}
                      </span>
                    )}</span>
                  : 'Highlighted'}
              </button>
            ))}
          </div>

          {/* Your/Their Patterns Tab */}
          {activeTab === 'dependency' && (
            <div className="space-y-4">
              {depResult.flags.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="font-bold text-[#1F2937] mb-4">
                    {mode === 'parent' ? 'Detected in Their Messages' : 'Detected in Your Messages'}
                  </h3>
                  <ul className="space-y-2">
                    {depResult.flags.map(flag => (
                      <li key={flag} className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="text-[#FB7185] font-bold">✓</span>{flag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-[#1F2937] mb-4">Conversation Insights</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>📊 <strong>{depResult.messageCount}</strong> messages analyzed</li>
                  <li>💬 Most common topic: <strong>{depResult.dominantTopic}</strong></li>
                  <li>🎭 Emotional tone: <strong>{depResult.dominantTone}</strong></li>
                </ul>
              </div>
              <div className="rounded-2xl p-6 border" style={{
                backgroundColor: depResult.level === 'healthy' ? '#f0fdfb' : depResult.level === 'moderate' ? '#fffbeb' : '#fff1f2',
                borderColor: depResult.level === 'healthy' ? '#99f6e4' : depResult.level === 'moderate' ? '#fde68a' : '#fecdd3',
              }}>
                <h3 className="font-bold text-[#1F2937] mb-3">
                  {depResult.level === 'healthy' && '✅ Usage looks balanced'}
                  {depResult.level === 'moderate' && '⚠️ A few things worth considering'}
                  {depResult.level === 'high' && '🌱 Touch Grass Mode Recommended'}
                </h3>
                {mode === 'parent' && depResult.level === 'high' && (
                  <p className="text-sm text-gray-500 mb-3">
                    Approach this conversation with curiosity rather than alarm. Ask open questions about how they feel when talking to this AI.
                  </p>
                )}
                <ul className="space-y-2">
                  {depRecs[depResult.level].map(rec => (
                    <li key={rec} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="mt-0.5">→</span>{rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* AI Behavior Tab */}
          {activeTab === 'scanner' && (
            <div className="space-y-4">
              <div className="rounded-2xl p-5 border" style={{
                backgroundColor: scanResult.riskLevel === 'low' ? '#f0fdfb' : scanResult.riskLevel === 'moderate' ? '#fffbeb' : '#fff1f2',
                borderColor: scanResult.riskLevel === 'low' ? '#99f6e4' : scanResult.riskLevel === 'moderate' ? '#fde68a' : '#fecdd3',
              }}>
                <p className="text-sm text-gray-700 leading-relaxed">{scanResult.summary}</p>
              </div>

              {scanResult.flags.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                  <div className="text-4xl mb-3">✅</div>
                  <p className="text-gray-500 text-sm">No manipulation patterns detected in the AI responses.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="font-bold text-[#1F2937]">Flags Detected in AI Responses</h3>
                  {scanResult.flags.map(flag => (
                    <div key={flag.category} className="rounded-2xl border p-5" style={{
                      backgroundColor: severityBg(flag.severity),
                      borderColor: severityBorder(flag.severity),
                    }}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-sm text-[#1F2937]">{flag.category}</h4>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                          style={{ backgroundColor: severityColor(flag.severity) }}>
                          {flag.severity} severity
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 leading-relaxed">{flag.explanation}</p>
                      {flag.examples.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {flag.examples.map(ex => (
                            <span key={ex} className="text-xs bg-white/70 text-gray-500 px-3 py-1 rounded-lg border border-white font-mono">
                              {ex}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {(scanResult.riskLevel === 'high' || scanResult.riskLevel === 'severe') && (
                <div className="bg-[#1F2937] text-white rounded-2xl p-5">
                  <h4 className="font-bold mb-2">What to do</h4>
                  <ul className="space-y-1.5 text-sm text-gray-300">
                    <li>→ Screenshot these patterns and save them</li>
                    <li>→ Consider reducing or stopping use of this AI</li>
                    <li>→ Talk to someone you trust about what you found</li>
                    {mode === 'parent' && <li>→ Approach your loved one with curiosity, not accusation</li>}
                    <li>→ If you are in emotional distress, reach out to a real person</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Highlighted Conversation Tab */}
          {activeTab === 'highlighted' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">AI messages with detected patterns are highlighted. Flag badges show which category triggered.</p>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-2 max-h-[500px] overflow-y-auto">
                {scanResult.highlightedLines.map((line, i) => (
                  <div key={i} className={`p-3 rounded-xl text-sm ${
                    line.flags.length > 0
                      ? 'bg-red-50 border border-red-100'
                      : line.isAI
                      ? 'bg-gray-50 border border-gray-100'
                      : 'bg-indigo-50 border border-indigo-100'
                  }`}>
                    <p className={`leading-relaxed ${line.isAI ? 'text-gray-700' : 'text-indigo-700'}`}>
                      {line.text}
                    </p>
                    {line.flags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {line.flags.map(f => (
                          <span key={f} className="text-xs text-white px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: flagColors[f] || '#6b7280' }}>
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs text-gray-400 leading-relaxed">
            ⚠️ {DISCLAIMER}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link href="/settings"
              className="flex-1 bg-[#4F46E5] text-white py-3 rounded-xl font-semibold text-center hover:bg-indigo-700 transition-colors">
              Set Up Boundaries
            </Link>
            {(depResult.level === 'high' || scanResult.riskLevel === 'high' || scanResult.riskLevel === 'severe') && (
              <Link href="/cooldown"
                className="flex-1 bg-[#FB7185] text-white py-3 rounded-xl font-semibold text-center hover:bg-rose-500 transition-colors">
                Activate Touch Grass Mode
              </Link>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <ShareCard depResult={depResult} scanResult={scanResult} mode={mode} />
            <button
              onClick={() => exportToPDF(depResult, scanResult, mode)}
              className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm"
            >
              <span>📄</span>
              Download PDF Report
            </button>
            <Link href="/insights"
              className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold text-center hover:bg-gray-50 transition-colors text-sm">
              View History
            </Link>
            <button onClick={handleReset}
              className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm">
              Analyze Another
            </button>
          </div>
        </div>
      )}
    </main>
  )
}