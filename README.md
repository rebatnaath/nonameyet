# Photo Reveal Game (Expo)

A real-time multiplayer social party game built with React Native (Expo) and Supabase.

## 🎮 How to Play

1. **Host a Game**: A host creates a room and selects a theme (e.g., "After Party", "Workplace").
2. **Join the Lobby**: Friends join the room using a 4-character room code.
3. **Upload Phase**: All players secretly choose an image from their camera roll that fits the theme within the time limit.
4. **Reveal Phase**: The host taps through the submitted photos one by one. The app automatically assigns a random player to ask the photo owner a question about the picture!

## ✨ Features Added

- **Real-time Multiplayer Sync**: Supabase Realtime seamlessly syncs lobby settings, photo submissions, and reveal phases across all connected devices.
- **Supabase Storage**: Photos are temporarily uploaded to a secure Supabase Storage bucket and displayed simultaneously on everyone's phones.
- **Kitten Avatars**: Every player is dynamically assigned a unique, adorable kitten avatar using Robohash based on their player ID! 🐱
- **Minimalist Aesthetic UI**: Built with NativeWind, featuring a beautifully clean, simple, and responsive layout.
- **Streamlined Photo Picker**: Removed unnecessary camera buttons to provide a perfectly centered, modern "Choose an Image" upload component.
- **Host Controls**: The Host has full control over when to advance to the next photo, finish the round, or play again.