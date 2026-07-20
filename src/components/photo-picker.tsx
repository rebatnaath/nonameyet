import { View, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { ThemedText } from './themed-text';

type PhotoPickerProps = {
  onPhotoSelect: (photo: { uri: string; fileName: string; mimeType: string }) => void;
  onPhotoRemove: () => void;
  selectedUri: string | null;
};

export function PhotoPicker({ onPhotoSelect, onPhotoRemove, selectedUri }: PhotoPickerProps) {
  const [permissionResponse, requestPermission] = ImagePicker.useMediaLibraryPermissions();

  const pickFromGallery = async () => {
    if (!permissionResponse?.granted) {
      const result = await requestPermission();
      if (!result.granted) return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      onPhotoSelect({
        uri: asset.uri,
        fileName: asset.fileName ?? `photo_${Date.now()}.jpg`,
        mimeType: asset.mimeType ?? 'image/jpeg',
      });
    }
  };


  if (selectedUri) {
    return (
      <Animated.View entering={FadeIn} exiting={FadeOut} className="items-center gap-4">
        <View className="w-64 h-64 rounded-2xl overflow-hidden border-2 border-indigo-400/30 shadow-lg">
          <Image
            source={{ uri: selectedUri }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
        <TouchableOpacity
          onPress={onPhotoRemove}
          className="bg-red-500/10 border border-red-400/30 rounded-full py-3 px-6 active:opacity-70 mt-2"
        >
          <ThemedText className="text-red-500 font-bold text-sm text-center">Remove & Pick Again</ThemedText>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <View className="items-center justify-center w-full max-w-sm">
      <TouchableOpacity
        onPress={pickFromGallery}
        className="w-full bg-slate-100 dark:bg-slate-800/80 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-[32px] h-64 items-center justify-center p-6 active:opacity-70"
      >
        <View className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full items-center justify-center mb-4">
          <ThemedText className="text-2xl">🖼️</ThemedText>
        </View>
        <ThemedText className="text-slate-900 dark:text-white text-xl font-black mb-2 text-center">
          Choose an Image
        </ThemedText>
        <ThemedText className="text-slate-500 dark:text-slate-400 text-center text-sm px-4">
          Tap here to browse your gallery
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}
