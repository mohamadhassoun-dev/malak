import {
  AppState,
  CartItem,
  CompanyProfile,
  DailyClosingRecord,
  ExpenseRecord,
  InventoryItem,
  MenuItem,
  OrderRecord,
  OrderType,
  AppUser
} from '../types';
import {
  DEFAULT_COMPANY,
  DEFAULT_INVENTORY,
  DEFAULT_MENU,
  DEFAULT_USERS
} from '../data/defaultData';

const STORAGE_KEY = 'malak_sfiha_pos_v2';
const broadcast = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('malak_pos_sync')
  : null;

export function loadInitialState(): AppState {
  if (typeof window === 'undefined') {
    return createDefaultState();
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        menu: parsed.menu && parsed.menu.length ? parsed.menu : DEFAULT_MENU,
        tables: parsed.tables || createDefaultTables(),
        activeTable: parsed.activeTable || 1,
        currentOrderType: parsed.currentOrderType || 'hall',
        takeawayCart: parsed.takeawayCart || [],
        deliveryCart: parsed.deliveryCart || [],
        transactions: parsed.transactions || [],
        inventory: parsed.inventory && parsed.inventory.length ? parsed.inventory : DEFAULT_INVENTORY,
        expenses: parsed.expenses || [],
        company: { ...DEFAULT_COMPANY, ...(parsed.company || {}) },
        closings: parsed.closings || [],
        users: DEFAULT_USERS,
        activeUser: parsed.activeUser?.role === 'admin' ? parsed.activeUser : DEFAULT_USERS[1]
      };
    }
  } catch (err) {
    console.error('Failed to load local state, using defaults:', err);
  }

  return createDefaultState();
}

export function saveStateToStorage(state: AppState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (broadcast) {
      broadcast.postMessage({ type: 'STATE_UPDATED', timestamp: Date.now() });
    }
  } catch (err) {
    console.error('Failed to persist state:', err);
  }
}

export function subscribeToCrossTabSync(callback: () => void) {
  if (!broadcast) return () => {};
  const handler = (e: MessageEvent) => {
    if (e.data?.type === 'STATE_UPDATED') {
      callback();
    }
  };
  broadcast.addEventListener('message', handler);
  return () => broadcast.removeEventListener('message', handler);
}

function createDefaultTables(): Record<number, CartItem[]> {
  const tables: Record<number, CartItem[]> = {};
  for (let i = 1; i <= 8; i++) {
    tables[i] = [];
  }
  return tables;
}

function createDefaultState(): AppState {
  return {
    menu: DEFAULT_MENU,
    tables: createDefaultTables(),
    activeTable: 1,
    currentOrderType: 'hall',
    takeawayCart: [],
    deliveryCart: [],
    transactions: [],
    inventory: DEFAULT_INVENTORY,
    expenses: [],
    company: DEFAULT_COMPANY,
    closings: [],
    users: DEFAULT_USERS,
    activeUser: DEFAULT_USERS[1] // Customer by default
  };
}

export function formatLbp(num: number | undefined | null): string {
  const val = Number(num || 0);
  return val.toLocaleString('ar-LB') + ' ل.ل';
}

export function formatUsd(lbpAmount: number, usdRate: number): string {
  const rate = usdRate || 89500;
  return '$' + (lbpAmount / rate).toFixed(2);
}

// Sound synthesized chimes using Web Audio API for fast feedback (zero external audio files needed)
export function playChime(type: 'add' | 'remove' | 'order' | 'success') {
  if (typeof window === 'undefined' || !window.AudioContext) return;
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'add') {
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'remove') {
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(330, now + 0.12);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'order' || type === 'success') {
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      osc.frequency.setValueAtTime(1046.50, now + 0.24); // C6
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  } catch {
    // Ignore audio failures if browser restricted autoplay
  }
}

// Loud, ringing bell chime specifically for new incoming orders alert
export function playNewOrderAlertSound() {
  if (typeof window === 'undefined' || !window.AudioContext) return;
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    
    // Play dual bell ring: Ding! ... Ding!
    const playNote = (freq: number, start: number, dur: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.3, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
      osc.start(start);
      osc.stop(start + dur);
    };

    const now = ctx.currentTime;
    playNote(880, now, 0.25); // A5
    playNote(1318.51, now + 0.15, 0.4); // E6
    playNote(1760, now + 0.35, 0.6); // A6
  } catch {
    // Browser autoplay policy catch
  }
}
