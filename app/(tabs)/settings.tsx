import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { IconSymbol, type IconSymbolName } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/useTheme';

export default function SettingsScreen() {
  const { colorScheme, themeMode, setThemeMode } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [haptics, setHaptics] = useState(true);

  const currentColorScheme = colorScheme ?? 'light';
  const backgroundColor = Colors[currentColorScheme].background;
  const sectionBackgroundColor = currentColorScheme === 'dark' ? '#1c1c1e' : '#ffffff';
  const separatorColor = currentColorScheme === 'dark' ? '#38383a' : '#d1d1d6';
  const textColor = Colors[currentColorScheme].text;
  const secondaryTextColor = Colors[currentColorScheme].icon;
  
  // Use black for light mode, blue for dark mode (for icons and checkboxes)
  const activeColor = currentColorScheme === 'light' ? '#000000' : Colors[currentColorScheme].tint;
  // Use green for switches in both modes
  const switchActiveColor = '#4CD964';
  const inactiveColor = '#757575';

  const SettingRow = ({
    title,
    subtitle,
    icon,
    trailingComponent,
    onPress,
    onRowPress,
    showChevron = false,
    hasSwitch = false
  }: {
    title: string;
    subtitle?: string;
    icon?: IconSymbolName;
    trailingComponent?: React.ReactNode;
    onPress?: () => void;
    onRowPress?: () => void;
    showChevron?: boolean;
    hasSwitch?: boolean;
  }) => (
    <View style={[styles.settingRow, { backgroundColor: sectionBackgroundColor }]}>
      <TouchableOpacity
        style={styles.mainContent}
        onPress={() => {
          if (onRowPress) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onRowPress();
          } else if (onPress) {
            onPress();
          }
        }}
        disabled={!onPress && !onRowPress}
        activeOpacity={0.7}
      >
        {icon && (
          <View style={styles.iconContainer}>
            <IconSymbol name={icon} size={20} color={activeColor} />
          </View>
        )}
        <View style={styles.textContainer}>
          <ThemedText style={[styles.titleText, { color: textColor }]}>{title}</ThemedText>
          {subtitle && (
            <ThemedText style={[styles.subtitleText, { color: secondaryTextColor }]}>
              {subtitle}
            </ThemedText>
          )}
        </View>
      </TouchableOpacity>
      <View style={styles.trailingContainer}>
        {trailingComponent}
        {showChevron && (
          <TouchableOpacity
            onPress={() => {
              if (onPress) {
                onPress();
              }
            }}
            activeOpacity={0.7}
          >
            <IconSymbol name="chevron.right" size={14} color={secondaryTextColor} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const Section = ({ title, children }: { title?: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      {title && (
        <ThemedText style={[styles.sectionTitle, { color: secondaryTextColor }]}>
          {title}
        </ThemedText>
      )}
      <View style={[styles.sectionContent, { backgroundColor: sectionBackgroundColor }]}>
        {children}
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-white" style={{ backgroundColor: currentColorScheme === 'dark' ? '#151718' : '#fff' }}>
      <ScrollView contentContainerStyle={styles.content}>
      <View className="pt-1 pb-1 items-center justify-center">
        <Text className="text-3xl font-bold text-gray-900 dark:text-white">Settings</Text>
      </View>

      <Section title="UPDATE">
        <SettingRow
          title="Version"
          subtitle="1.0.0"
          icon="info.circle.fill"
        />
        <View style={[styles.separator, { backgroundColor: separatorColor }]} />
        <SettingRow
          title="Auto Update"
          icon="arrow.triangle.2.circlepath"
          trailingComponent={
            <Switch
              value={autoUpdate}
              onValueChange={(value) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setAutoUpdate(value);
              }}
              trackColor={{ false: inactiveColor, true: switchActiveColor }}
              thumbColor={currentColorScheme === 'light' ? '#ffffff' : '#ffffff'}
            />
          }
          onRowPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setAutoUpdate(!autoUpdate);
          }}
          hasSwitch={true}
        />
      </Section>

      <Section title="NOTIFICATIONS">
        <SettingRow
          title="Notifications"
          icon="bell.fill"
          trailingComponent={
            <Switch
              value={notifications}
              onValueChange={(value) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setNotifications(value);
              }}
              trackColor={{ false: inactiveColor, true: switchActiveColor }}
              thumbColor={currentColorScheme === 'light' ? '#ffffff' : '#ffffff'}
            />
          }
          onRowPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setNotifications(!notifications);
          }}
          hasSwitch={true}
        />
      </Section>

      <Section title="APPEARANCE">
        <SettingRow
          title="Automatic"
          subtitle="Follow system theme"
          icon="circle.lefthalf.fill"
          trailingComponent={
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setThemeMode('auto');
              }}
              style={{
                width: 24,
                height: 24,
                borderRadius: 4,
                borderWidth: 2,
                borderColor: themeMode === 'auto' ? activeColor : inactiveColor,
                backgroundColor: themeMode === 'auto' ? activeColor : 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {themeMode === 'auto' && (
                <IconSymbol 
                  name="checkmark" 
                  size={14} 
                  color={currentColorScheme === 'light' ? '#ffffff' : '#000000'}
                />
              )}
            </TouchableOpacity>
          }
          onRowPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setThemeMode('auto');
          }}
        />
        <View style={[styles.separator, { backgroundColor: separatorColor }]} />
        <SettingRow
          title="Dark Mode"
          subtitle="Always use dark theme"
          icon="moon.fill"
          trailingComponent={
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setThemeMode('dark');
              }}
              style={{
                width: 24,
                height: 24,
                borderRadius: 4,
                borderWidth: 2,
                borderColor: themeMode === 'dark' ? activeColor : inactiveColor,
                backgroundColor: themeMode === 'dark' ? activeColor : 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {themeMode === 'dark' && (
                <IconSymbol 
                  name="checkmark" 
                  size={14} 
                  color={currentColorScheme === 'light' ? '#ffffff' : '#000000'}
                />
              )}
            </TouchableOpacity>
          }
          onRowPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setThemeMode('dark');
          }}
        />
        <View style={[styles.separator, { backgroundColor: separatorColor }]} />
        <SettingRow
          title="Light Mode"
          subtitle="Always use light theme"
          icon="sun.max.fill"
          trailingComponent={
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setThemeMode('light');
              }}
              style={{
                width: 24,
                height: 24,
                borderRadius: 4,
                borderWidth: 2,
                borderColor: themeMode === 'light' ? activeColor : inactiveColor,
                backgroundColor: themeMode === 'light' ? activeColor : 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {themeMode === 'light' && (
                <IconSymbol 
                  name="checkmark" 
                  size={14} 
                  color={currentColorScheme === 'light' ? '#ffffff' : '#000000'}
                />
              )}
            </TouchableOpacity>
          }
          onRowPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setThemeMode('light');
          }}
        />
        <View style={[styles.separator, { backgroundColor: separatorColor }]} />
        <SettingRow
          title="Haptics"
          icon="hand.tap.fill"
          trailingComponent={
            <Switch
              value={haptics}
              onValueChange={(value) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setHaptics(value);
              }}
              trackColor={{ false: inactiveColor, true: switchActiveColor }}
              thumbColor={currentColorScheme === 'light' ? '#ffffff' : '#ffffff'}
            />
          }
          onRowPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setHaptics(!haptics);
          }}
          hasSwitch={true}
        />
      </Section>

      <View style={{ alignItems: 'center', paddingVertical: 20 }}>
        <ThemedText style={{ textAlign: 'center', color: textColor }}>
          Made with ❤️ by VoidWork.xyz
        </ThemedText>
      </View>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 60,
    paddingBottom: 90,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    paddingTop: 10,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginLeft: 16,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  sectionContent: {
    borderRadius: 10,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 44,
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '400',
  },
  subtitleText: {
    fontSize: 13,
    marginTop: 2,
  },
  trailingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  separator: {
    height: 0.5,
    marginLeft: 56,
  },
});
