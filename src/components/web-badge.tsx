import { version } from 'expo/package.json';
import { Image } from 'expo-image';
import { useColorScheme } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export function WebBadge() {
  const scheme = useColorScheme();

  return (
    <ThemedView className="p-8 items-center gap-2">
      <ThemedText type="code" className="text-center text-slate-500 dark:text-slate-400">
        v{version}
      </ThemedText>
      <Image
        source={
          scheme === 'dark'
            ? require('@/assets/images/expo-badge-white.png')
            : require('@/assets/images/expo-badge.png')
        }
        style={{ width: 123, height: 24 }}
      />
    </ThemedView>
  );
}
