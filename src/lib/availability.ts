import {
  bookingEndMin,
  bookingStartMin,
  dateToDayMs,
  rangesOverlap,
  toISODate,
  toMinutes,
  type Booking,
} from "./stores/bookingStore";
import type { CafeTable } from "./data/floorPlan";

export const BUFFER_MIN = 10;
export const MAX_DURATION_MIN = 8 * 60;

export const SEATS = [1, 2, 3, 4] as const;

const active = (bookings: Booking[]): Booking[] =>
  bookings.filter((b) => !b.cancelled);

export function overlappingBookings(
  bookings: Booking[],
  tableId: string,
  s: number,
  e: number,
): Booking[] {
  return active(bookings).filter(
    (b) =>
      b.tableId === tableId &&
      rangesOverlap(s, e, bookingStartMin(b), bookingEndMin(b)),
  );
}

export function adjacentBookings(
  bookings: Booking[],
  tableId: string,
  s: number,
  e: number,
  userId: string | undefined,
): Booking[] {
  return active(bookings).filter(
    (b) =>
      b.tableId === tableId &&
      b.userId !== userId &&
      !rangesOverlap(s, e, bookingStartMin(b), bookingEndMin(b)) &&
      rangesOverlap(
        s - BUFFER_MIN,
        e + BUFFER_MIN,
        bookingStartMin(b),
        bookingEndMin(b),
      ),
  );
}

export function occupiedSeatsAt(
  bookings: Booking[],
  tableId: string,
  s: number,
  e: number,
  userId: string | undefined,
): number[] {
  const taken = new Set<number>();
  if (s < 0 || e < 0) return [];
  for (const b of active(bookings)) {
    if (b.tableId !== tableId) continue;
    const isOwn = b.userId === userId;
    const buffered = rangesOverlap(
      s,
      e,
      bookingStartMin(b) - (isOwn ? 0 : BUFFER_MIN),
      bookingEndMin(b) + (isOwn ? 0 : BUFFER_MIN),
    );
    if (!buffered) continue;
    if (b.kind === "full") SEATS.forEach((x) => taken.add(x));
    else b.guests.forEach((g) => taken.add(g.seat));
  }
  return [...taken];
}

export interface SeatInfo {
  seat: number;
  blocked: boolean;
  next: Booking | undefined;
}

export function bookingBlocked(b: Booking, at: number): boolean {
  return (
    at >= bookingStartMin(b) - BUFFER_MIN && at < bookingEndMin(b) + BUFFER_MIN
  );
}

export function seatInfoFor(
  bookings: Booking[],
  tableId: string,
  nowMin: number,
): SeatInfo[] {
  const list = active(bookings)
    .filter((b) => b.tableId === tableId)
    .sort((a, b) => bookingStartMin(a) - bookingStartMin(b));
  return SEATS.map((seat) => {
    const bs = list.filter(
      (b) => b.kind === "full" || b.guests.some((g) => g.seat === seat),
    );
    return {
      seat,
      blocked: bs.some((b) => bookingBlocked(b, nowMin)),
      next: bs.find((b) => bookingEndMin(b) > nowMin),
    };
  });
}

export function seatBusyNow(
  bookings: Booking[],
  tableId: string,
  seat: number,
  nowMin: number,
): boolean {
  return active(bookings).some(
    (b) =>
      b.tableId === tableId &&
      (b.kind === "full" || b.guests.some((g) => g.seat === seat)) &&
      bookingBlocked(b, nowMin),
  );
}

export function tableBusyNow(
  bookings: Booking[],
  t: CafeTable,
  nowMin: number,
): boolean {
  if (t.booking === "full")
    return active(bookings).some(
      (b) => b.tableId === t.id && bookingBlocked(b, nowMin),
    );
  return SEATS.every((s) => seatBusyNow(bookings, t.id, s, nowMin));
}

export function bookingTimeError(args: {
  table: CafeTable | undefined;
  startAbsMin: number;
  endAbsMin: number;
  durationMin: number;
  overlapping: Booking[];
  adjacent: Booking[];
  freeSeatsCount: number;
  nowMin: number;
  hasTime: boolean;
}): string | null {
  if (!args.table || !args.hasTime) return null;
  if (args.startAbsMin <= args.nowMin)
    return "Не можна бронювати на час, що вже минув.";
  if (args.durationMin > MAX_DURATION_MIN)
    return "Максимальна тривалість бронювання — 8 годин.";
  if (
    args.table.booking === "full" &&
    (args.overlapping.length || args.adjacent.length)
  )
    return "Столик зайнятий у цей час — між бронюваннями має бути перерва 10 хв.";
  if (args.freeSeatsCount === 0)
    return "На цей час усі місця за столиком уже зайняті.";
  if (args.adjacent.length)
    return "Між бронюваннями має бути перерва щонайменше 10 хв — зсуньте початок або кінець.";
  return null;
}

export function extensionError(
  bookings: Booking[],
  b: Booking,
  s: number,
  e: number,
  nowMin: number,
): string | null {
  const started = bookingStartMin(b) <= nowMin;
  if (e - s <= 0) return "Кінець має бути після початку.";
  if (e <= nowMin) return "Бронювання вже минуло.";
  if (!started && s < nowMin) return "Не можна перенести початок у минуле.";
  if (e - s > MAX_DURATION_MIN) return "Максимальна тривалість — 8 годин.";
  for (const o of active(bookings)) {
    if (o.id === b.id || o.tableId !== b.tableId) continue;
    const isOwn = o.userId === b.userId;
    const seatsClash =
      b.kind === "full" ||
      o.kind === "full" ||
      b.guests.some((g) => o.guests.some((og) => og.seat === g.seat));
    if (
      seatsClash &&
      rangesOverlap(
        s,
        e,
        bookingStartMin(o) - (isOwn ? 0 : BUFFER_MIN),
        bookingEndMin(o) + (isOwn ? 0 : BUFFER_MIN),
      )
    )
      return "У цей час місця за столиком уже зайняті.";
    if (
      !isOwn &&
      rangesOverlap(
        s - BUFFER_MIN,
        e + BUFFER_MIN,
        bookingStartMin(o),
        bookingEndMin(o),
      )
    )
      return "Між чужими бронюваннями має бути перерва 10 хв.";
  }
  return null;
}

export function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} год` : `${h} год ${m} хв`;
}

export function formatDateLabel(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${String(d).padStart(2, "0")}.${String(m).padStart(2, "0")}`;
}

export function nextDayLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return formatDateLabel(toISODate(new Date(y, m - 1, d + 1)));
}

export function extendBounds(
  dateIso: string,
  from: string,
  to: string,
): { s: number; e: number } {
  const dayStart = Math.floor(dateToDayMs(dateIso) / 60000);
  const f = toMinutes(from);
  const t = toMinutes(to);
  return { s: dayStart + f, e: dayStart + (t > f ? t : t + 1440) };
}
