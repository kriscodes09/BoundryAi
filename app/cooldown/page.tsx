'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const DEFAULT_ALTERNATIVES = [
  { icon: '🚶', text: 'Take a 15-minute walk' },
  { icon: '📞', text: 'Call or text a friend' },
  { icon: '📓', text: 'Write in a journal' },
  { icon: '🎵', text: 'Listen to music' },
  { icon: '☕', text: 'Make yourself a drink' },
  { icon: '🌿', text: 'Step outside for some air' },
]

const REFLECTION_OPTIONS = [
  "I'm feeling lonely",
  "I need advice on something",
  "I'm bored",
  "It's become a habit",
  "I'm avoiding something",
  "Other",
]

export default function CooldownPage() {
  const [timeLeft, setTimeLeft] = useState(60 * 60) // 1 hour default
  const [running, setRunning] = useState(false)
  const [reflection, setReflection] = useState('')
  const [alternative, setAlternative] = useState('')
  const [showOverride, setShowOverride] = useState(false)
  const [overridden, setOverridden] = useState(false)
  const [alternatives, setAlternatives] = useState(DEFAULT_ALTERNATIVES)
  const [duration, setDuration] = useState(60)

  useEffect(() => {
    const stored = localStorage.getItem('boundry-settings')
    if (stored) {
      const s = JSON.parse(stored)
      if (s.cooldownDuration) {
        setDuration(s.cooldownDuration)
        setTimeLeft(s.cooldownDuration * 60)
      }
      if (s.alternatives?.length) {
        setAlternatives(s.alternatives.map((text: string, i: number) => ({
          icon: DEFAULT_ALTERNATIVES[i]?.icon || '✨',
          text,
        })))
      }
    }
  }, [])

  const tick = useCallback(() => {
    setTimeLeft(t => {
      if (t <= 1) {
        setRunning(false)
        return 0
      }
      return t - 1
    })
  }, [])

  useEffect(() => {
    if (!running) return
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [running, tick])

  const fmt = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const handleStart = () => {
    setTimeLeft(duration * 60)
    setRunning(true)
    setOverridden(false)
  }

  const handleOverride = () => {
    setRunning(false)
    setOverridden(true)
    setShowOverride(false)
  }

  const done = timeLeft === 0 && !running

  return (
    <main className="max-w-xl mx-auto px-6 py-16 text-center">
      {/* Header */}
      <div className="mb-10">
        <div className="text-6xl mb-4">🌱</div>
        <h1 className="text-4xl font-extrabold text-[#1F2937] mb-2">Touch Grass Mode</h1>
        <p className="text-gray-500">
          {done ? 'Time\'s up. You made it.' : 'AI is taking a break so you can too.'}
        </p>
      </div>

      {/* Timer */}
      {!done && (
        <div
          className="rounded-3xl p-10 mb-8 shadow-sm"
          style={{
            background: running ? '#fff1f2' : '#f0fdfb',
            border: `2px solid ${running ? '#fecdd3' : '#99f6e4'}`,
          }}
        >
          <div
            className="text-7xl font-extrabold mb-4 tabular-nums"
            style={{ color: running ? '#FB7185' : '#2DD4BF' }}
          >
            {fmt(timeLeft)}
          </div>
          <p className="text-gray-400 text-sm">
            {running ? 'remaining' : `${duration} minute cooldown`}
          </p>
          {!running && (
            <button
              onClick={handleStart}
              className="mt-6 bg-[#FB7185] text-white px-8 py-3 rounded-2xl font-semibold hover:bg-rose-500 transition-colors"
            >
              Start Cooldown
            </button>
          )}
        </div>
      )}

      {done && (
        <div className="bg-[#f0fdfb] border border-[#99f6e4] rounded-3xl p-10 mb-8">
          <div className="text-5xl mb-3">✅</div>
          <h2 className="text-2xl font-bold text-[#2DD4BF] mb-2">Cooldown complete!</h2>
          <p className="text-gray-500 text-sm">You took a real break. That matters.</p>
          <button
            onClick={handleStart}
            className="mt-6 border border-gray-200 text-gray-600 px-6 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
          >
            Start another
          </button>
        </div>
      )}

      {/* Why It Matters */}
      {running && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6 text-left">
          <p className="text-sm text-gray-500 leading-relaxed">
            Taking breaks helps maintain healthy boundaries and keeps AI as a tool, not a replacement for real connection.
            You're not missing anything — the conversation will still be there.
          </p>
        </div>
      )}

      {/* Alternatives */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 text-left">
        <h3 className="font-bold text-[#1F2937] mb-4">While you wait:</h3>
        <ul className="space-y-2">
          {alternatives.map((alt, i) => (
            <li key={i} className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 px-4 py-2.5 rounded-xl">
              <span className="text-lg">{alt.icon}</span>
              {alt.text}
            </li>
          ))}
        </ul>
      </div>

      {/* Reflection */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8 text-left">
        <h3 className="font-bold text-[#1F2937] mb-4">Before you go: Why were you opening AI?</h3>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {REFLECTION_OPTIONS.map(opt => (
            <button
              key={opt}
              onClick={() => setReflection(opt)}
              className={`text-sm px-3 py-2.5 rounded-xl border transition-colors text-left ${
                reflection === opt
                  ? 'bg-[#4F46E5] text-white border-[#4F46E5]'
                  : 'bg-gray-50 text-gray-600 border-gray-100 hover:border-[#4F46E5]'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        <label className="block text-sm text-gray-500 mb-2">What could you do instead?</label>
        <input
          value={alternative}
          onChange={e => setAlternative(e.target.value)}
          placeholder="Write something..."
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30"
        />
      </div>

      {/* Override */}
      {running && (
        <div className="mb-6">
          {!showOverride ? (
            <button
              onClick={() => setShowOverride(true)}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              I have an urgent question
            </button>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <p className="text-sm text-amber-700 mb-4 font-medium">
                Are you sure? This will reset your cooldown progress.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleOverride}
                  className="bg-amber-500 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors"
                >
                  Yes, override
                </button>
                <button
                  onClick={() => setShowOverride(false)}
                  className="border border-gray-200 text-gray-600 px-5 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors"
                >
                  Stay in cooldown
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {overridden && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6 text-sm text-amber-700">
          Cooldown overridden. Try to keep it brief.
        </div>
      )}

      <div className="flex gap-3 justify-center">
        <Link href="/settings" className="text-sm text-[#4F46E5] hover:underline">
          Adjust settings
        </Link>
        <span className="text-gray-300">·</span>
        <Link href="/analyze" className="text-sm text-[#4F46E5] hover:underline">
          Analyze another conversation
        </Link>
      </div>
    </main>
  )
}
