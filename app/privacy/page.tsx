export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-extrabold mb-6">Privacy Policy</h1>
      <div className="prose text-gray-600 space-y-6 text-sm leading-relaxed">
        <p>
          <strong>We don't store your conversations. Ever.</strong>
        </p>
        <p>
          BoundryAI analyzes conversations entirely in your browser using client-side logic.
          No conversation text is sent to our servers, stored in a database, or shared with any third party.
        </p>
        <p>
          Your settings are saved locally in your browser using localStorage.
          This data never leaves your device.
        </p>
        <p>
          BoundryAI is a digital wellbeing tool. It is not therapy, mental health treatment,
          or a substitute for professional support. If you're struggling, please reach out to
          a mental health professional or someone you trust.
        </p>
        <p className="text-gray-400">Last updated: March 2026</p>
      </div>
    </main>
  )
}
