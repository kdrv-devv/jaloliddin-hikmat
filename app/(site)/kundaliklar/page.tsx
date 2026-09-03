import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { JournalCard } from "@/components/journal-card";
import { BookIcon, CheckIcon, PencilIcon, TelegramIcon } from "@/components/icons";
import { JuniperSprig, SprigDivider } from "@/components/marks";
import { ASK_MESSAGE, JOURNALS, telegramLink } from "@/lib/journals";
import {
  breadcrumbs,
  graph,
  journalList,
  person,
  webPage,
  website,
} from "@/lib/schema";
import { alternates, pageOpenGraph, site } from "@/lib/site";

const PATH = "/kundaliklar";

const DESCRIPTION =
  "Yozib boradigan odam o'zgaradi. ATOM va IKIGAI kundaliklari — tayyor " +
  "savollar bilan, har kuni o'n daqiqaga mo'ljallangan. Buyurtma Telegram orqali.";

export const metadata: Metadata = {
  title: "Kundaliklar",
  description: DESCRIPTION,
  alternates: alternates(PATH),
  openGraph: pageOpenGraph({
    title: `Kundaliklar — ${site.name}`,
    description: DESCRIPTION,
    path: PATH,
  }),
  twitter: {
    card: "summary_large_image",
    title: `Kundaliklar — ${site.name}`,
    description: DESCRIPTION,
  },
};

const REASONS = [
  {
    Icon: PencilIcon,
    title: "Bosh ichidagi tartibsizlik qog'ozda tartibga tushadi",
    body: "Aylanaverib charchatgan fikr yozilgan zahoti kichrayadi. Nima muhimligi shundagina ko'rinadi.",
  },
  {
    Icon: CheckIcon,
    title: "Bo'sh varaq oldida qotib qolmaysiz",
    body: "Savollar tayyor. Siz «nima yozsam ekan» deb emas, to'g'ridan-to'g'ri javob yozib boshlaysiz.",
  },
  {
    Icon: BookIcon,
    title: "Kuniga o'n daqiqa — lekin uzilmasa",
    body: "Ko'p yozish shart emas. Bir oy uzilmay yozilgan bir necha qator butun yilni o'zgartiradi.",
  },
];

const STEPS = [
  {
    title: "Kundalikni tanlang",
    body: "Odat qurmoqchi bo'lsangiz — ATOM. O'z yo'lingizni izlayotgan bo'lsangiz — IKIGAI.",
  },
  {
    title: "Tugmani bosing",
    body: "Telegram ochiladi, xabar tayyor holda yozilgan bo'ladi. Faqat yuborasiz.",
  },
  {
    title: "Yetkazib berishni kelishamiz",
    body: "To'lov va yetkazib berish shartlarini yozishmada birgalikda hal qilamiz.",
  },
];

export default function JournalsPage() {
  const askHref = telegramLink(ASK_MESSAGE);

  const jsonLd = graph(
    website(),
    person(),
    webPage({
      path: PATH,
      name: "Kundaliklar",
      description: DESCRIPTION,
      type: "CollectionPage",
    }),
    JOURNALS.length > 0 ? journalList(JOURNALS, PATH) : null,
    breadcrumbs([
      { name: "Bosh sahifa", path: "/" },
      { name: "Kundaliklar", path: PATH },
    ]),
  );

  return (
    <div className="mx-auto max-w-[52rem] px-5 sm:px-8">
      <JsonLd data={jsonLd} />

      {/* --- Sarlavha --------------------------------------------------- */}
      <section className="relative overflow-hidden pt-12 pb-12 sm:pt-20 sm:pb-16">
        <JuniperSprig className="pointer-events-none absolute -top-8 right-[-3.5rem] h-[17rem] w-auto -rotate-6 text-primary opacity-[0.13] sm:right-[-2.5rem] sm:h-[24rem]" />
        <div className="rise relative max-w-[36rem]">
          <p className="font-sans text-[0.875rem] font-medium tracking-[0.06em] text-accent-ink uppercase">
            Kundaliklar
          </p>
          <h1 className="mt-3 font-serif text-[2.15rem] leading-[1.08] font-medium tracking-[-0.025em] text-balance text-ink sm:text-[3.1rem] sm:leading-[1.04]">
            Yozib boradigan odam o'zgaradi.
          </h1>
          <p className="mt-5 max-w-[46ch] text-[1.0625rem] leading-[1.6] text-ink-soft sm:text-[1.125rem]">
            Ikkita kundalik: biri odat qurish uchun, biri o'z yo'lini topish
            uchun. Ikkalasida ham savollar tayyor — sizdan faqat rostini
            yozish talab qilinadi.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-3">
            <a
              href="#kundaliklar"
              className="rounded-full bg-primary px-5 py-2.5 font-sans text-[0.9375rem] font-medium text-primary-on transition-colors duration-200 hover:bg-primary-hover"
            >
              Kundaliklarni ko'rish
            </a>
            <a
              href={askHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 font-sans text-[0.9375rem] text-muted transition-colors duration-200 hover:text-primary"
            >
              <TelegramIcon className="size-[1.05rem]" />
              Savol bering
            </a>
          </div>
        </div>
      </section>

      {/* --- Nega kundalik? --------------------------------------------- */}
      <section aria-labelledby="nega" className="border-t border-line pt-10 sm:pt-14">
        <h2 id="nega" className="sr-only">
          Nega kundalik kerak
        </h2>
        <ul className="grid gap-8 sm:grid-cols-3 sm:gap-7">
          {REASONS.map(({ Icon, title, body }) => (
            <li key={title}>
              <Icon className="size-5 text-primary" />
              <h3 className="mt-3 font-serif text-[1.15rem] leading-[1.25] font-medium text-balance text-ink">
                {title}
              </h3>
              <p className="mt-2 text-[0.9375rem] leading-[1.6] text-muted">
                {body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* --- Mahsulotlar ------------------------------------------------- */}
      <section
        id="kundaliklar"
        aria-labelledby="royxat"
        className="scroll-mt-24 pt-14 sm:pt-20"
      >
        <h2
          id="royxat"
          className="font-serif text-[1.75rem] leading-[1.15] font-medium tracking-[-0.02em] text-ink sm:text-[2.15rem]"
        >
          Ikkita kundalik, ikki xil savol
        </h2>
        <p className="mt-3 max-w-[52ch] text-[1rem] leading-relaxed text-muted">
          Qaysi biri kerakligini bilmasangiz, o'zingizdan so'rang: men odat
          qurmoqchimanmi yoki yo'nalish izlayapmanmi?
        </p>

        <div className="mt-8 grid gap-6 sm:mt-10 sm:grid-cols-2">
          {JOURNALS.map((journal) => (
            <JournalCard key={journal.slug} journal={journal} />
          ))}
        </div>
      </section>

      {/* --- Qanday ishlaydi --------------------------------------------- */}
      <section aria-labelledby="qadamlar" className="pt-16 sm:pt-24">
        <h2
          id="qadamlar"
          className="font-serif text-[1.75rem] leading-[1.15] font-medium tracking-[-0.02em] text-ink sm:text-[2.15rem]"
        >
          Buyurtma uch qadamda
        </h2>

        <ol className="mt-8 grid gap-7 sm:grid-cols-3 sm:gap-6">
          {STEPS.map((step, index) => (
            <li key={step.title} className="border-t border-line pt-4">
              <span className="font-sans text-[0.8125rem] font-medium text-primary tabular-nums">
                0{index + 1}
              </span>
              <h3 className="mt-1.5 font-serif text-[1.15rem] leading-[1.25] font-medium text-ink">
                {step.title}
              </h3>
              <p className="mt-2 text-[0.9375rem] leading-[1.6] text-muted">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* --- Yakuniy chaqiriq --------------------------------------------- */}
      <section className="pt-16 sm:pt-24">
        <div className="relative overflow-hidden rounded-2xl border border-line bg-surface px-6 py-10 text-center sm:px-10 sm:py-14">
          <h2 className="font-serif text-[1.6rem] leading-[1.15] font-medium tracking-[-0.02em] text-balance text-ink sm:text-[2.05rem]">
            Birinchi sahifa eng qiyini. Qolgani o'zi ketadi.
          </h2>
          <p className="mx-auto mt-4 max-w-[44ch] text-[1rem] leading-relaxed text-muted">
            Kundalikni ertaga emas, bugun boshlagan odam bir oydan keyin
            o'zining qanday o'zgarganini o'qib ko'radi.
          </p>
          <a
            href={askHref}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-sans text-[1rem] font-medium text-primary-on transition-colors duration-200 hover:bg-primary-hover"
          >
            <TelegramIcon className="size-[1.1rem] transition-transform duration-300 ease-[var(--ease-out-quint)] group-hover:translate-x-0.5" />
            Telegramda buyurtma berish
          </a>
          <p className="mt-4 font-sans text-[0.8125rem] text-muted">
            @{"hr_Jaloliddin"} — savollarga o'zim javob beraman.
          </p>
        </div>
      </section>

      <SprigDivider className="mt-16" />
    </div>
  );
}
