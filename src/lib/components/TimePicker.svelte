<script lang="ts">
  import {
    AltArrowDownIcon,
    ClockCircleIcon,
  } from "@solar-icons/svelte/bold-duotone";

  interface Props {
    value?: string;
    placeholder?: string;
  }

  let { value = $bindable(""), placeholder = "--:--" }: Props = $props();

  const HOURS: number[] = Array.from({ length: 24 }, (_, i) => i);
  const MINUTES: number[] = Array.from({ length: 12 }, (_, i) => i * 5);

  let open = $state<boolean>(false);
  let el = $state<HTMLDivElement>();
  let hourCol = $state<HTMLDivElement>();
  let minCol = $state<HTMLDivElement>();

  let hour = $derived<number | null>(
    value ? Number(value.split(":")[0]) : null,
  );
  let minute = $derived<number | null>(
    value ? Number(value.split(":")[1]) : null,
  );

  $effect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent): void => {
      if (el && !el.contains(e.target as Node)) open = false;
    };
    const onKeydown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") open = false;
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeydown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeydown);
    };
  });

  $effect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      for (const col of [hourCol, minCol]) {
        col
          ?.querySelector("[data-active='true']")
          ?.scrollIntoView({ block: "center" });
      }
    });
  });

  function pad(n: number): string {
    return String(n).padStart(2, "0");
  }

  function pickHour(h: number): void {
    value = `${pad(h)}:${pad(minute ?? 0)}`;
  }

  function pickMinute(m: number): void {
    value = `${pad(hour ?? 0)}:${pad(m)}`;
  }
</script>

<div class="relative" bind:this={el}>
  <button
    type="button"
    class="flex h-9 w-28 items-center justify-between gap-2 rounded-lg border bg-card px-2.5 text-sm outline-none transition {open
      ? 'border-primary ring-2 ring-primary/20'
      : 'border-border hover:border-muted-foreground/40'}"
    aria-haspopup="listbox"
    aria-expanded={open}
    onclick={() => (open = !open)}
  >
    <span class="flex items-center gap-1.5">
      <span class="text-muted-foreground"><ClockCircleIcon size={15} /></span>
      <span
        class="tabular-nums {value
          ? 'font-medium text-foreground'
          : 'text-muted-foreground'}">{value || placeholder}</span
      >
    </span>
    <span
      class="text-muted-foreground transition-transform {open
        ? 'rotate-180'
        : ''}"
    >
      <AltArrowDownIcon size={13} />
    </span>
  </button>

  {#if open}
    <div
      class="absolute left-0 top-full z-20 mt-1.5 flex overflow-hidden rounded-xl border-r-4 border-b-4 border-border bg-card"
    >
      <div
        bind:this={hourCol}
        class="max-h-44 w-16 overflow-y-auto py-1"
        role="listbox"
        aria-label="Години"
      >
        <p
          class="sticky top-0 bg-card py-1 text-center text-[10px] font-medium uppercase leading-none text-muted-foreground"
        >
          год
        </p>
        {#each HOURS as h (h)}
          <button
            type="button"
            role="option"
            aria-selected={hour === h}
            data-active={hour === h}
            class="block w-full px-3 py-1.5 text-center text-sm tabular-nums transition {hour ===
            h
              ? 'bg-primary/10 font-semibold text-primary'
              : 'text-card-foreground hover:bg-muted'}"
            onclick={() => pickHour(h)}>{pad(h)}</button
          >
        {/each}
      </div>
      <div
        bind:this={minCol}
        class="max-h-44 w-16 overflow-y-auto border-l border-border py-1"
        role="listbox"
        aria-label="Хвилини"
      >
        <p
          class="sticky top-0 bg-card py-1 text-center text-[10px] font-medium uppercase leading-none text-muted-foreground"
        >
          хв
        </p>
        {#each MINUTES as m (m)}
          <button
            type="button"
            role="option"
            aria-selected={minute === m}
            data-active={minute === m}
            class="block w-full px-3 py-1.5 text-center text-sm tabular-nums transition {minute ===
            m
              ? 'bg-primary/10 font-semibold text-primary'
              : 'text-card-foreground hover:bg-muted'}"
            onclick={() => pickMinute(m)}>{pad(m)}</button
          >
        {/each}
      </div>
    </div>
  {/if}
</div>
