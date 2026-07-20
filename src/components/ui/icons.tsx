import React from 'react';
import { Ionicons } from '@expo/vector-icons';

export const CameraIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = 'currentColor' }) => {
  return <Ionicons name="camera-outline" size={size} color={color} />;
};

export const SparklesIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = 'currentColor' }) => {
  return <Ionicons name="sparkles-outline" size={size} color={color} />;
};

export const UsersIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = 'currentColor' }) => {
  return <Ionicons name="people-outline" size={size} color={color} />;
};
