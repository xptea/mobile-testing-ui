// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
export type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'arrow.clockwise': 'refresh',
    'circle.lefthalf.fill': 'brightness-6',
  'sun.max.fill': 'wb-sunny',
  'speaker.wave.2.fill': 'volume-up',
  'bell.fill': 'notifications',
  'speaker.wave.2': 'volume-up',
  'iphone.radiowaves.left.and.right': 'wifi',
  'moon.fill': 'brightness-2',
  'info.circle.fill': 'info',
  'hand.tap.fill': 'touch-app',
  'gear': 'settings',
  'checkmark': 'check',
  'chevron.right': 'chevron-right',
  'hammer.fill': 'build',
  'arrow.triangle.2.circlepath': 'sync',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
