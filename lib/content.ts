/**
 * Sayt sahifalaridagi tahrirlanadigan matnlar.
 *
 * Bu fayl toza (bazaga bog'liq emas) — uni ham server, ham boshqaruvdagi
 * mijoz komponenti o'qiydi. Bazada faqat o'zgartirilgan matn saqlanadi;
 * qolgani shu yerdagi dastlabki qiymatlardan olinadi, shuning uchun baza
 * bo'sh bo'lsa ham sayt bugungi ko'rinishida turaveradi.
 */
import { plainText } from "./text";


export type PageFieldKind = "line" | "text" | "markdown";

export type PageField = {
  key: string;
  label: string;
  hint?: string;
  kind: PageFieldKind;
  maxLength: number;
  /** Bo'sh qoldirilsa ham saqlanadigan maydon (SEO sarlavhasi kabi). */
  optional?: boolean;
  /** Baza bo'sh bo'lganda ishlatiladigan matn. */
  fallback: string;
};

export type PageDefinition = {
  key: string;
  label: string;
  /** Saytdagi manzili — ko'rish havolasi va yangilash uchun. */
  path: string;
  summary: string;
  /** Qidiruv natijasi uchun: SEO maydonlari bo'sh qolganda nima ishlatiladi. */
  seo: {
    titleFallback: string;
    /** Tavsif shu maydon matnidan olinadi (masalan "intro" yoki "body"). */
    descriptionFrom: string;
  };
  fields: PageField[];
};

export type PageValues = Record<string, string>;

const HOME_INTRO =
  "Men Jaloliddin. Bu yerda kundalik kuzatuvlarim, o'qigan kitoblarim va " +
  "oxirigacha o'ylab ko'rilgan fikrlarim yig'ilib boradi — shoshilmasdan, " +
  "birma-bir.";

const ABOUT_BODY = `Bu sahifa — uzun tanishtiruv emas, qisqa qo'l berish. Men shu yerda o'zim uchun yozaman: kunduzi ko'rgan bir narsa, kechqurun o'qigan bir sahifa, uzoq vaqt yechilmay turgan bir savol.

Yozganlarim ko'pincha shoshilmasdan tugaydi. Bir matnni bir necha kun tashlab qo'yib, keyin qaytib o'qiyman — shundagina qaysi jumla rost, qaysi biri shunchaki chiroyli ekani ko'rinadi. Shuning uchun bu yerda ko'p emas, ammo o'zim ishonadigan narsalar turadi.

## Nima haqida yozaman

Uchta narsa aylanib-aylanib qaytadi: _kundalik kuzatuvlar_ — shahar, ob-havo, odamlar; _kitoblar_ — o'qiganim va nega esimda qolgani; va _fikrlar_ — hali javobi topilmagan, lekin yozib qo'yishga arzigan savollar.

Matnlarim uzun bo'lishi mumkin. Ularni bir o'tirishda tugatish shart emas — sahifa qayerda to'xtaganingizni yuqoridagi ingichka chiziqda ko'rsatib turadi.

## Aloqa

Yozganlarim bo'yicha fikringiz bo'lsa, xursand bo'laman. Yangi matnlar shoshilmasdan, o'zi tayyor bo'lgan kuni chiqadi — kuzatib borish uchun vaqti-vaqti bilan kirib tursangiz kifoya.`;

export const PAGE_DEFINITIONS: PageDefinition[] = [
  {
    key: "bosh",
    label: "Bosh sahifa",
    path: "/",
    summary: "Saytga kirgan odam birinchi o'qiydigan sarlavha va tanishtiruv.",
    seo: { titleFallback: "Jaloliddin — yozuvlar", descriptionFrom: "intro" },
    fields: [
      {
        key: "heading",
        label: "Katta sarlavha",
        hint: "Bir jumla — sahifaning eng yirik matni.",
        kind: "line",
        maxLength: 160,
        fallback: "Sekin yoziladigan, sekin o'qiladigan yozuvlar.",
      },
      {
        key: "intro",
        label: "Tanishtiruv",
        hint: "Sarlavha ostidagi kichik xatboshi.",
        kind: "text",
        maxLength: 400,
        fallback: HOME_INTRO,
      },
      {
        key: "seoTitle",
        label: "Qidiruv sarlavhasi (ixtiyoriy)",
        hint: "Google natijalarida ko'rinadigan sarlavha. 60 belgigacha bo'lgani ma'qul. Bo'sh qoldirsangiz, saytning odatiy sarlavhasi ishlatiladi.",
        kind: "line",
        maxLength: 70,
        optional: true,
        fallback: "",
      },
      {
        key: "seoDescription",
        label: "Qidiruv tavsifi (ixtiyoriy)",
        hint: "Google natijalarida sarlavha ostidagi ikki qator. 120–160 belgi eng yaxshisi.",
        kind: "text",
        maxLength: 200,
        optional: true,
        fallback: "",
      },
    ],
  },
  {
    key: "haqida",
    label: "«Haqida» sahifasi",
    path: "/haqida",
    summary: "O'zingiz va blog haqidagi to'liq matn.",
    seo: { titleFallback: "Haqida — Jaloliddin", descriptionFrom: "body" },
    fields: [
      {
        key: "heading",
        label: "Sarlavha",
        kind: "line",
        maxLength: 120,
        fallback: "Salom, men Jaloliddin",
      },
      {
        key: "body",
        label: "Matn",
        hint: "Markdown bilan yoziladi: ## sarlavha, **qalin**, > iqtibos …",
        kind: "markdown",
        maxLength: 20_000,
        fallback: ABOUT_BODY,
      },
      {
        key: "seoTitle",
        label: "Qidiruv sarlavhasi (ixtiyoriy)",
        hint: "Google natijalarida ko'rinadigan sarlavha. 60 belgigacha bo'lgani ma'qul. Bo'sh qoldirsangiz, saytning odatiy sarlavhasi ishlatiladi.",
        kind: "line",
        maxLength: 70,
        optional: true,
        fallback: "",
      },
      {
        key: "seoDescription",
        label: "Qidiruv tavsifi (ixtiyoriy)",
        hint: "Google natijalarida sarlavha ostidagi ikki qator. 120–160 belgi eng yaxshisi.",
        kind: "text",
        maxLength: 200,
        optional: true,
        fallback: "",
      },
    ],
  },
];

export function getPageDefinition(key: string): PageDefinition | null {
  return PAGE_DEFINITIONS.find((page) => page.key === key) ?? null;
}

export function defaultPageValues(definition: PageDefinition): PageValues {
  const values: PageValues = {};
  for (const field of definition.fields) values[field.key] = field.fallback;
  return values;
}

/** Bazadagi qiymatlar dastlabki matn ustiga qo'yiladi — yetishmagani to'ldiriladi. */
export function withDefaults(
  definition: PageDefinition,
  stored: PageValues | null | undefined,
): PageValues {
  const values = defaultPageValues(definition);
  if (!stored) return values;
  for (const field of definition.fields) {
    const value = stored[field.key];
    if (typeof value === "string" && value.trim()) values[field.key] = value;
  }
  return values;
}

export type PageValidation =
  | { ok: true; data: PageValues }
  | { ok: false; error: string; field?: string };

export function validatePageValues(
  definition: PageDefinition,
  raw: unknown,
): PageValidation {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, error: "Ma'lumot noto'g'ri yuborildi." };
  }
  const body = raw as Record<string, unknown>;
  const data: PageValues = {};

  for (const field of definition.fields) {
    let value = String(body[field.key] ?? "").trim();
    // Bir qatorlik matnga tasodifan tushgan yangi qator sahifani buzmasin.
    if (field.kind === "line") value = value.replace(/\s+/g, " ");
    if (!value && !field.optional) {
      return {
        ok: false,
        error: `«${field.label}» bo'sh bo'lishi mumkin emas.`,
        field: field.key,
      };
    }
    if (value.length > field.maxLength) {
      return {
        ok: false,
        error: `«${field.label}» ${field.maxLength} belgidan oshmasin.`,
        field: field.key,
      };
    }
    data[field.key] = value;
  }

  return { ok: true, data };
}

/**
 * Sahifaning qidiruvdagi sarlavhasi va tavsifi.
 *
 * Tavsif tartibi: qo'lda yozilgani → sahifa matnidan olingani (agar u
 * yetarlicha uzun bo'lsa) → saytning umumiy tavsifi. Juda qisqa tavsif
 * (masalan ikki so'z) Google natijasida bo'sh joy bo'lib qoladi, shuning
 * uchun u ishlatilmaydi.
 */
export function pageSeo(
  definition: PageDefinition,
  values: PageValues,
  siteDescription: string,
): { title: string; description: string } {
  const title = values.seoTitle?.trim() || definition.seo.titleFallback;

  const manual = values.seoDescription?.trim();
  const auto = plainText(values[definition.seo.descriptionFrom] ?? "", 190);

  const description = manual || (auto.length >= 80 ? auto : siteDescription);

  return { title, description };
}
