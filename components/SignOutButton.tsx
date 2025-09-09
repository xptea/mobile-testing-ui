import { useTheme } from '@/hooks/useTheme'
import { useClerk } from '@clerk/clerk-expo'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import { TouchableOpacity } from 'react-native'
import { ThemedText } from './ThemedText'

export const SignOutButton = () => {
  // Use `useClerk()` to access the `signOut()` function
  const { signOut } = useClerk()
  const { colorScheme } = useTheme()
  const router = useRouter()
  const currentColorScheme = colorScheme ?? 'light'
  
  const handleSignOut = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      await signOut()
      // Navigate to auth page after sign out
      router.replace('/(auth)')
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error('Sign out error:', JSON.stringify(err, null, 2))
    }
  }
  
  return (
    <TouchableOpacity onPress={handleSignOut} activeOpacity={0.7}>
      <ThemedText style={{
        fontSize: 16,
        fontWeight: '400',
        color: '#FF3B30' // Red color to indicate destructive action
      }}>
        Sign Out
      </ThemedText>
    </TouchableOpacity>
  )
}