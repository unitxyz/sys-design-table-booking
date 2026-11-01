<script lang="ts">
  import {
    ArmchairIcon,
    ChairIcon,
  } from "@solar-icons/svelte/bold-duotone";
  import { PRICE_ROWS } from "../../data/floorPlan";
</script>

<p class="mb-2 text-center text-[11px] text-muted-foreground">
  −10% у «тихі» години 08–12 та 16–20 · місце при частковому бронюванні — ¼
  ціни столика за годину
</p>
<div
  class="mx-auto mb-2 w-full max-w-lg overflow-hidden rounded-xl border-r-4 border-b-4 border-border bg-card"
>
  <table class="w-full text-xs">
    <thead>
      <tr class="bg-muted/60 text-muted-foreground">
        <th class="px-3 py-1.5 text-center font-medium">Час</th>
        <th class="px-3 py-1.5 text-center font-medium">
          <span class="inline-flex items-center gap-1">
            <ChairIcon size={12} />Стіл/год
          </span>
        </th>
        <th class="px-3 py-1.5 text-center font-medium">
          <span class="inline-flex items-center gap-1">
            <ArmchairIcon size={12} />Лаунж/год
          </span>
        </th>
        <th class="px-3 py-1.5 text-center font-medium">Стіл·місце/год</th>
        <th class="px-3 py-1.5 text-center font-medium">Лаунж·місце/год</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-border">
      {#each PRICE_ROWS as row (row.label)}
        <tr>
          <td class="px-3 py-1.5 text-center tabular-nums text-muted-foreground"
            >{row.label}</td
          >
          <td class="px-3 py-1.5 text-center font-medium tabular-nums"
            >${row.full}{row.offPeak ? " (−10%)" : ""}</td
          >
          <td class="px-3 py-1.5 text-center font-medium tabular-nums"
            >${row.lounge}{row.offPeak ? " (−10%)" : ""}</td
          >
          <td
            class="px-3 py-1.5 text-center tabular-nums text-muted-foreground"
            >${row.seat}</td
          >
          <td
            class="px-3 py-1.5 text-center tabular-nums text-muted-foreground"
            >${row.loungeSeat}</td
          >
        </tr>
      {/each}
    </tbody>
  </table>
</div>
