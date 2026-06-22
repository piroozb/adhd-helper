import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable } from "react-native";

type AnimatedToggleProps = {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  activeColor?: string;
  inactiveColor?: string;
};

export function AnimatedToggle({
  checked,
  onChange,
  disabled,
  activeColor = "#0ea5e9",
  inactiveColor = "#cbd5e1",
}: AnimatedToggleProps) {
  const progress = useRef(new Animated.Value(checked ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: checked ? 1 : 0,
      duration: 200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [checked, progress]);

  const trackBackground = checked ? activeColor : inactiveColor;

  const thumbTranslate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 16],
  });

  return (
    <Pressable
      onPress={onChange}
      disabled={disabled}
      style={{
        width: 40,
        height: 24,
        borderRadius: 999,
        padding: 1,
        justifyContent: "center",
        backgroundColor: undefined,
      }}
      hitSlop={8}
    >
      <Animated.View
        style={[
          {
            width: 40,
            height: 24,
            borderRadius: 999,
            padding: 1,
            justifyContent: "center",
            backgroundColor: trackBackground,
          },
        ]}
      >
        <Animated.View
          style={{
            width: 22,
            height: 22,
            borderRadius: 999,
            backgroundColor: "#fff",
            transform: [{ translateX: thumbTranslate }],
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.15,
            shadowRadius: 2,
            elevation: 2,
          }}
        />
      </Animated.View>
    </Pressable>
  );
}
