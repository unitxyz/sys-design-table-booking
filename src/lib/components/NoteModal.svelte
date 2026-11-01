<script lang="ts">
  import {
    CloseCircleIcon,
    InfoCircleIcon,
  } from "@solar-icons/svelte/bold-duotone";

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
      class="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border-r-4 border-b-4 border-border bg-card p-6 text-card-foreground"
    >
      <div class="mb-4 flex items-center justify-between">
        <h2 class="flex items-center gap-2 text-xl font-bold">
          <span class="text-primary"><InfoCircleIcon size={22} /></span>
          Для викладача
        </h2>
        <button
          aria-label="Закрити"
          class="text-muted-foreground transition hover:text-foreground"
          onclick={close}
        >
          <CloseCircleIcon size={26} />
        </button>
      </div>

      <div class="flex flex-col gap-4 text-sm text-muted-foreground">
        <section>
          <h3 class="mb-1.5 font-semibold text-card-foreground">Проєкт</h3>
          <p>
            «Кафе Єврофе» — інформаційна система бронювання столиків. Курсовий
            проєкт з дисципліни «Проектування інформаційних систем».
          </p>
        </section>

        <section>
          <h3 class="mb-1.5 font-semibold text-card-foreground">
            Предметна область
          </h3>
          <p>
            Зал містить 16 столиків по чотири місця: вісім типу «Стіл» і вісім
            типу «Лаунж». Для лаунж-зони діє надбавка до тарифу. Користувач
            обирає дату, переглядає розклад зайнятості, вибирає столик і вказує
            час та гостей.
          </p>
        </section>

        <section>
          <h3 class="mb-1.5 font-semibold text-card-foreground">
            Часткове бронювання
          </h3>
          <p>
            Додаткова функція проєкту: на столиках із частковим типом можна
            бронювати окремі вільні місця, а не весь столик. Система зберігає
            гостей разом із номерами місць і перевіряє зайнятість кожного місця
            окремо. Тому різні користувачі можуть бронювати вільні місця за
            одним столиком на сумісний час.
          </p>
        </section>

        <section>
          <h3 class="mb-1.5 font-semibold text-card-foreground">
            Перевірка доступності
          </h3>
          <p>
            Доступність визначається одночасно за часом і місцем. Інтервали
            перевіряються на перетин; для чужих бронювань враховується буфер
            десять хвилин до початку та після завершення, а між ними має
            залишатися щонайменше десять хвилин. Власні бронювання дозволено
            стикувати без проміжку. Тривалість — до восьми годин; бронювати на
            минулий час не можна. Якщо час завершення раніший за час початку,
            система трактує його як наступну добу.
          </p>
        </section>

        <section>
          <h3 class="mb-1.5 font-semibold text-card-foreground">
            Тарифи й оплата
          </h3>
          <p>
            Вартість залежить від типу зони, часу доби та кількості місць. У
            «тихі» години 08:00–12:00 і 16:00–20:00 діє знижка 10%; у лаунж-зоні
            — надбавка 40%. Передбачено передоплату 10% і доплату 90% під час
            візиту. Оплата в прототипі симулюється.
          </p>
        </section>

        <section>
          <h3 class="mb-1.5 font-semibold text-card-foreground">
            Керування бронюваннями
          </h3>
          <p>
            Користувач може переглядати й сортувати власні бронювання,
            розширювати їхній часовий інтервал із повторною перевіркою
            доступності та перерахунком вартості, а також скасовувати. Після
            скасування запис зберігається в історії, але більше не займає місце
            й час.
          </p>
        </section>

        <section>
          <h3 class="mb-1.5 font-semibold text-card-foreground">
            Межі прототипу
          </h3>
          <p>
            Автентифікацію спрощено: вхід і реєстрація виконуються за ім’ям та
            прізвищем без пароля. Серверної частини й бази даних немає — дані
            зберігаються у localStorage цього браузера. Такий вибір залишає
            фокус роботи на правилах бронювання та перевірці конфліктів, а не на
            типовому обміні CRUD-даними із сервером. Платіжної прослойки та
            інтеграції з платіжним сервісом також немає: підтвердження оплати
            лише симулюється в інтерфейсі. Це навчальний прототип, а не система
            для реальних платежів чи спільної роботи кількох пристроїв.
          </p>
        </section>

        <section>
          <h3 class="mb-1.5 font-semibold text-card-foreground">Технології</h3>
          <p>
            Інтерфейс реалізовано на Svelte 5 і TypeScript; використано Vite,
            Tailwind CSS та Solar Icons. Правила доступності винесені в модуль
            availability.ts, а інтерфейс поділено на компоненти карти, розкладу,
            картки столика, підсумку та списку бронювань.
          </p>
        </section>
      </div>
    </div>
  </div>
{/if}
