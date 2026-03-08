'use client'

import { useState } from 'react'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <html lang="en">
      <head>
        <title>BoundryAI — Digital Wellbeing for AI Relationships</title>
        <meta name="description" content="Analyze your AI conversations, detect manipulation tactics, and set healthy boundaries." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-[#FAFAFA] text-[#1F2937] font-sans antialiased">
        <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <a href="/" className="font-bold text-xl text-[#4F46E5] tracking-tight">BoundryAI</a>

            {/* Desktop nav */}
            <div className="hidden sm:flex items-center gap-6 text-sm text-gray-500">
              <a href="/analyze" className="hover:text-[#4F46E5] transition-colors">Analyze</a>
              <a href="/insights" className="hover:text-[#4F46E5] transition-colors">Insights</a>
              <a href="/settings" className="hover:text-[#4F46E5] transition-colors">Settings</a>
              <a href="/analyze" className="bg-[#4F46E5] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
                Get Started
              </a>
            </div>

            {/* Mobile hamburger */}
            <button
              className="sm:hidden p-2 text-gray-500 hover:text-[#4F46E5]"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile dropdown */}
          {menuOpen && (
            <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-4">
              <a href="/analyze" className="text-gray-600 hover:text-[#4F46E5] font-medium" onClick={() => setMenuOpen(false)}>Analyze</a>
              <a href="/insights" className="text-gray-600 hover:text-[#4F46E5] font-medium" onClick={() => setMenuOpen(false)}>Insights</a>
              <a href="/settings" className="text-gray-600 hover:text-[#4F46E5] font-medium" onClick={() => setMenuOpen(false)}>Settings</a>
              <a href="/analyze" className="bg-[#4F46E5] text-white px-4 py-3 rounded-xl text-sm font-medium text-center hover:bg-indigo-700 transition-colors" onClick={() => setMenuOpen(false)}>
                Get Started
              </a>
            </div>
          )}
        </nav>

        <main className="px-4 sm:px-6">
          {children}
        </main>

        <footer className="border-t border-gray-100 mt-24 py-10 text-center text-sm text-gray-400 px-4">
          <p>Built for digital wellbeing, not surveillance.</p>
          <p className="mt-1">
            <a href="/privacy" className="underline hover:text-gray-600">Privacy Policy</a>
            {' · '}
            BoundryAI © {new Date().getFullYear()}
          </p>
        </footer>
      </body>
    </html>
  )
}