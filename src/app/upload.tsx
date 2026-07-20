import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Pressable, Image, ScrollView } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenWrapper } from '@/components/screen-wrapper';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { PhotoPicker } from '@/components/photo-picker';
import { useTempPhotoStorage, type TempPhoto } from '@/hooks/use-temp-photo-storage';
import { useRoom } from '@/hooks/use-room';

export default function UploadScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ room?: string; playerId?: string; theme?: string; duration?: string }>();
  const { storePhoto, photos } = useTempPhotoStorage();
  const { getRoom, submitPhoto } = useRoom();

  const roomCode = params.room ?? '';
  const playerId = params.playerId ?? '';
  const theme = params.theme ?? 'Random';
  const totalSeconds = parseInt(params.duration ?? '75', 10);

  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [selectedUri, setSelectedUri] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<{ uri: string; fileName: string; mimeType: string } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [waitingMessage, setWaitingMessage] = useState('Waiting for other players...');
  const [showDebug, setShowDebug] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setTimedOut(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Poll for game status when waiting
  useEffect(() => {
    if (!submitted && !timedOut) return;
    pollRef.current = setInterval(() => {
      const room = getRoom(roomCode);
      if (!room) return;
      if (room.status === 'revealing') {
        router.replace(`/reveal?room=${roomCode}&playerId=${playerId}`);
        return;
      }
      const submittedCount = room.submittedPlayerIds.length;
      const total = room.players.length;
      const skipped = room.players.filter((p) => !room.submittedPlayerIds.includes(p.id)).length;
      if (timedOut || submitted) {
        setWaitingMessage(`${submittedCount}/${total} submitted, ${skipped} skipped`);
      }
      // Check global deadline
      if (room.submissionDeadline > 0 && Date.now() > room.submissionDeadline) {
        room.status = 'revealing';
        router.replace(`/reveal?room=${roomCode}&playerId=${playerId}`);
      }
    }, 2000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [submitted, timedOut, roomCode, playerId]);

  const handlePhotoSelect = useCallback((photo: { uri: string; fileName: string; mimeType: string }) => {
    setSelectedUri(photo.uri);
    setSelectedPhoto(photo);
  }, []);

  const handlePhotoRemove = useCallback(() => {
    setSelectedUri(null);
    setSelectedPhoto(null);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!selectedPhoto) return;
    const pid = playerId || 'unknown';
    const key = `${roomCode}_${pid}`;
    storePhoto(key, {
      ...selectedPhoto,
      timestamp: Date.now(),
    });
    if (roomCode && pid) submitPhoto(roomCode, pid);
    setSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [selectedPhoto, storePhoto, roomCode, playerId, submitPhoto]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerColor = timeLeft <= 10 ? 'text-red-500' : 'text-slate-900 dark:text-white';

  const storedCount = Array.from(photos.entries()).length;

  if (submitted) {
    return (
      <ScreenWrapper options={{ headerShown: false, gestureEnabled: false }}>
        <ScrollView className="flex-1 px-6 py-8">
          <View className="items-center">
            <Animated.View entering={ZoomIn.duration(600).springify()}>
              <View className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-[32px] p-8 items-center shadow-xl max-w-sm mb-6">
                <ThemedText type="title" className="text-center mb-4">
                  Photo Submitted!
                </ThemedText>
                <ThemedText className="text-center text-slate-500 dark:text-slate-400 mb-4">
                  {waitingMessage}
                </ThemedText>
                <View className="w-16 h-16 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mb-4" />
                <ThemedText className="text-center text-sm text-slate-400">
                  {storedCount} photo{storedCount !== 1 ? 's' : ''} in storage
                </ThemedText>
              </View>
            </Animated.View>

            <Pressable
              onPress={() => setShowDebug(!showDebug)}
              className="bg-slate-200 dark:bg-slate-800 rounded-xl py-2 px-6 mb-6 active:opacity-70"
            >
              <ThemedText className="text-sm font-semibold">
                {showDebug ? 'Hide' : 'Show'} Stored Photos ({storedCount})
              </ThemedText>
            </Pressable>

            {showDebug && (
              <View className="w-full max-w-sm gap-4">
                {Array.from(photos.entries()).map(([key, photo]) => (
                  <View
                    key={key}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm"
                  >
                    <Image
                      source={{ uri: photo.uri }}
                      className="w-full h-48 rounded-xl mb-3"
                      resizeMode="cover"
                    />
                    <ThemedText type="small" className="text-xs font-mono">
                      Key: {key}
                    </ThemedText>
                    <ThemedText type="small" className="text-xs font-mono">
                      File: {photo.fileName}
                    </ThemedText>
                    <ThemedText type="small" className="text-xs font-mono">
                      Stored: {new Date(photo.timestamp).toLocaleTimeString()}
                    </ThemedText>
                  </View>
                ))}
                {storedCount === 0 && (
                  <ThemedText className="text-center text-slate-400">
                    No photos in storage yet.
                  </ThemedText>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper options={{ headerShown: false, gestureEnabled: false }}>

      <View className="flex-1 px-6 py-8 w-full max-w-md mx-auto justify-between">
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(600)} className="items-center">
          <ThemedText type="subtitle" className="font-black tracking-tight mb-1">
            Submit Your Photo
          </ThemedText>
          <View className="flex-row items-center gap-2 mb-2">
            <ThemedText type="small" className="text-slate-400">
              Theme:
            </ThemedText>
            <View className="bg-indigo-100 dark:bg-indigo-900/40 rounded-full px-3 py-0.5">
              <ThemedText className="text-indigo-600 dark:text-indigo-400 text-sm font-bold">
                {theme}
              </ThemedText>
            </View>
          </View>
        </Animated.View>

        {/* Timer */}
        <Animated.View entering={FadeInDown.delay(150).duration(600)} className="items-center">
          <View className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-[24px] p-6 items-center shadow-lg w-full">
            <ThemedText type="small" className="text-slate-400 mb-2">
              Time Remaining
            </ThemedText>
            <ThemedText className={`text-5xl font-black tabular-nums ${timerColor}`}>
              {minutes}:{seconds.toString().padStart(2, '0')}
            </ThemedText>
          </View>
        </Animated.View>

        {/* Photo Picker Area */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)} className="items-center">
          {timedOut && !selectedPhoto ? (
            <View className="items-center gap-4">
              <View className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 items-center justify-center">
                <ThemedText className="text-3xl">⏰</ThemedText>
              </View>
              <ThemedText className="text-center text-red-500 font-bold text-lg">
                Time's Up!
              </ThemedText>
              <ThemedText className="text-center text-slate-500 dark:text-slate-400">
                You didn't submit a photo in time. You'll be skipped for this round.
              </ThemedText>
            </View>
          ) : (
            <PhotoPicker
              onPhotoSelect={handlePhotoSelect}
              onPhotoRemove={handlePhotoRemove}
              selectedUri={selectedUri}
            />
          )}
        </Animated.View>

        {/* Submit Button */}
        {selectedPhoto && !timedOut && (
          <Animated.View entering={FadeInDown.delay(450).duration(600)}>
            <Pressable
              onPress={handleSubmit}
              className="w-full bg-indigo-600 active:bg-indigo-700 rounded-2xl py-4 items-center shadow-lg shadow-indigo-600/30 active:scale-[0.98] transition-all"
            >
              <ThemedText className="text-white text-lg font-bold tracking-wide">
                Submit Photo
              </ThemedText>
            </Pressable>
          </Animated.View>
        )}
      </View>
    </ScreenWrapper>
  );
}
