import { useState, useCallback } from 'react';

export type TempPhoto = {
  uri: string;
  fileName: string;
  mimeType: string;
  timestamp: number;
};

const store = new Map<string, TempPhoto>();

export function useTempPhotoStorage() {
  const [photos, setPhotos] = useState<Map<string, TempPhoto>>(new Map(store));

  const storePhoto = useCallback((key: string, photo: TempPhoto) => {
    store.set(key, photo);
    setPhotos(new Map(store));
  }, []);

  const getPhoto = useCallback((key: string): TempPhoto | undefined => {
    return store.get(key);
  }, []);

  const removePhoto = useCallback((key: string) => {
    store.delete(key);
    setPhotos(new Map(store));
  }, []);

  const clearAll = useCallback(() => {
    store.clear();
    setPhotos(new Map(store));
  }, []);

  return {
    photos,
    storePhoto,
    getPhoto,
    removePhoto,
    clearAll,
  };
}
