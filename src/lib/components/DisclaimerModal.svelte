<script lang="ts">
  import {
    CloseCircleIcon,
    DangerTriangleIcon,
  } from "@solar-icons/svelte/bold-duotone";
  import { settingsStore } from "../stores/settingsStore";

  let visible = $state<boolean>(true);
  let dontShowAgain = $state<boolean>(false);

  $effect(() => {
    const onKeydown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  });

  function close(): void {
    if (dontShowAgain) settingsStore.acceptDisclaimer();
    visible = false;
  }
</script>

{#if visible}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <button
      aria-label="Закрити вікно"
      class="absolute inset-0 h-full w-full cursor-default bg-foreground/30 backdrop-blur-sm"
      onclick={close}
    ></button>

    <div
      role="dialog"
      aria-modal="true"
      class="relative w-full max-w-md rounded-2xl border-r-4 border-b-4 border-border bg-card p-6 text-card-foreground"
    >
      <div class="mb-4 flex items-center justify-between">
        <h2 class="flex items-center gap-2 text-xl font-bold">
          <span class="text-primary"><DangerTriangleIcon size={24} /></span>
          Дисклеймер
        </h2>
        <button
          aria-label="Закрити"
          class="text-muted-foreground transition hover:text-foreground"
          onclick={close}
        >
          <CloseCircleIcon size={26} />
        </button>
      </div>

      <p class="mb-3 text-sm text-muted-foreground">
        Цей сайт є навчальним проєктом з дисципліни «Проектування інформаційних
        систем». Усі дані зберігаються лише локально у вашому браузері
        (localStorage) і нікуди не надсилаються.
      </p>
      <p class="mb-6 text-sm text-muted-foreground">
        У верхній панелі є кнопка «Сховище розробника» для керування даними
        localStorage, а внизу сторінки — «Ознайомитись» зі зведеною інформацією
        для ознайомлення.
      </p>

      <label class="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          bind:checked={dontShowAgain}
          class="h-4 w-4 accent-primary"
        />
        Не показувати дисклеймер
      </label>

      <button
        class="w-full rounded-lg bg-primary px-4 py-2.5 font-semibold text-primary-foreground transition hover:bg-primary/90"
        onclick={close}
      >
        Зрозуміло
      </button>
    </div>
  </div>
{/if}
