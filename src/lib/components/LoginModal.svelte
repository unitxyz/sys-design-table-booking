<script lang="ts">
  import {
    CloseCircleIcon,
    LoginIcon,
    UserPlusRoundedIcon,
  } from "@solar-icons/svelte/bold-duotone";
  import { userStore, type User } from "../stores/userStore";

  interface Props {
    open?: boolean;
  }

  let { open = $bindable(false) }: Props = $props();

  let name = $state<string>("");
  let inputEl = $state<HTMLInputElement>();

  let trimmed = $derived<string>(name.trim());
  let existingUser = $derived<User | undefined>(
    $userStore.users.find(
      (u: User) => u.name.toLowerCase() === trimmed.toLowerCase(),
    ),
  );

  let isFullName = $derived.by<boolean>(() => {
    const parts = trimmed.split(/\s+/).filter(Boolean);
    return parts.length >= 2 && parts.every((p) => p.length >= 2);
  });

  let nameError = $derived<boolean>(
    trimmed.length > 0 && !existingUser && !isFullName,
  );

  $effect(() => {
    if (open) inputEl?.focus();
  });

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

  function handleSubmit(e: SubmitEvent): void {
    e.preventDefault();
    if (!trimmed) return;
    if (existingUser) userStore.login(existingUser.name);
    else {
      if (!isFullName) return;
      userStore.register(trimmed);
    }
    name = "";
    close();
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
      class="relative w-full max-w-sm rounded-2xl border-r-4 border-b-4 border-border bg-card p-6 text-card-foreground"
    >
      <div class="mb-1 flex items-center justify-between">
        <h2 class="flex items-center gap-2 text-xl font-bold">
          <span class="text-primary">
            {#if existingUser}
              <LoginIcon size={22} />
            {:else}
              <UserPlusRoundedIcon size={22} />
            {/if}
          </span>
          {existingUser ? "Вхід в акаунт" : "Реєстрація"}
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
        {#if existingUser}
          Акаунт з ім'ям «{existingUser.name}» вже існує — натисніть, щоб
          увійти.
        {:else}
          Введіть ім'я та прізвище, щоб ми могли пересвідчитися у вашій особі —
          якщо такого акаунту немає, ми створимо новий.
        {/if}
      </p>

      <form class="flex flex-col gap-4" onsubmit={handleSubmit}>
        <label class="flex flex-col gap-1.5 text-sm">
          Ім'я та прізвище
          <input
            bind:this={inputEl}
            bind:value={name}
            type="text"
            placeholder="Наприклад, Олена Коваленко"
            class="rounded-lg border bg-card px-3 py-2.5 outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 {nameError
              ? 'border-destructive'
              : 'border-border focus:border-primary'}"
          />
          {#if nameError}
            <span class="text-xs text-destructive">
              Вкажіть ім'я та прізвище через пробіл — мінімум 2 літери кожне.
            </span>
          {/if}
        </label>

        <button
          type="submit"
          disabled={!trimmed}
          class="rounded-lg bg-primary px-4 py-2.5 font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {existingUser ? "Увійти" : "Зареєструватися"}
        </button>
      </form>
    </div>
  </div>
{/if}
