import type { AnalysisResult, ScanResult } from '@/lib/analyze'

export async function exportToPDF(
  depResult: AnalysisResult,
  scanResult: ScanResult,
  mode: 'self' | 'parent'
) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = 210
  let y = 0

  // Colors as explicit values
  const setColor = (r: number, g: number, b: number) => doc.setTextColor(r, g, b)
  const setFill = (r: number, g: number, b: number) => doc.setFillColor(r, g, b)

  const depColor: [number, number, number] = depResult.level === 'healthy' ? [45, 212, 191]
    : depResult.level === 'moderate' ? [245, 158, 11] : [251, 113, 133]

  const riskColor: [number, number, number] = scanResult.riskLevel === 'low' ? [45, 212, 191]
    : scanResult.riskLevel === 'moderate' ? [245, 158, 11]
    : scanResult.riskLevel === 'high' ? [251, 113, 133] : [220, 38, 38]

  const depLabel = depResult.level === 'healthy' ? 'Healthy Boundaries'
    : depResult.level === 'moderate' ? 'Some Dependency Signals' : 'High Emotional Reliance'

  const riskLabel = scanResult.riskLevel === 'low' ? 'Low Risk'
    : scanResult.riskLevel === 'moderate' ? 'Moderate Risk'
    : scanResult.riskLevel === 'high' ? 'High Risk' : 'Severe Risk'

  // HEADER
  setFill(79, 70, 229)
  doc.rect(0, 0, W, 28, 'F')
  setColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('BoundryAI', 15, 13)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Digital Wellbeing for AI Relationships', 15, 20)
  doc.text(`Generated ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, W - 15, 20, { align: 'right' })

  y = 38

  // SCORE BOXES
  setFill(249, 250, 251)
  doc.roundedRect(15, y, 85, 42, 4, 4, 'F')
  doc.roundedRect(110, y, 85, 42, 4, 4, 'F')

  setColor(107, 114, 128)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text(mode === 'parent' ? 'THEIR DEPENDENCY' : 'YOUR DEPENDENCY', 20, y + 8)
  setColor(depColor[0], depColor[1], depColor[2])
  doc.setFontSize(32)
  doc.setFont('helvetica', 'bold')
  doc.text(String(depResult.score), 20, y + 26)
  doc.setFontSize(9)
  doc.text(depLabel, 20, y + 34)

  setColor(107, 114, 128)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text('AI RISK SCORE', 115, y + 8)
  setColor(riskColor[0], riskColor[1], riskColor[2])
  doc.setFontSize(32)
  doc.setFont('helvetica', 'bold')
  doc.text(String(scanResult.riskScore), 115, y + 26)
  doc.setFontSize(9)
  doc.text(riskLabel, 115, y + 34)

  y += 52

  // SUMMARY
  setColor(31, 41, 55)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('Summary', 15, y)
  y += 7
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  setColor(107, 114, 128)
  const summaryLines = doc.splitTextToSize(scanResult.summary, W - 30)
  doc.text(summaryLines, 15, y)
  y += summaryLines.length * 5 + 8

  // DEPENDENCY FLAGS
  if (depResult.flags.length > 0) {
    setColor(31, 41, 55)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text(`${mode === 'parent' ? 'Their' : 'Your'} Patterns (${depResult.flags.length} detected)`, 15, y)
    y += 7
    for (const flag of depResult.flags) {
      setFill(255, 241, 242)
      doc.roundedRect(15, y - 4, W - 30, 9, 2, 2, 'F')
      setColor(251, 113, 133)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text('✓', 20, y + 2)
      setColor(31, 41, 55)
      doc.setFont('helvetica', 'normal')
      doc.text(flag, 27, y + 2)
      y += 11
    }
    y += 4
  }

  // AI RISK FLAGS
  if (scanResult.flags.length > 0) {
    if (y > 220) { doc.addPage(); y = 20 }
    setColor(31, 41, 55)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text(`AI Behavior Flags (${scanResult.flags.length} detected)`, 15, y)
    y += 8

    for (const flag of scanResult.flags) {
      if (y > 245) { doc.addPage(); y = 20 }
      const bgR = flag.severity === 'high' ? 255 : flag.severity === 'medium' ? 255 : 240
      const bgG = flag.severity === 'high' ? 241 : flag.severity === 'medium' ? 251 : 253
      const bgB = flag.severity === 'high' ? 242 : flag.severity === 'medium' ? 235 : 251
      const fgR = flag.severity === 'high' ? 251 : flag.severity === 'medium' ? 245 : 45
      const fgG = flag.severity === 'high' ? 113 : flag.severity === 'medium' ? 158 : 212
      const fgB = flag.severity === 'high' ? 133 : flag.severity === 'medium' ? 11 : 191

      setFill(bgR, bgG, bgB)
      doc.roundedRect(15, y - 4, W - 30, 10, 2, 2, 'F')
      setColor(fgR, fgG, fgB)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text(flag.category, 20, y + 2)
      doc.setFontSize(7)
      doc.text(flag.severity.toUpperCase(), W - 20, y + 2, { align: 'right' })
      y += 12

      setColor(107, 114, 128)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      const expLines = doc.splitTextToSize(flag.explanation, W - 35)
      doc.text(expLines, 20, y)
      y += expLines.length * 4.5

      if (flag.examples.length > 0) {
        setColor(31, 41, 55)
        doc.setFontSize(7.5)
        doc.setFont('helvetica', 'italic')
        doc.text(flag.examples.join('  '), 20, y + 2)
        y += 7
      }
      y += 6
    }
  }

  // CONVERSATION INSIGHTS
  if (y > 230) { doc.addPage(); y = 20 }
  setColor(31, 41, 55)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('Conversation Insights', 15, y)
  y += 8

  const insights: [string, string][] = [
    ['Messages analyzed', String(depResult.messageCount)],
    ['Most common topic', depResult.dominantTopic],
    ['Emotional tone', depResult.dominantTone],
  ]
  for (const [label, value] of insights) {
    setFill(249, 250, 251)
    doc.roundedRect(15, y - 4, W - 30, 9, 2, 2, 'F')
    setColor(107, 114, 128)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(label, 20, y + 2)
    setColor(31, 41, 55)
    doc.setFont('helvetica', 'bold')
    doc.text(value, W - 20, y + 2, { align: 'right' })
    y += 11
  }
  y += 6

  // RECOMMENDATIONS
  if (y > 230) { doc.addPage(); y = 20 }
  const recs: Record<string, string[]> = {
    healthy: ['Set a daily time limit of ~30 minutes', 'Use AI for tasks, not companionship', 'Journal before opening AI to clarify your needs'],
    moderate: ['30-minute cooldown between sessions', 'No AI conversations after 10 PM', 'Reach out to a real person today'],
    high: ['Touch Grass Mode recommended', '2-hour cooldowns between sessions', 'No AI during emotional moments', 'Make one real human connection before opening AI'],
  }
  setColor(31, 41, 55)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('Recommendations', 15, y)
  y += 8

  const recBgR = depResult.level === 'healthy' ? 240 : depResult.level === 'moderate' ? 255 : 255
  const recBgG = depResult.level === 'healthy' ? 253 : depResult.level === 'moderate' ? 251 : 241
  const recBgB = depResult.level === 'healthy' ? 251 : depResult.level === 'moderate' ? 235 : 242

  for (const rec of recs[depResult.level] || []) {
    setFill(recBgR, recBgG, recBgB)
    doc.roundedRect(15, y - 4, W - 30, 9, 2, 2, 'F')
    setColor(depColor[0], depColor[1], depColor[2])
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('->', 20, y + 2)
    setColor(31, 41, 55)
    doc.setFont('helvetica', 'normal')
    doc.text(rec, 27, y + 2)
    y += 11
  }

  // FOOTER
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    setFill(249, 250, 251)
    doc.rect(0, 285, W, 12, 'F')
    setColor(107, 114, 128)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text('BoundryAI  ·  boundryai.vercel.app  ·  Conversations are never stored', 15, 292)
    doc.text(`Page ${i} of ${pageCount}`, W - 15, 292, { align: 'right' })
  }

  doc.save('boundryai-report.pdf')
}