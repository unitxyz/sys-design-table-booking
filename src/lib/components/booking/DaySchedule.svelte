<script lang="ts">
  import { formatDateLabel } from "../../availability";
  import { TABLES } from "../../data/floorPlan";
  import {
    bookingEndMin,
    bookingStartMin,
    bookingStore,
    dateToDayMs,
  } from "../../stores/bookingStore";

  interface Props {
    date: string;
    selectedId?: string | null;
  }

  let { date, selectedId = null }: Props = $props();

  interface DaySlot {
    left: number;
    width: number;
    label: string;
  }

  const sortedTables = [...TABLES].sort((a, b) => a.number - b.number);

  let daySchedule = $derived.by<Map<string, DaySlot[]>>(() => {
    const dayStart = Math.floor(dateToDayMs(date) / 60000);
    const dayEnd = dayStart + 1440;
    const m = new Map<string, DaySlot[]>(
      sortedTables.map((t) => [t.id, []]),
    );
    for (const b of $bookingStore.bookings) {
      if (b.cancelled) continue;
      const s = Math.max(bookingStartMin(b), dayStart);
      const e = Math.min(bookingEndMin(b), dayEnd);
      if (e <= s) continue;
      m.get(b.tableId)?.push({
        left: ((s - dayStart) / 1440) * 100,
        width: ((e - s) / 1440) * 100,
        label: `${b.from}–${b.to}`,
      });
    }
    for (const slots of m.values()) slots.sort((x, y) => x.left - y.left);
    return m;
  });
</script>

<div
  class="w-full overflow-hidden rounded-xl border-r-4 border-b-4 border-border bg-card p-3"
>
  <p class="mb-2 text-center text-xs text-muted-foreground">
    Зайнятість на {formatDateLabel(date)}
  </p>
  <div class="mb-1 flex items-center gap-2">
    <span class="w-8 shrink-0"></span>
    <div class="relative h-3.5 flex-1 text-[9px] text-muted-foreground">
      {#each [0, 6, 12, 18] as h}
        <span class="absolute -translate-x-1/2" style="left:{(h / 24) * 100}%"
          >{h}:00</span
        >
      {/each}
      <span class="absolute right-0">24:00</span>
    </div>
  </div>
  <div class="flex flex-col gap-1">
    {#each sortedTables as t (t.id)}
      <div class="flex items-center gap-2">
        <span
          class="w-8 shrink-0 text-[10px] font-semibold {t.id === selectedId
            ? 'text-primary'
            : 'text-muted-foreground'}">№{t.number}</span
        >
        <div
          class="relative h-4 flex-1 overflow-hidden rounded bg-muted/60"
        >
          {#each daySchedule.get(t.id) ?? [] as s}
            <div
              class="group/slot absolute inset-y-0 bg-destructive/70"
              style="left:{s.left}%;width:{s.width}%"
              title={s.label}
            >
              <span
                class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[9px] font-medium text-foreground opacity-0 transition group-hover/slot:opacity-100"
                >{s.label}</span
              >
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
  <p class="mt-2 text-center text-[10px] text-muted-foreground/80">
    Червоне — зайнято; порожній рядок — вільний весь день. Наведіть на слот,
    щоб побачити час.
  </p>
</div>
