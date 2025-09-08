import React, { useEffect } from "react";
import { StyleSheet, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
  useDerivedValue,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { AnimatedSwitchProps } from "./AnimatedSwitch.types";

export const AnimatedSwitch: React.FC<AnimatedSwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
  width = 56,
  height = 32,
  onColor = "#4CD964",
  offColor = "#E9E9EA",
  thumbColor = "#FFFFFF",
  thumbSize,
  thumbInset = 2,
  springConfig = {
    damping: 15,
    stiffness: 120,
    mass: 1,
  },
  style,
  testID,

  thumbOnIcon,
  thumbOffIcon,
  trackOnIcon,
  trackOffIcon,

  backgroundImage,
  backgroundImageStyle,

  animateIcons = true,

  iconAnimationType = "fade",
}) => {
  const finalThumbSize = thumbSize ?? height - thumbInset * 2;
  const moveDistance = width - finalThumbSize - thumbInset * 2;

  const position = useSharedValue(value ? 1 : 0);
  const iconOpacity = useSharedValue(value ? 1 : 0);
  const iconRotation = useSharedValue(value ? 1 : 0);
  const iconScale = useSharedValue(value ? 1 : 0);
  const iconBounce = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    position.value = value ? 1 : 0;

    if (animateIcons) {
      if (iconAnimationType === "fade") {
        iconOpacity.value = withTiming(value ? 1 : 0, { duration: 200 });
      } else if (iconAnimationType === "rotate") {
        iconRotation.value = withTiming(value ? 1 : 0, { duration: 300 });
      } else if (iconAnimationType === "scale") {
        iconScale.value = withTiming(value ? 1 : 0, { duration: 200 });
      } else if (iconAnimationType === "bounce") {
        iconBounce.value = withSequence(
          withTiming(1.2, { duration: 100 }),
          withTiming(1, { duration: 100 }),
        );
      }
    }
  }, [
    value,
    position,
    iconOpacity,
    iconRotation,
    iconScale,
    iconBounce,
    animateIcons,
    iconAnimationType,
  ]);

  const backgroundColor = useDerivedValue(() => {
    return interpolateColor(position.value, [0, 1], [offColor, onColor]);
  });

  const thumbStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withSpring(position.value * moveDistance, springConfig),
        },
      ],
    };
  });

  const backgroundStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: backgroundColor.value,
    };
  });

  const thumbIconStyle = useAnimatedStyle(() => {
    switch (iconAnimationType) {
      case "fade":
        return {
          opacity: iconOpacity.value,
        };
      case "rotate":
        return {
          transform: [{ rotate: `${iconRotation.value * 180}deg` }],
        };
      case "scale":
        return {
          transform: [{ scale: iconScale.value * 0.6 + 0.4 }],
        };
      case "bounce":
        return {
          transform: [{ scale: iconBounce.value }],
        };
      default:
        return {};
    }
  });

  const handlePress = () => {
    if (disabled) return;

    const newValue = !value;
    onValueChange(newValue);
  };

  const trackIconStyle = useAnimatedStyle(() => {
    switch (iconAnimationType) {
      case "fade":
        return {
          opacity: value ? iconOpacity.value : 1 - iconOpacity.value,
        };
      case "scale":
        return {
          transform: [
            {
              scale: value
                ? iconScale.value * 0.5 + 0.5
                : (1 - iconScale.value) * 0.5 + 0.5,
            },
          ],
        };
      case "rotate":
        return {
          transform: [
            {
              rotate: value
                ? `${iconRotation.value * 90}deg`
                : `${(1 - iconRotation.value) * 90}deg`,
            },
          ],
        };
      case "bounce":
        return {
          transform: [{ scale: iconBounce.value }],
        };
      default:
        return {};
    }
  });

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      testID={testID}
      style={({ pressed }) => [
        { opacity: pressed || disabled ? 0.7 : 1 },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.track,
          backgroundStyle,
          {
            width,
            height,
            borderRadius: height / 2,
            overflow: "hidden",
          },
        ]}
      >
        {backgroundImage && (
          <Animated.Image
            source={backgroundImage}
            style={[styles.backgroundImage, backgroundImageStyle]}
            resizeMode="cover"
          />
        )}

        {value && trackOnIcon && (
          <Animated.View
            style={[
              styles.trackIconContainer,
              { justifyContent: "flex-start", alignItems: "flex-start" },
              trackIconStyle,
            ]}
          >
            {trackOnIcon}
          </Animated.View>
        )}

        {!value && trackOffIcon && (
          <Animated.View
            style={[
              styles.trackIconContainer,
              { justifyContent: "flex-end", alignItems: "flex-end" },
              trackIconStyle,
            ]}
          >
            {trackOffIcon}
          </Animated.View>
        )}

        <Animated.View
          style={[
            styles.thumb,
            thumbStyle,
            {
              width: finalThumbSize,
              height: finalThumbSize,
              borderRadius: finalThumbSize / 2,
              backgroundColor: thumbColor,
              left: thumbInset,
              top: thumbInset,
            },
          ]}
        >
          {value && thumbOnIcon && (
            <Animated.View style={[styles.thumbIconContainer, thumbIconStyle]}>
              {thumbOnIcon}
            </Animated.View>
          )}

          {!value && thumbOffIcon && (
            <Animated.View style={[styles.thumbIconContainer, thumbIconStyle]}>
              {thumbOffIcon}
            </Animated.View>
          )}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  track: {
    justifyContent: "center",
  },
  thumb: {
    position: "absolute",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  trackIconContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    padding: 8,
    zIndex: 1,
  },
  thumbIconContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
});

export default AnimatedSwitch;
