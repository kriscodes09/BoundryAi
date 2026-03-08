import Link from 'next/link'

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-block bg-[#4F46E5]/10 text-[#4F46E5] text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          Digital Wellbeing for AI Relationships
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-[#1F2937] leading-tight mb-6">
          Healthy Boundaries<br />
          <span className="text-[#4F46E5]">with AI.</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-xl mx-auto mb-10">
          BoundryAI scans conversations for manipulation tactics, dependency patterns, and red flags then helps you set boundaries that stick.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/analyze"
            className="inline-block bg-[#4F46E5] text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            Analyze a Conversation
          </Link>
          <Link
            href="/analyze"
            className="inline-block bg-white border border-gray-200 text-gray-700 px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            ▶ Watch Demo
          </Link>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-[#4F46E5] text-white">
        <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-3 gap-6 text-center">
          {[
            { stat: '8', label: 'Manipulation tactics detected' },
            { stat: '3', label: 'Analysis dimensions' },
            { stat: '0', label: 'Data stored or shared' },
          ].map(item => (
            <div key={item.label}>
              <p className="text-3xl font-extrabold">{item.stat}</p>
              <p className="text-indigo-200 text-sm mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Problem Statement */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl font-bold text-[#1F2937] mb-4">The problem no one's talking about</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
          The AI you talk to is getting more realistic and people are getting more attached. BoundryAI helps you see your patterns clearly before they become a problem.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-[#1F2937] mb-14">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              color: '#4F46E5',
              title: 'Paste Your Conversation',
              desc: 'Copy a conversation from any AI you talk to Character.ai, Replika, Claude, Chat GPT, anything and paste it in.',
            },
            {
              step: '02',
              color: '#2DD4BF',
              title: 'Get Two Scores',
              desc: 'Your dependency score shows your attachment patterns. The AI risk score highlights manipulation patterns, pressure signals, and dependency triggers in the AI’s responses.',
            },
            {
              step: '03',
              color: '#FB7185',
              title: 'Set Your Boundaries',
              desc: 'Personalized recommendations, Touch Grass Mode cooldowns, and a history tracker to see your patterns over time.',
            },
          ].map((item) => (
            <div key={item.step} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold mb-5"
                style={{ backgroundColor: item.color }}
              >
                {item.step}
              </div>
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What We Detect */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-center text-[#1F2937] mb-4">What We Detect</h2>
          <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
            Eight manipulation categories pulled from real psychological research on coercive control.
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🎭', name: 'Manipulation Language', color: '#FB7185' },
              { icon: '🪤', name: 'Grooming Patterns', color: '#f43f5e' },
              { icon: '💸', name: 'Financial Escalation', color: '#F59E0B' },
              { icon: '🧱', name: 'Isolation Signals', color: '#a855f7' },
              { icon: '🔗', name: 'Dependency Triggers', color: '#FB7185' },
              { icon: '💐', name: 'Love Bombing', color: '#ec4899' },
              { icon: '🔄', name: 'DARVO Tactics', color: '#ef4444' },
              { icon: '🔮', name: 'Future Faking', color: '#8b5cf6' },
            ].map(item => (
              <div key={item.name} className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="text-sm font-semibold text-[#1F2937]">{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dependency Levels */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-[#1F2937] mb-14">Dependency Score Guide</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              label: 'Healthy',
              range: '0 – 30',
              color: '#2DD4BF',
              bg: '#f0fdfb',
              border: '#99f6e4',
              desc: 'You\'re using AI intentionally. Keep it up! A few good habits will keep you balanced.',
            },
            {
              label: 'Some Signals',
              range: '31 – 60',
              color: '#F59E0B',
              bg: '#fffbeb',
              border: '#fde68a',
              desc: 'We\'re seeing patterns worth paying attention to. Small adjustments go a long way.',
            },
            {
              label: 'High Reliance',
              range: '61 – 100',
              color: '#FB7185',
              bg: '#fff1f2',
              border: '#fecdd3',
              desc: 'Touch Grass Mode time. Step back and reconnect with the real world.',
            },
          ].map((level) => (
            <div
              key={level.label}
              className="rounded-2xl p-6 border"
              style={{ backgroundColor: level.bg, borderColor: level.border }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-lg" style={{ color: level.color }}>{level.label}</span>
                <span className="text-sm font-medium text-gray-400">{level.range}</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{level.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Who It's For */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-center text-[#1F2937] mb-14">Who It's For</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '🙋',
                title: 'Yourself',
                desc: 'You use AI chats and want to be intentional about it not because you think you\'re addicted, but because you care about healthy tech habits.',
              },
              {
                icon: '👨‍👩‍👧',
                title: 'Parents',
                desc: 'Your teenager is spending hours with the ai they talk to and you want to understand what\'s happening. Use Parent Mode to analyze on their behalf.',
              },
              {
                icon: '🧑‍⚕️',
                title: 'Therapists',
                desc: 'You\'re already seeing clients with this problem and have zero tools to address it. BoundryAI gives you something concrete to recommend.',
              },
            ].map(item => (
              <div key={item.title} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to see what's actually happening?</h2>
        <p className="text-gray-500 mb-8">Paste a conversation. Get your score. No account needed.</p>
        <Link
          href="/analyze"
          className="inline-block bg-[#4F46E5] text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          Analyze Now — It's Free
        </Link>
        <p className="text-xs text-gray-400 mt-4">We never store your conversations. Ever.</p>
      </section>
    </main>
  )
}
