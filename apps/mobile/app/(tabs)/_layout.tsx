import { Tabs } from "expo-router"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import { colors } from "../../src/theme"

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"]

const LEFT_TABS: Array<{ route: string; label: string; icon: IoniconsName; activeIcon: IoniconsName }> = [
  { route: "closet",   label: "Closet",   icon: "shirt-outline",   activeIcon: "shirt" },
  { route: "capsules", label: "Capsules", icon: "albums-outline",  activeIcon: "albums" },
]

const RIGHT_TABS: Array<{ route: string; label: string; icon: IoniconsName; activeIcon: IoniconsName }> = [
  { route: "saved",    label: "Outfits",  icon: "layers-outline",  activeIcon: "layers" },
  { route: "profile",  label: "Profile",  icon: "person-outline",  activeIcon: "person" },
]

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()
  const activeRoute = state.routes[state.index].name

  function goTo(routeName: string) {
    const targetRoute = state.routes.find(r => r.name === routeName)
    const event = navigation.emit({
      type: "tabPress",
      target: targetRoute?.key ?? "",
      canPreventDefault: true,
    })
    if (!event.defaultPrevented) {
      navigation.navigate(routeName)
    }
  }

  function renderTabItem(cfg: typeof LEFT_TABS[0]) {
    const active = activeRoute === cfg.route
    return (
      <TouchableOpacity
        key={cfg.route}
        style={styles.tabItem}
        onPress={() => goTo(cfg.route)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={active ? cfg.activeIcon : cfg.icon}
          size={22}
          color={active ? colors.textPrimary : "#9ca3af"}
        />
        <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
          {cfg.label}
        </Text>
      </TouchableOpacity>
    )
  }

  const generateActive = activeRoute === "generate"

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom || 16 }]}>
      <View style={styles.section}>
        {LEFT_TABS.map(renderTabItem)}
      </View>

      {/* Raised center button → AI Generate */}
      <TouchableOpacity
        style={[styles.centerBtn, generateActive && styles.centerBtnActive]}
        onPress={() => goTo("generate")}
        activeOpacity={0.85}
      >
        <Ionicons name="sparkles" size={26} color="#fff" />
      </TouchableOpacity>

      <View style={styles.section}>
        {RIGHT_TABS.map(renderTabItem)}
      </View>
    </View>
  )
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="closet" />
      <Tabs.Screen name="capsules" />
      <Tabs.Screen name="generate" />
      <Tabs.Screen name="saved" />
      <Tabs.Screen name="profile" />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  section: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    gap: 3,
    paddingVertical: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: "#9ca3af",
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: colors.textPrimary,
  },
  centerBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  centerBtnActive: {
    backgroundColor: colors.primary,
  },
})
