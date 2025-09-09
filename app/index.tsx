import { useAuth } from '@clerk/clerk-expo'
import { Redirect } from 'expo-router'
import { useEffect, useState } from 'react'

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth()
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    if (isLoaded) {
      setAuthChecked(true)
    }
  }, [isLoaded])

  // Re-check when auth state changes
  useEffect(() => {
    if (isLoaded) {
      setAuthChecked(true)
    }
  }, [isSignedIn, isLoaded])

  // Wait for Clerk to load before making routing decisions
  if (!authChecked) {
    return null
  }

  if (isSignedIn) {
    return <Redirect href="/(home)" />
  } else {
    return <Redirect href="/(auth)" />
  }
}
