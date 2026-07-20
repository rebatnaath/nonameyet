import { useState, useEffect, useRef, useCallback } from 'react';
import { View, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenWrapper } from '@/components/screen-wrapper';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { PhotoPicker } from '@/components/photo-picker';
import { useRoom } from '@/hooks/use-room';
import { ModernLoader } from '@/components/ui/modern-loader';

export default function UploadScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ room?: string; playerId?: string; theme?: string; duration?: string }>();
  const { getRoom, submitPhoto, subscribeToRoom, addPhotoUrl } = useRoom();

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
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (roomCode) {
      return subscribeToRoom(roomCode);
    }
  }, [roomCode, subscribeToRoom]);

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
      if (timedOut) {
        const skipped = room.players.filter((p) => !room.submittedPlayerIds.includes(p.id)).length;
        setWaitingMessage(`Time's up! ${submittedCount}/${total} submitted, ${skipped} skipped`);
      } else {
        setWaitingMessage(`Waiting for other players... (${submittedCount}/${total} submitted)`);
      }
      // Check global deadline
      if (room.submissionDeadline > 0 && Date.now() > room.submissionDeadline) {
        room.status = 'revealing';
        router.replace(`/reveal?room=${roomCode}&playerId=${playerId}`);
      }
    }, 2000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [submitted, timedOut, roomCode, playerId, getRoom, router]);

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
    
    // Instantly transition UI so it doesn't feel stuck
    setSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const pid = playerId || 'unknown';
    
    // Run the heavy base64 decoding and upload slightly after to let the UI update first
    setTimeout(async () => {
      try {
        const base64 = await FileSystem.readAsStringAsync(selectedPhoto.uri, { encoding: 'base64' });
        // Use a timestamp to prevent caching old photos from previous rounds
        const filePath = `${roomCode}/${pid}_${Date.now()}.jpg`;
        
        await supabase.storage.from('game_photos').upload(filePath, decode(base64), {
          contentType: selectedPhoto.mimeType || 'image/jpeg',
          upsert: true
        });
        
        const { data: urlData } = supabase.storage.from('game_photos').getPublicUrl(filePath);
        await addPhotoUrl(roomCode, pid, urlData.publicUrl);
      } catch (err) {
        console.error('Failed to upload photo to Supabase:', err);
      }
      
      if (roomCode && pid) submitPhoto(roomCode, pid);
    }, 100);
  }, [selectedPhoto, roomCode, playerId, submitPhoto, addPhotoUrl]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerStyle = timeLeft <= 10 ? { color: '#ef4444' } : {};
  const progress = timeLeft / totalSeconds;

  const storedCount = Array.from(photos.entries()).length;

  if (submitted) {
    return (
      <ScreenWrapper options={{ headerShown: false, gestureEnabled: false }}>
        <View className="flex-1 items-center justify-center px-6">
          <View className="items-center w-full max-w-md">
            <Animated.View entering={ZoomIn.duration(600).springify()} className="w-full">
              <View className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-8 items-center shadow-md w-full backdrop-blur-md mb-6">
                
                <View className="mb-6 items-center">
                  <ModernLoader size={60} color="#4f46e5" strokeWidth={3.5} />
                </View>

                <ThemedText type="subtitle" className="text-center font-black mb-2">
                  Photo Submitted!
                </ThemedText>
                
                <ThemedText className="text-center text-slate-500 dark:text-slate-400 text-sm">
                  {waitingMessage}
                </ThemedText>
              </View>
            </Animated.View>
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper options={{ headerShown: false, gestureEnabled: false }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1 px-6 py-8">
        <View className="flex-1 w-full max-w-md mx-auto justify-between gap-6 pb-8">
          
          {/* Header */}
          <Animated.View entering={FadeInDown.duration(600)} className="items-center w-full gap-2">
            <ThemedText type="subtitle" className="font-black tracking-tight text-center">
              Submit Your Photo
            </ThemedText>
            <View className="flex-row items-center gap-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/35 rounded-full px-4 py-1.5 mt-1 shadow-sm">
              <Ionicons name="sparkles-outline" size={14} color="#4f46e5" />
              <ThemedText type="small" className="text-slate-400 text-xs font-semibold">
                Active Theme:
              </ThemedText>
              <ThemedText className="text-indigo-600 dark:text-indigo-400 text-xs font-black">
                {theme}
              </ThemedText>
            </View>
          </Animated.View>

          {/* Timer Card */}
          <Animated.View entering={FadeInDown.delay(150).duration(600)} className="w-full">
            <View className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-5 items-center shadow-md w-full backdrop-blur-md">
              <View className="flex-row items-center gap-2 mb-2">
                <Ionicons name="time-outline" size={16} color={timeLeft <= 10 ? '#ef4444' : '#64748b'} />
                <ThemedText type="small" className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  Submission Window
                </ThemedText>
              </View>
              
              <ThemedText 
                className="text-4xl font-black tabular-nums tracking-wide text-slate-900 dark:text-white my-1"
                style={timerStyle}
              >
                {minutes}:{seconds.toString().padStart(2, '0')}
              </ThemedText>

              {/* Elegant Progress Bar */}
              <View className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-3">
                <View 
                  style={{
                    width: `${progress * 100}%`,
                    backgroundColor: timeLeft <= 10 ? '#ef4444' : timeLeft <= 30 ? '#f59e0b' : '#4f46e5',
                    height: '100%',
                    borderRadius: 9999
                  }} 
                />
              </View>
            </View>
          </Animated.View>

          {/* Photo Picker Area */}
          <Animated.View entering={FadeInDown.delay(300).duration(600)} className="items-center w-full">
            {timedOut && !selectedPhoto ? (
              <View className="items-center gap-4 bg-red-50/50 dark:bg-red-950/10 border border-red-200/30 rounded-3xl p-6 w-full">
                <View className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/50 items-center justify-center">
                  <Ionicons name="alert-circle" size={32} color="#ef4444" />
                </View>
                <ThemedText className="text-center text-red-500 font-bold text-lg">
                  Time's Up!
                </ThemedText>
                <ThemedText className="text-center text-slate-500 dark:text-slate-400 text-sm">
                  You didn't submit a photo in time. You will be skipped for this game.
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
          {selectedPhoto && !timedOut ? (
            <Animated.View entering={FadeInDown.delay(450).duration(600)} className="w-full">
              <TouchableOpacity
                onPress={handleSubmit}
                className="w-full flex-row items-center justify-center gap-2 bg-indigo-600 rounded-2xl py-4 active:opacity-75 shadow-md shadow-indigo-600/20"
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="#ffffff" />
                <ThemedText className="text-white text-base font-black uppercase tracking-wider">
                  Confirm & Submit
                </ThemedText>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <View className="h-14 w-full" /> /* Spacing helper */
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
