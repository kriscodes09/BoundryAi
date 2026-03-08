'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface HistoryEntry {
  date: string
  depScore: number
  depLevel: string
  riskScore: number
  riskLevel: string
  flagCount: number
  mode: string
}

function ScoreBadge({ score, level }: { score: number; level: string }) {
  const color = level === 'healthy' || level === 'low' ? '#2DD4BF'
    : level === 'moderate' ? '#F59E0B'
    : '#FB7185'
  return (
    <span className="font-bold text-sm" style={{ color }}>{score}</span>
  )
}

export default function InsightsPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('boundry-history')
      if (stored) setHistory(JSON.parse(stored))
    } catch {}
  }, [])

  const clearHistory = () => {
    localStorage.removeItem('boundry-history')
    setHistory([])
  }

  const avgDep = history.length
    ? Math.round(history.reduce((a, b) => a + b.depScore, 0) / history.length)
    : 0

  const avgRisk = history.length
    ? Math.round(history.reduce((a, b) => a + b.riskScore, 0) / history.length)
    : 0

  const trend = history.length >= 2
    ? history[0].depScore - history[history.length - 1].depScore
    : 0

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-[#1F2937] mb-3">Your Insights</h1>
        <p className="text-gray-500">Track your patterns over time.</p>
      </div>

      {history.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="text-5xl mb-4">📊</div>
          <h2 className="font-bold text-lg text-[#1F2937] mb-2">No history yet</h2>
          <p className="text-gray-500 text-sm mb-6">Analyze a conversation to start tracking your patterns.</p>
          <Link href="/analyze"
            className="inline-block bg-[#4F46E5] text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
            Analyze a Conversation
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Analyses</p>
              <p className="text-3xl font-extrabold text-[#4F46E5]">{history.length}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Avg Dependency</p>
              <p className="text-3xl font-extrabold"
                style={{ color: avgDep < 30 ? '#2DD4BF' : avgDep < 60 ? '#F59E0B' : '#FB7185' }}>
                {avgDep}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Trend</p>
              <p className="text-3xl font-extrabold"
                style={{ color: trend > 0 ? '#2DD4BF' : trend < 0 ? '#FB7185' : '#9ca3af' }}>
                {trend > 0 ? `↓ ${trend}` : trend < 0 ? `↑ ${Math.abs(trend)}` : '→'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {trend > 0 ? 'Improving' : trend < 0 ? 'Increasing' : 'Stable'}
              </p>
            </div>
          </div>

          {/* Avg Risk */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Average AI Risk Score</p>
                <p className="text-xs text-gray-400 mt-0.5">Across all analyzed conversations</p>
              </div>
              <p className="text-2xl font-extrabold"
                style={{ color: avgRisk < 20 ? '#2DD4BF' : avgRisk < 45 ? '#F59E0B' : '#FB7185' }}>
                {avgRisk}
              </p>
            </div>
          </div>

          {/* History List */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-[#1F2937]">Analysis History</h3>
              <button onClick={clearHistory} className="text-xs text-gray-400 hover:text-gray-600 underline">
                Clear history
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {history.map((entry, i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {new Date(entry.date).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 capitalize">
                      {entry.mode === 'parent' ? 'For someone else' : 'For myself'} · {entry.flagCount} flag{entry.flagCount !== 1 ? 's' : ''} detected
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-xs text-gray-400">Dependency</p>
                      <ScoreBadge score={entry.depScore} level={entry.depLevel} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">AI Risk</p>
                      <ScoreBadge score={entry.riskScore} level={entry.riskLevel} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link href="/analyze"
            className="block w-full bg-[#4F46E5] text-white py-4 rounded-2xl font-semibold text-center hover:bg-indigo-700 transition-colors">
            Analyze Another Conversation
          </Link>
        </div>
      )}
    </main>
  )
}
