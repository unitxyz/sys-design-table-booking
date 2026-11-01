<script lang="ts">
  import {
    formatDateLabel,
    formatDuration,
    type SeatInfo,
  } from "../../availability";
  import type { CafeTable } from "../../data/floorPlan";
  import { toMinutes } from "../../stores/bookingStore";
  import { userStore } from "../../stores/userStore";
  import TimePicker from "../TimePicker.svelte";

  interface Props {
    table: CafeTable;
    pos: { left: number; top: number; above: boolean };
    seatInfo: SeatInfo[];
    occupiedSeats: number[];
    durationMin: number;
    endNextDay: boolean;
    endDateLabel: string;
    timeError: string | null;
    timeValid: boolean;
    guestsFilled: boolean;
    timeFrom?: string;
    timeTo?: string;
    guestNames?: string[];
    onbook: () => void;
  }

  let {
    table,
    pos,
    seatInfo,
    occupiedSeats,
    durationMin,
    endNextDay,
    endDateLabel,
    timeError,
    timeValid,
    guestsFilled,
    timeFrom = $bindable(""),
    timeTo = $bindable(""),
    guestNames = $bindable(["", "", "", ""]),
    onbook,
  }: Props = $props();

  let activeSeat = $state<number | null>(null);

  function isOccupied(seat: number): boolean {
    return occupiedSeats.includes(seat);
  }

  function fillSelfName(): void {
    if (activeSeat !== null && $userStore.user) {
      guestNames[activeSeat] = $userStore.user.name;
    }
  }
</script>

<div
  class="absolute z-10 w-64 max-w-[90%] rounded-lg border-r-4 border-b-4 border-border bg-card p-2 text-[10px] leading-tight"
  style="left:clamp(8.5rem, {pos.left}%, calc(100% - 8.5rem)); top:{pos.top}%; transform:translateX(-50%){pos.above
    ? ' translateY(-100%)'
    : ''};"
>
  <p class="font-semibold">
    №{table.number} · {table.zone} · {table.booking === "full"
      ? "повне"
      : "часткове"}
  </p>
  <p class="text-muted-foreground/80">
    ±10 хв до та після броні — вважається зайнятим.
  </p>
  {#if table.booking === "full"}
    {@const info = seatInfo[0]}
    <p class="mt-1">
      Зараз:
      <span
        class="font-medium {info?.blocked
          ? 'text-destructive'
          : 'text-success'}"
        >{info?.blocked ? "зайнятий" : "вільний"}</span
      >
    </p>
    <p class="mt-0.5 text-muted-foreground">
      {info?.next
        ? `Найближче: ${formatDateLabel(info.next.date)} ${info.next.from}–${info.next.to}${toMinutes(info.next.to) <= toMinutes(info.next.from) ? " (+1)" : ""}`
        : "Бронювань немає"}
    </p>
  {:else}
    <p class="mt-1 text-muted-foreground/80">
      Часткове бронювання — заповніть вільні місця.
    </p>
  {/if}
  <div class="mt-2 flex items-end justify-center gap-2">
    <label class="flex flex-col gap-0.5 text-[9px] text-muted-foreground">
      Від
      <TimePicker bind:value={timeFrom} />
    </label>
    <span class="mb-2 text-muted-foreground">—</span>
    <label class="flex flex-col gap-0.5 text-[9px] text-muted-foreground">
      До
      <TimePicker bind:value={timeTo} />
    </label>
  </div>
  {#if endNextDay && timeTo}
    <p class="mt-1 text-muted-foreground">
      Кінець — {endDateLabel} о {timeTo} (+1 доба)
    </p>
  {/if}
  {#if timeError}
    <p class="mt-1 text-destructive">{timeError}</p>
  {:else if durationMin > 0}
    <p class="mt-1 text-muted-foreground">
      Тривалість: {formatDuration(durationMin)}
    </p>
  {/if}
  <p class="mt-1.5 text-muted-foreground/80">
    Гості{table.booking === "full"
      ? " — усі 4 місця обов'язкові"
      : " — хоча б одне вільне місце"}:
  </p>
  <div class="mt-0.5 flex flex-col gap-1">
    {#each seatInfo as s (s.seat)}
      {@const taken = s.blocked || isOccupied(s.seat)}
      {#if taken}
        <div
          class="flex items-center gap-1.5 rounded bg-muted/60 px-1.5 py-1"
        >
          <span class="font-medium">м.{s.seat}</span>
          <span class="text-destructive">зайнято</span>
        </div>
      {:else}
        <div class="flex items-center gap-1.5">
          <span class="w-6 shrink-0 font-medium text-muted-foreground"
            >м.{s.seat}</span
          >
          <input
            type="text"
            placeholder="Ім'я гостя"
            bind:value={guestNames[s.seat - 1]}
            onfocus={() => (activeSeat = s.seat - 1)}
            onblur={() => (activeSeat = null)}
            class="min-w-0 flex-1 rounded border border-border bg-card px-1.5 py-1 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/30"
          />
        </div>
        {#if activeSeat === s.seat - 1 && $userStore.user}
          <button
            type="button"
            class="rounded bg-primary/10 px-1.5 py-0.5 text-left font-medium text-primary transition hover:bg-primary/20"
            onmousedown={(e: MouseEvent) => e.preventDefault()}
            onclick={fillSelfName}
          >
            {$userStore.user.name}
          </button>
        {/if}
      {/if}
    {/each}
  </div>
  <p class="mt-1 text-muted-foreground/70">
    Місця зі сторони входу: 1 — зверху ліворуч, 2 — зверху праворуч, 3 — знизу
    ліворуч, 4 — знизу праворуч.
  </p>
  <button
    type="button"
    disabled={!timeValid || !guestsFilled}
    class="mt-2 w-full rounded-full bg-primary py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
    onclick={onbook}
  >
    Забронувати
  </button>
</div>
