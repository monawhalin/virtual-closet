interface HSL {
  h: number
  s: number
  l: number
}

function rgbToHsl(r: number, g: number, b: number): HSL {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  let h = 0
  let s = 0

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break
      case gn: h = ((bn - rn) / d + 2) / 6; break
      case bn: h = ((rn - gn) / d + 4) / 6; break
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 }
}

function classifyColor(h: number, s: number, l: number): string {
  if (l < 12) return 'black'
  if (l > 90) return 'white'
  if (s < 12) {
    if (l < 40) return 'black'
    if (l > 75) return 'white'
    return 'grey'
  }
  if (h >= 0 && h < 20) return s > 40 && l < 60 ? 'red' : 'beige'
  if (h >= 20 && h < 40) return 'orange'
  if (h >= 40 && h < 65) return 'yellow'
  if (h >= 65 && h < 165) return 'green'
  if (h >= 165 && h < 195) {
    return s > 30 ? 'blue' : 'grey'
  }
  if (h >= 195 && h < 240) return l < 40 ? 'navy' : 'blue'
  if (h >= 240 && h < 290) return 'purple'
  if (h >= 290 && h < 335) return 'pink'
  if (h >= 335 && h <= 360) return s > 40 && l < 60 ? 'red' : 'pink'
  return 'beige'
}

export function extractDominantColors(dataUrl: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const SAMPLE = 16
      const canvas = document.createElement('canvas')
      canvas.width = SAMPLE
      canvas.height = SAMPLE
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('No canvas context')); return }

      ctx.drawImage(img, 0, 0, SAMPLE, SAMPLE)
      const data = ctx.getImageData(0, 0, SAMPLE, SAMPLE).data
      const counts: Record<string, number> = {}

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]!
        const g = data[i + 1]!
        const b = data[i + 2]!
        const a = data[i + 3]!
        if (a < 128) continue  // skip transparent pixels
        const { h, s, l } = rgbToHsl(r, g, b)
        const name = classifyColor(h, s, l)
        counts[name] = (counts[name] ?? 0) + 1
      }

      const sorted = Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([name]) => name)

      resolve(sorted)
    }
    img.onerror = () => reject(new Error('Failed to load image for color extraction'))
    img.src = dataUrl
  })
}
