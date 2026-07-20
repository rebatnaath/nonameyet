import { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { ScreenWrapper } from '@/components/screen-wrapper';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { useRoom } from '@/hooks/use-room';

export default function JoinScreen() {
  const { joinRoom, exists } = useRoom();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleJoin = async () => {
    const trimmedCode = code.trim().toUpperCase();
    const trimmedName = name.trim();
    if (!trimmedCode || !trimmedName) return;
    const roomExists = await exists(trimmedCode);
    if (!roomExists) {
      setError('Room not found. Check the code and try again.');
      return;
    }
    const result = await joinRoom(trimmedCode, trimmedName);
    if (!result) {
      setError('Cannot join this room. It may have already started.');
      return;
    }
    router.replace(`/lobby?code=${result.room.code}&playerId=${result.playerId}`);
  };

  return (
    <ScreenWrapper options={{ headerShown: false, presentation: 'modal' }}>
      <View className="flex-1 px-6 py-12 w-full max-w-md mx-auto justify-center">
        <Animated.View entering={FadeInDown.duration(600)} className="items-center gap-6">
          <ThemedText type="subtitle" className="font-black tracking-tight text-center">
            Join a Lobby
          </ThemedText>
          <ThemedText className="text-center text-slate-500 dark:text-slate-400">
            Enter the room code shared by the host
          </ThemedText>

          <TextInput
            value={code}
            onChangeText={(v) => { setCode(v.toUpperCase()); setError(''); }}
            placeholder="Room code"
            placeholderTextColor="#94a3b8"
            maxLength={4}
            autoCapitalize="characters"
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-lg text-center tracking-[0.5em] font-bold text-slate-900 dark:text-white"
          />

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor="#94a3b8"
            maxLength={20}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-lg text-slate-900 dark:text-white"
          />

          {error ? (
            <ThemedText className="text-red-500 text-sm text-center">{error}</ThemedText>
          ) : null}

          <View style={[
            { width: '100%', borderRadius: 16, overflow: 'hidden' },
            code.trim() && name.trim() ? { backgroundColor: '#4f46e5' } : { backgroundColor: '#cbd5e1' }
          ]}>
            <TouchableOpacity
              onPress={handleJoin}
              disabled={!code.trim() || !name.trim()}
              style={{ width: '100%', paddingVertical: 16, alignItems: 'center' }}
            >
              <ThemedText className="text-white text-lg font-bold">
                Join Room
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View className="mt-4">
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
              <ThemedText type="linkPrimary">Back</ThemedText>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </ScreenWrapper>
  );
}
