import React from 'react';
import { View, Switch, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';

const SettingsScreen: React.FC = () => {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <Stack.Screen options={{ headerShown: false }} />
      
      <View className="flex-1 px-6 py-12 w-full max-w-md mx-auto">
        
        {/* Header */}
        <Animated.View 
          entering={FadeInDown.duration(600)}
          className="mb-10 mt-4"
        >
          <ThemedText type="subtitle" className="font-black tracking-tight mb-2">
            Settings
          </ThemedText>
          <ThemedText type="small" className="text-slate-500 dark:text-slate-400">
            Customize your Photo Reveal game experience.
          </ThemedText>
        </Animated.View>

        {/* Settings Group */}
        <Animated.View 
          entering={FadeInDown.delay(150).duration(600)}
          className="w-full gap-6"
        >
          <View className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-[24px] p-5 shadow-lg shadow-slate-200/30 dark:shadow-black/40">
            
            {/* Setting Item: Dark Mode */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 justify-center items-center">
                  <Text className="text-xl">{isDark ? '🌙' : '☀️'}</Text>
                </View>
                <View>
                  <ThemedText className="font-bold text-slate-800 dark:text-slate-200">
                    Dark Mode
                  </ThemedText>
                  <ThemedText type="small" className="text-xs text-slate-400 dark:text-slate-500">
                    Toggle dark or light theme
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={isDark}
                onValueChange={() => toggleColorScheme()}
                trackColor={{ false: '#e2e8f0', true: '#4f46e5' }}
                thumbColor={'#ffffff'}
                ios_backgroundColor="#e2e8f0"
              />
            </View>

          </View>
        </Animated.View>

      </View>
    </SafeAreaView>
  );
};

export default SettingsScreen;
