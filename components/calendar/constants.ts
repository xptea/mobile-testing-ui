import { Dimensions } from "react-native";

export const SCREEN_WIDTH = Dimensions.get("window").width;
export const DAY_SIZE = (SCREEN_WIDTH - 80) / 7;

export const darkTheme = {
  background: "#0a0a0a",
  foreground: "#fafafa",
  card: "#0f0f0f",
  cardForeground: "#fafafa",
  popover: "#0a0a0a",
  popoverForeground: "#fafafa",
  primary: "#fafafa",
  primaryForeground: "#0a0a0a",
  secondary: "#1a1a1a",
  secondaryForeground: "#fafafa",
  muted: "#1a1a1a",
  mutedForeground: "#737373",
  accent: "#1a1a1a",
  accentForeground: "#fafafa",
  destructive: "#ef4444",
  destructiveForeground: "#fafafa",
  border: "#262626",
  input: "#262626",
  ring: "#fafafa",
  success: "#22c55e",
  warning: "#f59e0b",
  info: "#3b82f6",
  surfaceHover: "#171717",
  surfaceActive: "#404040",
};
