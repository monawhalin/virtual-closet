import type { Category } from '@vc/shared'

// Lazy import TF.js to avoid blocking initial render
let modelPromise: Promise<unknown> | null = null

// Maps substrings of ImageNet class names to our Category type
const IMAGENET_TO_CATEGORY: Array<{ keywords: string[]; category: Category }> = [
  { keywords: ['jersey', 't-shirt', 'tshirt', 'polo', 'blouse', 'shirt', 'top', 'tank', 'crop', 'sweatshirt', 'hoodie', 'pullover', 'sweater', 'cardigan', 'knitwear', 'turtleneck', 'tunic', 'camisole', 'vest top'], category: 'top' },
  { keywords: ['trouser', 'jean', 'denim', 'pant', 'legging', 'short', 'skirt', 'chino', 'sweatpant', 'jogger'], category: 'bottom' },
  { keywords: ['dress', 'gown', 'frock', 'sundress', 'maxi'], category: 'dress' },
  { keywords: ['jumpsuit', 'romper', 'overalls', 'playsuit', 'dungaree'], category: 'jumpsuit' },
  { keywords: ['jacket', 'coat', 'blazer', 'trench', 'parka', 'anorak', 'windbreaker', 'overcoat', 'raincoat', 'fur coat', 'peacoat'], category: 'outerwear' },
  { keywords: ['shoe', 'boot', 'sneaker', 'sandal', 'heel', 'loafer', 'pump', 'slipper', 'trainer', 'oxford', 'stiletto', 'mule', 'clog', 'wedge'], category: 'shoes' },
  { keywords: ['bag', 'purse', 'handbag', 'belt', 'scarf', 'hat', 'cap', 'sunglasses', 'glove', 'watch', 'necklace', 'earring', 'bracelet', 'tie', 'bow tie', 'wallet', 'backpack', 'clutch', 'tote'], category: 'accessory' },
]

function mapPredictionsToCategory(predictions: Array<{ className: string; probability: number }>): Category | null {
  for (const pred of predictions) {
    if (pred.probability < 0.20) continue
    const lower = pred.className.toLowerCase()
    for (const entry of IMAGENET_TO_CATEGORY) {
      if (entry.keywords.some(kw => lower.includes(kw))) {
        return entry.category
      }
    }
  }
  return null
}

async function loadMobileNet() {
  // Dynamic import to avoid blocking initial bundle
  const [tf, mobilenet] = await Promise.all([
    import('@tensorflow/tfjs'),
    import('@tensorflow-models/mobilenet'),
  ])
  await tf.ready()
  return mobilenet.load({ version: 2, alpha: 0.5 })
}

export function preloadModel(): void {
  if (!modelPromise) {
    modelPromise = loadMobileNet().catch((err) => {
      console.warn('TF.js model failed to load:', err)
      modelPromise = null
      return null
    })
  }
}

export async function classifyClothingImage(
  dataUrl: string
): Promise<{ suggestedCategory: Category | null; rawLabels: string[] }> {
  if (!modelPromise) {
    preloadModel()
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = (await modelPromise) as any
    if (!model) return { suggestedCategory: null, rawLabels: [] }

    const img = new Image()
    await new Promise<void>((res, rej) => {
      img.onload = () => res()
      img.onerror = () => rej(new Error('Image load failed'))
      img.src = dataUrl
    })

    const predictions = await model.classify(img, 5) as Array<{ className: string; probability: number }>
    // Release image from memory
    img.src = ''

    const suggestedCategory = mapPredictionsToCategory(predictions)
    const rawLabels = predictions
      .filter(p => p.probability > 0.10)
      .map(p => p.className)

    return { suggestedCategory, rawLabels }
  } catch (err) {
    console.warn('TF.js classification error:', err)
    return { suggestedCategory: null, rawLabels: [] }
  }
}

export function isModelReady(): boolean {
  return modelPromise !== null
}
