import { useState, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenWrapper } from '@/components/screen-wrapper';
import Animated, { 
  FadeInDown, 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming 
} from 'react-native-reanimated';
import { useColorScheme } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';

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
  const { colorScheme } = useColorScheme();

  // Pulse animation for waiting slots
  const pulse = useSharedValue(0.4);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(0.8, { duration: 1000 }), -1, true);
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

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
  }, [room?.status, room?.code, currentPlayerId, router]);

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
          <Animated.View entering={FadeInDown.duration(600)} className="w-full">
            <View className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-4 flex-row items-center justify-between shadow-md w-full backdrop-blur-md">
              <View className="flex-row items-center gap-3">
                <View className="bg-indigo-50 dark:bg-indigo-950/50 rounded-xl p-2.5">
                  <Ionicons name="key-outline" size={18} color="#4f46e5" />
                </View>
                <View>
                  <ThemedText type="small" className="text-slate-400 font-bold uppercase tracking-wider text-[9px] mb-0.5">
                    Room Code
                  </ThemedText>
                  <ThemedText className="text-2xl font-black tracking-widest text-indigo-600 dark:text-indigo-400">
                    {room.code}
                  </ThemedText>
                </View>
              </View>

              <TouchableOpacity
                onPress={copyCode}
                className="flex-row items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100/30 rounded-xl px-4 py-2 active:opacity-75"
              >
                <Ionicons name={copied ? "checkmark" : "copy-outline"} size={14} color="#4f46e5" />
                <ThemedText className="text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                  {copied ? 'Copied' : 'Copy'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Players */}
          <Animated.View entering={FadeInDown.delay(100).duration(600)} className="w-full">
            <View className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-md w-full backdrop-blur-md">
              <View className="flex-row items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800/50">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="people-outline" size={20} color="#4f46e5" />
                  <ThemedText className="font-bold text-slate-850 dark:text-slate-150">
                    Lobby Players
                  </ThemedText>
                </View>
                <View className="bg-indigo-50 dark:bg-indigo-950/40 rounded-full px-2.5 py-0.5">
                  <ThemedText className="text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                    {room.players.length} / {room.settings.minPlayers} min
                  </ThemedText>
                </View>
              </View>

              <View className="gap-2.5">
                {room.players.map((player) => (
                  <Animated.View
                    entering={FadeInDown.duration(400)}
                    key={player.id}
                    className="flex-row items-center gap-3 py-2.5"
                  >
                    <View className="w-10 h-10 rounded-full items-center justify-center overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/30">
                      <Image 
                        source={{ uri: `https://api.dicebear.com/9.x/fun-emoji/png?seed=${encodeURIComponent(player.name + '_' + player.id)}` }} 
                        style={{ width: 40, height: 40 }}
                      />
                    </View>
                    <View className="flex-row items-center gap-2 flex-1">
                      <ThemedText className="font-semibold text-slate-850 dark:text-slate-150">
                        {player.name}
                      </ThemedText>
                      {player.isHost && (
                        <View className="bg-amber-100 dark:bg-amber-950/40 rounded-full px-2 py-0.5 border border-amber-200/30">
                          <ThemedText type="small" className="text-amber-750 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider">
                            Host
                          </ThemedText>
                        </View>
                      )}
                      {player.id === currentPlayerId && (
                        <ThemedText type="small" className="text-slate-400 text-xs font-medium">
                          (you)
                        </ThemedText>
                      )}
                    </View>
                    <View className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </Animated.View>
                ))}

                {/* Skeleton placeholders for missing players */}
                {Array.from({ length: Math.max(0, room.settings.minPlayers - room.players.length) }).map((_, idx) => (
                  <Animated.View
                    key={`skeleton-${idx}`}
                    style={pulseStyle}
                    className="flex-row items-center gap-3 py-2.5"
                  >
                    <View className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700" />
                    <View className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded-md" />
                    <ThemedText type="small" className="text-slate-350 dark:text-slate-600 text-xs ml-auto font-mono">
                      waiting...
                    </ThemedText>
                  </Animated.View>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Settings */}
          <Animated.View entering={FadeInDown.delay(200).duration(600)} className="w-full">
            <ThemedText type="small" className="text-slate-400 font-bold uppercase tracking-wider text-[11px] mb-2 px-1">
              Game Configuration
            </ThemedText>
            <View className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-md w-full gap-4 backdrop-blur-md">
              {isHost ? (
                <>
                  <SettingRow icon="sparkles-outline" label="Theme" value={room.settings.theme} onPress={cycleTheme} />
                  <SettingRow icon="play-skip-forward-outline" label="Skip mode" value={room.settings.skipCountMode === 'fixed' ? `Fixed (${room.settings.fixedSkipCount})` : 'Random'} onPress={cycleSkipMode} />
                  {room.settings.skipCountMode === 'fixed' && (
                    <View className="flex-row items-center justify-between py-2 px-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/20">
                      <View className="flex-row items-center gap-3">
                        <View className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 items-center justify-center">
                          <Ionicons name="gift-outline" size={18} color="#4f46e5" />
                        </View>
                        <ThemedText className="font-medium text-slate-505 dark:text-slate-405 text-sm">Skip Pool Size</ThemedText>
                      </View>
                      <View className="flex-row items-center gap-3">
                        <TouchableOpacity 
                          onPress={() => adjustSkipCount(-1)} 
                          className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 items-center justify-center active:opacity-70"
                        >
                          <Ionicons name="remove" size={16} color="#4f46e5" />
                        </TouchableOpacity>
                        <ThemedText className="font-bold text-slate-800 dark:text-slate-200 text-base w-6 text-center">{room.settings.fixedSkipCount}</ThemedText>
                        <TouchableOpacity 
                          onPress={() => adjustSkipCount(1)} 
                          className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 items-center justify-center active:opacity-70"
                        >
                          <Ionicons name="add" size={16} color="#4f46e5" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                  <SettingRow icon="eye-outline" label="Skip visibility" value={room.settings.skipVisibility} onPress={cycleVisibility} />
                  <SettingRow icon="skull-outline" label="Punishment" value={room.settings.punishmentMode} onPress={cyclePunishment} />
                  
                  <View className="flex-row items-center justify-between py-2 px-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/20">
                    <View className="flex-row items-center gap-3">
                      <View className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 items-center justify-center">
                        <Ionicons name="people-outline" size={18} color="#4f46e5" />
                      </View>
                      <ThemedText className="font-medium text-slate-505 dark:text-slate-405 text-sm">Minimum Players</ThemedText>
                    </View>
                    <View className="flex-row items-center gap-3">
                      <TouchableOpacity 
                        onPress={() => adjustMinPlayers(room, updateSettings, -1)} 
                        className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 items-center justify-center active:opacity-70"
                      >
                        <Ionicons name="remove" size={16} color="#4f46e5" />
                      </TouchableOpacity>
                      <ThemedText className="font-bold text-slate-800 dark:text-slate-200 text-base w-6 text-center">{room.settings.minPlayers}</ThemedText>
                      <TouchableOpacity 
                        onPress={() => adjustMinPlayers(room, updateSettings, 1)} 
                        className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 items-center justify-center active:opacity-70"
                      >
                        <Ionicons name="add" size={16} color="#4f46e5" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              ) : (
                <>
                  <SettingRow icon="sparkles-outline" label="Theme" value={room.settings.theme} />
                  <SettingRow icon="play-skip-forward-outline" label="Skip mode" value={room.settings.skipCountMode === 'fixed' ? `Fixed (${room.settings.fixedSkipCount})` : 'Random'} />
                  <SettingRow icon="eye-outline" label="Skip visibility" value={room.settings.skipVisibility} />
                  <SettingRow icon="skull-outline" label="Punishment" value={room.settings.punishmentMode} />
                </>
              )}
            </View>
          </Animated.View>

          {/* Actions */}
          <Animated.View entering={FadeInDown.delay(300).duration(600)} className="gap-3 pb-12 w-full">
            {isHost && (
              <TouchableOpacity
                onPress={handleStart}
                disabled={!canStart}
                style={[
                  { width: '100%', borderRadius: 20, paddingVertical: 16, alignItems: 'center', shadowColor: '#4f46e5', shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
                  canStart ? { backgroundColor: '#4f46e5' } : { backgroundColor: colorScheme === 'dark' ? '#1e293b' : '#e2e8f0' }
                ]}
              >
                <ThemedText style={[
                  { fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
                  canStart ? { color: '#ffffff' } : { color: colorScheme === 'dark' ? '#64748b' : '#94a3b8' }
                ]}>
                  {room.players.length < room.settings.minPlayers
                    ? `Waiting for players (${room.players.length}/${room.settings.minPlayers})`
                    : 'Start Game'}
                </ThemedText>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleLeave}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 items-center active:opacity-75 shadow-sm"
            >
              <ThemedText className="text-red-500 font-bold text-sm uppercase tracking-wider">Leave Room</ThemedText>
            </TouchableOpacity>
          </Animated.View>

        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

type SettingRowProps = {
  icon: keyof typeof Ionicons.prototype.placeholder | any;
  label: string;
  value: string;
  onPress?: () => void;
};

function SettingRow({ icon, label, value, onPress }: SettingRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center justify-between py-3 px-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/20 active:opacity-75"
      style={!onPress && { opacity: 0.8 }}
    >
      <View className="flex-row items-center gap-3">
        <View className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 items-center justify-center">
          <Ionicons name={icon} size={18} color="#4f46e5" />
        </View>
        <ThemedText className="font-medium text-slate-500 dark:text-slate-400 text-sm">{label}</ThemedText>
      </View>
      <View className="flex-row items-center gap-1.5">
        <ThemedText className="font-bold text-slate-800 dark:text-slate-200 capitalize text-sm">{value}</ThemedText>
        {onPress && <Ionicons name="chevron-forward" size={14} color="#94a3b8" />}
      </View>
    </TouchableOpacity>
  );
}

function adjustMinPlayers(room: Room, updateSettings: (code: string, s: Partial<GameSettings>) => void, delta: number) {
  const next = Math.max(2, Math.min(10, room.settings.minPlayers + delta));
  updateSettings(room.code, { minPlayers: next });
}
