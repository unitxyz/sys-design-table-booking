export type TableStatus = "free" | "reserved";
export type TableShape = "round" | "rect";
export type BookingKind = "full" | "part";

export interface CafeTable {
  id: string;
  number: number;
  zone: string;
  seats: number;
  shape: TableShape;
  x: number;
  y: number;
  r: number;
  w: number;
  h: number;
  status: TableStatus;
  booking: BookingKind;
  price: number;
  rotated?: boolean;
}

export const TABLES: CafeTable[] = [
  { id: "t1", number: 1, zone: "Лаунж", seats: 4, shape: "rect", x: 95, y: 110, r: 0, w: 48, h: 88, status: "free", price: 20, booking: "full", rotated: true },
  { id: "t2", number: 2, zone: "Лаунж", seats: 4, shape: "rect", x: 185, y: 110, r: 0, w: 88, h: 48, status: "free", price: 20, booking: "part" },
  { id: "t3", number: 3, zone: "Стіл", seats: 4, shape: "round", x: 95, y: 205, r: 26, w: 0, h: 0, status: "free", price: 20, booking: "full", rotated: true },
  { id: "t4", number: 4, zone: "Стіл", seats: 4, shape: "round", x: 185, y: 205, r: 26, w: 0, h: 0, status: "free", price: 20, booking: "part" },
  { id: "t5", number: 5, zone: "Стіл", seats: 4, shape: "round", x: 95, y: 300, r: 26, w: 0, h: 0, status: "free", price: 20, booking: "full", rotated: true },
  { id: "t6", number: 6, zone: "Стіл", seats: 4, shape: "round", x: 185, y: 300, r: 26, w: 0, h: 0, status: "free", price: 20, booking: "part" },
  { id: "t7", number: 7, zone: "Лаунж", seats: 4, shape: "rect", x: 95, y: 395, r: 0, w: 48, h: 88, status: "free", price: 20, booking: "full", rotated: true },
  { id: "t8", number: 8, zone: "Лаунж", seats: 4, shape: "rect", x: 185, y: 395, r: 0, w: 88, h: 48, status: "free", price: 20, booking: "part" },
  { id: "t9", number: 9, zone: "Лаунж", seats: 4, shape: "rect", x: 535, y: 110, r: 0, w: 88, h: 48, status: "free", price: 20, booking: "part" },
  { id: "t10", number: 10, zone: "Лаунж", seats: 4, shape: "rect", x: 625, y: 110, r: 0, w: 48, h: 88, status: "free", price: 20, booking: "full", rotated: true },
  { id: "t11", number: 11, zone: "Стіл", seats: 4, shape: "round", x: 535, y: 205, r: 26, w: 0, h: 0, status: "free", price: 20, booking: "part" },
  { id: "t12", number: 12, zone: "Стіл", seats: 4, shape: "round", x: 625, y: 205, r: 26, w: 0, h: 0, status: "free", price: 20, booking: "full", rotated: true },
  { id: "t13", number: 13, zone: "Стіл", seats: 4, shape: "round", x: 535, y: 300, r: 26, w: 0, h: 0, status: "free", price: 20, booking: "part" },
  { id: "t14", number: 14, zone: "Стіл", seats: 4, shape: "round", x: 625, y: 300, r: 26, w: 0, h: 0, status: "free", price: 20, booking: "full", rotated: true },
  { id: "t15", number: 15, zone: "Лаунж", seats: 4, shape: "rect", x: 535, y: 395, r: 0, w: 88, h: 48, status: "free", price: 20, booking: "part" },
  { id: "t16", number: 16, zone: "Лаунж", seats: 4, shape: "rect", x: 625, y: 395, r: 0, w: 48, h: 88, status: "free", price: 20, booking: "full", rotated: true },
];

export interface PriceRow {
  label: string;
  offPeak: boolean;
  full: number;
  lounge: number;
  seat: number;
  loungeSeat: number;
}

export const PRICE_ROWS: PriceRow[] = [
  {
    label: "08:00–12:00",
    offPeak: true,
    full: 18,
    lounge: 25,
    seat: 5,
    loungeSeat: 6,
  },
  {
    label: "12:00–16:00",
    offPeak: false,
    full: 20,
    lounge: 28,
    seat: 5,
    loungeSeat: 7,
  },
  {
    label: "16:00–20:00",
    offPeak: true,
    full: 18,
    lounge: 25,
    seat: 5,
    loungeSeat: 6,
  },
  {
    label: "20:00–24:00",
    offPeak: false,
    full: 20,
    lounge: 28,
    seat: 5,
    loungeSeat: 7,
  },
];

function isOffPeak(hour: number): boolean {
  return (hour >= 8 && hour < 12) || (hour >= 16 && hour < 20);
}

export function hourlyRate(t: CafeTable, hour: number): number {
  const base = isOffPeak(hour) ? t.price * 0.9 : t.price;
  return Math.round(t.zone === "Лаунж" ? base * 1.4 : base);
}

export function bookingTotal(
  t: CafeTable,
  startAbsMin: number,
  endAbsMin: number,
  seatsCount: number,
): number {
  let total = 0;
  let m = startAbsMin;
  while (m < endAbsMin) {
    const nextHour = Math.floor(m / 60 + 1) * 60;
    const chunk = Math.min(endAbsMin, nextHour) - m;
    const hour = new Date(m * 60000).getHours();
    const rate =
      t.booking === "part"
        ? Math.round(hourlyRate(t, hour) / t.seats) * seatsCount
        : hourlyRate(t, hour);
    total += rate * (chunk / 60);
    m += chunk;
  }
  return Math.round(total);
}

export function chairPositions(t: CafeTable): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  const halfWidth = t.shape === "round" ? t.r : t.w / 2;
  const halfHeight = t.shape === "round" ? t.r : t.h / 2;
  const perSide = Math.ceil(t.seats / 2);
  const spread = t.shape === "round" ? 4 : 3;
  const sideLayout = t.rotated ? t.shape === "rect" : t.shape === "round";
  for (let i = 0; i < t.seats; i++) {
    const k = ((i % perSide) + 0.5) / perSide - 0.5;
    if (sideLayout) {
      const side = i % 2 === 0 ? -1 : 1;
      const ky = i < perSide ? -0.25 : 0.25;
      positions.push({
        x: t.x + side * (halfWidth + 12),
        y: t.y + ky * halfHeight * spread,
      });
    } else {
      const side = i < perSide ? -1 : 1;
      positions.push({
        x: t.x + k * halfWidth * spread,
        y: t.y + side * (halfHeight + 12),
      });
    }
  }
  return positions;
}
