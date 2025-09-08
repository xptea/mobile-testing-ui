import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import type { AnimatedMaskedTextProps } from "./AnimatedMaskedText.types";

export const AnimatedMaskedText: React.FC<AnimatedMaskedTextProps> = ({
  children,
  style,
  speed = 1,
  colors = ["transparent", "rgba(255,255,255,1)", "transparent"],
  baseTextColor = "#000000", // Add base text color prop
}) => {
  const shimmerTranslate = useSharedValue(-1);
  const [textWidth, setTextWidth] = React.useState(0);
  const [textHeight, setTextHeight] = React.useState(0);

  useEffect(() => {
    shimmerTranslate.value = withRepeat(
      withTiming(1, {
        duration: 2000 / speed,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      false
    );
  }, [shimmerTranslate, speed]);

  return (
    <View style={{ position: "relative" }}>
      {/* Base text layer - visible text */}
      <Text
        style={[styles.text, style, { color: baseTextColor }]}
        onTextLayout={(e) => {
          const { width, height } = e.nativeEvent.lines[0];
          setTextWidth(width);
          setTextHeight(height);
        }}
      >
        {children}
      </Text>

      {/* Shimmer overlay */}
      {textWidth > 0 && (
        <MaskedView
          style={[
            StyleSheet.absoluteFill,
            {
              width: textWidth,
              height: textHeight || 50,
            },
          ]}
          maskElement={
            <Text style={[styles.text, style, { color: "white" }]}>
              {children}
            </Text>
          }
        >
          <Animated.View
            style={[
              {
                flexDirection: "row",
                transform: [
                  {
                    translateX: interpolate(
                      shimmerTranslate.value,
                      [-1, 1],
                      [-textWidth * 2.2, textWidth * 2.5]
                    ),
                  },
                ],
                opacity: interpolate(shimmerTranslate.value, [-1, 1], [0.3, 1]),
              },
            ]}
          >
            <LinearGradient
              colors={colors as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                width: textWidth * 3,
                height: textHeight || 50,
              }}
            />
          </Animated.View>
        </MaskedView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
