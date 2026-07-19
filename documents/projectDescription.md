# Photo Reveal Party Game — Game Design Document

## 1. Overview
A multiplayer social party game where players submit personal photos around a shared theme, then take turns having their photo revealed and explained to the group. Other players interrogate the photo owner with questions. Owners can dodge questions using a limited pool of skips — burn through them all, and a punishment awaits.

*   **Platform & Tech Stack:** React Native via Expo (mobile, real-time multiplayer) styled with Tailwind CSS (NativeWind)
*   **Players per room:** 3–10 (recommended sweet spot: 4–8)
*   **Session length:** ~15–30 min depending on player count

---

## 2. Room Lifecycle

### 2.1 Room Creation
*   Host creates a room $\rightarrow$ system generates a unique room code (4–6 alphanumeric characters).
*   Host lands in a lobby screen showing:
    *   Room code (shareable/copyable)
    *   List of joined players (avatar + name)
    *   Game settings (theme, skip count, punishment mode)
    *   "Start Game" button (host-only, disabled until min player count met)

### 2.2 Joining
*   Players enter the room code $\rightarrow$ land in the same lobby.
*   Each player picks a display name + avatar (or auto-assigned).
*   Players see a "waiting for host to start" state.

### 2.3 Pre-Game Settings (Host-configurable)

| Setting | Options |
| :--- | :--- |
| **Theme** | After Party / Nature / Workplace / Hometown-Country / Random |
| **Skip count mode** | Fixed (host sets a number, e.g., 3, same for everyone) / Random (each player secretly gets a random count, e.g., 1–5) |
| **Skip visibility** | Visible (everyone sees everyone's remaining skips) / Hidden (no one can see anyone's count — not even their own) |
| **Punishment mode** | Predefined list / Punishment Wheel / Custom (player-submitted) |
| **Min players to start** | Default 3 |

> **Edge case:** If theme is "Random," system randomly assigns one of the fixed themes when the game starts (not per-photo — one theme for the whole session, for consistency).

---

## 3. Photo Submission Phase
*   After the host starts the game, all players are pushed to an upload screen.
*   Each player must submit exactly one photo matching the theme.
*   A countdown timer (e.g., 60–90 sec) enforces pace; if a player doesn't submit in time, they're skipped from this game's photo pool (or assigned a placeholder — decide policy).
*   Once all players have submitted (or timer ends), the game moves to the Reveal Phase.
*   **Storage policy:** Photos are stored temporarily only, for the duration of the active game session. No permanent storage, no history/recap feature that retains images. This avoids privacy/data-retention concerns entirely — nothing persists after the room closes.

### Edge cases to define:
*   What happens if a player disconnects mid-upload? $\rightarrow$ Auto-skip them for this round, allow reconnect before next phase starts.
*   Minimum players needed for a valid photo pool (e.g., can't play with only 1 submitted photo).
*   Content moderation: basic client-side check (file size/type) — no image content moderation planned initially; consider reporting/flagging for future.

---

## 4. Reveal Phase (Core Gameplay Loop)

### 4.1 Photo Queue Logic
*   All submitted photos are shuffled into a randomized, non-repeating queue for the round (e.g., $P_1 \rightarrow P_3 \rightarrow P_2 \rightarrow P_4$).
*   Every player's photo appears exactly once per full cycle.
*   After a full cycle completes, if the game continues (multi-round mode), reshuffle and start a new cycle.

### 4.2 Turn Structure (per photo)
*   **Reveal:** Selected photo is displayed to all players.
*   **Explanation:** Photo owner gives an initial explanation/story (soft-timed, e.g., 20–30 sec).
*   **Question Round:**
    *   Other players queue up to ask one question at a time (turn-based — enforced via a "raise hand" or auto-rotating question order).
    *   Owner must answer, OR use a Skip.
    *   Repeat until either: a fixed number of questions is reached (e.g., 3–5 per photo), or players stop asking / host advances.
*   **Advance:** Move to next photo in queue.

### 4.3 Skip System
*   **Pool structure:** Skips are drawn from a shared pool for the entire game session (not per-round). Every player has their own independent pool, usable any time across the whole game.
*   **Skip Count Mode** (host-configured pre-game):
    *   *Fixed:* Host sets one number that applies to every player (e.g., everyone gets 3 skips).
    *   *Random:* Each player is secretly assigned a random skip count at game start (e.g., somewhere between 1–5). Players don't know if they got more or fewer than others — adds asymmetry and unpredictability.
*   **Skip Visibility** (host-configured pre-game):
    *   *Visible:* Everyone can see everyone's remaining skip count at all times (transparency = strategic, players can calculate when someone's about to run out).
    *   *Hidden:* No one can see anyone's remaining count — including the player's own. This means a punishment can trigger completely out of nowhere for the player themselves, since they don't know exactly when they'll run out. Maximizes surprise/tension.
*   **Trigger:** When a player's pool hits 0 and they attempt to skip again $\rightarrow$ Punishment Trigger fires (in Hidden mode, this is the only moment a player learns their skips ran out).

> **Edge case:** Does asking to skip cost a skip even if the question was harmless? $\rightarrow$ Yes, any invoked skip decrements the pool regardless of question content — keeps it simple and consistent.
>
> **Edge case (Hidden mode):** Should there be any warning before the pool hits zero (e.g., a subtle low-skip indicator), or should it be a total blackout with zero feedback until the punishment fires? Worth deciding — full blackout is more dramatic, a subtle cue is more player-friendly.

---

## 5. Punishment System
Two host-configurable modes (can also allow combining):

### 5.1 Predefined Punishment List
*   Host (or all players, pre-game) selects from a curated list of punishment options during setup (e.g., "sing a song," "impersonate someone," "answer the next 2 questions truthfully with no skips," etc.).
*   When triggered, the game randomly selects one from the chosen list.

### 5.2 Punishment Wheel
*   A spin-the-wheel UI element appears when a punishment is triggered.
*   Wheel segments = the punishment pool selected during setup.
*   Adds visual/dramatic flair — lands on a punishment via animation.

### 5.3 Custom Punishments
*   During lobby/setup, players can submit their own punishment ideas (text input) which get added to the shared pool.
*   Host can approve/moderate submissions before they go live (optional toggle).

> **Edge case:** What happens after a punishment is served — does the skip pool reset, or stay at 0 for the rest of the game (meaning every future refusal = another punishment)? $\rightarrow$ Recommended default: pool stays at 0; every subsequent skip attempt triggers another punishment. This escalates stakes naturally.

---

## 6. Game End Conditions
*   **Single Round Mode:** Game ends after every player's photo has been revealed once.
*   **Multi-Round Mode:** Host can configure the game to loop for $N$ cycles or until a timer runs out.
*   **End screen:** recap of punishments served, "funniest moment" style summary (stretch goal, text-only, no stored images), option to play again with new photos/theme.
*   **On room close** (game end or all players leave): All uploaded photos are permanently deleted from storage. No copy is retained anywhere — server or client.

---

## 7. Suggested Data Model (high-level, for later schema design)
*   **Room:** `id`, `code`, `hostId`, `theme`, `skipCountMode` (fixed/random), `skipVisibility` (visible/hidden), `punishmentMode`, `status`
*   **Player:** `id`, `roomId`, `name`, `avatar`, `skipsAssigned`, `skipsRemaining`, `isConnected`
*   **Photo:** `id`, `roomId`, `ownerId`, `imageUrl` (temporary storage path), `revealed` (bool), `expiresAt` (auto-delete timestamp)
*   **Round:** `id`, `roomId`, `photoQueue` (ordered list), `currentIndex`
*   **Question:** `id`, `photoId`, `askedByPlayerId`, `wasSkipped` (bool), `timestamp`
*   **Punishment:** `id`, `roomId`, `triggeredByPlayerId`, `punishmentText`, `method` (wheel/list/custom), `completed` (bool)