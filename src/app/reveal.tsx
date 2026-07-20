import { useEffect } from 'react';
import { View, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenWrapper } from '@/components/screen-wrapper';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { useRoom } from '@/hooks/use-room';

export default function RevealScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ room: string; playerId: string }>();
  const { getRoom, subscribeToRoom, nextRevealPhoto, resetGame, leaveRoom } = useRoom();

  const roomCode = params.room ?? '';
  const playerId = params.playerId ?? '';
  const room = getRoom(roomCode);
  
  useEffect(() => {
    if (roomCode) {
      return subscribeToRoom(roomCode);
    }
  }, [roomCode, subscribeToRoom]);
  
  // Navigate out if status changes back to lobby
  useEffect(() => {
    if (room?.status === 'lobby') {
      router.replace(`/lobby?code=${roomCode}&playerId=${playerId}`);
    }
  }, [room?.status, roomCode, playerId, router]);

  const handleNext = () => {
    nextRevealPhoto(roomCode);
  };

  const handleReplay = () => {
    resetGame(roomCode);
  };

  const handleExit = () => {
    leaveRoom(roomCode, playerId);
    router.replace('/');
  };

  if (!room) {
    return (
      <ScreenWrapper options={{ headerShown: false, gestureEnabled: false }}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4f46e5" />
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

  return (
    <ScreenWrapper options={{ headerShown: false, gestureEnabled: false }}>
      <ScrollView className="flex-1 px-6 py-8">
        <View className="w-full max-w-md mx-auto items-center gap-6 pb-20">
          <Animated.View entering={FadeInDown.duration(600)} className="items-center">
            <ThemedText type="subtitle" className="font-black tracking-tight mb-1 text-center">
              {isFinished ? 'Round Finished!' : 'Reveal Phase'}
            </ThemedText>
            {!isFinished && revealOrder.length > 0 && (
              <ThemedText type="small" className="text-slate-400 text-center">
                Photo {currentRevealIndex + 1} of {revealOrder.length}
              </ThemedText>
            )}
          </Animated.View>

          {isFinished ? (
            <Animated.View entering={ZoomIn.duration(400)} className="w-full gap-4 mt-10">
              <ThemedText className="text-center text-slate-500 dark:text-slate-400 mb-6 text-lg">
                All photos have been revealed!
              </ThemedText>
              
              {isHost ? (
                <>
                  <TouchableOpacity
                    onPress={handleReplay}
                    className="w-full bg-indigo-600 rounded-2xl py-4 items-center shadow-lg active:opacity-80"
                  >
                    <ThemedText className="text-white text-lg font-bold tracking-wide">
                      Replay Again
                    </ThemedText>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={handleExit}
                    className="w-full bg-slate-200 dark:bg-slate-800 rounded-2xl py-4 items-center active:opacity-80 mt-2"
                  >
                    <ThemedText className="text-slate-900 dark:text-white text-lg font-bold tracking-wide">
                      Exit Game
                    </ThemedText>
                  </TouchableOpacity>
                </>
              ) : (
                <View className="items-center mt-4">
                  <ActivityIndicator color="#4f46e5" className="mb-4" />
                  <ThemedText className="text-center text-slate-500">
                    Waiting for host to choose next action...
                  </ThemedText>
                  <TouchableOpacity
                    onPress={handleExit}
                    className="w-full bg-slate-200 dark:bg-slate-800 rounded-2xl py-4 items-center active:opacity-80 mt-10"
                  >
                    <ThemedText className="text-slate-900 dark:text-white text-lg font-bold tracking-wide">
                      Leave Room
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          ) : (
            <>
              {/* Photo Card */}
              <Animated.View entering={ZoomIn.duration(400)} className="w-full">
                <View className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-[24px] p-4 shadow-lg w-full items-center">
                  {photoUrl ? (
                    <Image
                      source={{ uri: photoUrl }}
                      className="w-full h-80 rounded-xl mb-4 bg-slate-100 dark:bg-slate-800"
                      resizeMode="contain"
                    />
                  ) : (
                    <View className="w-full h-80 rounded-xl mb-4 bg-slate-100 dark:bg-slate-800 items-center justify-center">
                      <ThemedText className="text-slate-400">Loading Image...</ThemedText>
                    </View>
                  )}
                  
                  <View className="bg-indigo-50 dark:bg-indigo-900/30 w-full rounded-xl p-4 items-center mb-2">
                    <ThemedText className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                      Photo uploaded by {owner?.name || 'Unknown'}
                    </ThemedText>
                  </View>
                  
                  {asker && (
                    <View className="w-full pt-4 border-t border-slate-100 dark:border-slate-800/50 items-center">
                      <ThemedText className="text-center font-semibold text-slate-700 dark:text-slate-300">
                        <ThemedText className="font-bold text-indigo-500">{asker.name}</ThemedText>, ask a question!
                      </ThemedText>
                      <ThemedText type="small" className="text-center text-slate-400 mt-1">
                        The question rotation will go clockwise after them.
                      </ThemedText>
                    </View>
                  )}
                </View>
              </Animated.View>

              {/* Host Controls */}
              {isHost && (
                <Animated.View entering={FadeInDown.delay(300).duration(400)} className="w-full mt-4">
                  <TouchableOpacity
                    onPress={handleNext}
                    className="w-full bg-indigo-600 rounded-2xl py-4 items-center shadow-lg shadow-indigo-600/30 active:opacity-80"
                  >
                    <ThemedText className="text-white text-lg font-bold tracking-wide">
                      {currentRevealIndex < revealOrder.length - 1 ? 'Turn to Next Photo' : 'Finish Round'}
                    </ThemedText>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
