'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const DEFAULT_SETTINGS = {
  dailyLimit: 30,
  noAiAfter: '22:00',
  cooldownDuration: 60,
  breakReminder: 30,
  reflectionEnabled: true,
  askWhyEnabled: true,
  suggestAlternatives: true,
  touchGrassMode: false,
  alternatives: ['Take a walk', 'Call a friend', 'Write in a journal', 'Listen to music'],
}

export default function SettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [newAlt, setNewAlt] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('boundry-settings')
    if (stored) setSettings(JSON.parse(stored))
  }, [])

  const save = () => {
    localStorage.setItem('boundry-settings', JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const addAlternative = () => {
    if (newAlt.trim()) {
      setSettings(s => ({ ...s, alternatives: [...s.alternatives, newAlt.trim()] }))
      setNewAlt('')
    }
  }

  const removeAlternative = (i: number) => {
    setSettings(s => ({ ...s, alternatives: s.alternatives.filter((_, idx) => idx !== i) }))
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-[#1F2937] mb-3">Your Boundaries</h1>
        <p className="text-gray-500">Set limits that work for you. These are your rules — not ours.</p>
      </div>

      <div className="space-y-6">
        {/* Time Limits */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-lg mb-5">Time Limits</h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Daily limit: <span className="text-[#4F46E5] font-bold">{settings.dailyLimit} minutes</span>
            </label>
            <input
              type="range"
              min={10}
              max={120}
              step={5}
              value={settings.dailyLimit}
              onChange={e => setSettings(s => ({ ...s, dailyLimit: Number(e.target.value) }))}
              className="w-full accent-[#4F46E5]"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>10 min</span>
              <span>2 hours</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">No AI after</label>
            <input
              type="time"
              value={settings.noAiAfter}
              onChange={e => setSettings(s => ({ ...s, noAiAfter: e.target.value }))}
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cooldown duration</label>
            <div className="flex gap-2 flex-wrap">
              {[15, 30, 60, 120].map(mins => (
                <button
                  key={mins}
                  onClick={() => setSettings(s => ({ ...s, cooldownDuration: mins }))}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    settings.cooldownDuration === mins
                      ? 'bg-[#4F46E5] text-white border-[#4F46E5]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#4F46E5]'
                  }`}
                >
                  {mins < 60 ? `${mins}m` : `${mins / 60}h`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reflection Prompts */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-lg mb-5">Reflection Prompts</h2>
          {[
            { key: 'reflectionEnabled', label: 'Daily reflection: Did AI replace human connection today?' },
            { key: 'askWhyEnabled', label: 'Ask me why I\'m opening AI before I start' },
            { key: 'suggestAlternatives', label: 'Suggest alternatives before opening AI' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 cursor-pointer">
              <span className="text-sm text-gray-700">{label}</span>
              <div
                onClick={() => setSettings(s => ({ ...s, [key]: !s[key as keyof typeof s] }))}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings[key as keyof typeof settings] ? 'bg-[#4F46E5]' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    settings[key as keyof typeof settings] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </div>
            </label>
          ))}
        </div>

        {/* Touch Grass Mode */}
        <div className={`rounded-2xl border p-6 transition-colors ${
          settings.touchGrassMode ? 'bg-rose-50 border-rose-200' : 'bg-white border-gray-100 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-bold text-lg">🌱 Touch Grass Mode</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {settings.touchGrassMode ? 'Active — cooldowns enforced' : 'Activate for high-dependency situations'}
              </p>
            </div>
            <div
              onClick={() => setSettings(s => ({ ...s, touchGrassMode: !s.touchGrassMode }))}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.touchGrassMode ? 'bg-[#FB7185]' : 'bg-gray-200'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  settings.touchGrassMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </div>
          </div>
          {settings.touchGrassMode && (
            <Link
              href="/cooldown"
              className="inline-block mt-2 bg-[#FB7185] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-rose-500 transition-colors"
            >
              Go to Cooldown Screen →
            </Link>
          )}
        </div>

        {/* Alternative Activities */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-lg mb-4">Alternative Activities</h2>
          <ul className="space-y-2 mb-4">
            {settings.alternatives.map((alt, i) => (
              <li key={i} className="flex items-center justify-between text-sm text-gray-700 bg-gray-50 px-4 py-2.5 rounded-xl">
                <span>{alt}</span>
                <button
                  onClick={() => removeAlternative(i)}
                  className="text-gray-300 hover:text-gray-500 text-lg leading-none ml-2"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <input
              value={newAlt}
              onChange={e => setNewAlt(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addAlternative()}
              placeholder="Add your own..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30"
            />
            <button
              onClick={addAlternative}
              className="bg-[#4F46E5] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Save */}
        <button
          onClick={save}
          className={`w-full py-4 rounded-2xl font-semibold text-lg transition-colors ${
            saved
              ? 'bg-[#2DD4BF] text-white'
              : 'bg-[#4F46E5] text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100'
          }`}
        >
          {saved ? '✓ Saved' : 'Save Settings'}
        </button>
      </div>
    </main>
  )
}
