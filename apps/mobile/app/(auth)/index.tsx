import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native'
import { useFonts, PlayfairDisplay_700Bold, PlayfairDisplay_400Regular_Italic } from '@expo-google-fonts/playfair-display'
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter'
import { supabase } from '../../src/lib/supabase'
import { colors, fonts, radii, spacing } from '../../src/theme'

export default function AuthScreen() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_400Regular_Italic,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  })

  async function handleSignIn() {
    if (!email.trim()) return
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim() })
    setLoading(false)
    if (error) {
      Alert.alert('Error', error.message)
    } else {
      setSent(true)
    }
  }

  const serif = fontsLoaded ? fonts.serif : undefined
  const sans = fontsLoaded ? fonts.sans : undefined
  const sansMedium = fontsLoaded ? fonts.sansMedium : undefined
  const sansSemiBold = fontsLoaded ? fonts.sansSemiBold : undefined
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        {/* Logo mark */}
        <View style={styles.logoMark}>
          <Text style={[styles.logoInitial, { fontFamily: serif }]}>VC</Text>
        </View>

        <Text style={[styles.title, { fontFamily: serif }]}>Virtual Closet</Text>
        <Text style={[styles.subtitle, { fontFamily: sans }]}>
          Your wardrobe, beautifully organised
        </Text>

        {sent ? (
          <View style={styles.sentBox}>
            <View style={styles.sentIcon}>
              <Text style={styles.sentEmoji}>✉️</Text>
            </View>
            <Text style={[styles.sentTitle, { fontFamily: serif }]}>Check your email</Text>
            <Text style={[styles.sentBody, { fontFamily: sans }]}>
              We sent a magic link to {email}. Tap it to sign in.
            </Text>
            <TouchableOpacity onPress={() => { setSent(false); setEmail('') }}>
              <Text style={[styles.retryLink, { fontFamily: sansMedium }]}>Use a different email</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={[styles.label, { fontFamily: sansMedium }]}>Email address</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, { fontFamily: sans }]}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoFocus
              />
            </View>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSignIn}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={[styles.buttonText, { fontFamily: sansSemiBold }]}>Send magic link</Text>}
            </TouchableOpacity>
          </View>
        )}

        <Text style={[styles.hint, { fontFamily: sans }]}>
          No password needed — just your email.
        </Text>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  logoMark: {
    width: 72,
    height: 72,
    borderRadius: radii.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoInitial: {
    fontSize: 26,
    color: '#fff',
    fontWeight: '700',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxxl,
    lineHeight: 20,
  },
  form: {
    width: '100%',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  inputWrapper: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  input: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    fontSize: 15,
    color: colors.textPrimary,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    marginTop: spacing.xs,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  sentBox: {
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sentIcon: {
    width: 64,
    height: 64,
    borderRadius: radii.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  sentEmoji: { fontSize: 28 },
  sentTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  sentBody: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryLink: {
    fontSize: 13,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
})
