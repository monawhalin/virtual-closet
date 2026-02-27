import { useState, useCallback } from 'react'
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Image, Share, Alert, ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { generateOutfits, validateCloset } from '@vc/outfit-gen'
import type { ClosetItem, Occasion, GeneratorOptions, GeneratedOutfit } from '@vc/shared'
import { OCCASIONS } from '@vc/shared'
import { db } from '../../../src/db/schema'
import { useAllItems } from '../../../src/hooks/useAllItems'

const DEFAULT_OPTS: GeneratorOptions = {
  preferLeastWorn: true,
  avoidRecentDays: 7,
  capsuleOnly: false,
  capsuleId: null,
  preferFavorites: true,
}

export default function GenerateScreen() {
  const allItems = useAllItems()
  const [occasion, setOccasion] = useState<Occasion>('casual')
  const [outfits, setOutfits] = useState<GeneratedOutfit[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(false)

  const currentOutfit = outfits[currentIndex]

  const handleGenerate = useCallback(async () => {
    if (!allItems) return
    setLoading(true)
    // Small delay to allow the spinner to render
    await new Promise(r => setTimeout(r, 50))
    const generated = generateOutfits(allItems, occasion, DEFAULT_OPTS)
    setOutfits(generated)
    setCurrentIndex(0)
    setLoading(false)
  }, [allItems, occasion])

  const handleShare = useCallback(async () => {
    if (!currentOutfit) return
    const parts: string[] = [`Virtual Closet — ${occasion} outfit`]
    if (currentOutfit.top) parts.push(`Top: ${currentOutfit.top.category} (${currentOutfit.top.colors.join(', ')})`)
    if (currentOutfit.bottom) parts.push(`Bottom: ${currentOutfit.bottom.category} (${currentOutfit.bottom.colors.join(', ')})`)
    if (currentOutfit.dress) parts.push(`Dress: ${currentOutfit.dress.category}`)
    parts.push(`Shoes: ${currentOutfit.shoes.category}`)
    await Share.share({ message: parts.join('\n') })
  }, [currentOutfit, occasion])

  const handleMarkWorn = useCallback(async () => {
    if (!currentOutfit) return
    const wornAt = Date.now()
    const itemIds = [
      currentOutfit.top?.id,
      currentOutfit.bottom?.id,
      currentOutfit.dress?.id,
      currentOutfit.jumpsuit?.id,
      currentOutfit.shoes?.id,
      currentOutfit.outerwear?.id,
      currentOutfit.accessory?.id,
    ].filter(Boolean) as string[]

    for (const itemId of itemIds) {
      const item = allItems?.find(i => i.id === itemId)
      if (!item) continue
      await db.updateItem(itemId, {
        wearCount: item.wearCount + 1,
        lastWornAt: wornAt,
      })
    }
    Alert.alert('Outfit marked as worn! 🎉')
  }, [currentOutfit, allItems])

  const validation = allItems ? validateCloset(allItems) : null

  function renderItemSlot(item: ClosetItem | undefined, label: string) {
    if (!item) return null
    return (
      <View key={item.id} style={styles.slot}>
        {item.images[0] ? (
          <Image source={{ uri: item.images[0] }} style={styles.slotImage} />
        ) : (
          <View style={[styles.slotImage, styles.slotPlaceholder]}>
            <Text style={{ fontSize: 20 }}>👕</Text>
          </View>
        )}
        <Text style={styles.slotLabel}>{label}</Text>
        <Text style={styles.slotCategory}>{item.category}</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Generate Outfit</Text>

      {/* Occasion picker */}
      <Text style={styles.sectionLabel}>Occasion</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.occasionScroll}>
        {OCCASIONS.map(occ => (
          <TouchableOpacity
            key={occ}
            onPress={() => setOccasion(occ)}
            style={[styles.occasionChip, occasion === occ && styles.occasionChipActive]}
          >
            <Text style={[styles.occasionText, occasion === occ && styles.occasionTextActive]}>
              {occ.charAt(0).toUpperCase() + occ.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Generate button */}
      {validation && !validation.canGenerate && (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>{validation.missingMessage}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.generateButton, (!validation?.canGenerate || loading) && styles.generateButtonDisabled]}
        onPress={handleGenerate}
        disabled={!validation?.canGenerate || loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <><Ionicons name="sparkles" size={16} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.generateButtonText}>Generate</Text></>
        }
      </TouchableOpacity>

      {/* Outfit display */}
      {currentOutfit && (
        <View style={styles.outfitCard}>
          {/* Pagination */}
          {outfits.length > 1 && (
            <View style={styles.pagination}>
              <TouchableOpacity
                onPress={() => setCurrentIndex(i => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
              >
                <Ionicons name="chevron-back" size={20} color={currentIndex === 0 ? '#d4d4d2' : '#44403c'} />
              </TouchableOpacity>
              <Text style={styles.paginationText}>{currentIndex + 1} / {outfits.length}</Text>
              <TouchableOpacity
                onPress={() => setCurrentIndex(i => Math.min(outfits.length - 1, i + 1))}
                disabled={currentIndex === outfits.length - 1}
              >
                <Ionicons name="chevron-forward" size={20} color={currentIndex === outfits.length - 1 ? '#d4d4d2' : '#44403c'} />
              </TouchableOpacity>
            </View>
          )}

          {/* Slots grid */}
          <View style={styles.slotsGrid}>
            {renderItemSlot(currentOutfit.top, 'Top')}
            {renderItemSlot(currentOutfit.bottom, 'Bottom')}
            {renderItemSlot(currentOutfit.dress, 'Dress')}
            {renderItemSlot(currentOutfit.jumpsuit, 'Jumpsuit')}
            {renderItemSlot(currentOutfit.shoes, 'Shoes')}
            {renderItemSlot(currentOutfit.outerwear, 'Outerwear')}
            {renderItemSlot(currentOutfit.accessory, 'Accessory')}
          </View>

          {/* Outfit actions */}
          <View style={styles.outfitActions}>
            <TouchableOpacity style={styles.outfitActionBtn} onPress={handleMarkWorn}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#57534e" />
              <Text style={styles.outfitActionText}>Worn</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.outfitActionBtn} onPress={handleShare}>
              <Ionicons name="share-outline" size={18} color="#57534e" />
              <Text style={styles.outfitActionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafaf9' },
  content: { padding: 16, paddingTop: 60, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '700', color: '#1c1917', marginBottom: 20 },
  sectionLabel: { fontSize: 11, fontWeight: '600', color: '#a8a29e', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  occasionScroll: { marginBottom: 16 },
  occasionChip: {
    borderWidth: 1, borderColor: '#e7e5e4', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, backgroundColor: '#fff',
  },
  occasionChipActive: { backgroundColor: '#1c1917', borderColor: '#1c1917' },
  occasionText: { fontSize: 13, color: '#57534e', fontWeight: '500' },
  occasionTextActive: { color: '#fff' },
  warningBox: {
    backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#fed7aa',
    borderRadius: 10, padding: 12, marginBottom: 12,
  },
  warningText: { fontSize: 13, color: '#92400e' },
  generateButton: {
    backgroundColor: '#1c1917', borderRadius: 12, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  generateButtonDisabled: { opacity: 0.5 },
  generateButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  outfitCard: {
    backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f5f5f4', padding: 16,
  },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  paginationText: { fontSize: 13, color: '#78716c' },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  slot: { width: '30%', alignItems: 'center', gap: 4 },
  slotImage: { width: '100%', aspectRatio: 1, borderRadius: 10 },
  slotPlaceholder: {
    backgroundColor: '#fafaf9', borderWidth: 1, borderColor: '#f5f5f4',
    alignItems: 'center', justifyContent: 'center',
  },
  slotLabel: { fontSize: 9, fontWeight: '600', color: '#a8a29e', textTransform: 'uppercase', letterSpacing: 0.3 },
  slotCategory: { fontSize: 11, color: '#44403c', textTransform: 'capitalize' },
  outfitActions: { flexDirection: 'row', gap: 10, borderTopWidth: 1, borderTopColor: '#f5f5f4', paddingTop: 12 },
  outfitActionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1, borderColor: '#e7e5e4', backgroundColor: '#fafaf9',
  },
  outfitActionText: { fontSize: 13, fontWeight: '500', color: '#57534e' },
})
