import { View, Text, StyleSheet } from 'react-native'

export default function CapsulesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Capsules</Text>
      <Text style={styles.hint}>Group items into curated capsule collections.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafaf9', padding: 16, paddingTop: 60 },
  title: { fontSize: 26, fontWeight: '700', color: '#1c1917', marginBottom: 8 },
  hint: { fontSize: 14, color: '#a8a29e', lineHeight: 20 },
})
