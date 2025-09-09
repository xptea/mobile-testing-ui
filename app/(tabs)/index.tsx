import { Card, CardContent, CardHeader, CardTitle, Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, IconSymbol, ThemedText, Touchable } from '@/components';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Audio } from 'expo-av';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Platform, ScrollView, TextInput, View } from 'react-native';

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

type Note = {id: string, text: string, audioUri: string | null};

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const [notes, setNotes] = useState<Note[]>([]);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [text, setText] = useState('');
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);
  const [voiceAvailable, setVoiceAvailable] = useState(Platform.OS === 'web' || !!Voice);

  useEffect(() => {
    Audio.requestPermissionsAsync();
    console.log('Voice recognition available:', voiceAvailable);
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
      if (Platform.OS !== 'web' && Voice) {
        Voice.destroy().then(Voice.removeAllListeners);
      }
    };
  }, [voiceAvailable]);

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

  const addNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      text: text,
      audioUri: audioUri
    };
    setNotes(prev => [newNote, ...prev]);
    setText('');
    setAudioUri(null);
  };

  const playAudio = async (uri: string) => {
    const { sound } = await Audio.Sound.createAsync({ uri });
    await sound.playAsync();
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <ThemedText style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: Colors[colorScheme].text }}>Voice Notes</ThemedText>
        {notes.map(note => (
          <Card key={note.id} style={{ marginBottom: 10 }}>
            <CardHeader>
              <CardTitle>Note</CardTitle>
            </CardHeader>
            <CardContent>
              <ThemedText>{note.text}</ThemedText>
              {note.audioUri && (
                <Touchable onPress={() => playAudio(note.audioUri!)}>
                  <IconSymbol name="play.fill" size={24} color={Colors[colorScheme].tint} />
                </Touchable>
              )}
            </CardContent>
          </Card>
        ))}
      </ScrollView>
      <Dialog>
        <DialogTrigger asChild>
          <Touchable style={{ position: 'absolute', bottom: 20, right: 20, backgroundColor: Colors[colorScheme].tint, padding: 15, borderRadius: 50 }}>
            <IconSymbol name="plus" size={24} color="white" />
          </Touchable>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Note</DialogTitle>
          </DialogHeader>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type your note..."
            style={{ borderWidth: 1, borderColor: Colors[colorScheme].icon, padding: 10, marginVertical: 10, color: Colors[colorScheme].text }}
            multiline
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Touchable onPress={isListening ? stopListening : startListening}>
              <ThemedText>
                {isListening ? 'Stop Listening' : 
                 voiceAvailable ? 'Start Voice Input' : 
                 'Voice Input (Dev Build Only)'}
              </ThemedText>
            </Touchable>
            <Touchable onPress={isRecording ? stopRecording : startRecording}>
              <ThemedText>{isRecording ? 'Stop Recording' : 'Record Audio'}</ThemedText>
            </Touchable>
          </View>
          {!voiceAvailable && (
            <ThemedText style={{ fontSize: 12, color: Colors[colorScheme].icon, marginTop: 8, textAlign: 'center' }}>
              Voice recognition requires a development build. Use "expo run:android" or "expo run:ios" for full functionality.
            </ThemedText>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Touchable onPress={addNote} style={{ backgroundColor: Colors[colorScheme].tint, padding: 10, borderRadius: 5 }}>
                <ThemedText style={{ color: 'white', textAlign: 'center' }}>Add Note</ThemedText>
              </Touchable>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </View>
  );
}


