<script lang="ts">
  import type { Snippet } from "svelte";
  import {
    ArmchairIcon,
    ChairIcon,
    ChefHatIcon,
    LeafIcon,
    WineglassIcon,
  } from "@solar-icons/svelte/bold-duotone";
  import {
    seatBusyNow,
    tableBusyNow,
  } from "../../availability";
  import {
    chairPositions,
    TABLES,
    type CafeTable,
  } from "../../data/floorPlan";
  import { bookingStore } from "../../stores/bookingStore";

  interface Props {
    selectedId: string | null;
    nowMin: number;
    onselect: (t: CafeTable) => void;
    overlay?: Snippet;
  }

  let { selectedId, nowMin, onselect, overlay }: Props = $props();

  function handleKeydown(e: KeyboardEvent, t: CafeTable): void {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onselect(t);
    }
  }

  function tableClass(t: CafeTable): string {
    if (t.id === selectedId) return "fill-primary/15 stroke-primary";
    if (tableBusyNow($bookingStore.bookings, t, nowMin))
      return "fill-destructive/10 stroke-destructive";
    return "fill-success/10 stroke-success group-hover:stroke-primary";
  }

  function seatCircleClass(t: CafeTable, seat: number): string {
    if (seatBusyNow($bookingStore.bookings, t.id, seat, nowMin))
      return "fill-destructive/50";
    if (t.id === selectedId) return "fill-primary/50";
    return "fill-success/40";
  }

  function numberClass(t: CafeTable): string {
    if (t.id === selectedId) return "fill-primary font-bold text-sm";
    if (tableBusyNow($bookingStore.bookings, t, nowMin))
      return "fill-destructive text-sm";
    return "fill-success text-sm font-medium";
  }

  function tableIconClass(t: CafeTable): string {
    if (t.id === selectedId) return "text-primary";
    if (tableBusyNow($bookingStore.bookings, t, nowMin))
      return "text-destructive";
    return "text-success";
  }
</script>

<div class="relative">
  <svg
    viewBox="0 0 720 480"
    class="h-auto w-full"
    role="img"
    aria-label="Карта столиків кафе"
  >
    <defs>
      <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" class="fill-muted/60" />
        <path d="M0 8 L8 0" class="stroke-muted-foreground/30" stroke-width="1" />
      </pattern>
    </defs>

    <!-- Стіни -->
    <rect
      x="20"
      y="20"
      width="680"
      height="440"
      rx="14"
      fill="none"
      class="stroke-foreground/30"
      stroke-width="3"
    />

    <!-- Вікна на бокових стінах -->
    <rect
      x="16"
      y="90"
      width="7"
      height="110"
      rx="2"
      class="fill-card stroke-muted-foreground"
    />
    <line
      x1="19.5"
      y1="92"
      x2="19.5"
      y2="198"
      class="stroke-muted-foreground/60"
      stroke-dasharray="6 5"
    />
    <rect
      x="16"
      y="240"
      width="7"
      height="110"
      rx="2"
      class="fill-card stroke-muted-foreground"
    />
    <line
      x1="19.5"
      y1="242"
      x2="19.5"
      y2="348"
      class="stroke-muted-foreground/60"
      stroke-dasharray="6 5"
    />
    <rect
      x="697"
      y="90"
      width="7"
      height="110"
      rx="2"
      class="fill-card stroke-muted-foreground"
    />
    <line
      x1="700.5"
      y1="92"
      x2="700.5"
      y2="198"
      class="stroke-muted-foreground/60"
      stroke-dasharray="6 5"
    />
    <rect
      x="697"
      y="240"
      width="7"
      height="110"
      rx="2"
      class="fill-card stroke-muted-foreground"
    />
    <line
      x1="700.5"
      y1="242"
      x2="700.5"
      y2="348"
      class="stroke-muted-foreground/60"
      stroke-dasharray="6 5"
    />

    <!-- Вікна на нижній стіні біля входу -->
    <rect
      x="60"
      y="456"
      width="80"
      height="7"
      rx="2"
      class="fill-card stroke-muted-foreground"
    />
    <line
      x1="62"
      y1="459.5"
      x2="138"
      y2="459.5"
      class="stroke-muted-foreground/60"
      stroke-dasharray="6 5"
    />
    <rect
      x="200"
      y="456"
      width="80"
      height="7"
      rx="2"
      class="fill-card stroke-muted-foreground"
    />
    <line
      x1="202"
      y1="459.5"
      x2="278"
      y2="459.5"
      class="stroke-muted-foreground/60"
      stroke-dasharray="6 5"
    />
    <rect
      x="440"
      y="456"
      width="80"
      height="7"
      rx="2"
      class="fill-card stroke-muted-foreground"
    />
    <line
      x1="442"
      y1="459.5"
      x2="518"
      y2="459.5"
      class="stroke-muted-foreground/60"
      stroke-dasharray="6 5"
    />
    <rect
      x="580"
      y="456"
      width="80"
      height="7"
      rx="2"
      class="fill-card stroke-muted-foreground"
    />
    <line
      x1="582"
      y1="459.5"
      x2="658"
      y2="459.5"
      class="stroke-muted-foreground/60"
      stroke-dasharray="6 5"
    />

    <!-- Вхід знизу по центру -->
    <rect x="335" y="455" width="60" height="10" class="fill-card" />
    <line
      x1="345"
      y1="460"
      x2="345"
      y2="420"
      class="stroke-foreground/50"
      stroke-width="2"
    />
    <path
      d="M345 420 A40 40 0 0 1 385 460"
      fill="none"
      class="stroke-foreground/50"
      stroke-width="2"
      stroke-dasharray="5 4"
    />
    <text
      x="360"
      y="476"
      text-anchor="middle"
      class="fill-muted-foreground text-xs font-semibold uppercase tracking-widest"
      >Вхід</text
    >

    <!-- Кухня по центру зверху -->
    <rect
      x="276"
      y="40"
      width="168"
      height="96"
      rx="10"
      fill="url(#hatch)"
      class="stroke-border opacity-70"
    />
    <foreignObject x="312" y="76" width="20" height="20">
      <span
        class="flex h-5 w-5 items-center justify-center text-muted-foreground"
      >
        <ChefHatIcon size={18} />
      </span>
    </foreignObject>
    <text
      x="366"
      y="90"
      text-anchor="middle"
      class="fill-muted-foreground text-xs font-semibold uppercase tracking-widest"
      >Кухня</text
    >

    <!-- Бар перед кухнею -->
    <rect
      x="252"
      y="156"
      width="216"
      height="46"
      rx="10"
      fill="url(#hatch)"
      class="stroke-border opacity-70"
    />
    <foreignObject x="322" y="168" width="20" height="20">
      <span
        class="flex h-5 w-5 items-center justify-center text-muted-foreground"
      >
        <WineglassIcon size={18} />
      </span>
    </foreignObject>
    <text
      x="366"
      y="181"
      text-anchor="middle"
      class="fill-muted-foreground text-xs font-semibold uppercase tracking-widest"
      >Бар</text
    >

    <!-- Зелена зона очікування в центрі -->
    <rect
      x="272"
      y="240"
      width="176"
      height="160"
      rx="10"
      fill="url(#hatch)"
      class="stroke-border opacity-70"
    />
    <text
      x="360"
      y="308"
      text-anchor="middle"
      class="fill-muted-foreground text-xs font-semibold uppercase tracking-widest"
      >Зелена зона</text
    >
    <text
      x="360"
      y="324"
      text-anchor="middle"
      class="fill-muted-foreground text-xs font-semibold uppercase tracking-widest"
      >(очікування)</text
    >
    <foreignObject x="352" y="334" width="18" height="18">
      <span
        class="flex h-[18px] w-[18px] items-center justify-center text-muted-foreground"
      >
        <LeafIcon size={16} />
      </span>
    </foreignObject>

    <!-- 8 барних стільців -->
    <circle cx="290" cy="222" r="6" class="fill-muted stroke-border" />
    <circle cx="310" cy="222" r="6" class="fill-muted stroke-border" />
    <circle cx="330" cy="222" r="6" class="fill-muted stroke-border" />
    <circle cx="350" cy="222" r="6" class="fill-muted stroke-border" />
    <circle cx="370" cy="222" r="6" class="fill-muted stroke-border" />
    <circle cx="390" cy="222" r="6" class="fill-muted stroke-border" />
    <circle cx="410" cy="222" r="6" class="fill-muted stroke-border" />
    <circle cx="430" cy="222" r="6" class="fill-muted stroke-border" />

    <!-- Столики -->
    {#each TABLES as t (t.id)}
      <g
        role="button"
        tabindex="0"
        aria-label="Столик №{t.number}, {t.seats} місць, {t.status === 'free'
          ? 'вільний'
          : 'зайнятий'}"
        class="group cursor-pointer outline-none"
        onclick={() => onselect(t)}
        onkeydown={(e: KeyboardEvent) => handleKeydown(e, t)}
      >
        {#each chairPositions(t) as c, i}
          <circle cx={c.x} cy={c.y} r="5" class={seatCircleClass(t, i + 1)} />
        {/each}

        {#if t.shape === "round"}
          <circle
            cx={t.x}
            cy={t.y}
            r={t.r}
            stroke-width="2"
            class={tableClass(t)}
          />
        {:else}
          <rect
            x={t.x - t.w / 2}
            y={t.y - t.h / 2}
            width={t.w}
            height={t.h}
            rx="10"
            stroke-width="2"
            class={tableClass(t)}
          />
        {/if}

        <text
          x={t.x}
          y={t.y - 4}
          text-anchor="middle"
          dominant-baseline="central"
          class={numberClass(t)}
        >
          {t.number}
        </text>
        <foreignObject x={t.x - 6} y={t.y + 6} width="12" height="12">
          <span
            class="flex h-3 w-3 items-center justify-center {tableIconClass(
              t,
            )}"
          >
            {#if t.zone === "Лаунж"}
              <ArmchairIcon size={11} />
            {:else}
              <ChairIcon size={11} />
            {/if}
          </span>
        </foreignObject>
      </g>
    {/each}
  </svg>

  {@render overlay?.()}
</div>
