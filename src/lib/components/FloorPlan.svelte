<script lang="ts">
  import {
    AltArrowLeftIcon,
    BookmarkIcon,
    CalendarAddIcon,
    MapIcon,
  } from "@solar-icons/svelte/bold-duotone";
  import {
    adjacentBookings,
    bookingTimeError,
    formatDateLabel,
    nextDayLabel,
    occupiedSeatsAt,
    overlappingBookings,
    seatInfoFor,
  } from "../availability";
  import BookingSummary from "./booking/BookingSummary.svelte";
  import CafeMap from "./booking/CafeMap.svelte";
  import DaySchedule from "./booking/DaySchedule.svelte";
  import MyBookings from "./booking/MyBookings.svelte";
  import PriceTable from "./booking/PriceTable.svelte";
  import TableCard from "./booking/TableCard.svelte";
  import { bookingTotal, TABLES, type CafeTable } from "../data/floorPlan";
  import {
    bookingStore,
    dateToDayMs,
    toISODate,
    toMinutes,
  } from "../stores/bookingStore";
  import { userStore } from "../stores/userStore";

  type BookingView = "menu" | "book" | "bookings";

  let view = $state<BookingView>("menu");
  let selectedId = $state<string | null>(null);
  let selected = $derived<CafeTable | undefined>(
    TABLES.find((t) => t.id === selectedId),
  );

  let guestNames = $state<string[]>(["", "", "", ""]);
  let selectedDate = $state<string>("");
  let timeFrom = $state<string>("");
  let timeTo = $state<string>("");
  let now = $state<number>(Date.now());

  $effect(() => {
    const id = setInterval(() => (now = Date.now()), 30000);
    return () => clearInterval(id);
  });

  let nowMin = $derived<number>(Math.floor(now / 60000));
  let fromMin = $derived<number>(timeFrom ? toMinutes(timeFrom) : -1);
  let toMin = $derived<number>(timeTo ? toMinutes(timeTo) : -1);
  let startAbsMin = $derived<number>(
    fromMin < 0 || !selectedDate
      ? -1
      : Math.floor(dateToDayMs(selectedDate) / 60000) + fromMin,
  );
  let endAbsMin = $derived<number>(
    toMin < 0 || fromMin < 0 || !selectedDate
      ? -1
      : Math.floor(dateToDayMs(selectedDate) / 60000) +
          (toMin > fromMin ? toMin : toMin + 1440),
  );
  let durationMin = $derived<number>(
    startAbsMin >= 0 && endAbsMin > 0 ? endAbsMin - startAbsMin : 0,
  );
  let endNextDay = $derived<boolean>(
    toMin >= 0 && fromMin >= 0 && toMin <= fromMin,
  );
  let endDateLabel = $derived<string>(
    endNextDay && selectedDate ? nextDayLabel(selectedDate) : "",
  );

  interface DayCell {
    iso: string;
    dayNum: number;
    month: string;
    weekday: string;
    isToday: boolean;
  }

  let days = $derived.by<DayCell[]>(() => {
    void now;
    const base = new Date();
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(
        base.getFullYear(),
        base.getMonth(),
        base.getDate() + i,
      );
      return {
        iso: toISODate(d),
        dayNum: d.getDate(),
        month: d.toLocaleDateString("uk-UA", { month: "short" }),
        weekday: d.toLocaleDateString("uk-UA", { weekday: "short" }),
        isToday: i === 0,
      };
    });
  });

  function scrollToSummary(): void {
    document
      .getElementById("summary-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  let overlapping = $derived<ReturnType<typeof overlappingBookings>>(
    !selected || startAbsMin < 0 || endAbsMin < 0
      ? []
      : overlappingBookings(
          $bookingStore.bookings,
          selected.id,
          startAbsMin,
          endAbsMin,
        ),
  );

  let adjacent = $derived<ReturnType<typeof adjacentBookings>>(
    !selected || startAbsMin < 0 || endAbsMin < 0
      ? []
      : adjacentBookings(
          $bookingStore.bookings,
          selected.id,
          startAbsMin,
          endAbsMin,
          $userStore.user?.id,
        ),
  );

  let occupiedSeats = $derived<number[]>(
    !selected || startAbsMin < 0 || endAbsMin < 0
      ? []
      : occupiedSeatsAt(
          $bookingStore.bookings,
          selected.id,
          startAbsMin,
          endAbsMin,
          $userStore.user?.id,
        ),
  );

  let freeSeatsCount = $derived<number>(
    [1, 2, 3, 4].filter((s) => !occupiedSeats.includes(s)).length,
  );

  let timeError = $derived<string | null>(
    bookingTimeError({
      table: selected,
      startAbsMin,
      endAbsMin,
      durationMin,
      overlapping,
      adjacent,
      freeSeatsCount,
      nowMin,
      hasTime: !!timeFrom && !!timeTo,
    }),
  );

  let timeValid = $derived<boolean>(
    !!selectedDate && !!timeFrom && !!timeTo && !timeError,
  );

  let guestsFilled = $derived.by<boolean>(() => {
    if (!selected) return false;
    const filled = (i: number): boolean => !!guestNames[i]?.trim();
    const occupied = (i: number): boolean => occupiedSeats.includes(i + 1);
    if (selected.booking === "part")
      return [0, 1, 2, 3].some((i) => !occupied(i) && filled(i));
    return [0, 1, 2, 3].every((i) => occupied(i) || filled(i));
  });

  let guestCount = $derived<number>(
    [0, 1, 2, 3].filter(
      (i) => !occupiedSeats.includes(i + 1) && !!guestNames[i]?.trim(),
    ).length,
  );

  let totalPrice = $derived<number>(
    selected && timeValid
      ? bookingTotal(selected, startAbsMin, endAbsMin, guestCount || 1)
      : 0,
  );

  function confirmBooking(): void {
    if (!selected || !$userStore.user || !timeValid || !guestsFilled) return;
    const guests = [0, 1, 2, 3]
      .filter((i) => !occupiedSeats.includes(i + 1) && !!guestNames[i]?.trim())
      .map((i) => ({ seat: i + 1, name: guestNames[i].trim() }));
    bookingStore.add({
      id: crypto.randomUUID(),
      tableId: selected.id,
      tableNumber: selected.number,
      zone: selected.zone,
      kind: selected.booking,
      date: selectedDate,
      from: timeFrom,
      to: timeTo,
      guests,
      userId: $userStore.user.id,
      userName: $userStore.user.name,
      price: totalPrice,
      paid: true,
      createdAt: Date.now(),
    });
    selectedId = null;
    guestNames = ["", "", "", ""];
    selectedDate = "";
    timeFrom = "";
    timeTo = "";
    view = "bookings";
  }

  function selectTable(t: CafeTable): void {
    selectedId = selectedId === t.id ? null : t.id;
  }

  let seatInfo = $derived<ReturnType<typeof seatInfoFor>>(
    selected ? seatInfoFor($bookingStore.bookings, selected.id, nowMin) : [],
  );

  let cardPos = $derived.by<{ left: number; top: number; above: boolean }>(
    () => {
      if (!selected) return { left: 50, top: 0, above: false };
      const half = selected.shape === "round" ? selected.r : selected.h / 2;
      const below = selected.y + half + 14;
      const estH = 400;
      const above = below + estH > 480;
      const top = ((above ? selected.y - half - 14 : below) / 480) * 100;
      return { left: (selected.x / 720) * 100, top, above };
    },
  );
</script>

<section class="w-full text-left">
  {#if view === "menu"}
    <div class="mb-6 flex flex-col items-center gap-2 text-center">
      <h2 class="flex items-center gap-3 text-3xl font-bold tracking-tight">
        <span class="text-primary"><CalendarAddIcon size={30} /></span>
        Вітаємо, {$userStore.user?.name}!
      </h2>
      <p class="text-base text-muted-foreground">
        Оберіть дію: створіть нове бронювання або перегляньте свої записи.
      </p>
    </div>
  {:else}
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 class="flex items-center gap-2 text-lg font-bold">
        {#if view === "bookings"}
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Назад"
            onclick={() => (view = "menu")}
          >
            <AltArrowLeftIcon size={18} />
          </button>
          <span class="text-primary"><BookmarkIcon size={22} /></span>
          Мої бронювання
        {:else}
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Назад"
            onclick={() => (view = "menu")}
          >
            <AltArrowLeftIcon size={18} />
          </button>
          <span class="text-primary"><MapIcon size={22} /></span>
          Бронювання
        {/if}
      </h2>
    </div>
  {/if}

  {#if view === "menu"}
    <div class="flex w-full flex-col gap-2">
      <button
        type="button"
        class="group flex w-full items-center gap-4 rounded-2xl px-4 py-5 text-left transition hover:bg-muted"
        onclick={() => (view = "book")}
      >
        <span
          class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground"
        >
          <CalendarAddIcon size={26} />
        </span>
        <span class="flex flex-col gap-1">
          <span class="text-base font-semibold">Забронювати</span>
          <span class="text-sm text-muted-foreground">
            Створіть нове бронювання: оберіть вільний столик на інтерактивній
            карті залу, вкажіть дату та час візиту
          </span>
        </span>
      </button>

      <button
        type="button"
        class="group flex w-full items-center gap-4 rounded-2xl px-4 py-5 text-left transition hover:bg-muted"
        onclick={() => (view = "bookings")}
      >
        <span
          class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground"
        >
          <BookmarkIcon size={26} />
        </span>
        <span class="flex flex-col gap-1">
          <span class="text-base font-semibold">Мої бронювання</span>
          <span class="text-sm text-muted-foreground">
            Перегляньте список ваших активних і минулих бронювань, деталі
            кожного запису та його статус
          </span>
        </span>
      </button>
    </div>
  {:else if view === "bookings"}
    <MyBookings {nowMin} />
  {:else if view === "book"}
    <div class="flex w-full flex-col gap-6">
      <div>
        <h3
          class="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
        >
          1. Оберіть дату
        </h3>
        <div class="flex flex-col items-center gap-4">
          <div class="grid w-full max-w-lg grid-cols-6 gap-2">
            {#each days as d (d.iso)}
              <button
                type="button"
                class="flex flex-col items-center gap-0.5 rounded-lg border px-1 py-2 text-center transition {selectedDate ===
                d.iso
                  ? 'border-primary bg-primary/15'
                  : 'border-border bg-card hover:bg-muted'}"
                onclick={() => {
                  selectedDate = d.iso;
                  timeFrom = "";
                  timeTo = "";
                }}
              >
                <span
                  class="text-[10px] uppercase leading-none text-muted-foreground"
                  >{d.weekday}</span
                >
                <span class="text-sm font-semibold leading-tight"
                  >{d.dayNum}</span
                >
                <span
                  class="text-[10px] leading-none {d.isToday
                    ? 'font-medium text-primary'
                    : 'text-muted-foreground'}"
                  >{d.isToday ? "сьогодні" : d.month}</span
                >
              </button>
            {/each}
          </div>

          {#if selectedDate}
            <DaySchedule date={selectedDate} {selectedId} />
          {:else}
            <p
              class="w-full rounded-xl border border-dashed border-border bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground"
            >
              Оберіть дату, щоб переглянути зайнятість столиків.
            </p>
          {/if}
        </div>
      </div>

      <div>
        <h3
          class="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
        >
          2. Оберіть столик
        </h3>
        <PriceTable />
        {#if !selected}
          <p class="mb-2 text-center text-sm text-muted-foreground">
            Оберіть столик на карті — відкриється картка бронювання.
          </p>
        {/if}
        <CafeMap {selectedId} {nowMin} onselect={selectTable}>
          {#snippet overlay()}
            {#if selected}
              <TableCard
                table={selected}
                pos={cardPos}
                {seatInfo}
                {occupiedSeats}
                {durationMin}
                {endNextDay}
                {endDateLabel}
                {timeError}
                {timeValid}
                {guestsFilled}
                bind:timeFrom
                bind:timeTo
                bind:guestNames
                onbook={scrollToSummary}
              />
            {/if}
          {/snippet}
        </CafeMap>
      </div>

      <BookingSummary
        table={selected}
        dateLabel={selectedDate ? formatDateLabel(selectedDate) : "N/A"}
        {timeFrom}
        {timeTo}
        {endNextDay}
        {endDateLabel}
        {durationMin}
        {guestNames}
        {occupiedSeats}
        {timeValid}
        {guestsFilled}
        {guestCount}
        {totalPrice}
        onconfirm={confirmBooking}
      />
    </div>
  {/if}
</section>
