import { useEffect, useState } from 'react';
import { View, Pressable, Image, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ScreenWrapper } from '@/components/screen-wrapper';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { useRoom } from '@/hooks/use-room';
import { useTempPhotoStorage } from '@/hooks/use-temp-photo-storage';

export default function RevealScreen() {
  const params = useLocalSearchParams<{ room: string; playerId: string }>();
  const { getRoom } = useRoom();
  const { photos } = useTempPhotoStorage();

  const room = getRoom(params.room ?? '');
  const photoEntries = Array.from(photos.entries());

  return (
    <ScreenWrapper options={{ headerShown: false, gestureEnabled: false }}>
      <ScrollView className="flex-1 px-6 py-8">
        <View className="w-full max-w-md mx-auto items-center gap-6">
          <Animated.View entering={FadeInDown.duration(600)} className="items-center">
            <ThemedText type="subtitle" className="font-black tracking-tight mb-1">
              Reveal Phase
            </ThemedText>
            <ThemedText type="small" className="text-slate-400">
              All photos submitted! Time to reveal.
            </ThemedText>
          </Animated.View>

          {photoEntries.length === 0 ? (
            <View className="items-center gap-4">
              <ThemedText className="text-slate-500 dark:text-slate-400">
                No photos found in storage.
              </ThemedText>
            </View>
          ) : (
            <View className="w-full gap-4">
              {photoEntries.map(([key, photo]) => (
                <Animated.View key={key} entering={ZoomIn.duration(400)}>
                  <View className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-[24px] p-4 shadow-lg">
                    <Image
                      source={{ uri: photo.uri }}
                      className="w-full h-64 rounded-xl mb-3"
                      resizeMode="cover"
                    />
                    <ThemedText type="small" className="text-xs font-mono text-slate-400">
                      {photo.fileName}
                    </ThemedText>
                  </View>
                </Animated.View>
              ))}
            </View>
          )}

          {room && (
            <View className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-[24px] p-5 shadow-lg w-full">
              <ThemedText className="font-bold mb-2">Players in room</ThemedText>
              {room.players.map((p) => (
                <View key={p.id} className="flex-row items-center gap-2 py-1">
                  <ThemedText className={p.isHost ? 'font-bold text-indigo-600' : ''}>
                    {p.name} {p.isHost ? '(Host)' : ''}
                  </ThemedText>
                  {room.submittedPlayerIds.includes(p.id) ? (
                    <ThemedText type="small" className="text-green-500">✓ Submitted</ThemedText>
                  ) : (
                    <ThemedText type="small" className="text-red-400">✗ Skipped</ThemedText>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
