import { IconSymbol, ThemedText, Touchable } from '@/components';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Audio } from 'expo-av';
import { router } from 'expo-router';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Alert, DeviceEventEmitter, Platform, SafeAreaView, StatusBar, TextInput, View } from 'react-native';

// Conditionally import Voice to handle Expo Go limitations
let Voice: any = null;
try {
  Voice = require('@react-native-voice/voice').default;
} catch (e) {
  console.warn('Voice recognition not available in Expo Go. Use a development build for full functionality.');
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type Note = {id: string, title: string, text: string, audioUri: string | null, createdAt: string, tags: string[]};

// Initialize global storage if it doesn't exist
if (!(globalThis as any).__notesStorage) {
  (globalThis as any).__notesStorage = [];
  console.log('Initialized global notes storage');
}

const addNoteToStorage = (note: Note) => {
  const currentNotes = (globalThis as any).__notesStorage || [];
  (globalThis as any).__notesStorage = [note, ...currentNotes];
  console.log('Note added to global storage. Total notes:', (globalThis as any).__notesStorage.length);
  console.log('Current storage contents:', (globalThis as any).__notesStorage);
};

export default function NewNoteScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);
  const [voiceAvailable, setVoiceAvailable] = useState(Platform.OS === 'web' || !!Voice);
  const [isSaving, setIsSaving] = useState(false);

    const saveNote = useCallback(async () => {
    console.log('Save button pressed');
    console.log('Current text:', text);
    console.log('AudioUri:', audioUri);
    
    if (!title.trim() && !text.trim() && !audioUri) {
      Alert.alert('Empty Note', 'Please add a title, text, or audio before saving.');
      return;
    }

    setIsSaving(true);
    try {
      console.log('Starting to save note...');
      
      // Create new note
      const newNote: Note = {
        id: Date.now().toString(),
        title: title.trim() || 'Untitled Note',
        text: text.trim(),
        audioUri,
        tags: tags.filter(tag => tag.trim() !== ''),
        createdAt: new Date().toISOString()
      };
      console.log('New note created:', newNote);

      // Add to global storage
      addNoteToStorage(newNote);
      console.log('Note saved to memory successfully!');

      Alert.alert(
        'Note Saved!', 
        'Your note has been saved successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.log('Error saving note:', error);
      Alert.alert('Error', 'Failed to save note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [title, text, audioUri, tags]);

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  useEffect(() => {
    console.log('NewNoteScreen useEffect running...');
    
    Audio.requestPermissionsAsync();
    console.log('Voice recognition available:', voiceAvailable);
    
    // Listen for save button press from header
    console.log('Setting up saveNote event listener...');
    const saveEventListener = DeviceEventEmitter.addListener('saveNote', () => {
      console.log('Save event received!');
      saveNote();
    });
    
    if (Platform.OS !== 'web' && Voice) {
      Voice.onSpeechStart = () => setIsListening(true);
      Voice.onSpeechEnd = () => setIsListening(false);
      Voice.onSpeechResults = (e: any) => {
        if (e.value && Array.isArray(e.value) && e.value.length > 0 && e.value[0]) {
          setText(prev => prev + ' ' + e.value[0]);
        }
      };
      Voice.onSpeechError = (e: any) => console.log(e);
    }
    
    return () => {
      console.log('Cleaning up event listeners...');
      // Remove event listener
      saveEventListener.remove();
      
      if (Platform.OS !== 'web' && Voice) {
        Voice.destroy().then(Voice.removeAllListeners);
      }
    };
  }, [voiceAvailable, saveNote]);

  const startRecording = async () => {
    try {
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (recording) {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setAudioUri(uri);
    }
  };

  const startListening = async () => {
    if (Platform.OS === 'web') {
      const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      rec.lang = 'en-US';
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setText(prev => prev + ' ' + transcript);
      };
      rec.start();
      setRecognition(rec);
    } else if (Voice) {
      try {
        await Voice.start('en-US');
      } catch (e) {
        console.error('Voice recognition failed:', e);
        alert('Voice recognition is not available. Please use a development build or type your note manually.');
      }
    } else {
      alert('Voice recognition requires a development build. Please type your note manually.');
    }
  };

  const stopListening = async () => {
    if (Platform.OS === 'web') {
      if (recognition) {
        recognition.stop();
        setRecognition(null);
      }
    } else if (Voice) {
      try {
        await Voice.stop();
      } catch (e) {
        console.error('Failed to stop voice recognition:', e);
      }
    }
  };

  const playAudio = async (uri: string) => {
    const { sound } = await Audio.Sound.createAsync({ uri });
    await sound.playAsync();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* ScrollView for better layout with multiple inputs */}
      <View style={{ flex: 1 }}>
        <View style={{ padding: 20 }}>
          {/* Title Input */}
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Title (optional)"
            placeholderTextColor={Colors[colorScheme].icon}
            style={{
              fontSize: 20,
              fontWeight: '600',
              color: Colors[colorScheme].text,
              backgroundColor: 'transparent',
              padding: 0,
              marginBottom: 16,
              borderWidth: 0,
            }}
            returnKeyType="next"
            onSubmitEditing={() => {}} // Focus next input
          />

          {/* Tags Section */}
          <View style={{ marginBottom: 16 }}>
            {/* Existing Tags */}
            {tags.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
                {tags.map((tag, index) => (
                  <View key={index} style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: Colors[colorScheme].tint,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 12,
                    marginRight: 6,
                    marginBottom: 6
                  }}>
                    <ThemedText style={{ color: 'white', fontSize: 12 }}>
                      #{tag}
                    </ThemedText>
                    <Touchable onPress={() => removeTag(tag)} style={{ marginLeft: 4 }}>
                      <IconSymbol name="xmark" size={12} color="white" />
                    </Touchable>
                  </View>
                ))}
              </View>
            )}

            {/* Add Tag Input */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                value={tagInput}
                onChangeText={setTagInput}
                placeholder="Add tags..."
                placeholderTextColor={Colors[colorScheme].icon}
                style={{
                  flex: 1,
                  fontSize: 14,
                  color: Colors[colorScheme].text,
                  backgroundColor: 'transparent',
                  padding: 0,
                  borderWidth: 0,
                  marginRight: 8
                }}
                onSubmitEditing={addTag}
                returnKeyType="done"
              />
              {tagInput.trim() && (
                <Touchable onPress={addTag}>
                  <IconSymbol name="plus" size={16} color={Colors[colorScheme].tint} />
                </Touchable>
              )}
            </View>
          </View>

          {/* Divider */}
          <View style={{
            height: 1,
            backgroundColor: Colors[colorScheme].icon + '20',
            marginBottom: 16
          }} />
        </View>

        {/* Main Text Input Area */}
        <View style={{ flex: 1, paddingHorizontal: 20 }}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Start writing your note..."
            placeholderTextColor={Colors[colorScheme].icon}
            style={{
              flex: 1,
              fontSize: 16,
              color: Colors[colorScheme].text,
              backgroundColor: 'transparent',
              textAlignVertical: 'top',
              padding: 0,
              margin: 0,
              borderWidth: 0,
              fontFamily: 'System',
              lineHeight: 24,
            }}
            multiline
            scrollEnabled={true}
          />

          {/* Character Count at Bottom */}
          <View style={{
            position: 'absolute',
            bottom: 100,
            left: 20,
            right: 20,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 8,
            paddingHorizontal: 12,
            backgroundColor: Colors[colorScheme].background + 'CC',
            borderRadius: 8,
            opacity: text.length > 0 ? 1 : 0,
          }}>
            <ThemedText style={{
              fontSize: 14,
              color: Colors[colorScheme].icon,
              fontStyle: 'italic'
            }}>
              {text.length} characters
            </ThemedText>
            {text.trim() && (
              <Touchable onPress={() => setText('')}>
                <ThemedText style={{
                  fontSize: 14,
                  color: Colors[colorScheme].tint,
                  fontWeight: '500'
                }}>
                  Clear
                </ThemedText>
              </Touchable>
            )}
          </View>
        </View>
      </View>

      {/* Audio Section - Only show when audio exists */}
      {audioUri && (
        <View style={{
          position: 'absolute',
          top: 100,
          left: 20,
          right: 20,
          backgroundColor: Colors[colorScheme].background,
          borderRadius: 12,
          padding: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
          borderWidth: 1,
          borderColor: Colors[colorScheme].tint + '40'
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: Colors[colorScheme].tint + '20',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }}>
                <IconSymbol name="waveform" size={20} color={Colors[colorScheme].tint} />
              </View>
              <View>
                <ThemedText style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: Colors[colorScheme].text
                }}>
                  Audio Recording
                </ThemedText>
                <ThemedText style={{
                  fontSize: 12,
                  color: Colors[colorScheme].icon
                }}>
                  Tap to play
                </ThemedText>
              </View>
            </View>
            <Touchable
              onPress={() => playAudio(audioUri)}
              style={{
                padding: 12,
                borderRadius: 8,
                backgroundColor: Colors[colorScheme].tint
              }}
            >
              <IconSymbol name="play.fill" size={16} color="white" />
            </Touchable>
          </View>
        </View>
      )}

      {/* Floating Action Buttons - Bottom Right */}
      <View style={{
        position: 'absolute',
        bottom: 30,
        right: 20,
        flexDirection: 'column',
        gap: 12,
      }}>
        {/* Test Save Button - Temporary for debugging */}
        <Touchable
          onPress={() => {
            console.log('Direct save button pressed!');
            saveNote();
          }}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: '#10B981', // Green color
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <IconSymbol
            name="checkmark"
            size={24}
            color="white"
          />
        </Touchable>

        {/* Voice Input Button */}
        <Touchable
          onPress={isListening ? stopListening : startListening}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: isListening ? '#ef4444' : Colors[colorScheme].tint,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <IconSymbol
            name={isListening ? "stop.fill" : "mic.fill"}
            size={24}
            color="white"
          />
        </Touchable>

        {/* Audio Recording Button */}
        <Touchable
          onPress={isRecording ? stopRecording : startRecording}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: isRecording ? '#ef4444' : Colors[colorScheme].tint,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <IconSymbol
            name={isRecording ? "stop.fill" : "waveform"}
            size={24}
            color="white"
          />
        </Touchable>
      </View>

      {/* Info Panel - Only show when voice isn't available */}
      {!voiceAvailable && (
        <View style={{
          position: 'absolute',
          bottom: 30,
          left: 20,
          right: 100,
          padding: 12,
          borderRadius: 8,
          backgroundColor: Colors[colorScheme].background,
          borderWidth: 1,
          borderColor: Colors[colorScheme].icon + '30',
          flexDirection: 'row',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 4,
        }}>
          <IconSymbol name="info.circle" size={16} color={Colors[colorScheme].icon} />
          <ThemedText style={{
            fontSize: 12,
            color: Colors[colorScheme].icon,
            marginLeft: 8,
            flex: 1
          }}>
            Voice features require a development build.
          </ThemedText>
        </View>
      )}
    </SafeAreaView>
  );
}