import { IconSymbol, ThemedText, Touchable } from '@/components';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Audio } from 'expo-av';
import { router, useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Alert, DeviceEventEmitter, Platform, SafeAreaView, ScrollView, StatusBar, TextInput, View } from 'react-native';

// Conditionally import Voice to handle Expo Go limitations
let Voice: any = null;
try {
  Voice = require('@react-native-voice/voice').default;
} catch (e) {
  console.warn('Voice recognition not available in Expo Go. Use a development build for full functionality.');
}

type Note = {id: string, title: string, text: string, audioUri: string | null, createdAt: string, tags: string[]};

// Function to get note by ID from global storage
const getNoteById = (id: string): Note | null => {
  const storage = (globalThis as any).__notesStorage || [];
  return storage.find((note: Note) => note.id === id) || null;
};

// Function to update note in global storage
const updateNoteInStorage = (updatedNote: Note) => {
  const storage = (globalThis as any).__notesStorage || [];
  const index = storage.findIndex((note: Note) => note.id === updatedNote.id);
  if (index !== -1) {
    storage[index] = updatedNote;
    (globalThis as any).__notesStorage = storage;
    console.log('Note updated in global storage');
  }
};

// Function to delete note from global storage
const deleteNoteFromStorage = (noteId: string) => {
  const storage = (globalThis as any).__notesStorage || [];
  const filteredStorage = storage.filter((note: Note) => note.id !== noteId);
  (globalThis as any).__notesStorage = filteredStorage;
  console.log('Note deleted from global storage. Remaining notes:', filteredStorage.length);
};

export default function EditNoteScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const { id } = useLocalSearchParams<{ id: string }>();
  
  // State
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [voiceAvailable, setVoiceAvailable] = useState(Platform.OS === 'web' || !!Voice);
  const [isSaving, setIsSaving] = useState(false);

  // Load note data
  useEffect(() => {
    if (id) {
      const existingNote = getNoteById(id);
      if (existingNote) {
        setNote(existingNote);
        setTitle(existingNote.title);
        setText(existingNote.text);
        setTags(existingNote.tags);
        setAudioUri(existingNote.audioUri);
      } else {
        Alert.alert('Error', 'Note not found', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    }
  }, [id]);

  const saveNote = useCallback(async () => {
    if (!note) return;
    
    if (!title.trim() && !text.trim() && !audioUri) {
      Alert.alert('Empty Note', 'Please add a title, text, or audio before saving.');
      return;
    }

    setIsSaving(true);
    try {
      const updatedNote: Note = {
        ...note,
        title: title.trim() || 'Untitled Note',
        text: text.trim(),
        audioUri,
        tags: tags.filter(tag => tag.trim() !== ''),
      };

      updateNoteInStorage(updatedNote);
      
      Alert.alert(
        'Note Updated!', 
        'Your changes have been saved.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.log('Error updating note:', error);
      Alert.alert('Error', 'Failed to update note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [note, title, text, audioUri, tags]);

  const deleteNote = () => {
    if (!note) return;
    
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteNoteFromStorage(note.id);
            router.back();
          }
        }
      ]
    );
  };

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

  const playAudio = async (uri: string) => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.playAsync();
    } catch (error) {
      console.log('Error playing audio:', error);
    }
  };

  // Setup voice and event listeners
  useEffect(() => {
    Audio.requestPermissionsAsync();
    
    // Listen for save button press from header
    const saveEventListener = DeviceEventEmitter.addListener('saveNote', saveNote);
    
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
      saveEventListener.remove();
      if (Platform.OS !== 'web' && Voice) {
        Voice.destroy().then(Voice.removeAllListeners);
      }
    };
  }, [saveNote]);

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
      }
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

  if (!note) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ThemedText>Loading...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {/* Title Input */}
        <View style={{ marginBottom: 20 }}>
          <ThemedText style={{
            fontSize: 16,
            fontWeight: '600',
            marginBottom: 8,
            color: Colors[colorScheme].text
          }}>
            Title
          </ThemedText>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Enter note title..."
            placeholderTextColor={Colors[colorScheme].icon}
            style={{
              borderWidth: 1,
              borderColor: Colors[colorScheme].icon + '30',
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
              color: Colors[colorScheme].text,
              backgroundColor: Colors[colorScheme].background,
            }}
          />
        </View>

        {/* Tags Section */}
        <View style={{ marginBottom: 20 }}>
          <ThemedText style={{
            fontSize: 16,
            fontWeight: '600',
            marginBottom: 8,
            color: Colors[colorScheme].text
          }}>
            Tags
          </ThemedText>
          
          {/* Existing Tags */}
          {tags.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
              {tags.map((tag, index) => (
                <View key={index} style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: Colors[colorScheme].tint,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  marginRight: 8,
                  marginBottom: 8
                }}>
                  <ThemedText style={{ color: 'white', fontSize: 14, marginRight: 6 }}>
                    #{tag}
                  </ThemedText>
                  <Touchable onPress={() => removeTag(tag)}>
                    <IconSymbol name="xmark" size={14} color="white" />
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
              placeholder="Add tag..."
              placeholderTextColor={Colors[colorScheme].icon}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: Colors[colorScheme].icon + '30',
                borderRadius: 8,
                padding: 12,
                fontSize: 14,
                color: Colors[colorScheme].text,
                backgroundColor: Colors[colorScheme].background,
                marginRight: 8
              }}
              onSubmitEditing={addTag}
              returnKeyType="done"
            />
            <Touchable
              onPress={addTag}
              style={{
                backgroundColor: Colors[colorScheme].tint,
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 8
              }}
            >
              <ThemedText style={{ color: 'white', fontWeight: '600' }}>Add</ThemedText>
            </Touchable>
          </View>
        </View>

        {/* Content Input */}
        <View style={{ flex: 1, marginBottom: 20 }}>
          <ThemedText style={{
            fontSize: 16,
            fontWeight: '600',
            marginBottom: 8,
            color: Colors[colorScheme].text
          }}>
            Content
          </ThemedText>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Start writing your note..."
            placeholderTextColor={Colors[colorScheme].icon}
            style={{
              borderWidth: 1,
              borderColor: Colors[colorScheme].icon + '30',
              borderRadius: 8,
              padding: 16,
              fontSize: 16,
              color: Colors[colorScheme].text,
              backgroundColor: Colors[colorScheme].background,
              minHeight: 200,
              textAlignVertical: 'top'
            }}
            multiline
            numberOfLines={10}
          />
        </View>

        {/* Audio Section */}
        {audioUri && (
          <View style={{
            marginBottom: 20,
            padding: 16,
            borderRadius: 12,
            backgroundColor: Colors[colorScheme].tint + '20',
            borderWidth: 1,
            borderColor: Colors[colorScheme].tint + '40'
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <IconSymbol name="waveform" size={20} color={Colors[colorScheme].tint} />
                <ThemedText style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: Colors[colorScheme].text,
                  marginLeft: 8
                }}>
                  Audio Recording
                </ThemedText>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Touchable
                  onPress={() => playAudio(audioUri)}
                  style={{
                    padding: 8,
                    borderRadius: 6,
                    backgroundColor: Colors[colorScheme].tint
                  }}
                >
                  <IconSymbol name="play.fill" size={16} color="white" />
                </Touchable>
                <Touchable
                  onPress={() => setAudioUri(null)}
                  style={{
                    padding: 8,
                    borderRadius: 6,
                    backgroundColor: '#ef4444'
                  }}
                >
                  <IconSymbol name="trash" size={16} color="white" />
                </Touchable>
              </View>
            </View>
          </View>
        )}

        {/* Delete Button */}
        <Touchable
          onPress={deleteNote}
          style={{
            backgroundColor: '#ef4444',
            padding: 16,
            borderRadius: 8,
            alignItems: 'center',
            marginBottom: 20
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <IconSymbol name="trash" size={18} color="white" />
            <ThemedText style={{
              color: 'white',
              fontSize: 16,
              fontWeight: '600',
              marginLeft: 8
            }}>
              Delete Note
            </ThemedText>
          </View>
        </Touchable>
      </ScrollView>

      {/* Floating Action Buttons */}
      <View style={{
        position: 'absolute',
        bottom: 30,
        right: 20,
        flexDirection: 'column',
        gap: 12,
      }}>
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
    </SafeAreaView>
  );
}