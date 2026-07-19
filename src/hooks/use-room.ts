import { useState, useCallback, useEffect } from 'react';

export type Player = {
  id: string;
  name: string;
  isHost: boolean;
};

export type Theme = 'After Party' | 'Nature' | 'Workplace' | 'Hometown-Country' | 'Random';
export type SkipCountMode = 'fixed' | 'random';
export type SkipVisibility = 'visible' | 'hidden';
export type PunishmentMode = 'predefined' | 'wheel' | 'custom';
export type RoomStatus = 'lobby' | 'uploading' | 'revealing' | 'finished';

export type GameSettings = {
  theme: Theme;
  skipCountMode: SkipCountMode;
  fixedSkipCount: number;
  skipVisibility: SkipVisibility;
  punishmentMode: PunishmentMode;
  minPlayers: number;
};

export type Room = {
  code: string;
  hostId: string;
  players: Player[];
  settings: GameSettings;
  status: RoomStatus;
  submittedPlayerIds: string[];
  submissionDeadline: number;
};

export type RoomResult = {
  room: Room;
  playerId: string;
};

const DEFAULT_SETTINGS: GameSettings = {
  theme: 'Random',
  skipCountMode: 'fixed',
  fixedSkipCount: 3,
  skipVisibility: 'visible',
  punishmentMode: 'wheel',
  minPlayers: 2,
};

const STORAGE_KEY = 'photoreveal_rooms';

function loadRooms(): Map<string, Room> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Map();
    const entries: Room[] = JSON.parse(raw);
    return new Map(entries.map((r) => [r.code, {
      ...r,
      submittedPlayerIds: r.submittedPlayerIds ?? [],
      submissionDeadline: r.submissionDeadline ?? 0,
    }]));
  } catch {
    return new Map();
  }
}

function saveRooms(rooms: Map<string, Room>) {
  try {
    const entries = Array.from(rooms.values());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {}
}

const inMemoryRooms = loadRooms();
const listeners = new Set<() => void>();

function notify() {
  saveRooms(inMemoryRooms);
  listeners.forEach((fn) => fn());
}

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  while (inMemoryRooms.has(code)) {
    code = '';
    for (let i = 0; i < 4; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return code;
}

function generateId(): string {
  return `p_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export function useRoom() {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const handler = () => forceUpdate((n) => n + 1);
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  // Listen for cross-tab storage changes
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const fresh = loadRooms();
        inMemoryRooms.clear();
        fresh.forEach((v, k) => inMemoryRooms.set(k, v));
        forceUpdate((n) => n + 1);
      }
    };
    try {
      window.addEventListener('storage', onStorage);
      return () => window.removeEventListener('storage', onStorage);
    } catch {}
  }, []);

  const createRoom = useCallback((hostName: string): RoomResult => {
    const code = generateRoomCode();
    const hostId = generateId();
    const room: Room = {
      code,
      hostId,
      players: [{ id: hostId, name: hostName, isHost: true }],
      settings: { ...DEFAULT_SETTINGS },
      status: 'lobby',
      submittedPlayerIds: [],
      submissionDeadline: 0,
    };
    inMemoryRooms.set(code, room);
    notify();
    return { room, playerId: hostId };
  }, []);

  const joinRoom = useCallback((code: string, playerName: string): RoomResult | null => {
    // Sync from localStorage in case another tab created the room
    const fresh = loadRooms();
    inMemoryRooms.clear();
    fresh.forEach((v, k) => inMemoryRooms.set(k, v));
    const room = inMemoryRooms.get(code);
    if (!room || room.status !== 'lobby') return null;
    const playerId = generateId();
    room.players.push({ id: playerId, name: playerName, isHost: false });
    notify();
    return { room, playerId };
  }, []);

  const leaveRoom = useCallback((code: string, playerId: string) => {
    const room = inMemoryRooms.get(code);
    if (!room) return;
    room.players = room.players.filter((p) => p.id !== playerId);
    if (room.players.length === 0) inMemoryRooms.delete(code);
    notify();
  }, []);

  const updateSettings = useCallback((code: string, settings: Partial<GameSettings>) => {
    const room = inMemoryRooms.get(code);
    if (!room) return;
    room.settings = { ...room.settings, ...settings };
    notify();
  }, []);

  const startGame = useCallback((code: string) => {
    const room = inMemoryRooms.get(code);
    if (!room) return;
    room.status = 'uploading';
    room.submittedPlayerIds = [];
    room.submissionDeadline = Date.now() + 90000; // 90 seconds
    notify();
  }, []);

  const getRoom = useCallback((code: string): Room | undefined => {
    const fresh = loadRooms();
    inMemoryRooms.clear();
    fresh.forEach((v, k) => inMemoryRooms.set(k, v));
    return inMemoryRooms.get(code);
  }, []);

  const submitPhoto = useCallback((code: string, playerId: string) => {
    const room = inMemoryRooms.get(code);
    if (!room) return;
    if (!room.submittedPlayerIds.includes(playerId)) {
      room.submittedPlayerIds.push(playerId);
    }
    const allSubmitted = room.submittedPlayerIds.length >= room.players.length;
    if (allSubmitted) {
      room.status = 'revealing';
    }
    notify();
  }, []);

  const exists = useCallback((code: string): boolean => {
    return loadRooms().has(code);
  }, []);

  return {
    createRoom,
    joinRoom,
    leaveRoom,
    updateSettings,
    startGame,
    submitPhoto,
    getRoom,
    exists,
  };
}
