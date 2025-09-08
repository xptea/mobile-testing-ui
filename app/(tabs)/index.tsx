import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';

import {
  ActionCard,
  AnimatedCheckbox,
  AnimatedChip,
  AnimatedMaskedText,
  AnimatedSwitch,
  BreadcrumbsList,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Collapsible,
  ExpandableButton,
  ExternalLink,
  HelloWave,
  HorizontalDivider,
  IconSymbol,
  ListItem,
  SeekBar,
  ThemedText,
  Title,
  Touchable
} from '@/components';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const [notifications, setNotifications] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const [seekValue, setSeekValue] = useState(0.7);
  const [chipActive, setChipActive] = useState(false);

  // Theme-aware colors
  const backgroundColor = Colors[colorScheme].background;
  const cardBackgroundColor = Colors[colorScheme].background;
  const textColor = Colors[colorScheme].text;
  const secondaryTextColor = Colors[colorScheme].icon;
  const borderColor = colorScheme === 'dark' ? '#333333' : '#e0e0e0';
  const shadowColor = colorScheme === 'dark' ? '#000000' : '#000000';

  const handleHapticFeedback = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <ScrollView 
      style={styles(colorScheme).container}
      contentContainerStyle={styles(colorScheme).contentContainer}
    >
      {/* Hero Section */}
      <View style={[styles(colorScheme).heroSection, { backgroundColor: Colors[colorScheme].background }]}>
        <AnimatedMaskedText
          style={[styles(colorScheme).heroTitle, { color: textColor }]}
          speed={0.8}
          colors={['transparent', colorScheme === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)', 'transparent']}
          baseTextColor={textColor}
        >
          VWisper
        </AnimatedMaskedText>
        <ThemedText style={[styles(colorScheme).heroSubtitle, { color: secondaryTextColor }]}>
          Discover the power of modern React Native components
        </ThemedText>
        <HelloWave />
      </View>

      {/* Quick Actions */}
      <View style={styles(colorScheme).section}>
        <Title style={[styles(colorScheme).sectionTitle, { color: textColor }]}>Quick Actions</Title>
        <View style={styles(colorScheme).quickActionsGrid}>
          <ActionCard style={[styles(colorScheme).quickActionCard, { backgroundColor: cardBackgroundColor, borderColor, shadowColor }]}>
            <Touchable onPress={handleHapticFeedback}>
              <View style={styles(colorScheme).quickActionContent}>
                <IconSymbol name="bell.fill" size={32} color={Colors[colorScheme].tint} />
                <ThemedText style={[styles(colorScheme).quickActionText, { color: textColor }]}>Noti</ThemedText>
                <AnimatedSwitch
                  value={notifications}
                  onValueChange={setNotifications}
                />
              </View>
            </Touchable>
          </ActionCard>

          <ActionCard style={[styles(colorScheme).quickActionCard, { backgroundColor: cardBackgroundColor, borderColor, shadowColor }]}>
            <Touchable onPress={handleHapticFeedback}>
              <View style={styles(colorScheme).quickActionContent}>
                <IconSymbol name="hand.tap.fill" size={32} color="#10b981" />
                <ThemedText style={[styles(colorScheme).quickActionText, { color: textColor }]}>Haptics</ThemedText>
                <AnimatedSwitch
                  value={haptics}
                  onValueChange={setHaptics}
                />
              </View>
            </Touchable>
          </ActionCard>
        </View>
      </View>

      {/* Feature Showcase */}
      <View style={styles(colorScheme).section}>
        <Title style={[styles(colorScheme).sectionTitle, { color: textColor }]}>Component Showcase</Title>

        {/* Interactive Cards */}
        <View style={styles(colorScheme).cardsGrid}>
          <Card variant="elevated" interactive pressable onPress={handleHapticFeedback}>
            <CardHeader>
              <CardTitle>Interactive Card</CardTitle>
              <CardDescription>Tap me for haptic feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <ThemedText>This card responds to your touch with beautiful animations.</ThemedText>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader>
              <CardTitle>SeekBar Control</CardTitle>
              <CardDescription>Volume: {Math.round(seekValue * 100)}%</CardDescription>
            </CardHeader>
            <CardContent>
              <View style={{ marginTop: 8 }}>
                <SeekBar
                  value={seekValue}
                  onValueChange={setSeekValue}
                />
              </View>
            </CardContent>
          </Card>
        </View>

        {/* Component Demo Row */}
        <View style={styles(colorScheme).demoRow}>
          <View style={styles(colorScheme).demoItem}>
            <ThemedText style={styles(colorScheme).demoLabel}>Animated Chip</ThemedText>
            <AnimatedChip
              label="Tap Me!"
              icon="house.fill"
              isActive={chipActive}
              onPress={() => {
                setChipActive(!chipActive);
                handleHapticFeedback();
              }}
            />
          </View>

          <View style={styles(colorScheme).demoItem}>
            <ThemedText style={styles(colorScheme).demoLabel}>Checkbox</ThemedText>
            <AnimatedCheckbox
              checked={notifications}
              onPress={() => {
                setNotifications(!notifications);
                handleHapticFeedback();
              }}
            />
          </View>
        </View>

        {/* Expandable Content */}
        <Collapsible title="Advanced Features">
          <View style={styles(colorScheme).collapsibleContent}>
            <ThemedText style={styles(colorScheme).collapsibleText}>
              Explore our comprehensive component library with smooth animations,
              haptic feedback, and modern design patterns.
            </ThemedText>

            <View style={styles(colorScheme).featureList}>
              <ListItem
                title="Smooth Animations"
                subtitle="Reanimated-powered transitions"
              />
              <ListItem
                title="Haptic Feedback"
                subtitle="Tactile responses for better UX"
              />
              <ListItem
                title="Theme Support"
                subtitle="Light and dark mode ready"
              />
            </View>

            <HorizontalDivider />

            <View style={styles(colorScheme).buttonRow}>
              <ExpandableButton
                title="Get Started"
                isLoading={false}
                onPress={handleHapticFeedback}
              />
              <ExternalLink href="https://expo.dev">
                Learn More
              </ExternalLink>
            </View>
          </View>
        </Collapsible>
      </View>

      {/* Footer */}
      <View style={styles(colorScheme).footer}>
        <BreadcrumbsList>
          <ThemedText>Home</ThemedText>
          <ThemedText>Welcome</ThemedText>
        </BreadcrumbsList>
        <ThemedText style={styles(colorScheme).footerText}>
          Built with ❤️ using React Native & Expo
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = (colorScheme: 'light' | 'dark') => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors[colorScheme].background,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
    backgroundColor: Colors[colorScheme].background,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: Colors[colorScheme].text,
  },
  heroSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: Colors[colorScheme].icon,
    marginBottom: 20,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors[colorScheme].text,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: Colors[colorScheme].background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colorScheme === 'dark' ? '#333333' : '#e0e0e0',
    shadowColor: colorScheme === 'dark' ? '#000000' : '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionContent: {
    alignItems: 'center',
    padding: 20,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 12,
    color: Colors[colorScheme].text,
  },
  cardsGrid: {
    gap: 16,
    marginBottom: 24,
  },
  demoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Colors[colorScheme].background,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: colorScheme === 'dark' ? '#000000' : '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  demoItem: {
    alignItems: 'center',
    gap: 8,
  },
  demoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors[colorScheme].icon,
  },
  collapsibleContent: {
    gap: 16,
  },
  collapsibleText: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors[colorScheme].text,
  },
  featureList: {
    gap: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: Colors[colorScheme].background,
  },
  footerText: {
    fontSize: 14,
    color: Colors[colorScheme].icon,
    marginTop: 16,
    textAlign: 'center',
  },
});
