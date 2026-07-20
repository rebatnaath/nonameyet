import React from 'react';
import { View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useColorScheme } from 'nativewind';

import { ThemedText } from '@/components/themed-text';
import { CameraIcon, SparklesIcon, UsersIcon } from '@/components/ui/icons';
import { ScreenWrapper } from '@/components/screen-wrapper';

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#818cf8' : '#4f46e5';
  const buttonSecondaryIconColor = colorScheme === 'dark' ? '#ffffff' : '#0f172a';

  return (
    <ScreenWrapper>
      
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
    </ScreenWrapper>
  );
};

export default HomeScreen;
