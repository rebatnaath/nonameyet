import React from 'react';
import { View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useColorScheme } from 'nativewind';
import Svg, { Path, Circle } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';

const CameraIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = 'currentColor' }) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <Circle cx="12" cy="13" r="4" />
    </Svg>
  );
};

const SparklesIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = 'currentColor' }) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <Path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5 5 3Z" />
      <Path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z" />
    </Svg>
  );
};

const UsersIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = 'currentColor' }) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <Circle cx="9" cy="7" r="4" />
      <Path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Svg>
  );
};

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#818cf8' : '#4f46e5';
  const buttonSecondaryIconColor = colorScheme === 'dark' ? '#ffffff' : '#0f172a';

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <Stack.Screen options={{ headerShown: false }} />
      
      <View className="flex-1 justify-between items-center px-6 py-12 w-full h-full max-w-md mx-auto">
        
        {/* Spacer */}
        <View className="h-4" />

        {/* Main Logo & Title */}
        <View className="items-center w-full">
          <Animated.View 
            entering={ZoomIn.duration(800).springify().damping(12)}
            className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-8 rounded-[32px] mb-8 shadow-xl shadow-slate-200/50 dark:shadow-black/50"
          >
            <CameraIcon size={80} color={iconColor} />
          </Animated.View>
          
          <Animated.View entering={FadeInDown.delay(200).duration(600)} className="w-full">
            <ThemedText type="title" className="text-center font-black tracking-tighter mb-3">
              Photo Reveal
            </ThemedText>
          </Animated.View>
          
          <Animated.View entering={FadeInDown.delay(350).duration(600)} className="w-full">
            <ThemedText className="text-center text-lg font-medium px-4 text-slate-500 dark:text-slate-400">
              The ultimate social party game of photos, questions, and secrets.
            </ThemedText>
          </Animated.View>
        </View>

        {/* Actions/Buttons */}
        <View className="w-full gap-4 mb-8">
          <Animated.View entering={FadeInDown.delay(500).duration(600)} className="w-full">
            <Pressable 
              onPress={() => router.push('/host' as any)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-2xl py-4 flex-row items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 border border-indigo-500/20 active:scale-[0.98] transition-all"
            >
              <ThemedText className="text-white text-lg font-bold tracking-wide">
                Host a Game
              </ThemedText>
              <SparklesIcon size={20} color="#ffffff" />
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(650).duration(600)} className="w-full">
            <Pressable
              onPress={() => router.push('/join' as any)}
              className="w-full bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 active:bg-slate-100 dark:active:bg-slate-800/50 rounded-2xl py-4 flex-row items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 shadow-sm active:scale-[0.98] transition-all"
            >
              <ThemedText className="text-slate-900 dark:text-white text-lg font-bold tracking-wide">
                Join a Lobby
              </ThemedText>
              <UsersIcon size={20} color={buttonSecondaryIconColor} />
            </Pressable>
          </Animated.View>
        </View>

        {/* Spacer */}
        <View className="h-4" />

      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
