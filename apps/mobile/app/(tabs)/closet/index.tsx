import { useState, useCallback } from "react"
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, Image, Alert, ActivityIndicator, ScrollView,
} from "react-native"
import { router } from "expo-router"
import * as ImagePicker from "expo-image-picker"
import * as ImageManipulator from "expo-image-manipulator"
import * as FileSystem from "expo-file-system"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useFonts, PlayfairDisplay_700Bold, PlayfairDisplay_600SemiBold } from "@expo-google-fonts/playfair-display"
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from "@expo-google-fonts/inter"
import { useClosetItems } from "../../../src/hooks/useClosetItems"
import { db } from "../../../src/db/schema"
import type { ClosetItem } from "@vc/shared"
import { colors, fonts, radii, spacing } from "../../../src/theme"

type InnerTab = "closet" | "outfits" | "capsules"

const INNER_TABS: Array<{ key: InnerTab; label: string }> = [
  { key: "closet",   label: "CLOSET"   },
  { key: "outfits",  label: "OUTFITS"  },
  { key: "capsules", label: "CAPSULES" },
]

const FILTER_CHIPS = ["All Items", "Category", "Color", "Season"]

export default function ClosetScreen() {
  const insets = useSafeAreaInsets()
  const [search, setSearch] = useState("")
  const [uploading, setUploading] = useState(false)
  const [innerTab, setInnerTab] = useState<InnerTab>("closet")
  const items = useClosetItems(search)

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  })

  const serif   = fontsLoaded ? fonts.serif       : undefined
  const serifMd = fontsLoaded ? fonts.serifMedium : undefined
  const sans    = fontsLoaded ? fonts.sans         : undefined
  const sansMd  = fontsLoaded ? fonts.sansMedium  : undefined

  const handleAddItem = useCallback(async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) {
      Alert.alert("Permission needed", "Allow photo access to add items to your closet.")
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.9,
    })
    if (result.canceled) return

    setUploading(true)
    try {
      for (const asset of result.assets) {
        const manipulated = await ImageManipulator.manipulateAsync(
          asset.uri,
          [{ resize: { width: 800 } }],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        )
        const dest = `${FileSystem.documentDirectory}images/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`
        await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}images/`, { intermediates: true })
        await FileSystem.copyAsync({ from: manipulated.uri, to: dest })
        await db.addItem({
          id: Math.random().toString(36).slice(2),
          images: JSON.stringify([dest]),
          category: "top",
          colors: "[]",
          tags: "[]",
          season: null,
          brand: null,
          url: null,
          notes: null,
          isFavorite: 0,
          status: "active",
          wearCount: 0,
          lastWornAt: null,
          createdAt: Date.now(),
        })
      }
    } catch (err) {
      Alert.alert("Error", "Failed to add item(s). Please try again.")
      console.error(err)
    } finally {
      setUploading(false)
    }
  }, [])

  const renderCard = useCallback(({ item }: { item: ClosetItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/(tabs)/closet/${item.id}`)}
      activeOpacity={0.8}
    >
      <View style={styles.cardImageWrap}>
        {item.images[0] ? (
          <Image
            source={{ uri: item.images[0] }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.cardImage, styles.cardPlaceholder]}>
            <Ionicons name="shirt-outline" size={32} color={colors.textMuted} />
          </View>
        )}

        {/* Wear badge */}
        <View style={styles.wearBadge}>
          <Text style={[styles.wearBadgeText, { fontFamily: sansMd }]}>
            {item.wearCount > 0 ? `${item.wearCount} Wear${item.wearCount !== 1 ? "s" : ""}` : "New"}
          </Text>
        </View>

        {/* Heart */}
        <TouchableOpacity
          style={styles.heartBtn}
          activeOpacity={0.8}
          onPress={() => db.updateItem(item.id, { isFavorite: item.isFavorite ? 0 : 1 })}
        >
          <Ionicons
            name={item.isFavorite ? "heart" : "heart-outline"}
            size={16}
            color={item.isFavorite ? colors.red : colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.cardInfo}>
        <Text style={[styles.cardName, { fontFamily: serifMd }]} numberOfLines={1}>
          {item.brand ?? item.category.charAt(0).toUpperCase() + item.category.slice(1)}
        </Text>
        <Text style={[styles.cardMeta, { fontFamily: sans }]} numberOfLines={1}>
          {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
          {item.season ? ` • ${item.season}` : ""}
        </Text>
      </View>
    </TouchableOpacity>
  ), [serifMd, sans, sansMd])

  const ListHeader = (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterRow}
    >
      {FILTER_CHIPS.map((label, i) => (
        <TouchableOpacity
          key={label}
          style={[styles.chip, i === 0 && styles.chipActive]}
          activeOpacity={0.75}
        >
          <Text style={[styles.chipText, { fontFamily: sans }, i === 0 && styles.chipTextActive]}>
            {label}
          </Text>
          <Ionicons
            name="chevron-down"
            size={12}
            color={i === 0 ? "#fff" : colors.textSecondary}
            style={{ marginLeft: 2 }}
          />
        </TouchableOpacity>
      ))}
    </ScrollView>
  )

  return (
    <View style={styles.container}>
      {/* ── Sticky header ── */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        {/* Title row */}
        <View style={styles.titleRow}>
          <Text style={[styles.title, { fontFamily: serif }]}>My Closet</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="search" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={handleAddItem}
              disabled={uploading}
              activeOpacity={0.85}
            >
              {uploading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Ionicons name="add" size={22} color="#fff" />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Inner tab bar */}
        <View style={styles.innerTabs}>
          {INNER_TABS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={styles.innerTabItem}
              onPress={() => setInnerTab(tab.key)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.innerTabText,
                { fontFamily: serifMd },
                innerTab === tab.key && styles.innerTabTextActive,
              ]}>
                {tab.label}
              </Text>
              {innerTab === tab.key && <View style={styles.innerTabUnderline} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Hidden search input (keeps hook wired) */}
      <TextInput
        style={{ height: 0, opacity: 0 }}
        value={search}
        onChangeText={setSearch}
      />

      {/* ── Content ── */}
      {innerTab === "closet" && (
        items === null ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
        ) : (
          <FlatList
            data={items}
            keyExtractor={i => i.id}
            renderItem={renderCard}
            numColumns={2}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.gridContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={ListHeader}
            ListEmptyComponent={
              <View style={styles.empty}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="shirt-outline" size={36} color={colors.primary} />
                </View>
                <Text style={[styles.emptyTitle, { fontFamily: serif }]}>Your closet is empty</Text>
                <Text style={[styles.emptyHint,  { fontFamily: sans  }]}>Tap + to add your first item</Text>
              </View>
            }
          />
        )
      )}

      {innerTab !== "closet" && (
        <View style={styles.innerPlaceholder}>
          <Ionicons
            name={innerTab === "outfits" ? "layers-outline" : "albums-outline"}
            size={48}
            color={colors.textMuted}
          />
          <Text style={[styles.innerPlaceholderTitle, { fontFamily: serif }]}>
            {innerTab === "outfits" ? "Your Outfits" : "Your Capsules"}
          </Text>
          <Text style={[styles.innerPlaceholderHint, { fontFamily: sans }]}>
            {innerTab === "outfits"
              ? "Generate outfits using the ✦ button below"
              : "Manage collections in the Capsules tab"}
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    backgroundColor: colors.surfaceLight,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    fontStyle: "italic",
    color: colors.textPrimary,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.backgroundLight,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  innerTabs: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
  },
  innerTabItem: {
    flex: 1,
    alignItems: "center",
    paddingBottom: spacing.sm,
    position: "relative",
  },
  innerTabText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 1,
    color: colors.textSecondary,
  },
  innerTabTextActive: {
    color: colors.textPrimary,
  },
  innerTabUnderline: {
    position: "absolute",
    bottom: 0,
    left: "15%",
    right: "15%",
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.textPrimary,
  },
  filterRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 2,
  },
  chipActive: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  chipText: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: "#fff",
  },
  gridContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 110,
  },
  gridRow: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  card: {
    flex: 1,
    borderRadius: radii.xl,
    overflow: "hidden",
    backgroundColor: colors.surfaceLight,
  },
  cardImageWrap: {
    position: "relative",
  },
  cardImage: {
    width: "100%",
    aspectRatio: 4 / 5,
    backgroundColor: "#f1f2f4",
  },
  cardPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  wearBadge: {
    position: "absolute",
    bottom: spacing.sm,
    left: spacing.sm,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  wearBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.textPrimary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  heartBtn: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: {
    padding: spacing.md - 2,
    backgroundColor: colors.surfaceLight,
  },
  cardName: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  cardMeta: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  empty: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: spacing.xxxl,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: radii.full,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  emptyHint: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
  },
  innerPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xxxl,
    gap: spacing.md,
  },
  innerPlaceholderTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
  },
  innerPlaceholderHint: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
})
