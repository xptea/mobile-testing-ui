import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { DeviceEventEmitter, Text, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import '../global.css';

import { ThemeProvider, useColorScheme } from '@/hooks/useTheme';

const SaveButton = () => {
  const colorScheme = useColorScheme() ?? 'light';
  
  const handleSave = () => {
    console.log('Save button pressed in header!');
    // Emit an event that the new-note screen can listen to
    DeviceEventEmitter.emit('saveNote');
    console.log('SaveNote event emitted!');
  };
  
  return (
    <TouchableOpacity
      onPress={handleSave}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        backgroundColor: '#007AFF', // iOS blue
      }}
    >
      <Text style={{
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
      }}>
        Save
      </Text>
    </TouchableOpacity>
  );
};

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <RootLayoutContent />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  
  return (
    <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="new-note"
          options={{
            title: 'New Note',
            headerBackTitle: 'Back',
            headerRight: () => (
              <SaveButton />
            ),
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </NavigationThemeProvider>
  );
}
