import React from 'react';
import { Pressable, type ViewStyle, type StyleProp, type GestureResponderEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

type Props = {
  onPress?: (e: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  scale?: number;
  disabled?: boolean;
  hitSlop?: { top?: number; bottom?: number; left?: number; right?: number };
};

export function PressableScale({
  onPress,
  style,
  children,
  scale = 0.96,
  disabled,
  hitSlop,
}: Props) {
  const pressed = useSharedValue(false);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(pressed.value ? scale : 1, {
          damping: 18,
          stiffness: 420,
          mass: 0.7,
        }),
      },
    ],
    opacity: withSpring(pressed.value ? 0.88 : 1, { damping: 18, stiffness: 420 }),
  }));

  return (
    <Pressable
      onPressIn={() => { pressed.value = true; }}
      onPressOut={() => { pressed.value = false; }}
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop}
    >
      <Animated.View style={[style, animStyle]}>{children}</Animated.View>
    </Pressable>
  );
}
