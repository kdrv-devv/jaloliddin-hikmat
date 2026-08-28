import { MongoClient } from "mongodb";
import { seedPosts } from "./content/posts.mjs";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "jaloliddin";

if (!uri) {
  console.error(
    "\nMONGODB_URI topilmadi. .env.local faylini to'ldiring va qayta urinib ko'ring.\n",
  );
  process.exit(1);
}

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });

try {
  await client.connect();
  const posts = client.db(dbName).collection("posts");

  await posts.createIndexes([
    { key: { slug: 1 }, name: "slug_unique", unique: true },
    { key: { status: 1, publishedAt: -1 }, name: "status_publishedAt" },
    { key: { tags: 1 }, name: "tags" },
  ]);

  await client
    .db(dbName)
    .collection("views")
    .createIndexes([
      { key: { postId: 1, deviceId: 1 }, name: "post_device_unique", unique: true },
      { key: { postId: 1 }, name: "postId" },
    ]);

  let added = 0;
  let skipped = 0;

  for (const post of seedPosts) {
    const exists = await posts.findOne({ slug: post.slug });
    if (exists) {
      skipped += 1;
      continue;
    }
    const publishedAt = new Date(Date.now() - post.daysAgo * 86_400_000);
    await posts.insertOne({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      tags: post.tags,
      status: "published",
      coverImage: null,
      coverAlt: null,
      publishedAt,
      createdAt: publishedAt,
      updatedAt: publishedAt,
      views: 0,
    });
    added += 1;
  }

  console.log(
    `\nTayyor. Qo'shildi: ${added} ta, mavjud bo'lgani uchun o'tkazib yuborildi: ${skipped} ta.\n`,
  );
} catch (error) {
  console.error("\nBazaga ulanib bo'lmadi:\n", error.message, "\n");
  process.exitCode = 1;
} finally {
  await client.close();
}
