import { MongoClient, type Db, type Collection } from "mongodb";
import { envValue } from "./env";
import type { PageDoc, PostDoc, ViewDoc } from "./types";

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

export async function getPages(): Promise<Collection<PageDoc>> {
  const db = await getDb();
  return db.collection<PageDoc>("pages");
}

export function isDatabaseConfigured(): boolean {
  return Boolean(uri);
}

let indexesEnsured = false;

/** Idempotent: creates the indexes the blog queries rely on. */
export async function ensureIndexes(): Promise<void> {
  if (indexesEnsured) return;
  const [posts, views] = await Promise.all([getPosts(), getViews()]);
  await Promise.all([
    posts.createIndexes([
      { key: { slug: 1 }, name: "slug_unique", unique: true },
      { key: { status: 1, publishedAt: -1 }, name: "status_publishedAt" },
      { key: { tags: 1 }, name: "tags" },
    ]),
    // Takroriy ko'rishni bazaning o'zi rad etadi.
    views.createIndexes([
      { key: { postId: 1, deviceId: 1 }, name: "post_device_unique", unique: true },
      { key: { postId: 1 }, name: "postId" },
    ]),
  ]);
  indexesEnsured = true;
}
