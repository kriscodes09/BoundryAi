'use client'

import { useRef } from 'react'
import type { AnalysisResult, ScanResult } from '@/lib/analyze'

interface Props {
  depResult: AnalysisResult
  scanResult: ScanResult
  mode: 'self' | 'parent'
}

export default function ShareCard({ depResult, scanResult, mode }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const depColor = depResult.level === 'healthy' ? '#2DD4BF'
    : depResult.level === 'moderate' ? '#F59E0B' : '#FB7185'

  const riskColor = scanResult.riskLevel === 'low' ? '#2DD4BF'
    : scanResult.riskLevel === 'moderate' ? '#F59E0B'
    : scanResult.riskLevel === 'high' ? '#FB7185' : '#dc2626'

  const depLabel = depResult.level === 'healthy' ? 'Healthy Boundaries'
    : depResult.level === 'moderate' ? 'Some Signals' : 'High Reliance'

  const riskLabel = scanResult.riskLevel === 'low' ? 'Low Risk'
    : scanResult.riskLevel === 'moderate' ? 'Moderate Risk'
    : scanResult.riskLevel === 'high' ? 'High Risk' : 'Severe Risk'

  const downloadCard = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = 800
    const H = 420
    canvas.width = W
    canvas.height = H

    // Background
    ctx.fillStyle = '#FAFAFA'
    ctx.fillRect(0, 0, W, H)

    // Left accent bar
    ctx.fillStyle = '#4F46E5'
    ctx.fillRect(0, 0, 6, H)

    // Header
    ctx.fillStyle = '#4F46E5'
    ctx.font = 'bold 28px Inter, sans-serif'
    ctx.fillText('BoundryAI', 40, 55)

    ctx.fillStyle = '#9ca3af'
    ctx.font = '15px Inter, sans-serif'
    ctx.fillText('Digital Wellbeing for AI Relationships', 40, 80)

    // Divider
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(40, 105)
    ctx.lineTo(W - 40, 105)
    ctx.stroke()

    // Dependency Score Box
    const box1X = 40
    const box1Y = 130
    const boxW = 340
    const boxH = 200

    ctx.fillStyle = '#ffffff'
    roundRect(ctx, box1X, box1Y, boxW, boxH, 16)
    ctx.fill()
    ctx.strokeStyle = '#f3f4f6'
    ctx.lineWidth = 1
    roundRect(ctx, box1X, box1Y, boxW, boxH, 16)
    ctx.stroke()

    ctx.fillStyle = '#9ca3af'
    ctx.font = '12px Inter, sans-serif'
    ctx.fillText(mode === 'parent' ? 'THEIR DEPENDENCY' : 'YOUR DEPENDENCY', box1X + 20, box1Y + 28)

    ctx.fillStyle = depColor
    ctx.font = 'bold 72px Inter, sans-serif'
    ctx.fillText(String(depResult.score), box1X + 20, box1Y + 110)

    ctx.fillStyle = depColor
    ctx.font = 'bold 16px Inter, sans-serif'
    ctx.fillText(depLabel, box1X + 20, box1Y + 140)

    if (depResult.flags.length > 0) {
      ctx.fillStyle = '#6b7280'
      ctx.font = '13px Inter, sans-serif'
      ctx.fillText(`${depResult.flags.length} pattern${depResult.flags.length !== 1 ? 's' : ''} detected`, box1X + 20, box1Y + 168)
    }

    // Risk Score Box
    const box2X = W - 40 - boxW
    ctx.fillStyle = '#ffffff'
    roundRect(ctx, box2X, box1Y, boxW, boxH, 16)
    ctx.fill()
    ctx.strokeStyle = '#f3f4f6'
    roundRect(ctx, box2X, box1Y, boxW, boxH, 16)
    ctx.stroke()

    ctx.fillStyle = '#9ca3af'
    ctx.font = '12px Inter, sans-serif'
    ctx.fillText('AI RISK SCORE', box2X + 20, box1Y + 28)

    ctx.fillStyle = riskColor
    ctx.font = 'bold 72px Inter, sans-serif'
    ctx.fillText(String(scanResult.riskScore), box2X + 20, box1Y + 110)

    ctx.fillStyle = riskColor
    ctx.font = 'bold 16px Inter, sans-serif'
    ctx.fillText(riskLabel, box2X + 20, box1Y + 140)

    if (scanResult.flags.length > 0) {
      ctx.fillStyle = '#6b7280'
      ctx.font = '13px Inter, sans-serif'
      ctx.fillText(`${scanResult.flags.length} flag${scanResult.flags.length !== 1 ? 's' : ''} in AI responses`, box2X + 20, box1Y + 168)
    }

    // Footer
    ctx.fillStyle = '#9ca3af'
    ctx.font = '13px Inter, sans-serif'
    ctx.fillText('boundryai.vercel.app  ·  Analyzed locally. Nothing was stored.', 40, H - 25)

    // Download
    const link = document.createElement('a')
    link.download = 'boundryai-score.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div>
      <canvas ref={canvasRef} className="hidden" />
      <button
        onClick={downloadCard}
        className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm"
      >
        <span>📤</span>
        Share Score Card
      </button>
    </div>
  )
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}
