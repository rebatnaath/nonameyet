import { useState } from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { useRoom } from '@/hooks/use-room';

export default function HostScreen() {
  const router = useRouter();
  const { createRoom } = useRoom();
  const [name, setName] = useState('');

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const { room, playerId } = createRoom(trimmed);
    router.replace(`/lobby?code=${room.code}&playerId=${playerId}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />
      <View className="flex-1 px-6 py-12 w-full max-w-md mx-auto justify-center">
        <Animated.View entering={FadeInDown.duration(600)} className="items-center gap-6">
          <ThemedText type="subtitle" className="font-black tracking-tight text-center">
            Host a Game
          </ThemedText>
          <ThemedText className="text-center text-slate-500 dark:text-slate-400">
            Enter your name to create a room
          </ThemedText>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor="#94a3b8"
            maxLength={20}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-lg text-slate-900 dark:text-white"
          />

          <Pressable
            onPress={handleCreate}
            disabled={!name.trim()}
            className={`w-full rounded-2xl py-4 items-center ${
              name.trim()
                ? 'bg-indigo-600 active:bg-indigo-700 shadow-lg shadow-indigo-600/30'
                : 'bg-slate-300 dark:bg-slate-800'
            }`}
          >
            <ThemedText className="text-white text-lg font-bold">
              Create Room
            </ThemedText>
          </Pressable>

          <Pressable onPress={() => router.back()} className="active:opacity-70">
            <ThemedText type="linkPrimary">Back</ThemedText>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
