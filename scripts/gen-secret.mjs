import { randomBytes } from "node:crypto";

const secret = randomBytes(48).toString("base64url");
console.log("\nAUTH_SECRET uchun qiymat:\n");
console.log(`AUTH_SECRET=${secret}\n`);
console.log("Uni .env.local fayliga ko'chiring.\n");
