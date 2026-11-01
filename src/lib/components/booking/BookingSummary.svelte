<script lang="ts">
  import { formatDuration } from "../../availability";
  import type { CafeTable } from "../../data/floorPlan";

  interface Props {
    table?: CafeTable;
    dateLabel: string;
    timeFrom: string;
    timeTo: string;
    endNextDay: boolean;
    endDateLabel: string;
    durationMin: number;
    guestNames: string[];
    occupiedSeats: number[];
    timeValid: boolean;
    guestsFilled: boolean;
    guestCount: number;
    totalPrice: number;
    onconfirm: () => void;
  }

  let {
    table,
    dateLabel,
    timeFrom,
    timeTo,
    endNextDay,
    endDateLabel,
    durationMin,
    guestNames,
    occupiedSeats,
    timeValid,
    guestsFilled,
    guestCount,
    totalPrice,
    onconfirm,
  }: Props = $props();
</script>

<div id="summary-section">
  <h3
    class="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
  >
    3. Підсумок
  </h3>
  <div class="flex flex-col items-center gap-4">
    <div
      class="w-full max-w-md rounded-xl border-r-4 border-b-4 border-border bg-card p-5 text-left"
    >
      <h3 class="mb-3 text-base font-bold">Підсумок бронювання</h3>
      <dl class="flex flex-col gap-2 text-sm">
        <div class="flex justify-between gap-3">
          <dt class="text-muted-foreground">Столик</dt>
          <dd class="font-medium">
            {table ? `№${table.number} · ${table.zone}` : "N/A"}
          </dd>
        </div>
        <div class="flex justify-between gap-3">
          <dt class="text-muted-foreground">Тип</dt>
          <dd class="font-medium">
            {table
              ? table.booking === "full"
                ? "повне бронювання"
                : "часткове бронювання"
              : "N/A"}
          </dd>
        </div>
        <div class="flex justify-between gap-3">
          <dt class="text-muted-foreground">Дата</dt>
          <dd class="font-medium">{dateLabel}</dd>
        </div>
        <div class="flex justify-between gap-3">
          <dt class="text-muted-foreground">Час</dt>
          <dd class="font-medium">
            {timeFrom && timeTo
              ? `${timeFrom}–${timeTo}${endNextDay ? ` (${endDateLabel})` : ""} · ${formatDuration(durationMin)}`
              : "N/A"}
          </dd>
        </div>
        <div class="flex flex-col gap-1">
          <dt class="text-muted-foreground">Гості</dt>
          <dd class="font-medium">
            {#if guestCount === 0}N/A{/if}
            {#each [0, 1, 2, 3] as i}
              {#if !occupiedSeats.includes(i + 1) && guestNames[i]?.trim()}
                <div>{i + 1}. {guestNames[i].trim()}</div>
              {/if}
            {/each}
          </dd>
        </div>
        <div
          class="mt-1 flex justify-between gap-3 border-t border-border pt-2"
        >
          <dt class="text-muted-foreground">Ціна</dt>
          <dd class="font-medium">
            {timeValid && guestsFilled && table
              ? `$${totalPrice}${table.zone === "Лаунж" ? " (Лаунж +40%)" : ""}${table.booking === "part" ? ` · ${guestCount} місц.` : ""}`
              : "N/A"}
          </dd>
        </div>
        <div class="flex justify-between gap-3">
          <dt class="text-muted-foreground">Передоплата 10%</dt>
          <dd class="font-semibold text-primary">
            {timeValid && guestsFilled && table
              ? `$${Math.round(totalPrice * 0.1)}`
              : "N/A"}
          </dd>
        </div>
        <div class="flex justify-between gap-3">
          <dt class="text-muted-foreground">Доплата при візиті 90%</dt>
          <dd class="font-medium">
            {timeValid && guestsFilled && table
              ? `$${Math.round(totalPrice * 0.9)}`
              : "N/A"}
          </dd>
        </div>
      </dl>
      {#if durationMin > 0}
        <p class="mt-3 text-xs leading-relaxed text-muted-foreground">
          Якщо запізнення перевищить {Math.round(durationMin * 0.1)} хв (10% від
          часу бронювання) і жоден гість не з'явиться — бронювання згоряє.
        </p>
      {/if}
    </div>

    <button
      type="button"
      disabled={!table ||
        !dateLabel ||
        dateLabel === "N/A" ||
        !timeValid ||
        !guestsFilled}
      class="flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
      onclick={onconfirm}
    >
      Підтвердити й оплатити{timeValid && guestsFilled
        ? ` $${Math.round(totalPrice * 0.1)}`
        : ""}
    </button>
  </div>
</div>
