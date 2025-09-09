import { Touchable } from '@/components'
import { ThemedText } from '@/components/ThemedText'
import { Colors } from '@/constants/Colors'
import { api } from '@/convex/_generated/api'
import { useColorScheme } from '@/hooks/useTheme'
import { useAuth, useOAuth, useUser } from '@clerk/clerk-expo'
import { useMutation } from 'convex/react'
import { useRouter } from 'expo-router'
import React, { useEffect } from 'react'
import { View } from 'react-native'

export default function AuthPage() {
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' })
  const { user } = useUser()
  const { isSignedIn } = useAuth()
  const router = useRouter()
  const colorScheme = useColorScheme() ?? 'light'
  const createOrUpdateUser = useMutation(api.mutations.createOrUpdateUser)

  // Save user data to Convex when user becomes available after authentication
  useEffect(() => {
    if (user && isSignedIn) {
      console.log('User data available:', {
        id: user.id,
        fullName: user.fullName,
        firstName: user.firstName,
        email: user.primaryEmailAddress?.emailAddress,
        imageUrl: user.imageUrl
      })
      saveUserToConvex()
    }
  }, [user, isSignedIn])

  // Redirect to home when authentication is successful
  useEffect(() => {
    if (isSignedIn && user) {
      // Add a small delay to ensure user data is saved first
      setTimeout(() => {
        router.replace('/(home)')
      }, 1000)
    }
  }, [isSignedIn, user])

  // Handle Google OAuth
  const onGooglePress = async () => {
    try {
      const { createdSessionId, setActive: setActiveOAuth } = await startOAuthFlow()
      if (createdSessionId && setActiveOAuth) {
        await setActiveOAuth({ session: createdSessionId })
        
        // Don't manually redirect - let the auth state change trigger the redirect
        // The user data will be saved in a useEffect when the user becomes available
      }
    } catch (err) {
      console.error('OAuth error:', JSON.stringify(err, null, 2))
    }
  }

  const saveUserToConvex = async () => {
    if (!user) {
      console.log('No user data available for saving')
      return
    }
    
    const userData = {
      clerkId: user.id,
      name: user.fullName || user.firstName || 'Unknown User',
      email: user.primaryEmailAddress?.emailAddress || '',
      profilePicture: user.imageUrl || undefined,
    }
    
    console.log('Attempting to save user data to Convex:', userData)
    
    try {
      const result = await createOrUpdateUser(userData)
      console.log('User data saved successfully to Convex:', result)
    } catch (error) {
      console.error('Error saving user to Convex:', error)
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 }}>
        <View style={{ alignItems: 'center' }}>
          <ThemedText style={{
            fontSize: 30,
            fontWeight: 'bold',
            color: Colors[colorScheme].text,
            marginBottom: 1,
            paddingTop: 24
          }}>
            Void Notes
          </ThemedText>
        </View>
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <ThemedText style={{
            fontSize: 16,
            color: Colors[colorScheme].icon,
            textAlign: 'center'
          }}>
            Sign in or create an account
          </ThemedText>
        </View>

        {/* Google Auth Button */}
        <Touchable
          onPress={onGooglePress}
          style={{
            backgroundColor: Colors[colorScheme].background,
            borderWidth: 1,
            borderColor: Colors[colorScheme].icon + '40',
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center'
          }}
        >
          <ThemedText style={{
            fontSize: 16,
            fontWeight: '600',
            marginLeft: 12,
            color: Colors[colorScheme].text
          }}>
            Continue with Google
          </ThemedText>
        </Touchable>
      </View>
      <View style={{ alignItems: 'center', paddingHorizontal: 24, paddingBottom: 20 }}>
        <ThemedText style={{
          fontSize: 14,
          color: Colors[colorScheme].icon,
          textAlign: 'center'
        }}>
          Version 1.0.0
        </ThemedText>
        <ThemedText style={{
          fontSize: 14,
          color: Colors[colorScheme].icon,
          textAlign: 'center'
        }}>
          2025 www.voidwork.xyz
        </ThemedText>
      </View>
    </View>
  )
}
