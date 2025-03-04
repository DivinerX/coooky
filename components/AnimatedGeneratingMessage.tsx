import React, { useEffect, useState } from 'react';
import { View, Animated, StyleSheet, Platform } from 'react-native';

interface AnimatedGeneratingMessageProps {
  message: string;
  style?: any;
}

export const AnimatedGeneratingMessage = ({ message, style }: AnimatedGeneratingMessageProps) => {
  const [animatedValues, setAnimatedValues] = useState<Animated.Value[]>([]);

  useEffect(() => {
    const newAnimatedValues = message.split('').map(() => new Animated.Value(0));
    setAnimatedValues(newAnimatedValues);

    const animations = newAnimatedValues.map((value, i) => {
      return Animated.sequence([
        Animated.delay(i * 30), // Reduced delay for faster animation
        Animated.spring(value, {
          toValue: 1,
          tension: 80,
          friction: 8,
          useNativeDriver: Platform.OS !== 'web', // Only use native driver on native platforms
        })
      ]);
    });

    Animated.stagger(20, animations).start();

    return () => {
      animations.forEach(anim => anim.stop());
    };
  }, [message]);

  return (
    <View style={styles.container}>
      {message.split('').map((char, index) => (
        <Animated.Text
          key={`${char}-${index}`}
          style={[
            style,
            styles.character,
            {
              opacity: animatedValues[index]?.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }) || 0,
              transform: [
                {
                  translateY: animatedValues[index]?.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [10, -5, 0],
                  }) || 0,
                },
                {
                  scale: animatedValues[index]?.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.5, 1.1, 1],
                  }) || 1,
                }
              ]
            }
          ]}
        >
          {char}
        </Animated.Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  character: {
    fontSize: 16,
    lineHeight: 24,
  },
});
