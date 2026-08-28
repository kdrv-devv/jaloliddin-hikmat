import { ObjectId, type Filter } from "mongodb";
import {
  ensureIndexes,
  getPosts,
  getViews,
  isDatabaseConfigured,
} from "./mongodb";
import { readingMinutes } from "./format";
import type { Post, PostDoc, PostInput } from "./types";

function serialize(doc: PostDoc): Post {
  return {
    id: doc._id.toString(),
    title: doc.title,
    slug: doc.slug,
    excerpt: doc.excerpt,
    content: doc.content,
    tags: doc.tags ?? [],
    status: doc.status,
    coverImage: doc.coverImage ?? null,
    coverAlt: doc.coverAlt ?? null,
    publishedAt: doc.publishedAt ? doc.publishedAt.toISOString() : null,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    readingMinutes: readingMinutes(doc.content),
    views: doc.views ?? 0,
  };
}

/**
 * Public reads never throw: a missing or unreachable database renders the
 * site's empty state instead of a 500. Writes (admin) do throw.
 */
async function safeRead<T>(fallback: T, run: () => Promise<T>): Promise<T> {
  if (!isDatabaseConfigured()) return fallback;
  try {
    return await run();
  } catch (error) {
    console.error("[db] o'qishda xatolik:", error);
    return fallback;
  }
}

const PUBLISHED: Filter<PostDoc> = { status: "published" };

export async function listPublishedPosts(options?: {
  limit?: number;
  skip?: number;
  tag?: string;
}): Promise<Post[]> {
  const { limit = 0, skip = 0, tag } = options ?? {};
  return safeRead<Post[]>([], async () => {
    const posts = await getPosts();
    const filter: Filter<PostDoc> = tag
      ? { ...PUBLISHED, tags: tag }
      : PUBLISHED;
    let cursor = posts.find(filter).sort({ publishedAt: -1, createdAt: -1 });
    if (skip) cursor = cursor.skip(skip);
    if (limit) cursor = cursor.limit(limit);
    return (await cursor.toArray()).map(serialize);
  });
}

export async function countPublishedPosts(tag?: string): Promise<number> {
  return safeRead(0, async () => {
    const posts = await getPosts();
    return posts.countDocuments(tag ? { ...PUBLISHED, tags: tag } : PUBLISHED);
  });
}

export async function getPublishedPost(slug: string): Promise<Post | null> {
  return safeRead<Post | null>(null, async () => {
    const posts = await getPosts();
    const doc = await posts.findOne({ ...PUBLISHED, slug });
    return doc ? serialize(doc) : null;
  });
}

export type Neighbours = {
  previous: Pick<Post, "slug" | "title"> | null;
  next: Pick<Post, "slug" | "title"> | null;
};

/** `previous` is older, `next` is newer — reading order on the post page. */
export async function getNeighbours(post: Post): Promise<Neighbours> {
  return safeRead<Neighbours>({ previous: null, next: null }, async () => {
    const posts = await getPosts();
    const pivot = post.publishedAt ? new Date(post.publishedAt) : new Date();
    const projection = { slug: 1, title: 1 } as const;
    const [older, newer] = await Promise.all([
      posts.findOne(
        { ...PUBLISHED, publishedAt: { $lt: pivot } },
        { sort: { publishedAt: -1 }, projection },
      ),
      posts.findOne(
        { ...PUBLISHED, publishedAt: { $gt: pivot } },
        { sort: { publishedAt: 1 }, projection },
      ),
    ]);
    return {
      previous: older ? { slug: older.slug, title: older.title } : null,
      next: newer ? { slug: newer.slug, title: newer.title } : null,
    };
  });
}

export type TagCount = { tag: string; count: number };

export async function listTags(): Promise<TagCount[]> {
  return safeRead<TagCount[]>([], async () => {
    const posts = await getPosts();
    const rows = await posts
      .aggregate<{ _id: string; count: number }>([
        { $match: PUBLISHED },
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
      ])
      .toArray();
    return rows.map((row) => ({ tag: row._id, count: row.count }));
  });
}

export async function listAllSlugs(): Promise<
  { slug: string; updatedAt: string }[]
> {
  return safeRead<{ slug: string; updatedAt: string }[]>([], async () => {
    const posts = await getPosts();
    const rows = await posts
      .find(PUBLISHED, { projection: { slug: 1, updatedAt: 1 } })
      .toArray();
    return rows.map((row) => ({
      slug: row.slug,
      updatedAt: row.updatedAt.toISOString(),
    }));
  });
}

/* --- Admin ------------------------------------------------------------- */

export async function listAllPosts(): Promise<Post[]> {
  await ensureIndexes();
  const posts = await getPosts();
  const docs = await posts.find({}).sort({ updatedAt: -1 }).toArray();
  return docs.map(serialize);
}

export async function getPostById(id: string): Promise<Post | null> {
  if (!ObjectId.isValid(id)) return null;
  const posts = await getPosts();
  const doc = await posts.findOne({ _id: new ObjectId(id) });
  return doc ? serialize(doc) : null;
}

export async function slugExists(
  slug: string,
  exceptId?: string,
): Promise<boolean> {
  const posts = await getPosts();
  const doc = await posts.findOne(
    exceptId && ObjectId.isValid(exceptId)
      ? { slug, _id: { $ne: new ObjectId(exceptId) } }
      : { slug },
    { projection: { _id: 1 } },
  );
  return Boolean(doc);
}

export async function createPost(input: PostInput): Promise<Post> {
  await ensureIndexes();
  const posts = await getPosts();
  const now = new Date();
  const doc: Omit<PostDoc, "_id"> = {
    ...input,
    publishedAt: resolvePublishedAt(input, null),
    createdAt: now,
    updatedAt: now,
    views: 0,
  };
  const result = await posts.insertOne(doc as PostDoc);
  return serialize({ ...doc, _id: result.insertedId } as PostDoc);
}

export async function updatePost(
  id: string,
  input: PostInput,
): Promise<Post | null> {
  if (!ObjectId.isValid(id)) return null;
  const posts = await getPosts();
  const existing = await posts.findOne({ _id: new ObjectId(id) });
  if (!existing) return null;
  const doc = await posts.findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...input,
        publishedAt: resolvePublishedAt(input, existing.publishedAt),
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" },
  );
  return doc ? serialize(doc) : null;
}

export async function deletePost(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const [posts, views] = await Promise.all([getPosts(), getViews()]);
  const objectId = new ObjectId(id);
  const result = await posts.deleteOne({ _id: objectId });
  // Yozuv o'chsa, uning ko'rish yozuvlari ham qolib ketmasin.
  await views.deleteMany({ postId: objectId });
  return result.deletedCount === 1;
}

/**
 * A post gets its publication date the first time it is published, and keeps
 * it afterwards unless the author sets one explicitly.
 */
function resolvePublishedAt(input: PostInput, current: Date | null): Date | null {
  if (input.publishedAt) return new Date(input.publishedAt);
  if (input.status !== "published") return current;
  return current ?? new Date();
}
