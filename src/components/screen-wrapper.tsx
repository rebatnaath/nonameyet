import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

type ScreenWrapperProps = {
  children: React.ReactNode;
  options?: any;
  className?: string;
};

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ 
  children, 
  options = { headerShown: false },
  className = ''
}) => {
  return (
    <SafeAreaView className={`flex-1 bg-slate-50 dark:bg-slate-950 ${className}`}>
      <Stack.Screen options={options} />
      {children}
    </SafeAreaView>
  );
};
