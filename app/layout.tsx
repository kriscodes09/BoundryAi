import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BoundryAI — Digital Wellbeing for AI Relationships',
  description: 'Like Screen Time, but for AI companions. Analyze your conversations, set healthy boundaries, and stay in control.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-[#FAFAFA] text-[#1F2937] font-sans antialiased">
        <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <a href="/" className="font-bold text-xl text-[#4F46E5] tracking-tight">BoundryAI</a>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="/analyze" className="hover:text-[#4F46E5] transition-colors">Analyze</a>
              <a href="/insights" className="hover:text-[#4F46E5] transition-colors">Insights</a>
              <a href="/settings" className="hover:text-[#4F46E5] transition-colors">Settings</a>
              <a href="/analyze" className="bg-[#4F46E5] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
                Get Started
              </a>
            </div>
          </div>
        </nav>
        {children}
        <footer className="border-t border-gray-100 mt-24 py-10 text-center text-sm text-gray-400">
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
