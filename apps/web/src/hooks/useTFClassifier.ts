import { useEffect, useState } from 'react'
import { preloadModel, classifyClothingImage, isModelReady } from '../lib/tfClassifier'
import type { Category } from '@vc/shared'

interface ClassificationResult {
  suggestedCategory: Category | null
  rawLabels: string[]
}

interface UseTFClassifierReturn {
  modelReady: boolean
  classify: (dataUrl: string) => Promise<ClassificationResult>
}

export function useTFClassifier(): UseTFClassifierReturn {
  const [modelReady, setModelReady] = useState(isModelReady())

  useEffect(() => {
    if (!modelReady) {
      preloadModel()
      // Poll until ready (model loads asynchronously)
      const interval = setInterval(() => {
        if (isModelReady()) {
          setModelReady(true)
          clearInterval(interval)
        }
      }, 500)
      return () => clearInterval(interval)
    }
    return undefined
  }, [modelReady])

  return {
    modelReady,
    classify: classifyClothingImage,
  }
}
