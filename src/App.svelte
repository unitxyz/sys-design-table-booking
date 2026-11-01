<script lang="ts">
  import {
    CalendarIcon,
    ChefHatIcon,
    DangerTriangleIcon,
    DatabaseIcon,
    LoginIcon,
    LogoutIcon,
  } from "@solar-icons/svelte/bold-duotone";
  import DevStorageModal from "./lib/components/DevStorageModal.svelte";
  import DisclaimerModal from "./lib/components/DisclaimerModal.svelte";
  import FloorPlan from "./lib/components/FloorPlan.svelte";
  import LoginModal from "./lib/components/LoginModal.svelte";
  import NoteModal from "./lib/components/NoteModal.svelte";
  import { settingsStore } from "./lib/stores/settingsStore";
  import { userStore } from "./lib/stores/userStore";

  let modalOpen = $state<boolean>(false);
  let devOpen = $state<boolean>(false);
  let noteOpen = $state<boolean>(false);

  function openLoginModal(): void {
    modalOpen = true;
  }

  function openDevModal(): void {
    devOpen = true;
  }

  function openNoteModal(): void {
    noteOpen = true;
  }

  function handleLogout(): void {
    userStore.logout();
  }
</script>

<div class="min-h-screen bg-background text-foreground">
  <header class="fixed inset-x-0 top-4 z-40 flex justify-center px-4">
    <div
      class="flex w-full max-w-2xl items-center justify-between gap-4 rounded-full border-r-4 border-b-4 border-border bg-card/80 py-2 pr-2 pl-5 backdrop-blur-md"
    >
      <div class="flex items-center gap-2.5">
        <span class="text-primary">
          <ChefHatIcon size={26} secondaryOpacity={0.35} />
        </span>
        <span class="text-base font-bold tracking-tight">Кафе «Єврофе»</span>
      </div>

      <div class="flex items-center gap-2">
        <button
          aria-label="Сховище розробника"
          title="Сховище розробника"
          class="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
          onclick={openDevModal}
        >
          <DatabaseIcon size={19} />
        </button>

        {#if $userStore.user}
          <div class="flex items-center gap-2.5 pr-1">
            <div
              class="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
            >
              {$userStore.user.name[0]?.toUpperCase()}
            </div>
            <div class="flex min-w-0 flex-col">
              <span class="max-w-28 truncate text-sm leading-tight font-medium">
                {$userStore.user.name}
              </span>
            </div>
          </div>
          <div class="h-5 border-l border-border"></div>
          <button
            aria-label="Вийти з акаунту"
            title="Вийти"
            class="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
            onclick={handleLogout}
          >
            <LogoutIcon size={19} />
          </button>
        {:else}
          <button
            class="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 active:scale-95"
            onclick={openLoginModal}
          >
            <LoginIcon size={17} />
            Увійти
          </button>
        {/if}
      </div>
    </div>
  </header>

  <main
    class="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-8 px-6 py-24 pb-20 text-center"
  >
    {#if $userStore.user}
      <FloorPlan />
    {:else}
      <div class="flex flex-col items-center gap-3">
        <h1 class="flex items-center gap-3 text-4xl font-bold tracking-tight">
          <span class="text-primary"><CalendarIcon size={36} /></span>
          Бронювання столиків у Єврофе
        </h1>
        <p class="max-w-lg text-center text-xl text-muted-foreground">
          Щоб забронювати столик, увійдіть у свій акаунт або зареєструйтесь
        </p>
      </div>
    {/if}
  </main>

  <footer class="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
    <button
      class="flex items-center gap-2 rounded-full border-r-4 border-b-4 border-border bg-card/80 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-foreground backdrop-blur-md transition hover:bg-card active:scale-95"
      onclick={openNoteModal}
    >
      <span class="text-primary"><DangerTriangleIcon size={16} /></span>
      Ознайомитись
    </button>
  </footer>
</div>

<LoginModal bind:open={modalOpen} />
<DevStorageModal bind:open={devOpen} />
<NoteModal bind:open={noteOpen} />
{#if $settingsStore.disclaimer}
  <DisclaimerModal />
{/if}
