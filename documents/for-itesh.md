# Guide for Itesh

Welcome to the project! Follow these steps to get your local environment set up and start collaborating.

## 1. Prerequisites
Make sure you have the following installed on your machine:
- **Node.js** (LTS version recommended)
- **Git**
- **Expo Go** app on your phone (if you want to test on a physical device) or a local emulator/simulator (Android Studio / Xcode).

## 2. Pull the Code
First, clone the repository or pull the latest changes if you already have it:

```bash
# If cloning for the first time:
git clone <repository_url>
cd nonameyet

# If you already have it cloned:
git pull origin main
```

## 3. Install Dependencies
Once you have the latest code, install all the project dependencies using `npm`. If any new packages are added to the project, the exact commands to install them will be logged here so you can easily copy and paste them.

First, run the standard install command to sync everything:
```bash
npm install
```

**Recently Added Dependencies (Copy & Paste to install):**
```bash
npm install nativewind tailwindcss
```

## 4. Run the Development Server
Start the Expo development server:

```bash
npm run start
# OR
npx expo start
```

This will give you a QR code in the terminal.
- **Physical Device**: Scan the QR code with your phone's camera (iOS) or the Expo Go app (Android).
- **Emulator/Simulator**: Press `a` to run on Android or `i` to run on iOS (you need to have them set up on your machine).

## 5. Development Workflow
We are following strict clean code principles and naming conventions. Please review the following documents before writing code:
- `documents/clean-code.md` - Core naming conventions, method design, intent revelation principle, and comments guide.
- `documents/reactNativeCodingPrinciples.md` - TypeScript, React Native, and Expo specific style, structure, and optimization principles.
- `documents/projectDescription.md` - The Game Design Document to understand the core game loop and features.

## 6. Making Changes
1. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Stage all your changes:
   ```bash
   git add .
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add: your feature description"
   ```
4. Push your branch and create a Pull Request:
   ```bash
   git push origin feature/your-feature-name
   ```

Happy coding! Let me know if you run into any issues.
