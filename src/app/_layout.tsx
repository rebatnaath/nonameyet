import '../global.css';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="host"
        options={{ presentation: 'modal', gestureEnabled: false }}
      />
      <Stack.Screen
        name="join"
        options={{ presentation: 'modal', gestureEnabled: false }}
      />
      <Stack.Screen
        name="lobby"
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="upload"
        options={{ presentation: 'modal', gestureEnabled: false }}
      />
      <Stack.Screen
        name="reveal"
        options={{ gestureEnabled: false }}
      />
    </Stack>
  );
}
