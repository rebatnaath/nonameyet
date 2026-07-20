import '../global.css';
import { Stack } from 'expo-router';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="host"
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="join"
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="lobby"
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="upload"
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="reveal"
        options={{ gestureEnabled: false }}
      />
    </Stack>
  );
}
