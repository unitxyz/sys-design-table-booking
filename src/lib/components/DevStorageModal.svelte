<script lang="ts">
  import {
    CloseCircleIcon,
    DatabaseIcon,
    MagicWandIcon,
    SettingsIcon,
    TrashBinTrashIcon,
    UsersGroupRoundedIcon,
  } from "@solar-icons/svelte/bold-duotone";
  import { settingsStore } from "../stores/settingsStore";
  import { userStore, type User } from "../stores/userStore";
  import {
    bookingStartMin,
    bookingStore,
    dateToDayMs,
    toISODate,
    toMinutes,
    type Booking,
  } from "../stores/bookingStore";
  import { bookingTotal, TABLES } from "../data/floorPlan";

  interface Props {
    open?: boolean;
  }

  let { open = $bindable(false) }: Props = $props();

  $effect(() => {
    if (!open) return;
    const onKeydown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  });

  function close(): void {
    open = false;
  }

  function handleRename(e: Event, user: User): void {
    const input = e.currentTarget as HTMLInputElement;
    const value = input.value.trim().replace(/\s+/g, " ");
    const parts = value.split(" ").filter(Boolean);
    if (
      value === user.name ||
      parts.length < 2 ||
      parts.some((p) => p.length < 2)
    ) {
      input.value = user.name;
      return;
    }
    userStore.updateName(user.id, value);
  }

  function handleNameKeydown(e: KeyboardEvent): void {
    if (e.key === "Enter") (e.currentTarget as HTMLInputElement).blur();
  }

  let sortedBookings = $derived<Booking[]>(
    [...$bookingStore.bookings].sort(
      (a, b) => bookingStartMin(a) - bookingStartMin(b),
    ),
  );

  function fmtDate(iso: string): string {
    const [, m, d] = iso.split("-");
    return `${d}.${m}`;
  }

  const SEED_NAMES = [
    "Олена Коваленко",
    "Тарас Шевченко",
    "Ірина Бондаренко",
    "Богдан Ткаченко",
    "Марта Кравченко",
    "Ніна Мороз",
    "Петро Савченко",
    "Софія Литвин",
    "Ігор Поліщук",
    "Дарина Романюк",
    "Віталій Кузьменко",
    "Аня Гаврилюк",
    "Олег Марченко",
    "Леся Олійник",
    "Сергій Данилюк",
    "Оксана Василенко",
  ];

  const GUEST_NAMES = [
    "Максим Юрченко",
    "Юля Гончар",
    "Андрій Мельник",
    "Катя Захарчук",
    "Роман Сидоренко",
    "Оля Павленко",
  ];

  const DAY_SPECS: { offset: number; p: number; gap: number }[] = [
    { offset: 0, p: 0.75, gap: 90 },
    { offset: 1, p: 0.15, gap: 300 },
    { offset: 2, p: 1, gap: 20 },
    { offset: 3, p: 0.5, gap: 140 },
    { offset: 4, p: 0.35, gap: 200 },
    { offset: 5, p: 0.15, gap: 300 },
    { offset: 6, p: 0.6, gap: 110 },
    { offset: 7, p: 1, gap: 30 },
    { offset: 8, p: 0.2, gap: 260 },
    { offset: 9, p: 0.4, gap: 170 },
    { offset: 10, p: 0.55, gap: 120 },
    { offset: 12, p: 1, gap: 15 },
    { offset: 14, p: 0.4, gap: 180 },
    { offset: 15, p: 0.15, gap: 320 },
    { offset: 17, p: 0.5, gap: 140 },
    { offset: 19, p: 0.2, gap: 240 },
    { offset: 21, p: 0.6, gap: 100 },
    { offset: 24, p: 0.35, gap: 190 },
    { offset: 26, p: 0.15, gap: 300 },
    { offset: 28, p: 0.45, gap: 160 },
  ];

  function hash(n: number): number {
    let x = (n ^ 0x9e3779b9) >>> 0;
    x = Math.imul(x, 0x85ebca6b) >>> 0;
    x ^= x >>> 13;
    x = Math.imul(x, 0xc2b2ae35) >>> 0;
    x ^= x >>> 16;
    return x >>> 0;
  }

  const rnd = (seed: number): number => (hash(seed) % 10000) / 10000;

  function generateSeedData(): void {
    bookingStore.clear();
    const me = $userStore.user;
    for (const u of $userStore.users.filter((x) => x.id !== me?.id))
      userStore.deleteUser(u.id);
    const seedUsers = SEED_NAMES.map((name, i) => ({
      id: `00000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
      name,
    }));
    userStore.addMany(seedUsers);

    const candidates = me ? [me, ...seedUsers] : seedUsers;

    const userBusy = new Map<string, [number, number][]>();
    let cursor = 0;
    const pickUser = (iso: string, s: number, e: number): number => {
      for (let k = 0; k < candidates.length; k++) {
        const u = (cursor + k) % candidates.length;
        const key = `${u}:${iso}`;
        const arr = userBusy.get(key) ?? [];
        if (!arr.some(([a, b]) => s < b && a < e)) {
          arr.push([s, e]);
          userBusy.set(key, arr);
          cursor = (u + 1) % candidates.length;
          return u;
        }
      }
      return -1;
    };

    const now = new Date();
    let seq = 0;
    for (const spec of DAY_SPECS) {
      const d = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + spec.offset,
      );
      const iso = toISODate(d);
      const dayStart = Math.floor(dateToDayMs(iso) / 60000);
      TABLES.forEach((t, i) => {
        const base = spec.offset * 7919 + i * 104729;
        if (rnd(base) > spec.p) return;
        let cursorMin = 8 * 60 + Math.floor(rnd(base + 1) * 160);
        let j = 0;
        while (cursorMin < 21 * 60) {
          const dur = 45 + Math.floor(rnd(base + cursorMin * 3 + 7) * 120);
          const sMin = cursorMin;
          const eMin = Math.min(sMin + dur, 1439);
          if (eMin <= sMin) break;
          const from = fmtMin(sMin);
          const to = fmtMin(eMin);
          const s = dayStart + sMin;
          const e = dayStart + eMin;
          const ui = pickUser(iso, sMin, eMin);
          cursorMin =
            eMin + 10 + Math.floor(rnd(base + eMin * 5 + 13) * spec.gap);
          if (ui < 0) continue;
          const user = candidates[ui];
          const seats =
            t.booking === "full"
              ? [1, 2, 3, 4]
              : j % 2 === 0
                ? [((i + j) % 4) + 1]
                : [((i + j) % 4) + 1, ((i + j + 1) % 4) + 1];
          const guests = seats.map((seat, k) => ({
            seat,
            name:
              k === 0
                ? user.name
                : GUEST_NAMES[(i + j + k) % GUEST_NAMES.length],
          }));
          bookingStore.add({
            id: `00000000-0000-4000-8001-${String(++seq).padStart(12, "0")}`,
            tableId: t.id,
            tableNumber: t.number,
            zone: t.zone,
            kind: t.booking,
            date: iso,
            from,
            to,
            guests,
            userId: user.id,
            userName: user.name,
            price: bookingTotal(t, s, e, guests.length),
            paid: true,
            createdAt: Date.now() - (seq % 48) * 3600_000,
          });
          j++;
        }
      });
    }
  }

  function fmtMin(m: number): string {
    return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(
      m % 60,
    ).padStart(2, "0")}`;
  }

  let confirmAction = $state<"generate" | "clear" | null>(null);

  function askGenerate(): void {
    if ($bookingStore.bookings.length > 0 || $userStore.users.length > 1) {
      confirmAction = "generate";
    } else {
      generateSeedData();
    }
  }

  function runConfirm(): void {
    if (confirmAction === "clear") {
      bookingStore.clear();
      userStore.clear();
    } else if (confirmAction === "generate") {
      generateSeedData();
    }
    confirmAction = null;
  }
</script>

{#if open}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <button
      aria-label="Закрити вікно"
      class="absolute inset-0 h-full w-full cursor-default bg-foreground/30 backdrop-blur-sm"
      onclick={close}
    ></button>

    <div
      role="dialog"
      aria-modal="true"
      class="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border-r-4 border-b-4 border-border bg-card p-6 text-card-foreground"
    >
      <div class="mb-1 flex items-center justify-between">
        <h2 class="flex items-center gap-2 text-xl font-bold">
          <span class="text-primary"><DatabaseIcon size={22} /></span>
          Сховище розробника
        </h2>
        <button
          aria-label="Закрити"
          class="text-muted-foreground transition hover:text-foreground"
          onclick={close}
        >
          <CloseCircleIcon size={26} />
        </button>
      </div>

      <p class="mb-5 text-sm text-muted-foreground">
        Дані з локального сховища — ім'я можна змінити, запис видалити.
      </p>

      <h3 class="mb-3 flex items-center gap-2 text-sm font-semibold">
        <span class="text-primary"><SettingsIcon size={18} /></span>
        Налаштування
      </h3>

      <div class="mb-4 flex gap-2">
        <button
          type="button"
          class="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 active:scale-95"
          onclick={askGenerate}
        >
          <MagicWandIcon size={15} />
          Згенерувати дані
        </button>
        <button
          type="button"
          disabled={$bookingStore.bookings.length === 0 &&
            $userStore.users.length === 0}
          class="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground transition hover:bg-destructive/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          onclick={() => (confirmAction = "clear")}
        >
          <TrashBinTrashIcon size={15} />
          Видалити все
        </button>
      </div>

      <label
        class="mb-5 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border bg-muted/50 px-3 py-2.5"
      >
        <span class="text-sm font-medium">Дисклеймер при завантаженні</span>
        <input
          type="checkbox"
          class="peer sr-only"
          checked={$settingsStore.disclaimer}
          onchange={(e: Event) =>
            settingsStore.setDisclaimer(
              (e.currentTarget as HTMLInputElement).checked,
            )}
        />
        <span
          class="relative h-5 w-9 shrink-0 rounded-full bg-border transition-colors peer-checked:bg-primary after:absolute after:top-0.5 after:left-0.5 after:h-4 after:w-4 after:rounded-full after:bg-card after:transition-transform peer-checked:after:translate-x-4"
        ></span>
      </label>

      <h3 class="mb-3 flex items-center gap-2 text-sm font-semibold">
        <span class="text-primary"><UsersGroupRoundedIcon size={18} /></span>
        Користувачі ({$userStore.users.length})
      </h3>

      {#if $userStore.users.length > 0}
        <ul class="flex max-h-56 flex-col gap-1.5 overflow-y-auto pr-1">
          {#each $userStore.users as u (u.id)}
            <li
              class="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-2 py-1.5"
            >
              <input
                value={u.name}
                onchange={(e: Event) => handleRename(e, u)}
                onkeydown={handleNameKeydown}
                class="w-32 shrink-0 rounded-lg border border-transparent bg-transparent px-2 py-0.5 text-center text-sm font-medium outline-none transition focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/20"
              />
              <span
                class="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground"
                >{u.id}</span
              >
              {#if $userStore.user?.id === u.id}
                <span
                  class="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                  >поточний</span
                >
              {/if}
              <button
                aria-label="Видалити користувача"
                title="Видалити"
                class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                onclick={() => userStore.deleteUser(u.id)}
              >
                <TrashBinTrashIcon size={15} />
              </button>
            </li>
          {/each}
        </ul>
      {:else}
        <p class="py-4 text-center text-sm text-muted-foreground">
          У сторі поки немає користувачів
        </p>
      {/if}

      <h3 class="mb-3 mt-6 flex items-center gap-2 text-sm font-semibold">
        <span class="text-primary"><DatabaseIcon size={18} /></span>
        Бронювання ({$bookingStore.bookings.length})
      </h3>

      {#if sortedBookings.length > 0}
        <ul class="flex max-h-56 flex-col gap-1.5 overflow-y-auto pr-1">
          {#each sortedBookings as b (b.id)}
            <li
              class="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-2 py-1.5 text-xs"
            >
              <span class="shrink-0 font-semibold">№{b.tableNumber}</span>
              <span class="shrink-0 text-muted-foreground">
                {fmtDate(b.date)}
                {b.from}–{b.to}{toMinutes(b.to) <= toMinutes(b.from)
                  ? " (+1)"
                  : ""}
              </span>
              <span class="shrink-0 text-muted-foreground/70">
                {b.kind === "full"
                  ? "повне"
                  : `м.${b.guests.map((g) => g.seat).join(",")}`}
              </span>
              <span class="min-w-0 flex-1 truncate text-muted-foreground"
                >{b.userName}</span
              >
              {#if b.cancelled}
                <span
                  class="shrink-0 rounded-full bg-destructive/10 px-1.5 py-0.5 text-destructive"
                  >скас.</span
                >
              {/if}
              <button
                aria-label="Видалити бронювання"
                title="Видалити"
                class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                onclick={() => bookingStore.remove(b.id)}
              >
                <TrashBinTrashIcon size={15} />
              </button>
            </li>
          {/each}
        </ul>
      {:else}
        <p class="py-3 text-center text-sm text-muted-foreground">
          Бронювань немає
        </p>
      {/if}
    </div>

    {#if confirmAction}
      <div class="absolute inset-0 z-10 flex items-center justify-center p-6">
        <div
          class="w-full max-w-xs rounded-2xl border-r-4 border-b-4 border-border bg-card p-5 text-center shadow-xl"
        >
          <p class="mb-1 text-sm font-semibold">
            {confirmAction === "clear"
              ? "Видалити всі дані?"
              : "Згенерувати тестові дані?"}
          </p>
          <p class="mb-4 text-xs text-muted-foreground">
            Усі користувачі та бронювання буде видалено{confirmAction ===
            "generate"
              ? " і замінено тестовими"
              : ""}. Дію не можна скасувати.
          </p>
          <div class="flex gap-2">
            <button
              type="button"
              class="flex-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold transition hover:bg-muted active:scale-95"
              onclick={() => (confirmAction = null)}
            >
              Скасувати
            </button>
            <button
              type="button"
              class="flex-1 rounded-full bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground transition hover:bg-destructive/90 active:scale-95"
              onclick={runConfirm}
            >
              Підтвердити
            </button>
          </div>
        </div>
      </div>
    {/if}
  </div>
{/if}
