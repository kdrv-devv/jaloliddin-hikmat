import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error(
    "\nParolni argument sifatida bering:\n  npm run gen:password -- 'sizning-parolingiz'\n",
  );
  process.exit(1);
}

if (password.length < 10) {
  console.error("\nParol kamida 10 belgidan iborat bo'lsin.\n");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);

// bcrypt hashi `$` bilan to'la, `.env` fayllari esa `$` ni o'zgaruvchi deb
// o'qiydi va qiymatni yo'q qiladi. Shuning uchun base64 ko'rinishida beramiz.
const encoded = Buffer.from(hash, "utf8").toString("base64");

console.log("\nADMIN_PASSWORD_HASH uchun qiymat:\n");
console.log(`ADMIN_PASSWORD_HASH="${encoded}"\n`);
console.log("Uni .env.local fayliga o'zgartirmasdan ko'chiring.");
console.log("(Bu — bcrypt hashining base64 ko'rinishi; parolning o'zi emas.)\n");
