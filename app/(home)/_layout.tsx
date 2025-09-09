import { IconSymbol } from '@/components/ui/IconSymbol'
import { Colors } from '@/constants/Colors'
import { useTheme } from '@/hooks/useTheme'
import { BlurView } from 'expo-blur'
import { Tabs } from 'expo-router'
import { Platform, StyleSheet } from 'react-native'

function TabBarBackground() {
  return (
    <BlurView
      intensity={100}
      tint="systemChromeMaterial"
      style={StyleSheet.absoluteFill}
    />
  )
}

export default function Layout() {
  const { colorScheme } = useTheme()
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            height: 80,
            paddingBottom: 20,
            paddingTop: 2,
          },
          default: {
            backgroundColor: Colors[colorScheme ?? 'light'].background + 'CC',
            borderTopWidth: 0,
            elevation: 0,
            height: 80,
            paddingBottom: 20,
            paddingTop: 2,
          },
        }),
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 1,
        },
        tabBarIconStyle: {
          marginTop: 1,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 8,
        },
        tabBarBackground: Platform.OS === 'ios' ? TabBarBackground : undefined,
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol name={focused ? 'house.fill' : 'house'} color={color} size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol name={focused ? 'gear' : 'gear'} color={color} size={28} />
          ),
        }}
      />
    </Tabs>
  )
}
