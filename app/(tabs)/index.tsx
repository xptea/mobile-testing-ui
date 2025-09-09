import { Card, CardContent, CardHeader, CardTitle, IconSymbol, SearchBar, ThemedText, Touchable } from '@/components';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useTheme';
import { Audio } from 'expo-av';
import { router, useFocusEffect } from 'expo-router';
import * as React from 'react';
import { useCallback, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, View } from 'react-native';

type Note = {id: string, title: string, text: string, audioUri: string | null, createdAt: string, tags: string[]};

// Function to get notes from global storage
const getNotesFromGlobalStorage = (): Note[] => {
  console.log('Checking global storage...');
  const storage = (globalThis as any).__notesStorage;
  console.log('Global storage raw:', storage);
  
  if (storage && Array.isArray(storage)) {
    console.log('Found notes in global storage:', storage.length);
    return storage;
  } else {
    console.log('No notes found in global storage or storage is invalid');
    return [];
  }
};

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);

  // Initialize global storage if it doesn't exist
  React.useEffect(() => {
    if (!(globalThis as any).__notesStorage) {
      (globalThis as any).__notesStorage = [];
      console.log('Initialized global notes storage in HomeScreen');
    }
  }, []);

  // Filter notes based on search query
  React.useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredNotes(notes);
    } else {
      const filtered = notes.filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredNotes(filtered);
    }
  }, [notes, searchQuery]);

  const loadNotes = async () => {
    console.log('Loading notes from memory...');
    try {
      const storedNotes = getNotesFromGlobalStorage();
      console.log('Retrieved notes:', storedNotes);
      console.log('Notes count:', storedNotes.length);
      setNotes(storedNotes);
    } catch (error) {
      console.log('Error loading notes:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [])
  );

  const goToNewNote = () => {
    router.push('/new-note');
  };

  const goToEditNote = (noteId: string) => {
    router.push({
      pathname: '/edit-note',
      params: { id: noteId }
    });
  };

  const playAudio = async (uri: string) => {
    const { sound } = await Audio.Sound.createAsync({ uri });
    await sound.playAsync();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Search Bar */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 8, paddingTop: 10 }}>
        <SearchBar
          placeholder="Search notes, titles, or tags..."
          onSearch={setSearchQuery}
          onClear={() => setSearchQuery('')}
          tint={Colors[colorScheme].tint}
        />
      </View>

      <ScrollView 
        contentContainerStyle={{ 
          paddingHorizontal: 20,
          paddingBottom: notes.length > 0 ? 100 : 160
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Header - only show when no search query */}
        {searchQuery.trim() === '' && (
          <View style={{ 
            alignItems: 'center', 
            marginBottom: 20, 
            marginTop: 15
          }}>
            <ThemedText style={{
              fontSize: 28,
              fontWeight: 'bold',
              marginBottom: 8,
              color: Colors[colorScheme].text,
              textAlign: 'center',
              letterSpacing: 0.5
            }}>
              Voice Notes
            </ThemedText>
            <ThemedText style={{
              fontSize: 16,
              color: Colors[colorScheme].icon,
              textAlign: 'center',
              marginBottom: 10,
              lineHeight: 22
            }}>
              Capture your thoughts with voice and text
            </ThemedText>
          </View>
        )}

        {/* Create New Note Button - at top when no notes */}
        {notes.length === 0 && searchQuery.trim() === '' && (
          <Touchable
            onPress={goToNewNote}
            style={{
              backgroundColor: Colors[colorScheme].tint,
              padding: 20,
              borderRadius: 12,
              marginBottom: 30,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3
            }}
          >
            <IconSymbol name="plus" size={28} color="white" />
            <ThemedText style={{
              color: 'white',
              fontSize: 18,
              fontWeight: 'bold',
              marginTop: 8
            }}>
              Create New Note
            </ThemedText>
          </Touchable>
        )}

        {/* Search Results Header */}
        {searchQuery.trim() !== '' && (
          <View style={{ marginBottom: 15 }}>
            <ThemedText style={{
              fontSize: 18,
              fontWeight: '600',
              color: Colors[colorScheme].text
            }}>
              {filteredNotes.length} result{filteredNotes.length !== 1 ? 's' : ''} for "{searchQuery}"
            </ThemedText>
          </View>
        )}

        {/* Notes Section */}
        {(searchQuery.trim() !== '' ? filteredNotes : notes).length > 0 && (
          <View>
            {searchQuery.trim() === '' && (
              <ThemedText style={{
                fontSize: 20,
                fontWeight: 'bold',
                marginBottom: 15,
                color: Colors[colorScheme].text
              }}>
                Your Notes ({notes.length})
              </ThemedText>
            )}

            {(searchQuery.trim() !== '' ? filteredNotes : notes).map(note => (
              <Touchable
                key={note.id}
                onPress={() => goToEditNote(note.id)}
                style={{ marginBottom: 12 }}
              >
                <Card>
                  <CardHeader>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View style={{ flex: 1 }}>
                        <CardTitle style={{ fontSize: 16, marginBottom: 4 }}>
                          {note.title || 'Untitled Note'}
                        </CardTitle>
                        {note.tags.length > 0 && (
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
                            {note.tags.map((tag, index) => (
                              <View key={index} style={{
                                backgroundColor: Colors[colorScheme].tint + '20',
                                paddingHorizontal: 8,
                                paddingVertical: 2,
                                borderRadius: 12,
                                marginRight: 6,
                                marginBottom: 4
                              }}>
                                <ThemedText style={{
                                  fontSize: 12,
                                  color: Colors[colorScheme].tint,
                                  fontWeight: '500'
                                }}>
                                  #{tag}
                                </ThemedText>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <ThemedText style={{ 
                          fontSize: 12, 
                          color: Colors[colorScheme].icon,
                          fontStyle: 'italic'
                        }}>
                          {new Date(note.createdAt).toLocaleDateString()}
                        </ThemedText>
                        {note.audioUri && (
                          <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: 4
                          }}>
                            <IconSymbol name="waveform" size={12} color={Colors[colorScheme].icon} />
                            <ThemedText style={{
                              fontSize: 10,
                              color: Colors[colorScheme].icon,
                              marginLeft: 4
                            }}>
                              Audio
                            </ThemedText>
                          </View>
                        )}
                      </View>
                    </View>
                  </CardHeader>
                  <CardContent>
                    <ThemedText style={{ marginBottom: 10, lineHeight: 20, color: Colors[colorScheme].text + 'DD' }}>
                      {note.text.length > 120 ? note.text.substring(0, 120) + '...' : note.text}
                    </ThemedText>
                    {note.audioUri && (
                      <Touchable
                        onPress={() => {
                          // Prevent card navigation - handled by not using event parameter
                          playAudio(note.audioUri!);
                        }}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: Colors[colorScheme].tint,
                          padding: 8,
                          borderRadius: 6,
                          alignSelf: 'flex-start'
                        }}
                      >
                        <IconSymbol name="play.fill" size={16} color="white" />
                        <ThemedText style={{ color: 'white', marginLeft: 5, fontSize: 12 }}>
                          Play Audio
                        </ThemedText>
                      </Touchable>
                    )}
                  </CardContent>
                </Card>
              </Touchable>
            ))}
          </View>
        )}

        {/* Empty State */}
        {notes.length === 0 && searchQuery.trim() === '' && (
          <View style={{ 
            alignItems: 'center', 
            justifyContent: 'center',
            marginTop: 40,
            paddingHorizontal: 20
          }}>
            <View style={{
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <IconSymbol name="doc.text" size={64} color={Colors[colorScheme].icon} />
              <ThemedText style={{
                fontSize: 18,
                color: Colors[colorScheme].icon,
                textAlign: 'center',
                marginTop: 20,
                marginBottom: 10,
                fontWeight: '500'
              }}>
                No notes yet
              </ThemedText>
              <ThemedText style={{
                fontSize: 14,
                color: Colors[colorScheme].icon,
                textAlign: 'center',
                lineHeight: 20
              }}>
                Tap "Create New Note" to get started
              </ThemedText>
            </View>
          </View>
        )}

        {/* No Search Results */}
        {searchQuery.trim() !== '' && filteredNotes.length === 0 && (
          <View style={{ 
            alignItems: 'center', 
            justifyContent: 'center',
            marginTop: 40,
            paddingHorizontal: 20
          }}>
            <View style={{
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <IconSymbol name="magnifyingglass" size={64} color={Colors[colorScheme].icon} />
              <ThemedText style={{
                fontSize: 18,
                color: Colors[colorScheme].icon,
                textAlign: 'center',
                marginTop: 20,
                marginBottom: 10,
                fontWeight: '500'
              }}>
                No results found
              </ThemedText>
              <ThemedText style={{
                fontSize: 14,
                color: Colors[colorScheme].icon,
                textAlign: 'center',
                lineHeight: 20
              }}>
                Try a different search term
              </ThemedText>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Floating Create New Note Button - when notes exist */}
      {notes.length > 0 && (
        <View style={{
          position: 'absolute',
          bottom: 30,
          right: 20,
        }}>
          <Touchable
            onPress={goToNewNote}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: Colors[colorScheme].tint,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <IconSymbol name="plus" size={24} color="white" />
          </Touchable>
        </View>
      )}
    </SafeAreaView>
  );
}