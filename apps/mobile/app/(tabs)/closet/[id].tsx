import { useState } from "react"
import {
  View, Text, Image, ScrollView, StyleSheet,
  TouchableOpacity, Alert, Linking,
} from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useFonts, PlayfairDisplay_700Bold, PlayfairDisplay_600SemiBold, PlayfairDisplay_400Regular_Italic } from "@expo-google-fonts/playfair-display"
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from "@expo-google-fonts/inter"
import { db } from "../../../src/db/schema"
import { useItem } from "../../../src/hooks/useItem"
import { formatLastWorn } from "@vc/ui-shared"
import { colors, fonts, radii, spacing } from "../../../src/theme"

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const item = useItem(id)
  const [photoIndex, setPhotoIndex] = useState(0)
  const insets = useSafeAreaInsets()

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_400Regular_Italic,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  })

  const serif      = fontsLoaded ? fonts.serif        : undefined
  const serifMd    = fontsLoaded ? fonts.serifMedium  : undefined
  const serifItal  = fontsLoaded ? fonts.serifItalic  : undefined
  const sans       = fontsLoaded ? fonts.sans          : undefined
  const sansSemi   = fontsLoaded ? fonts.sansSemiBold  : undefined

  if (!item) {
    return (
      <View style={styles.loadingWrap}>
        <Text style={{ color: colors.textMuted }}>Loading…</Text>
      </View>
    )
  }

  async function handleToggleFavorite() {
    await db.updateItem(id, { isFavorite: item!.isFavorite ? 0 : 1 })
  }

  async function handleArchive() {
    const newStatus = item!.status === "archived" ? "active" : "archived"
    await db.updateItem(id, { status: newStatus })
    if (newStatus === "archived") router.back()
  }

  async function handleDelete() {
    Alert.alert(
      "Delete item",
      "Permanently delete this item? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete", style: "destructive",
          onPress: async () => { await db.deleteItem(id); router.back() },
        },
      ]
    )
  }

  const displayName = item.brand
    ? item.brand
    : item.category.charAt(0).toUpperCase() + item.category.slice(1)

  return (
    <View style={styles.root}>
      {/* ── Header bar ── */}
      <View style={[styles.headerBar, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="create-outline" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => Alert.alert(
              "Options",
              undefined,
              [
                { text: item.isFavorite ? "Unfavorite" : "Favorite", onPress: handleToggleFavorite },
                { text: item.status === "archived" ? "Restore" : "Archive", onPress: handleArchive },
                { text: "Delete", style: "destructive", onPress: handleDelete },
                { text: "Cancel", style: "cancel" },
              ]
            )}
          >
            <Ionicons name="ellipsis-vertical" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Image ── */}
        <View style={styles.imageArea}>
          {item.images[photoIndex] ? (
            <Image
              source={{ uri: item.images[photoIndex] }}
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={{ fontSize: 64 }}>👗</Text>
            </View>
          )}
          {/* Dot pager */}
          {item.images.length > 1 && (
            <View style={styles.dots}>
              {item.images.map((_, i) => (
                <TouchableOpacity key={i} onPress={() => setPhotoIndex(i)}>
                  <View style={[styles.dot, i === photoIndex && styles.dotActive]} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* ── Title block ── */}
        <View style={styles.titleBlock}>
          {item.brand && (
            <Text style={[styles.brandLabel, { fontFamily: serifMd }]}>
              {item.brand.toUpperCase()}
            </Text>
          )}
          <Text style={[styles.itemName, { fontFamily: serif }]}>{displayName}</Text>
          {item.notes ? (
            <Text style={[styles.notesQuote, { fontFamily: serifItal }]}>
              "{item.notes}"
            </Text>
          ) : null}
        </View>

        {/* ── Wardrobe Analytics ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { fontFamily: sansSemi }]}>Wardrobe Analytics</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { fontFamily: serif }]}>{item.wearCount}</Text>
              <Text style={[styles.statCaption, { fontFamily: sansSemi }]}>WEARS</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { fontFamily: serif }]}>—</Text>
              <Text style={[styles.statCaption, { fontFamily: sansSemi }]}>COST/WEAR</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, styles.statValueSm, { fontFamily: serif }]}>
                {formatLastWorn(item.lastWornAt)}
              </Text>
              <Text style={[styles.statCaption, { fontFamily: sansSemi }]}>LAST WORN</Text>
            </View>
          </View>
        </View>

        {/* ── Item Details ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { fontFamily: sansSemi }]}>Item Details</Text>
          <View style={styles.detailsCard}>
            {/* Season */}
            {item.season ? (
              <View style={styles.detailRow}>
                <Text style={[styles.detailKey, { fontFamily: serifMd }]}>Season</Text>
                <Text style={[styles.detailVal, { fontFamily: sans }]}>{item.season}</Text>
              </View>
            ) : null}

            {/* URL */}
            {item.url ? (
              <View style={[styles.detailRow, item.season ? styles.detailRowBordered : null]}>
                <View style={styles.detailRowHeader}>
                  <Text style={[styles.detailKey, { fontFamily: serifMd }]}>URL</Text>
                  <TouchableOpacity onPress={() => Linking.openURL(item.url!)}>
                    <Text style={[styles.urlLinkLabel, { fontFamily: sans }]}>
                      open <Ionicons name="open-outline" size={11} />
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={[styles.urlVal, { fontFamily: sans }]} numberOfLines={1}>{item.url}</Text>
              </View>
            ) : null}

            {/* Tags */}
            {item.tags.length > 0 ? (
              <View style={[(item.season || item.url) ? styles.detailRowBordered : null, styles.tagsSection]}>
                <Text style={[styles.detailKey, { fontFamily: serifMd }]}>Tags</Text>
                <View style={styles.tagWrap}>
                  {item.tags.map(t => (
                    <View key={t} style={styles.tag}>
                      <Text style={[styles.tagText, { fontFamily: sans }]}>#{t}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {/* Colors */}
            {item.colors.length > 0 ? (
              <View style={styles.tagsSection}>
                <Text style={[styles.detailKey, { fontFamily: serifMd }]}>Colors</Text>
                <View style={styles.tagWrap}>
                  {item.colors.map(c => (
                    <View key={c} style={styles.tag}>
                      <Text style={[styles.tagText, { fontFamily: sans }]}>{c}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </View>
        </View>

        {/* ── Actions ── */}
        <View style={styles.actionsBlock}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => Alert.alert("Save to Capsule", "Capsule management coming soon.")}
            activeOpacity={0.85}
          >
            <Text style={[styles.primaryBtnText, { fontFamily: sansSemi }]}>Save to Capsule</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleArchive} activeOpacity={0.7}>
            <Text style={[styles.archiveLink, { fontFamily: sans }]}>
              {item.status === "archived" ? "Restore Item" : "Archive Item"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fcfbf9",
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fcfbf9",
  },

  // Header bar
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
  headerActions: {
    flexDirection: "row",
    gap: spacing.xs,
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 120 },

  // Image area
  imageArea: {
    width: "100%",
    aspectRatio: 4 / 5,
    backgroundColor: "#fcfbf9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  image: {
    width: "85%",
    height: "85%",
  },
  imagePlaceholder: {
    width: "85%",
    height: "85%",
    alignItems: "center",
    justifyContent: "center",
  },
  dots: {
    position: "absolute",
    bottom: spacing.md,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    width: "100%",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#d4d4d2",
  },
  dotActive: {
    backgroundColor: colors.textPrimary,
  },

  // Title block
  titleBlock: {
    alignItems: "center",
    paddingHorizontal: spacing.xxl,
    marginBottom: spacing.xxl,
    gap: spacing.xs,
  },
  brandLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 2,
    color: colors.textSecondary,
    textAlign: "center",
  },
  itemName: {
    fontSize: 28,
    fontWeight: "500",
    color: colors.textPrimary,
    textAlign: "center",
    lineHeight: 34,
  },
  notesQuote: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xs,
  },

  // Sections
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: colors.textSecondary,
    marginBottom: spacing.md,
    paddingLeft: 2,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  statValueSm: {
    fontSize: 15,
    textAlign: "center",
  },
  statCaption: {
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.textSecondary,
  },

  // Details card
  detailsCard: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.xl,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  detailRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: 4,
  },
  detailRowBordered: {
    borderTopWidth: 1,
    borderTopColor: "#f4f4f4",
  },
  detailRowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailKey: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  detailVal: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  urlLinkLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  urlVal: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  tagsSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "#f4f4f4",
  },
  tagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.full,
    backgroundColor: "#f3f4f6",
  },
  tagText: {
    fontSize: 12,
    color: colors.textPrimary,
  },

  // Actions
  actionsBlock: {
    paddingHorizontal: spacing.xxl,
    marginTop: spacing.md,
    alignItems: "center",
    gap: spacing.lg,
  },
  primaryBtn: {
    width: "100%",
    paddingVertical: spacing.lg,
    borderRadius: radii.full,
    backgroundColor: colors.textPrimary,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  archiveLink: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textSecondary,
    borderBottomWidth: 1,
    borderBottomColor: "transparent",
  },
})
