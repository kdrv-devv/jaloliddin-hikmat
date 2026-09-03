import { cache } from "react";
import {
  defaultPageValues,
  getPageDefinition,
  withDefaults,
  type PageDefinition,
  type PageValues,
} from "./content";
import { getPages, isDatabaseConfigured } from "./mongodb";

function requireDefinition(key: string): PageDefinition {
  const definition = getPageDefinition(key);
  if (!definition) throw new Error(`«${key}» nomli sahifa yo'q.`);
  return definition;
}

async function readStored(key: string): Promise<PageValues | null> {
  const pages = await getPages();
  const doc = await pages.findOne({ _id: key });
  return doc?.values ?? null;
}

/**
 * Sayt sahifalari uchun. Baza sozlanmagan yoki ishlamayotgan bo'lsa,
 * yozuvlar ro'yxatidagidek — xato emas, dastlabki matn qaytadi.
 *
 * `cache` bir so'rov ichida ikki marta (metadata va sahifaning o'zi uchun)
 * bazaga borishning oldini oladi.
 */
export const getPageContent = cache(
  async (key: string): Promise<PageValues> => {
    const definition = requireDefinition(key);
    if (!isDatabaseConfigured()) return defaultPageValues(definition);
    try {
      return withDefaults(definition, await readStored(key));
    } catch (error) {
      console.error("[db] sahifa matnini o'qishda xatolik:", error);
      return defaultPageValues(definition);
    }
  },
);

/** Sahifa matni oxirgi marta qachon o'zgargani — sitemap'dagi `lastmod` uchun. */
export const getPageUpdatedAt = cache(
  async (key: string): Promise<Date | null> => {
    requireDefinition(key);
    if (!isDatabaseConfigured()) return null;
    try {
      const pages = await getPages();
      const doc = await pages.findOne(
        { _id: key },
        { projection: { updatedAt: 1 } },
      );
      return doc?.updatedAt ?? null;
    } catch {
      return null;
    }
  },
);

/* --- Admin ------------------------------------------------------------- */

/** Boshqaruv uchun: bazadagi xatolik yashirilmaydi. */
export async function readPageContent(key: string): Promise<PageValues> {
  const definition = requireDefinition(key);
  return withDefaults(definition, await readStored(key));
}

export async function writePageContent(
  key: string,
  values: PageValues,
): Promise<PageValues> {
  requireDefinition(key);
  const pages = await getPages();
  await pages.updateOne(
    { _id: key },
    { $set: { values, updatedAt: new Date() } },
    { upsert: true },
  );
  return values;
}
