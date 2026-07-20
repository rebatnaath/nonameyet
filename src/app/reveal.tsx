import { useEffect } from 'react';
import { View, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenWrapper } from '@/components/screen-wrapper';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { useRoom } from '@/hooks/use-room';
import { ModernLoader } from '@/components/ui/modern-loader';

export default function RevealScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ room: string; playerId: string }>();
  const { getRoom, subscribeToRoom, nextRevealPhoto, resetGame, leaveRoom, closeRoom, skipTurn, resolvePunishment } = useRoom();

  const roomCode = params.room ?? '';
  const playerId = params.playerId ?? '';
  const room = getRoom(roomCode);
  
  useEffect(() => {
    if (roomCode) {
      return subscribeToRoom(roomCode);
    }
  }, [roomCode, subscribeToRoom]);
  
  // Navigate out if status changes back to lobby or closed
  useEffect(() => {
    if (room?.status === 'lobby') {
      router.replace(`/lobby?code=${roomCode}&playerId=${playerId}`);
    } else if (room?.status === 'closed') {
      // If host closed the room, everyone goes back to home
      router.replace('/');
    }
  }, [room?.status, roomCode, playerId, router]);

  const handleNext = () => {
    nextRevealPhoto(roomCode);
  };

  const handleReplay = () => {
    resetGame(roomCode);
  };

  const handleExit = () => {
    if (isHost) {
      closeRoom(roomCode);
    } else {
      leaveRoom(roomCode, playerId);
      router.replace('/');
    }
  };

  const handleSkip = () => {
    skipTurn(roomCode, playerId);
  };

  if (!room) {
    return (
      <ScreenWrapper options={{ headerShown: false, gestureEnabled: false }}>
        <View className="flex-1 justify-center items-center">
          <ModernLoader size={48} color="#4f46e5" />
        </View>
      </ScreenWrapper>
    );
  }

  const isHost = room.hostId === playerId;
  const isFinished = room.status === 'finished';

  const { revealOrder = [], currentRevealIndex = 0, askerId, photos = {} } = room.settings;
  const currentOwnerId = revealOrder[currentRevealIndex];
  const photoUrl = currentOwnerId ? photos[currentOwnerId] : undefined;
  
  const owner = room.players.find(p => p.id === currentOwnerId);
  const asker = room.players.find(p => p.id === askerId);
  const isOwner = currentOwnerId === playerId;

  const punishedPlayerId = room.settings.punishedPlayerId;
  const punishedPlayer = room.players.find(p => p.id === punishedPlayerId);
  const activePunishmentText = room.settings.activePunishmentText;

  return (
    <ScreenWrapper options={{ headerShown: false, gestureEnabled: false }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1 px-6 py-8">
        <View className="w-full max-w-md mx-auto items-center gap-6 pb-20 justify-between flex-1">
          
          {/* Header */}
          <Animated.View entering={FadeInDown.duration(600)} className="items-center w-full mt-4">
            <ThemedText type="small" className="text-indigo-500 font-bold uppercase tracking-widest text-[10px] mb-1.5">
              {isFinished ? 'ROUND COMPLETED' : 'REVEAL PHASE'}
            </ThemedText>
            <ThemedText type="subtitle" className="font-black tracking-tight text-center text-3xl">
              {isFinished ? 'Round Finished!' : `Photo ${(currentRevealIndex + 1).toString().padStart(2, '0')}`}
            </ThemedText>
            {!isFinished && revealOrder.length > 0 && (
              <ThemedText type="small" className="text-slate-400 text-center mt-1 text-xs">
                of {revealOrder.length} total uploads
              </ThemedText>
            )}
          </Animated.View>

          {isFinished ? (
            <Animated.View entering={ZoomIn.duration(400)} className="w-full gap-6">
              
              {/* Gallery Results Recap */}
              <View className="w-full gap-4 bg-white/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-5 shadow-md backdrop-blur-md">
                <ThemedText type="small" className="text-slate-450 dark:text-slate-400 font-bold uppercase tracking-widest text-center text-[10px] pb-2 border-b border-slate-100 dark:border-slate-800/40">
                  Submission Gallery
                </ThemedText>
                
                <View className="flex-row flex-wrap justify-between gap-y-4 pt-2">
                  {room.players.map((player) => {
                    const playerPhoto = photos[player.id];
                    if (!playerPhoto) return null;
                    return (
                      <View 
                        key={player.id}
                        className="w-[48%] bg-slate-50 dark:bg-slate-850 rounded-2xl p-2 border border-slate-100 dark:border-slate-800/20 shadow-sm"
                      >
                        <Image 
                          source={{ uri: playerPhoto }} 
                          className="w-full aspect-square rounded-xl bg-slate-100 dark:bg-slate-800"
                          resizeMode="cover"
                        />
                        <View className="flex-row items-center gap-1.5 mt-2 px-1">
                          <View className="w-5 h-5 rounded-full overflow-hidden bg-slate-200">
                            <Image 
                              source={{ uri: `https://loremflickr.com/100/100/cat?lock=${player.id.charCodeAt(0) + (player.id.charCodeAt(1) || 0)}` }} 
                              className="w-full h-full"
                            />
                          </View>
                          <ThemedText 
                            className="font-semibold text-xs flex-1" 
                            style={{ color: '#000000' }}
                            numberOfLines={1}
                          >
                            {player.name}
                          </ThemedText>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
              
              {isHost ? (
                <View className="gap-3 mt-2 w-full">
                  <TouchableOpacity
                    onPress={handleReplay}
                    className="w-full flex-row items-center justify-center gap-2 bg-indigo-600 rounded-2xl py-4 shadow-md active:opacity-75"
                  >
                    <Ionicons name="refresh-outline" size={20} color="#ffffff" />
                    <ThemedText className="text-white text-base font-black uppercase tracking-wider">
                      Replay Again
                    </ThemedText>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={handleExit}
                    className="w-full flex-row items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 active:opacity-75"
                  >
                    <Ionicons name="close-circle-outline" size={20} color="#ef4444" />
                    <ThemedText className="text-red-500 text-sm font-bold uppercase tracking-wider">
                      Close Room
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="items-center mt-4 w-full gap-4">
                  <View className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/40 flex-row items-center justify-center gap-3 w-full">
                    <ModernLoader size={20} color="#4f46e5" strokeWidth={2} />
                    <ThemedText className="text-center text-slate-500 text-xs font-semibold">
                      Waiting for host to launch next action...
                    </ThemedText>
                  </View>
                  <TouchableOpacity
                    onPress={handleExit}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 items-center active:opacity-75"
                  >
                    <ThemedText className="text-red-500 text-sm font-bold uppercase tracking-wider">
                      Leave Room
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          ) : punishedPlayerId ? (
            
            /* Punishment View */
            <Animated.View entering={ZoomIn.duration(400)} className="w-full my-auto">
              <View className="bg-red-50/90 dark:bg-red-950/20 border-2 border-red-500/20 rounded-3xl p-6 items-center shadow-lg w-full backdrop-blur-md">
                
                <View className="w-16 h-16 rounded-2xl bg-red-500/10 items-center justify-center mb-4 border border-red-500/25">
                  <Ionicons name="flame" size={32} color="#ef4444" />
                </View>

                <ThemedText className="text-red-550 dark:text-red-400 text-2xl font-black uppercase tracking-wider mb-2">
                  🚨 punishment!
                </ThemedText>
                
                <View className="flex-row items-center gap-2 mb-4 bg-red-100/50 dark:bg-red-950/40 px-4 py-1.5 rounded-full border border-red-200/20">
                  <View className="w-6 h-6 rounded-full overflow-hidden bg-white/80">
                    <Image 
                      source={{ uri: `https://loremflickr.com/100/100/cat?lock=${(punishedPlayer?.id || 'x').charCodeAt(0) + ((punishedPlayer?.id || 'x').charCodeAt(1) || 0)}` }} 
                      className="w-full h-full"
                    />
                  </View>
                  <ThemedText className="font-bold text-red-700 dark:text-red-400 text-sm">
                    {punishedPlayer?.name || 'Unknown'} is out of skips
                  </ThemedText>
                </View>

                <View className="bg-white dark:bg-slate-900 border border-red-200/10 rounded-2xl p-5 w-full shadow-inner mb-2">
                  <ThemedText className="text-slate-800 dark:text-slate-100 text-base text-center leading-6 font-semibold italic">
                    "{activePunishmentText}"
                  </ThemedText>
                </View>

                {isHost ? (
                  <TouchableOpacity
                    onPress={() => resolvePunishment(roomCode)}
                    className="w-full flex-row items-center justify-center gap-2 bg-red-600 rounded-2xl py-4 mt-4 active:opacity-75 shadow-md shadow-red-655/20"
                  >
                    <Ionicons name="checkmark-done" size={20} color="#ffffff" />
                    <ThemedText className="text-white text-sm font-black uppercase tracking-wider">
                      Resolve & Continue
                    </ThemedText>
                  </TouchableOpacity>
                ) : (
                  <View className="flex-row items-center gap-2 bg-red-100/30 dark:bg-red-950/20 rounded-2xl py-3 px-4 mt-4 w-full justify-center">
                    <ModernLoader size={16} color="#ef4444" strokeWidth={2} />
                    <ThemedText className="text-red-500 dark:text-red-400 text-xs font-semibold text-center">
                      Waiting for Host to confirm completion...
                    </ThemedText>
                  </View>
                )}
              </View>
            </Animated.View>

          ) : (
            <>
              {/* Photo Card */}
              <Animated.View entering={ZoomIn.duration(400)} className="w-full">
                <View className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-4 shadow-md w-full items-center">
                  
                  {/* Photo Container */}
                  <View className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800/40 relative">
                    {photoUrl ? (
                      <Image
                        source={{ uri: photoUrl }}
                        className="w-full h-full"
                        resizeMode="contain"
                      />
                    ) : (
                      <View className="w-full h-full items-center justify-center">
                        <ModernLoader size={36} color="#4f46e5" />
                        <ThemedText className="text-slate-400 mt-2 text-xs font-semibold">Loading Image...</ThemedText>
                      </View>
                    )}
                  </View>
                  
                  {/* Explaining Player Profile */}
                  <View className="flex-row items-center gap-3 mt-2 border-t border-slate-100 dark:border-slate-800/40 pt-4 w-full px-2">
                    <View className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/35">
                      {owner && (
                        <Image 
                          source={{ uri: `https://loremflickr.com/100/100/cat?lock=${owner.id.charCodeAt(0) + (owner.id.charCodeAt(1) || 0)}` }} 
                          className="w-full h-full"
                        />
                      )}
                    </View>
                    <View className="flex-1">
                      <ThemedText type="small" className="text-slate-400 dark:text-slate-550 font-bold uppercase tracking-wider text-[9px] mb-0.5">
                        Now Explaining
                      </ThemedText>
                      <ThemedText className="font-bold text-slate-850 dark:text-slate-150 text-base">
                        {owner?.name || 'Unknown'}
                      </ThemedText>
                    </View>
                  </View>

                  {owner && (
                    <View className="w-full pt-3 mt-3 border-t border-slate-50 dark:border-slate-850/50 items-center">
                      <ThemedText type="small" className="text-center text-slate-400 dark:text-slate-500 text-[11px]">
                        The question rotation moves clockwise after {owner.name}.
                      </ThemedText>
                    </View>
                  )}

                </View>
              </Animated.View>

              {/* Action Buttons Container */}
              <Animated.View entering={FadeInDown.delay(200).duration(500)} className="w-full gap-3 mt-2">
                
                {/* Active Owner Skip Controls */}
                {isOwner && (
                  <TouchableOpacity
                    onPress={handleSkip}
                    className="w-full flex-row items-center justify-center gap-2 bg-amber-500 rounded-2xl py-4 active:opacity-75 shadow-md shadow-amber-500/20"
                  >
                    <Ionicons name="play-skip-forward-outline" size={20} color="#ffffff" />
                    <ThemedText className="text-white text-base font-black uppercase tracking-wider">
                      {room.settings.skipVisibility === 'hidden'
                        ? 'Skip Question (Secret count)'
                        : `Skip Question (${room.settings.skips?.[playerId] ?? 0} remaining)`
                      }
                    </ThemedText>
                  </TouchableOpacity>
                )}

                {/* Host Controls */}
                {isHost && (
                  <TouchableOpacity
                    onPress={handleNext}
                    className="w-full flex-row items-center justify-center gap-2 bg-indigo-600 rounded-2xl py-4 shadow-md shadow-indigo-600/20 active:opacity-75"
                  >
                    <Ionicons name="arrow-forward-outline" size={20} color="#ffffff" />
                    <ThemedText className="text-white text-base font-black uppercase tracking-wider">
                      {currentRevealIndex < revealOrder.length - 1 ? 'Next Photo' : 'Finish Round'}
                    </ThemedText>
                  </TouchableOpacity>
                )}

                {/* General waiting indicator for non-host & non-owner players */}
                {!isHost && !isOwner && owner && (
                  <View className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/40 flex-row items-center justify-center gap-3 w-full">
                    <ModernLoader size={16} color="#4f46e5" strokeWidth={2} />
                    <ThemedText className="text-center text-slate-500 text-xs font-semibold">
                      Waiting for {owner.name} to explain...
                    </ThemedText>
                  </View>
                )}

              </Animated.View>
            </>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
