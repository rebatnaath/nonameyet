import { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { useRoom } from '@/hooks/use-room';

export default function HostScreen() {
  const { createRoom } = useRoom();
  const [name, setName] = useState('');

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const { room, playerId } = await createRoom(trimmed);
    router.replace(`/lobby?code=${room.code}&playerId=${playerId}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <Stack.Screen options={{ headerShown: false }} />
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

          <TouchableOpacity
            onPress={handleCreate}
            disabled={!name.trim()}
            style={{ width: '100%', borderRadius: 16, paddingVertical: 16, alignItems: 'center', backgroundColor: name.trim() ? '#4f46e5' : '#cbd5e1' }}
          >
            <ThemedText className="text-white text-lg font-bold">
              Create Room
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
            <ThemedText type="linkPrimary">Back</ThemedText>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
