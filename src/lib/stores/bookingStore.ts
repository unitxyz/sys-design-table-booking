import { writable, type Readable } from "svelte/store";
import type { BookingKind } from "../data/floorPlan";

export interface BookingSeat {
  seat: number;
  name: string;
}

export interface Booking {
  id: string;
  tableId: string;
  tableNumber: number;
  zone: string;
  kind: BookingKind;
  date: string;
  from: string;
  to: string;
  guests: BookingSeat[];
  userId: string;
  userName: string;
  price: number;
  paid: boolean;
  cancelled?: boolean;
  createdAt: number;
}

export interface BookingStoreState {
  bookings: Booking[];
}

export interface BookingStore extends Readable<BookingStoreState> {
  add(b: Booking): void;
  update(id: string, patch: Partial<Booking>): void;
  cancel(id: string): void;
  remove(id: string): void;
  clear(): void;
}

const STORAGE_KEY = "cafe-booking:booking-store";

const EMPTY_STATE: BookingStoreState = { bookings: [] };

function loadState(): BookingStoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw) as Partial<BookingStoreState>;
    const today = toISODate(new Date());
    return {
      bookings: Array.isArray(parsed.bookings)
        ? parsed.bookings.map((b: Booking) => ({
            ...b,
            date: b.date ?? today,
            paid: b.paid ?? true,
          }))
        : [],
    };
  } catch {
    return EMPTY_STATE;
  }
}

function createBookingStore(): BookingStore {
  const { subscribe, update } = writable<BookingStoreState>(loadState());

  subscribe((state: BookingStoreState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  });

  return {
    subscribe,
    add(b: Booking): void {
      update((state) => ({ ...state, bookings: [...state.bookings, b] }));
    },
    update(id: string, patch: Partial<Booking>): void {
      update((state) => ({
        ...state,
        bookings: state.bookings.map((b) =>
          b.id === id ? { ...b, ...patch } : b,
        ),
      }));
    },
    cancel(id: string): void {
      update((state) => ({
        ...state,
        bookings: state.bookings.map((b) =>
          b.id === id ? { ...b, cancelled: true } : b,
        ),
      }));
    },
    remove(id: string): void {
      update((state) => ({
        ...state,
        bookings: state.bookings.filter((b) => b.id !== id),
      }));
    },
    clear(): void {
      update((state) => ({ ...state, bookings: [] }));
    },
  };
}

export const bookingStore: BookingStore = createBookingStore();

export function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function toTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function rangesOverlap(
  fromA: number,
  toA: number,
  fromB: number,
  toB: number,
): boolean {
  return fromA < toB && fromB < toA;
}

export function toISODate(d: Date): string {
  const p = (n: number): string => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function dateToDayMs(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).getTime();
}

export function bookingStartMin(b: Booking): number {
  return Math.floor(dateToDayMs(b.date) / 60000) + toMinutes(b.from);
}

export function bookingEndMin(b: Booking): number {
  const start = bookingStartMin(b);
  const dur = toMinutes(b.to) - toMinutes(b.from);
  return start + (dur > 0 ? dur : dur + 1440);
}
