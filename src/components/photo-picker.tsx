import { View, Pressable, Image } from 'react-native';
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
  const [cameraPermissionResponse, requestCameraPermission] = ImagePicker.useCameraPermissions();

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

  const takePhoto = async () => {
    if (!cameraPermissionResponse?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) return;
    }

    const result = await ImagePicker.launchCameraAsync({
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
        <Pressable
          onPress={onPhotoRemove}
          className="bg-red-500/10 border border-red-400/30 rounded-xl py-2 px-5 active:opacity-70"
        >
          <ThemedText className="text-red-500 font-semibold text-sm">Remove & Choose Again</ThemedText>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <View className="items-center gap-4">
      <Pressable
        onPress={pickFromGallery}
        className="w-full bg-indigo-600 active:bg-indigo-700 rounded-2xl py-4 flex-row items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
      >
        <ThemedText className="text-white text-lg font-bold">Pick from Gallery</ThemedText>
      </Pressable>

      <Pressable
        onPress={takePhoto}
        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 flex-row items-center justify-center gap-2 active:opacity-70"
      >
        <ThemedText className="text-slate-900 dark:text-white text-lg font-bold">Take a Photo</ThemedText>
      </Pressable>
    </View>
  );
}
