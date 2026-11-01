<script lang="ts">
  import { BookmarkIcon } from "@solar-icons/svelte/bold-duotone";
  import {
    extendBounds,
    extensionError,
    formatDateLabel,
  } from "../../availability";
  import { bookingTotal, TABLES } from "../../data/floorPlan";
  import {
    bookingEndMin,
    bookingStartMin,
    bookingStore,
    toMinutes,
    type Booking,
  } from "../../stores/bookingStore";
  import { userStore } from "../../stores/userStore";
  import TimePicker from "../TimePicker.svelte";

  interface Props {
    nowMin: number;
  }

  let { nowMin }: Props = $props();

  let bookingsSort = $state<"created" | "date">("created");
  let extendId = $state<string | null>(null);
  let extFrom = $state<string>("");
  let extTo = $state<string>("");

  let myBookings = $derived.by<Booking[]>(() => {
    const mine = $bookingStore.bookings.filter(
      (b) => b.userId === $userStore.user?.id,
    );
    return bookingsSort === "created"
      ? mine.sort((a, b) => b.createdAt - a.createdAt)
      : mine.sort((a, b) => bookingStartMin(a) - bookingStartMin(b));
  });

  function startExtend(b: Booking): void {
    extendId = b.id;
    extFrom = b.from;
    extTo = b.to;
  }

  function bounds(b: Booking): { s: number; e: number } {
    return extendBounds(b.date, extFrom, extTo);
  }

  function errFor(b: Booking): string | null {
    if (!extFrom || !extTo) return "Оберіть час.";
    const { s, e } = bounds(b);
    return extensionError($bookingStore.bookings, b, s, e, nowMin);
  }

  function applyExtend(b: Booking): void {
    if (errFor(b)) return;
    const { s, e } = bounds(b);
    const table = TABLES.find((t) => t.id === b.tableId);
    bookingStore.update(b.id, {
      from: extFrom,
      to: extTo,
      price: table ? bookingTotal(table, s, e, b.guests.length || 1) : b.price,
    });
    extendId = null;
  }
</script>

{#if myBookings.length === 0}
  <div
    class="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-muted/50 px-6 py-10 text-center"
  >
    <span class="text-muted-foreground"><BookmarkIcon size={32} /></span>
    <p class="text-sm text-muted-foreground">
      У вас поки немає бронювань. Спочатку оберіть столик у розділі
      «Забронювати».
    </p>
  </div>
{:else}
  <div class="mb-3 flex items-center gap-1.5">
    <span class="mr-1 text-xs text-muted-foreground">Сортувати:</span>
    <button
      type="button"
      class="rounded-full border px-3 py-1 text-xs font-medium transition {bookingsSort ===
      'created'
        ? 'border-primary bg-primary/15 text-primary'
        : 'border-border text-muted-foreground hover:bg-muted'}"
      onclick={() => (bookingsSort = "created")}
    >
      Нові спочатку
    </button>
    <button
      type="button"
      class="rounded-full border px-3 py-1 text-xs font-medium transition {bookingsSort ===
      'date'
        ? 'border-primary bg-primary/15 text-primary'
        : 'border-border text-muted-foreground hover:bg-muted'}"
      onclick={() => (bookingsSort = "date")}
    >
      За датою броні
    </button>
  </div>
  <div
    class="grid max-h-[70vh] w-full grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2"
  >
    {#each myBookings as b (b.id)}
      <div
        class="flex flex-col rounded-xl border-r-4 border-b-4 border-border bg-card p-3 text-[13px] {b.cancelled
          ? 'opacity-60'
          : ''}"
      >
        <div class="flex flex-col gap-1 text-sm">
          <p class="font-semibold">
            Столик №{b.tableNumber} · {b.zone}
            {#if b.cancelled}
              <span
                class="ml-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive"
                >Скасовано</span
              >
            {/if}
          </p>
          <p class="text-muted-foreground">
            {formatDateLabel(b.date)} · {b.from}–{b.to}{toMinutes(b.to) <=
            toMinutes(b.from)
              ? " (+1)"
              : ""} · {b.kind === "full" ? "повне" : "часткове"}
            бронювання
          </p>
          <p class="text-muted-foreground">
            {b.guests.map((g) => `${g.seat}. ${g.name}`).join(", ")}
          </p>
          <p class="text-muted-foreground">
            Передоплата ${Math.round(b.price * 0.1)} · всього ${b.price}
          </p>
          {#if b.paid}
            <p class="text-xs font-medium text-success">Оплачено</p>
          {/if}
        </div>
        {#if !b.cancelled && bookingEndMin(b) > nowMin}
          {#if extendId === b.id}
            <div class="mt-3 flex flex-col gap-2 border-t border-border pt-3">
              <p class="text-xs text-muted-foreground">
                Змініть початок або кінець — бронювання розшириться без
                створення нового. Свої броні можна стикувати впритык.
              </p>
              <div
                class="flex items-end justify-center gap-2 text-[10px] text-muted-foreground"
              >
                {#if bookingStartMin(b) <= nowMin}
                  <span class="mb-2 text-xs">
                    Початок {b.from} (уже триває)
                  </span>
                {:else}
                  <label class="flex flex-col gap-0.5">
                    Початок
                    <TimePicker bind:value={extFrom} />
                  </label>
                {/if}
                <span class="mb-2 text-muted-foreground">—</span>
                <label class="flex flex-col gap-0.5">
                  Кінець
                  <TimePicker bind:value={extTo} />
                </label>
              </div>
              {#if errFor(b)}
                <p class="text-xs text-destructive">{errFor(b)}</p>
              {/if}
              <div class="flex justify-center gap-2">
                <button
                  type="button"
                  disabled={!!errFor(b) ||
                    (extFrom === b.from && extTo === b.to)}
                  class="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                  onclick={() => applyExtend(b)}
                >
                  Зберегти
                </button>
                <button
                  type="button"
                  class="rounded-full border border-border px-4 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted"
                  onclick={() => (extendId = null)}
                >
                  Скасувати
                </button>
              </div>
            </div>
          {:else}
            <div class="mt-3 flex gap-2">
              <button
                type="button"
                class="rounded-full border border-border px-4 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                onclick={() => startExtend(b)}
              >
                Розширити
              </button>
              <button
                type="button"
                class="rounded-full border border-destructive/40 px-4 py-1.5 text-xs font-medium text-destructive transition hover:bg-destructive/10"
                onclick={() => bookingStore.cancel(b.id)}
              >
                Скасувати бронювання
              </button>
            </div>
          {/if}
        {/if}
      </div>
    {/each}
  </div>
{/if}
