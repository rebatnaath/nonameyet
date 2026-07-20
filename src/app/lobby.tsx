import { useState, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenWrapper } from '@/components/screen-wrapper';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { useRoom, type Room, type GameSettings, type Theme, type SkipCountMode, type SkipVisibility, type PunishmentMode } from '@/hooks/use-room';

const THEMES: Theme[] = ['After Party', 'Nature', 'Workplace', 'Hometown-Country', 'Random'];
const SKIP_MODES: SkipCountMode[] = ['fixed', 'random'];
const VISIBILITIES: SkipVisibility[] = ['visible', 'hidden'];
const PUNISHMENTS: PunishmentMode[] = ['predefined', 'wheel', 'custom'];

export default function LobbyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ code: string; playerId: string }>();
  const { getRoom, updateSettings, startGame, leaveRoom, subscribeToRoom } = useRoom();
  const [copied, setCopied] = useState(false);

  // Subscribe to real-time updates for the current room
  useEffect(() => {
    if (params.code) {
      return subscribeToRoom(params.code);
    }
  }, [params.code, subscribeToRoom]);

  const room = getRoom(params.code ?? '');
  const currentPlayerId = params.playerId ?? '';
  const isHost = room?.hostId === currentPlayerId;

  // Auto-navigate all players to upload when host starts the game
  useEffect(() => {
    if (room?.status === 'uploading') {
      router.replace(`/upload?room=${room.code}&playerId=${currentPlayerId}&theme=${room.settings.theme}`);
    }
  }, [room?.status]);

  const copyCode = useCallback(() => {
    try {
      navigator.clipboard?.writeText(room?.code ?? '');
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [room?.code]);

  const cycleTheme = useCallback(() => {
    if (!room) return;
    const idx = THEMES.indexOf(room.settings.theme);
    updateSettings(room.code, { theme: THEMES[(idx + 1) % THEMES.length] });
  }, [room, updateSettings]);

  const cycleSkipMode = useCallback(() => {
    if (!room) return;
    const idx = SKIP_MODES.indexOf(room.settings.skipCountMode);
    updateSettings(room.code, { skipCountMode: SKIP_MODES[(idx + 1) % SKIP_MODES.length] });
  }, [room, updateSettings]);

  const cycleVisibility = useCallback(() => {
    if (!room) return;
    const idx = VISIBILITIES.indexOf(room.settings.skipVisibility);
    updateSettings(room.code, { skipVisibility: VISIBILITIES[(idx + 1) % VISIBILITIES.length] });
  }, [room, updateSettings]);

  const cyclePunishment = useCallback(() => {
    if (!room) return;
    const idx = PUNISHMENTS.indexOf(room.settings.punishmentMode);
    updateSettings(room.code, { punishmentMode: PUNISHMENTS[(idx + 1) % PUNISHMENTS.length] });
  }, [room, updateSettings]);

  const adjustSkipCount = useCallback((delta: number) => {
    if (!room) return;
    const next = Math.max(1, Math.min(10, room.settings.fixedSkipCount + delta));
    updateSettings(room.code, { fixedSkipCount: next });
  }, [room, updateSettings]);

  const handleStart = useCallback(() => {
    if (!room || !isHost) return;
    startGame(room.code);
    router.replace(`/upload?room=${room.code}&playerId=${currentPlayerId}&theme=${room.settings.theme}`);
  }, [room, isHost, startGame, router, currentPlayerId]);

  const handleLeave = useCallback(() => {
    if (!room || !currentPlayerId) return;
    leaveRoom(room.code, currentPlayerId);
    router.back();
  }, [room, currentPlayerId, leaveRoom, router]);

  if (!room) {
    return (
      <ScreenWrapper options={{ headerShown: false }}>
        <View className="flex-1 items-center justify-center px-6">
          <ThemedText className="text-center text-slate-500 dark:text-slate-400 mb-4">
            Room not found
          </ThemedText>
          <TouchableOpacity onPress={() => router.back()} className="bg-indigo-600 rounded-2xl py-3 px-8 active:opacity-70">
            <ThemedText className="text-white font-bold">Back</ThemedText>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  const canStart = isHost && room.players.length >= room.settings.minPlayers;

  return (
    <ScreenWrapper options={{ headerShown: false, gestureEnabled: false }}>
      <ScrollView className="flex-1 px-6 py-8">
        <View className="w-full max-w-md mx-auto gap-6">

          {/* Room Code Card */}
          <Animated.View entering={FadeInDown.duration(600)} className="items-center">
            <ThemedText type="small" className="text-slate-400 mb-2">
              Room Code
            </ThemedText>
            <View className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-[24px] px-8 py-5 items-center shadow-lg w-full">
              <ThemedText className="text-4xl font-black tracking-[0.3em] text-indigo-600 dark:text-indigo-400">
                {room.code}
              </ThemedText>
              <TouchableOpacity
                onPress={copyCode}
                className="mt-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-full px-4 py-1 active:opacity-70"
              >
                <ThemedText className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold">
                  {copied ? 'Copied!' : 'Copy Code'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Players */}
          <Animated.View entering={FadeInDown.delay(100).duration(600)}>
            <View className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-[24px] p-5 shadow-lg w-full">
              <View className="flex-row items-center justify-between mb-3">
                <ThemedText className="font-bold text-slate-800 dark:text-slate-200">
                  Players
                </ThemedText>
                <ThemedText type="small" className="text-slate-400">
                  {room.players.length}/{room.settings.minPlayers} min
                </ThemedText>
              </View>
              {room.players.map((player, idx) => (
                <View
                  key={player.id}
                  className="flex-row items-center gap-3 py-2.5"
                  style={idx < room.players.length - 1 ? { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' } : {}}
                >
                  <View 
                    className="w-8 h-8 rounded-full items-center justify-center overflow-hidden"
                    style={player.isHost ? { backgroundColor: '#e0e7ff' } : { backgroundColor: '#f1f5f9' }}
                  >
                    <Image 
                      source={{ uri: `https://robohash.org/${player.id}?set=set4&size=100x100` }} 
                      style={{ width: 32, height: 32 }}
                    />
                  </View>
                  <View className="flex-row items-center gap-2">
                    <ThemedText className="font-semibold">
                      {player.name}
                    </ThemedText>
                    {player.isHost && (
                      <View className="bg-indigo-600/10 rounded-full px-2 py-0.5">
                        <ThemedText type="small" className="text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                          Host
                        </ThemedText>
                      </View>
                    )}
                    {player.id === currentPlayerId && (
                      <ThemedText type="small" className="text-slate-400 text-xs">
                        (you)
                      </ThemedText>
                    )}
                  </View>
                </View>
              ))}
              {room.players.length === 0 && (
                <ThemedText className="text-slate-400 text-center py-4">
                  No players yet
                </ThemedText>
              )}
            </View>
          </Animated.View>

          {/* Settings */}
          <Animated.View entering={FadeInDown.delay(200).duration(600)}>
            <ThemedText type="small" className="text-slate-400 mb-2 px-1">
              Settings
            </ThemedText>
            <View className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-[24px] p-5 shadow-lg w-full gap-3">
              {isHost ? (
                <>
                  <SettingRow label="Theme" value={room.settings.theme} onPress={cycleTheme} />
                  <SettingRow label="Skip mode" value={room.settings.skipCountMode === 'fixed' ? `Fixed (${room.settings.fixedSkipCount})` : 'Random'} onPress={cycleSkipMode} />
                  {room.settings.skipCountMode === 'fixed' && (
                    <View className="flex-row items-center justify-between pl-4">
                      <ThemedText type="small" className="text-slate-400">Skip count</ThemedText>
                      <View className="flex-row items-center gap-3">
                        <TouchableOpacity onPress={() => adjustSkipCount(-1)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center active:opacity-70">
                          <ThemedText className="font-bold">-</ThemedText>
                        </TouchableOpacity>
                        <ThemedText className="font-bold text-lg w-6 text-center">{room.settings.fixedSkipCount}</ThemedText>
                        <TouchableOpacity onPress={() => adjustSkipCount(1)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center active:opacity-70">
                          <ThemedText className="font-bold">+</ThemedText>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                  <SettingRow label="Skip visibility" value={room.settings.skipVisibility} onPress={cycleVisibility} />
                  <SettingRow label="Punishment" value={room.settings.punishmentMode} onPress={cyclePunishment} />
                  <View className="flex-row items-center justify-between">
                    <ThemedText type="small" className="text-slate-400">Min players</ThemedText>
                    <View className="flex-row items-center gap-3">
                      <TouchableOpacity onPress={() => adjustMinPlayers(room, updateSettings, -1)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center active:opacity-70">
                        <ThemedText className="font-bold">-</ThemedText>
                      </TouchableOpacity>
                      <ThemedText className="font-bold text-lg w-6 text-center">{room.settings.minPlayers}</ThemedText>
                      <TouchableOpacity onPress={() => adjustMinPlayers(room, updateSettings, 1)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center active:opacity-70">
                        <ThemedText className="font-bold">+</ThemedText>
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              ) : (
                <>
                  <SettingRow label="Theme" value={room.settings.theme} />
                  <SettingRow label="Skip mode" value={room.settings.skipCountMode === 'fixed' ? `Fixed (${room.settings.fixedSkipCount})` : 'Random'} />
                  <SettingRow label="Skip visibility" value={room.settings.skipVisibility} />
                  <SettingRow label="Punishment" value={room.settings.punishmentMode} />
                </>
              )}
            </View>
          </Animated.View>

          {/* Actions */}
          <Animated.View entering={FadeInDown.delay(300).duration(600)} className="gap-3 pb-8">
            {isHost && (
              <View style={[
                { width: '100%', borderRadius: 16, overflow: 'hidden' },
                canStart ? { backgroundColor: '#4f46e5' } : { backgroundColor: '#cbd5e1' }
              ]}>
                <TouchableOpacity
                  onPress={handleStart}
                  disabled={!canStart}
                  style={{ width: '100%', paddingVertical: 16, alignItems: 'center' }}
                >
                  <ThemedText className="text-white text-lg font-bold">
                    {room.players.length < room.settings.minPlayers
                      ? `Waiting for players (${room.players.length}/${room.settings.minPlayers})`
                      : 'Start Game'}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              onPress={handleLeave}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 items-center active:opacity-70"
            >
              <ThemedText className="text-red-500 font-semibold">Leave Room</ThemedText>
            </TouchableOpacity>
          </Animated.View>

        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

type SettingRowProps = {
  label: string;
  value: string;
  onPress?: () => void;
};

function SettingRow({ label, value, onPress }: SettingRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center justify-between py-1"
      style={onPress ? { opacity: 1 } : { opacity: 0.5 }}
    >
      <ThemedText type="small" className="text-slate-400">{label}</ThemedText>
      <View className="flex-row items-center gap-1">
        <ThemedText className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{value}</ThemedText>
        {onPress && <ThemedText type="small" className="text-slate-300 ml-1">›</ThemedText>}
      </View>
    </TouchableOpacity>
  );
}

function adjustMinPlayers(room: Room, updateSettings: (code: string, s: Partial<GameSettings>) => void, delta: number) {
  const next = Math.max(2, Math.min(10, room.settings.minPlayers + delta));
  updateSettings(room.code, { minPlayers: next });
}
