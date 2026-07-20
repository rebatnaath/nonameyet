import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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
  return new Map();
}

function saveRooms(rooms: Map<string, Room>) {
  // AsyncStorage would go here for React Native, but in-memory is fine for now
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

  const createRoom = useCallback(async (hostName: string): Promise<RoomResult> => {
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

    await supabase.from('rooms').insert({
      code,
      host_id: hostId,
      status: room.status,
      settings: room.settings
    });

    await supabase.from('players').insert({
      id: hostId,
      room_code: code,
      name: hostName,
      is_host: true
    });

    inMemoryRooms.set(code, room);
    notify();
    return { room, playerId: hostId };
  }, []);

  const joinRoom = useCallback(async (code: string, playerName: string): Promise<RoomResult | null> => {
    const playerId = generateId();
    
    const { error } = await supabase.from('players').insert({
      id: playerId,
      room_code: code,
      name: playerName,
      is_host: false
    });

    if (error) {
      console.error('Failed to join room in Supabase', error);
      return null;
    }

    let room = inMemoryRooms.get(code);
    if (!room) {
      const { data: roomData } = await supabase.from('rooms').select('*').eq('code', code).single();
      const { data: playersData } = await supabase.from('players').select('*').eq('room_code', code);
      
      if (!roomData) return null;
      
      room = {
        code: roomData.code,
        hostId: roomData.host_id,
        players: playersData?.map((p: any) => ({
          id: p.id,
          name: p.name,
          isHost: p.is_host
        })) || [],
        settings: roomData.settings,
        status: roomData.status,
        submittedPlayerIds: [],
        submissionDeadline: 0,
      };
    } else {
      room.players.push({ id: playerId, name: playerName, isHost: false });
    }

    inMemoryRooms.set(code, room);
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

  const subscribeToRoom = useCallback((code: string) => {
    const fetchRoomState = async () => {
      const { data: roomData } = await supabase.from('rooms').select('*').eq('code', code).maybeSingle();
      const { data: playersData } = await supabase.from('players').select('*').eq('room_code', code);
      if (!roomData) return;
      
      const room: Room = {
        code: roomData.code,
        hostId: roomData.host_id,
        players: playersData?.map((p: any) => ({
          id: p.id,
          name: p.name,
          isHost: p.is_host
        })) || [],
        settings: roomData.settings,
        status: roomData.status,
        submittedPlayerIds: [],
        submissionDeadline: 0,
      };
      
      inMemoryRooms.set(code, room);
      notify();
    };

    const channel = supabase.channel(`room_${code}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `code=eq.${code}` }, fetchRoomState)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `room_code=eq.${code}` }, fetchRoomState)
      .subscribe();

    // Initial fetch to sync up
    fetchRoomState();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const exists = useCallback(async (code: string): Promise<boolean> => {
    if (inMemoryRooms.has(code)) return true;
    const { data } = await supabase.from('rooms').select('code').eq('code', code).maybeSingle();
    return !!data;
  }, []);

  return {
    createRoom,
    joinRoom,
    leaveRoom,
    updateSettings,
    startGame,
    submitPhoto,
    getRoom,
    subscribeToRoom,
    exists,
  };
}
