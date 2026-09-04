import { MongoClient, type Db, type Collection } from "mongodb";
import { envValue } from "./env";
import type { EventDoc, LikeDoc, PageDoc, PostDoc, ViewDoc } from "./types";

const uri = envValue(process.env.MONGODB_URI);
const dbName = envValue(process.env.MONGODB_DB) || "jaloliddin";

/**
 * The client is cached on globalThis so that Next's dev-time module reloading
 * doesn't open a new connection pool on every edit.
 */
const globalForMongo = globalThis as unknown as {
  _mongoClientPromise?: Promise<MongoClient>;
};

function getClientPromise(): Promise<MongoClient> {
  if (!uri) {
    throw new Error(
      "MONGODB_URI aniqlanmagan. `.env.local` faylida (Vercel'da esa Environment Variables bo'limida) ulanish satrini ko'rsating.",
    );
  }
  if (!/^mongodb(\+srv)?:\/\//.test(uri)) {
    throw new Error(
      "MONGODB_URI `mongodb+srv://` yoki `mongodb://` bilan boshlanishi kerak. " +
        "Ko'pincha sabab: qiymat qo'shtirnoqlari bilan yoki `MONGODB_URI=` qismi bilan birga nusxalangan. " +
        "Panelga faqat satrning o'zini, qo'shtirnoqsiz qo'ying.",
    );
  }
  if (!globalForMongo._mongoClientPromise) {
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
    });
    globalForMongo._mongoClientPromise = client.connect();
  }
  return globalForMongo._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(dbName);
}

export async function getPosts(): Promise<Collection<PostDoc>> {
  const db = await getDb();
  return db.collection<PostDoc>("posts");
}

export async function getViews(): Promise<Collection<ViewDoc>> {
  const db = await getDb();
  return db.collection<ViewDoc>("views");
}

export async function getLikes(): Promise<Collection<LikeDoc>> {
  const db = await getDb();
  return db.collection<LikeDoc>("likes");
}

export async function getEvents(): Promise<Collection<EventDoc>> {
  const db = await getDb();
  return db.collection<EventDoc>("events");
}

export async function getPages(): Promise<Collection<PageDoc>> {
  const db = await getDb();
  return db.collection<PageDoc>("pages");
}

export function isDatabaseConfigured(): boolean {
  return Boolean(uri);
}

/** Statistika hodisalari shuncha vaqt saqlanadi, keyin o'zi o'chadi. */
export const EVENT_TTL_DAYS = 400;

/**
 * Indekslar bir marta yaratiladi. Bayroq `globalThis` da turadi: `next dev`
 * modulni qayta yuklaganda ham, serverless nusxa qayta ishga tushganda ham
 * har so'rovda `createIndexes` chaqirilib ketmasin.
 */
const globalForIndexes = globalThis as unknown as {
  _jhIndexesEnsured?: Promise<void>;
};

/** Idempotent: creates the indexes the blog queries rely on. */
export function ensureIndexes(): Promise<void> {
  globalForIndexes._jhIndexesEnsured ??= createAllIndexes().catch((error) => {
    // Keyingi so'rov qayta urinib ko'rsin — aks holda indeks bir marta
    // xato bergani uchun umrbod yaratilmay qoladi.
    globalForIndexes._jhIndexesEnsured = undefined;
    throw error;
  });
  return globalForIndexes._jhIndexesEnsured;
}

async function createAllIndexes(): Promise<void> {
  const [posts, views, likes, events] = await Promise.all([
    getPosts(),
    getViews(),
    getLikes(),
    getEvents(),
  ]);
  await Promise.all([
    posts.createIndexes([
      { key: { slug: 1 }, name: "slug_unique", unique: true },
      { key: { status: 1, publishedAt: -1 }, name: "status_publishedAt" },
      {
        key: { section: 1, status: 1, publishedAt: -1 },
        name: "section_status_publishedAt",
      },
      { key: { tags: 1 }, name: "tags" },
    ]),
    // Takroriy ko'rishni bazaning o'zi rad etadi. Indeks (postId, deviceId)
    // juftligi bo'yicha — ya'ni bir qurilma har bir yozuvni alohida-alohida
    // bir martadan «o'qigan» bo'la oladi.
    views.createIndexes([
      { key: { postId: 1, deviceId: 1 }, name: "post_device_unique", unique: true },
      { key: { postId: 1 }, name: "postId" },
    ]),
    likes.createIndexes([
      { key: { postId: 1, deviceId: 1 }, name: "post_device_unique", unique: true },
      { key: { postId: 1 }, name: "postId" },
      { key: { deviceId: 1 }, name: "deviceId" },
    ]),
    events.createIndexes([
      // TTL: eski hodisalar o'zi o'chib, kolleksiya cheksiz o'smaydi.
      {
        key: { createdAt: 1 },
        name: "createdAt_ttl",
        expireAfterSeconds: EVENT_TTL_DAYS * 24 * 60 * 60,
      },
      { key: { type: 1, createdAt: -1 }, name: "type_createdAt" },
      { key: { type: 1, path: 1 }, name: "type_path" },
      { key: { type: 1, postId: 1 }, name: "type_postId" },
      { key: { deviceId: 1, createdAt: -1 }, name: "device_createdAt" },
    ]),
  ]);
}
