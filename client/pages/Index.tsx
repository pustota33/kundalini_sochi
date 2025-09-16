import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Clock3,
  MapPin,
  Banknote,
  Sparkles,
  Waves,
  Heart,
  HandHeart,
  Play,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const EVENT_DATE = new Date("2025-10-05T11:00:00+03:00");
const REMAINING_SEATS = 8;

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return useMemo(() => {
    const diff = Math.max(0, target.getTime() - now.getTime());
    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { days, hours, minutes, seconds };
  }, [now, target]);
}

function StatPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground">
      {children}
    </span>
  );
}

function ReserveModal() {
  const WEBHOOK = "https://hook.eu2.make.com/j5hxjpnnfwk01l4ak2j8eqdb6quks1xn";
  useEffect(() => {
    const btn = document.getElementById("reserveBtn");
    const modal = document.getElementById("reserveModal") as HTMLDivElement | null;
    const closeBtn = document.getElementById("modalClose");
    const form = document.getElementById("reserveForm") as HTMLFormElement | null;
    const ok = document.getElementById("formMsg") as HTMLParagraphElement | null;
    const err = document.getElementById("formErr") as HTMLParagraphElement | null;

    const open = (e?: Event) => {
      if (modal) modal.style.display = "flex";
      const trigger = (e?.currentTarget as HTMLElement) || (e?.target as HTMLElement) || null;
      const prefill = trigger?.getAttribute("data-prefill") || "";
      const comment = document.querySelector<HTMLTextAreaElement>("#reserveForm textarea[name='comment']");
      if (comment) comment.value = prefill;
    };
    const close = () => { if (modal) modal.style.display = "none"; };

    btn?.addEventListener("click", open);
    document.querySelectorAll('[data-reserve-trigger]').forEach(el => el.addEventListener('click', open));
    closeBtn?.addEventListener("click", close);
    modal?.addEventListener("click", (e) => { if (e.target === modal) close(); });

    const submit = async (e: Event) => {
      e.preventDefault();
      if (ok) ok.style.display = "none";
      if (err) err.style.display = "none";
      if (!form) return;
      const fd = new FormData(form);
      if (fd.get("website")) { if (ok) ok.style.display = "block"; setTimeout(close, 1000); return; }
      if (!fd.get("name") || !fd.get("email") || !fd.get("messenger") || !fd.get("comment")) {
        if (err) { err.textContent = "Заполните имя, email, WhatsApp/Telegram и комментарий"; err.style.display = "block"; }
        return;
      }
      try {
        await fetch(WEBHOOK, { method: "POST", body: fd, mode: "no-cors" });
        if (ok) ok.style.display = "block";
        form.reset();
        setTimeout(close, 1000);
      } catch {
        if (err) err.style.display = "block";
      }
    };

    form?.addEventListener("submit", submit);
    return () => {
      form?.removeEventListener("submit", submit);
      btn?.removeEventListener("click", open);
      document.querySelectorAll('[data-reserve-trigger]').forEach(el => el.removeEventListener('click', open as any));
      closeBtn?.removeEventListener("click", close);
    };
  }, []);

  return (
    <div id="reserveModal" aria-hidden="true" className="fixed inset-0 z-[9999] items-center justify-center bg-black/60 backdrop-blur-sm" style={{ display: "none" }}>
      <div className="relative w-[92%] max-w-lg rounded-2xl bg-card p-6 shadow-2xl ring-1 ring-border">
        <button id="modalClose" aria-label="Закрыть" className="absolute right-3 top-3 text-2xl opacity-70 transition hover:opacity-100">✕</button>
        <h3 className="mb-3 text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">Забронировать место</h3>
        <form id="reserveForm" noValidate>
          <input type="text" name="website" autoComplete="off" tabIndex={-1} className="hidden" />
          <label className="block mb-1 text-sm">Ваше имя*</label>
          <input name="name" required placeholder="Иван" className="w-full rounded-xl border bg-background px-3 py-2 outline-none ring-2 ring-transparent focus:ring-primary" />
          <label className="block mb-1 mt-3 text-sm">Email*</label>
          <input name="email" type="email" required placeholder="you@mail.com" className="w-full rounded-xl border bg-background px-3 py-2 outline-none ring-2 ring-transparent focus:ring-primary" />
          <label className="block mb-1 mt-3 text-sm">WhatsApp или Telegram*</label>
          <input name="messenger" required placeholder="+7 900 000 0000 или @username" className="w-full rounded-xl border bg-background px-3 py-2 outline-none ring-2 ring-transparent focus:ring-primary" />
          <label className="block mb-1 mt-3 text-sm">Телефон (необязательно)</label>
          <input name="phone" placeholder="+7 900 000 0000" className="w-full rounded-xl border bg-background px-3 py-2 outline-none ring-2 ring-transparent focus:ring-primary" />
          <label className="block mb-1 mt-3 text-sm">Комментарий*</label>
          <textarea name="comment" rows={3} required placeholder="Ваше сообщение" className="w-full rounded-xl border bg-background px-3 py-2 outline-none ring-2 ring-transparent focus:ring-primary" />
          <Button type="submit" variant="cta" size="xl" className="mt-2 w-full">Отправить заявку</Button>
          <p id="formMsg" className="mt-2 text-green-600 text-sm" style={{ display: "none" }}>Спасибо! Заявка отправлена ✅</p>
          <p id="formErr" className="mt-2 text-red-600 text-sm" style={{ display: "none" }}>Ошибка отправки. Попробуйте ещё раз.</p>
        </form>
      </div>
    </div>
  );
}

export default function Index() {
  const time = useCountdown(EVENT_DATE);

  return (
    <main className="min-h-screen bg-[radial-gradient(1200px_600px_at_0%_-10%,hsl(var(--accent))_0%,transparent_60%),radial-gradient(1200px_600px_at_100%_110%,hsl(var(--secondary))_0%,transparent_60%)]">
      {/* Hero */}
      <section
        className={cn(
          "relative w-full border-b",
          "bg-gradient-to-b from-[hsl(24_90%_60%_/0.10)] to-transparent",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 -z-10 bg-cover bg-center",
            "opacity-30",
          )}
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop')",
          }}
        />
        <div className="container mx-auto grid gap-8 px-4 py-12 md:grid-cols-2 md:py-16 lg:py-20">
          <div className="flex flex-col items-start gap-5">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight md:text-4xl lg:text-5xl">
              Активация Кундалини в Сочи — 1 день, 2 мастера, мощный прорыв
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              2 часа практики, глубокое освобождение тела и сознания, интеграция с чаем
            </p>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2Fb41cb3bc76744413bb1feb61b473a170%2F579923101b0246c6984286c1c188e90f?format=webp&width=800"
                    alt="Ульяна — фасилитатор"
                    className="h-36 w-36 sm:h-40 sm:w-40 md:h-48 md:w-48 rounded-full object-cover object-center shadow-md ring-2 ring-white/80 ring-offset-2 ring-offset-background"
                  />
                  <span className="mt-2 rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-foreground ring-1 ring-border shadow-sm">Ульяна</span>
                </div>
                <div className="flex flex-col items-center">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2Fb41cb3bc76744413bb1feb61b473a170%2Fd917deec17ab43d2bf502976469b59e5?format=webp&width=800"
                    alt="Денис — фасилитатор"
                    className="h-36 w-36 sm:h-40 sm:w-40 md:h-48 md:w-48 rounded-full object-cover object-center shadow-md ring-2 ring-white/80 ring-offset-2 ring-offset-background"
                  />
                  <span className="mt-2 rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-foreground ring-1 ring-border shadow-sm">Денис</span>
                </div>
              </div>
            </div>

            <div className="flex w-full flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Button id="reserveBtn" size="xl" variant="cta" className="px-8">
                Забронировать место
              </Button>
              <div className="text-base font-semibold text-foreground bg-secondary/70 px-3 py-1 rounded-lg ring-1 ring-border">
                Осталось {REMAINING_SEATS} мест — не откладывай трансформацию
              </div>
            </div>

            <div className="mt-2 flex items-center gap-3">
              <div className="flex items-center gap-3 rounded-xl bg-primary/10 px-4 py-2 text-sm md:text-base font-semibold text-foreground shadow-soft ring-1 ring-primary/30 backdrop-blur">
                <Sparkles className="h-5 w-5 text-primary" />
                <span>
                  До начала: {time.days}д {time.hours}ч {time.minutes}м — успей забронировать
                </span>
              </div>
            </div>
          </div>

          {/* Right column: video + testimonials */}
          <div className="flex flex-col items-stretch gap-6">
            <div className="relative overflow-hidden rounded-2xl shadow-lg">
              <div className="relative aspect-[9/16] w-1/2 mx-auto overflow-hidden rounded-xl bg-black ring-1 ring-border">
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src="https://rutube.ru/play/embed/f25f40e73eebc884f656dd81e5644a62"
                  title="Rutube Shorts"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-start gap-4">
              <figure className="rounded-xl bg-card p-4 shadow-sm ring-1 ring-border">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=128&auto=format&fit=crop"
                    alt="Мария"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <figcaption className="text-sm font-medium">Мария, 32</figcaption>
                </div>
                <blockquote className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  «Я почувствовала, что живу заново. Это был мягкий, но мощный процесс — будто с души сняли груз.»
                </blockquote>
              </figure>
              <figure className="rounded-xl bg-card p-4 shadow-sm ring-1 ring-border">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=128&auto=format&fit=crop"
                    alt="Сергей"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <figcaption className="text-sm font-medium">Сергей, 28</figcaption>
                </div>
                <blockquote className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  «Энергия пробудилась так естественно, без страха. После практики я почувствовал ясность и лёгкость.»
                </blockquote>
              </figure>
              <figure className="rounded-xl bg-card p-4 shadow-sm ring-1 ring-border">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=128&auto=format&fit=crop"
                    alt="Алина"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <figcaption className="text-sm font-medium">Алина, 41</figcaption>
                </div>
                <blockquote className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  «Удивительно, как всего за 3 часа можно так глубоко трансформироваться. Это лучший подарок себе!»
                </blockquote>
              </figure>
            </div>
          </div>
        </div>

        {/* USP row */}
        <div className="container mx-auto grid grid-cols-2 gap-4 px-4 pb-10 pt-4 md:grid-cols-4">
          <div className="flex items-center gap-2 rounded-xl bg-card p-3 text-sm shadow-sm ring-1 ring-border">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>Глубокая практика</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-card p-3 text-sm shadow-sm ring-1 ring-border">
            <HandHeart className="h-5 w-5 text-primary" />
            <span>Мощная трансформация</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-card p-3 text-sm shadow-sm ring-1 ring-border">
            <Waves className="h-5 w-5 text-primary" />
            <span>Место силы — Сочи</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-card p-3 text-sm shadow-sm ring-1 ring-border">
            <Heart className="h-5 w-5 text-primary" />
            <span>Поддержка фасилитаторов</span>
          </div>
        </div>
      </section>

      {/* Info + Booking */}
      <section id="book" className="container mx-auto grid gap-6 px-4 pb-8 mt-8 md:mt-14 md:grid-cols-2">
        <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border">
          <h2 className="mb-4 text-xl font-semibold">Детали события</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <span>5 октября 2025</span>
            </li>
            <li className="flex items-center gap-3">
              <Clock3 className="h-5 w-5 text-primary" />
              <span>11:00 — 13:00</span>
            </li>
            <li className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <span>Сочи, Yoga Space (адрес)</span>
            </li>
            <li className="flex items-center gap-3">
              <Banknote className="h-5 w-5 text-primary" />
              <span>
                Цена: 10 000 ₽ <span className="text-muted-foreground">·</span> <span className="text-muted-foreground">Ранняя бронь до 1 октября: 9 000 ₽</span>
              </span>
            </li>
          </ul>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Button data-reserve-trigger variant="cta" size="xl" className="px-8">
                Забронировать место
              </Button>
            <div className="text-sm text-muted-foreground">
              Свободно: {REMAINING_SEATS} мест
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border">
          <h2 className="mb-4 text-xl font-semibold">FAQ</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="q1">
              <AccordionTrigger>Нужно ли быть подготовленным?</AccordionTrigger>
              <AccordionContent>
                Нет, подойдёт всем — практика адаптируется под ваш опыт и
                состояние.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q2">
              <AccordionTrigger>Что взять с собой?</AccordionTrigger>
              <AccordionContent>
                Удобную одежду, коврик, бутылку воды. По желанию — плед.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q3">
              <AccordionTrigger>Это безопасно?</AccordionTrigger>
              <AccordionContent>
                Да, всё проходит под руководством опытных фасилитаторов с
                заботой и вниманием к каждому участнику.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Individual session */}
<section className="container mx-auto px-4 py-10">
  <div className="grid gap-8 md:grid-cols-2 rounded-3xl bg-secondary/60 p-4 sm:p-6 ring-1 ring-border">
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-extrabold">🌟 Индивидуальная сессия активации кундалини</h2>
      <p className="text-muted-foreground">
        Глубокое, персональное погружение в энергию под полным сопровождением двух фасилитаторов.
      </p>
      <ul className="space-y-2 text-sm">
        <li>🔥 Эта сессия — для тех, кто готов к мощному личному прорыву и хочет уделить всё внимание себе.</li>
        <li>💎 2 мастера работают только с вами</li>
        <li>✨ Индивидуальный подход и настройка</li>
        <li>🌊 Углублённая практика и интеграция</li>
        <li>💰 Цена: 25 000 ₽ <span className="text-muted-foreground">(запись ограничена)</span></li>
      </ul>
      <Button
        data-reserve-trigger
        data-prefill="Индивидуальная сессия"
        variant="cta"
        size="xl"
        className="mt-2 px-6 py-3 mx-auto"
      >
        Забронировать индивидуальную сессию
      </Button>
    </div>

    <div className="mx-auto w-full max-w-md md:relative grid grid-cols-2 gap-3 items-start">
      <img
        src="https://cdn.builder.io/api/v1/image/assets%2Fb41cb3bc76744413bb1feb61b473a170%2F42b4a8cf62af44798b5845e0472bf183?format=webp&width=800"
        alt="Ульяна"
        className="w-full aspect-[4/5] rounded-2xl object-cover shadow-xl ring-1 ring-border"
      />
      <img
        src="https://cdn.builder.io/api/v1/image/assets%2Fb41cb3bc76744413bb1feb61b473a170%2F6a510f1e8bee4510a3b8ddce8c3b1df2?format=webp&width=800"
        alt="Денис"
        className="w-full aspect-[4/5] rounded-2xl object-cover shadow-xl ring-1 ring-border md:absolute md:bottom-2 md:right-2 md:w-64 md:shadow-2xl md:ring-2 md:ring-background md:rotate-90"
      />
      <div className="hidden md:block absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur">
        💎 Только вы и 2 мастера
      </div>
    </div>
  </div>
</section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-gradient-to-br from-primary/15 via-accent/50 to-secondary/40 p-6 text-center shadow-sm ring-1 ring-border">
          <h3 className="text-2xl font-bold">Готовы к мощной трансформации?</h3>
          <p className="text-base font-semibold text-foreground">
            Осталось {REMAINING_SEATS} мест — не откладывай трансформацию · До старта: {time.days}д {time.hours}ч {time.minutes}м
          </p>
          <Button data-reserve-trigger variant="cta" size="xl" className="px-10">
              Забронировать место
            </Button>
        </div>
      </section>
      <ReserveModal />
    </main>
  );
}
