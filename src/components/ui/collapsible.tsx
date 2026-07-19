import { SymbolView } from 'expo-symbols';
import { PropsWithChildren, useState } from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useColorScheme } from 'nativewind';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const { colorScheme } = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#ffffff' : '#0f172a';

  return (
    <ThemedView>
      <Pressable
        className="flex-row items-center gap-2 active:opacity-75"
        onPress={() => setIsOpen((value) => !value)}>
        <ThemedView type="element" className="w-8 h-8 rounded-xl justify-center items-center">
          <SymbolView
            name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
            size={14}
            weight="bold"
            tintColor={iconColor}
            style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
          />
        </ThemedView>

        <ThemedText type="smallBold">{title}</ThemedText>
      </Pressable>
      {isOpen && (
        <Animated.View entering={FadeIn.duration(200)}>
          <ThemedView type="element" className="mt-3 rounded-2xl ml-4 p-4">
            {children}
          </ThemedView>
        </Animated.View>
      )}
    </ThemedView>
  );
}
