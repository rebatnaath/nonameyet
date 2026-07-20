import { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { ScreenWrapper } from '@/components/screen-wrapper';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useColorScheme } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { useRoom } from '@/hooks/use-room';

export default function JoinScreen() {
  const { joinRoom, exists } = useRoom();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { colorScheme } = useColorScheme();

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
      {/* Back Button */}
      <View className="absolute top-12 left-6 z-10">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 items-center justify-center shadow-sm active:opacity-75"
        >
          <Ionicons name="chevron-back" size={22} color={colorScheme === 'dark' ? '#ffffff' : '#0f172a'} />
        </TouchableOpacity>
      </View>

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

          <TouchableOpacity
            onPress={handleJoin}
            disabled={!code.trim() || !name.trim()}
            style={[
              { width: '100%', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
              (code.trim() && name.trim()) ? { backgroundColor: '#4f46e5' } : { backgroundColor: colorScheme === 'dark' ? '#1e293b' : '#e2e8f0' }
            ]}
          >
            <ThemedText style={[
              { fontSize: 18, fontWeight: 'bold' },
              (code.trim() && name.trim()) ? { color: '#ffffff' } : { color: colorScheme === 'dark' ? '#64748b' : '#94a3b8' }
            ]}>
              Join Room
            </ThemedText>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScreenWrapper>
  );
}
