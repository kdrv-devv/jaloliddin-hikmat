# jaloliddin.uz

Shaxsiy blog: sokin, o'qishga qulay va mobil qurilmalarda yengil ishlaydigan
sayt hamda uning admin paneli. Frontend ham, backend ham bitta Next.js
loyihasida.

- **Framework:** Next.js 16 (App Router, TypeScript, Turbopack)
- **Uslub:** Tailwind CSS v4 + OKLCH dizayn tokenlari
- **Baza:** MongoDB (Atlas)
- **Kirish:** httpOnly cookie'dagi JWT + bcrypt parol hashi
- **Matn:** Markdown (remark/rehype, sanitizatsiya bilan)

---

## 1. Tez boshlash

```bash
npm install
cp .env.example .env.local     # keyin .env.local ni to'ldiring
npm run dev
```

Sayt: <http://localhost:3000> · Boshqaruv: <http://localhost:3000/admin>

---

## 2. MongoDB Atlas'dan bepul baza olish

1. <https://www.mongodb.com/cloud/atlas/register> — ro'yxatdan o'ting.
2. **Create a cluster** → **M0 Free** tarifini tanlang, hududni o'zingizga
   yaqinini oling (masalan Frankfurt yoki Ireland).
3. **Database Access** → **Add New Database User**: foydalanuvchi nomi va
   parol yarating (parolda `@ : / ?` belgilari bo'lmasin — ular ulanish
   satrini buzadi). Ruxsat: *Read and write to any database*.
4. **Network Access** → **Add IP Address**:
   - o'z kompyuteringizdan ishlash uchun — *Add Current IP Address*;
   - Vercel'ga joylashtirganda — `0.0.0.0/0` (Atlas'da bu *Allow access from
     anywhere*). Bazani baribir foydalanuvchi nomi va parol himoya qiladi.
5. **Database** → **Connect** → **Drivers** → Node.js. Chiqqan satrni
   nusxalang, `<db_password>` o'rniga haqiqiy parolni qo'ying va
   `.env.local` fayliga yozing:

```env
MONGODB_URI="mongodb+srv://user:parol@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority"
MONGODB_DB="jaloliddin"
```

Kolleksiya va indekslar birinchi so'rovdayoq o'zi yaratiladi.

---

## 3. Admin panelga kirish ma'lumotlari

```bash
npm run gen:secret                       # AUTH_SECRET yaratadi
npm run gen:password -- 'kuchli-parol'   # ADMIN_PASSWORD_HASH yaratadi
```

Chiqqan qatorlarni `.env.local` ga **o'zgartirmasdan** ko'chiring:

```env
AUTH_SECRET="…"
ADMIN_USERNAME="jaloliddin"
ADMIN_PASSWORD_HASH="JDJiJDEyJC4uLg=="
```

> **Nega hash base64 ko'rinishida?** bcrypt hashi `$2b$12$…` shaklida bo'ladi,
> `.env` fayllarini o'qiydigan kutubxona esa `$` ni o'zgaruvchi deb talqin
> qilib, qiymatni yo'q qiladi. Shuning uchun `gen:password` hashni base64
> qilib beradi va server uni o'qiyotganda qayta ochadi. Xuddi shu sabab:
> **`.env.local` dagi hech bir qiymatda `$` bo'lmasin** — Atlas parolida ham.
>
> Parolning o'zi hech qayerda saqlanmaydi. Almashtirish uchun `gen:password`
> ni qayta ishga tushiring va faqat shu qatorni yangilang.

Kirishda 10 daqiqada 8 tadan ortiq urinish bo'lsa, IP vaqtincha bloklanadi.

---

## 4. Namunaviy yozuvlar (ixtiyoriy)

```bash
npm run seed
```

Beshta tayyor yozuvni bazaga qo'yadi. Bir xil manzilli (slug) yozuv allaqachon
bo'lsa, tegmaydi — ya'ni buyruqni bir necha marta ishga tushirish xavfsiz.
Matnlar `scripts/content/posts.mjs` faylida.

---

## 5. Buyruqlar

| Buyruq | Vazifasi |
| --- | --- |
| `npm run dev` | Ishlab chiqish serveri |
| `npm run build` | Ishlab chiqarish uchun yig'ish |
| `npm start` | Yig'ilgan saytni ishga tushirish |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript tekshiruvi |
| `npm run seed` | Namunaviy yozuvlar |
| `npm run gen:secret` | `AUTH_SECRET` yaratish |
| `npm run gen:password -- 'parol'` | Parol hashini yaratish |

---

## 6. Yozuv qo'shish

1. `/admin` → **Yangi yozuv**.
2. Chapda sarlavha va Markdown matni, o'ngda — saytdagi aynan o'sha
   ko'rinish. Telefonda uchta bo'lim: **Matn · Ko'rinish · Sozlamalar**.
3. **Sozlamalar** bo'limida: manzil (slug), qisqa tavsif, teglar, muqova
   rasmi havolasi va nashr sanasi.
4. Yuqoridagi **Qoralama / Nashr** tugmasi bilan holatni tanlab, **Saqlash**
   (yoki `⌘S` / `Ctrl+S`).

Nashr qilingan yozuv darhol bosh sahifada, arxivda, teg sahifasida va RSS'da
paydo bo'ladi — kesh avtomatik yangilanadi.

**Manzil (slug)** avtomatik sarlavhadan olinadi (`Kechki archa hidi` →
`kechki-archa-hidi`) va uni qo'lda o'zgartirsa ham bo'ladi. `admin`, `api`,
`yozuvlar`, `teg`, `haqida` kabi sayt sahifalarining manzillari band.

**Rasmlar.** Loyihada fayl yuklash yo'q — muqova sifatida tashqi havola
qo'yiladi (masalan Cloudinary, S3 yoki GitHub'dagi rasm). Matn ichida ham
odatdagi Markdown ishlaydi: `![tavsif](https://…)`.

**RSS.** `jaloliddin.uz/rss.xml` ishlaydi va yangi yozuvlar unga o'zi
qo'shiladi, ammo saytda unga **hech qanday havola ko'rsatilmaydi**. Faqat
`<head>` ichida ko'rinmas belgisi bor — RSS ilovalari saytni ochganda lentani
o'zi topib oladi, oddiy o'quvchi esa hech narsa sezmaydi. Havolani qaytarish
uchun `components/site-footer.tsx` ga bitta `<a href="/rss.xml">` qo'shsangiz
kifoya.

---

## 7. Sayt sahifalarini tahrirlash

Yozuvlarga kirmaydigan doimiy matnlar ham panel orqali o'zgaradi — kodga
tegish shart emas. `/admin` → **Sahifalar**:

| Sahifa | Nima tahrirlanadi |
| --- | --- |
| **Bosh sahifa** (`/`) | katta sarlavha va uning ostidagi tanishtiruv |
| **«Haqida» sahifasi** (`/haqida`) | sarlavha va to'liq matn (Markdown) |

Chapda maydonlar, o'ngda — saytdagi aynan o'sha ko'rinish. **Saqlash**
(yoki `⌘S` / `Ctrl+S`) bosilgach sahifa keshi darhol yangilanadi.

Matnlar `pages` kolleksiyasida saqlanadi. Baza bo'sh bo'lsa yoki unga
ulanib bo'lmasa, sayt `lib/content.ts` faylidagi **dastlabki matnni**
ko'rsatadi — ya'ni sahifa hech qachon bo'sh qolmaydi. **Dastlabki matn**
tugmasi maydonlarni o'sha matn bilan to'ldiradi (saqlaguningizcha saytga
tegmaydi).

Yangi maydon yoki yangi sahifa qo'shish uchun `lib/content.ts` dagi
`PAGE_DEFINITIONS` ro'yxatiga yozuv qo'shiladi — panel, tekshiruv va
ko'rinish o'shandan avtomatik quriladi.

---

## 8. Ko'rishlar hisobi

Har bir yozuv nechta odam o'qigani saqlanadi.

- Brauzerga bir marta **qurilma kaliti** beriladi (`localStorage` va cookie —
  biri o'chsa, ikkinchisidan tiklanadi). Hech qanday IP yoki shaxsiy
  ma'lumot saqlanmaydi.
- Bazada `(yozuv, qurilma)` juftligi bo'yicha **unique indeks** turadi, ya'ni
  bitta qurilma bitta yozuvni necha marta ochsa ham hisob bir marta oshadi.
  Dedupe kod darajasida emas, bazaning o'zida — bir vaqtda kelgan
  so'rovlar ham hisobni ikki marta oshira olmaydi.
- Sanoq sahifa ochilishi bilan emas, **5 soniyadan keyin** yuboriladi —
  «kirdi-chiqdi» hisobga olinmaydi.
- Admin panelga kirgan holda o'z yozuvingizni ochsangiz, u sanalmaydi.
- Qoralamalar sanalmaydi.

Raqam yozuv sahifasida sana va o'qish vaqti yonida, admin panelda esa har bir
qator va tahrirlagich sozlamalarida ko'rinadi. Saytda ko'rsatishni
xohlamasangiz, `app/(site)/[slug]/page.tsx` faylidagi `<ViewCounter …/>`
qatorini (va undan oldingi nuqtani) o'chirib qo'ysangiz kifoya — hisob
baribir yig'ilib boraveradi.

---

## 9. Vercel'ga joylashtirish

1. Loyihani GitHub'ga yuklang (`.env.local` `.gitignore`da — u yuklanmaydi).
2. <https://vercel.com/new> → repozitoriyni tanlang.
3. **Environment Variables** bo'limiga `.env.local` dagi barcha qiymatlarni
   kiriting, faqat manzilni almashtiring:
   `NEXT_PUBLIC_SITE_URL="https://jaloliddin.uz"`. `ADMIN_PASSWORD_HASH` ni
   `.env.local` dagidek base64 ko'rinishida qoldiring.

   > **Qiymatlarni qo'shtirnoqsiz yopishtiring.** `.env.local` da
   > `MONGODB_URI="mongodb+srv://…"` deb yoziladi, Vercel paneliga esa faqat
   > `mongodb+srv://…` qismi kerak — panel qo'shtirnoqni qiymatning ichiga
   > qo'shib saqlaydi va ulanish `Invalid scheme` xatosi bilan yiqiladi.
   > (Kod endi qo'shtirnoq va ortiqcha probelni o'zi tozalaydi, ammo toza
   > qo'yilgani ma'qul.)
   >
   > `NEXT_PUBLIC_SITE_URL` ni **bo'sh qiymat bilan qo'shib qo'ymang** — u
   > sitemap, RSS va OG teglaridagi manzillarni belgilaydi. Qiymat bo'sh yoki
   > buzuq bo'lsa build yiqilmaydi, lekin manzillar `https://jaloliddin.uz`
   > ga qaytadi.
4. Atlas'da **Network Access** → `0.0.0.0/0` qo'shilganiga ishonch hosil
   qiling.
5. **Deploy**. Keyin **Settings → Domains** da `jaloliddin.uz` domenini
   ulang va domen provayderida Vercel ko'rsatgan DNS yozuvlarini qo'ying.

---

## 10. SEO va Google Search Console

### O'z-o'zidan ishlaydigan qismi

| Nima | Qayerda |
| --- | --- |
| `canonical`, `og:*`, `twitter:*` teglari — har bir sahifada o'ziniki | `app/**/page.tsx` |
| `sitemap.xml` — barcha yozuv, teg va sahifalar, aniq `lastmod` bilan | `app/sitemap.ts` |
| `robots.txt` + sitemap havolasi, `/admin` va `/api` yopiq | `app/robots.ts` |
| Ijtimoiy tarmoq rasmi (1200×630) — har bir yozuvga sarlavhasi bilan | `app/opengraph-image.tsx`, `app/(site)/[slug]/opengraph-image.tsx` |
| JSON-LD: `WebSite`, `Person`, `Blog`, `BlogPosting`, `BreadcrumbList`, `ItemList` | `lib/schema.ts` |
| `www.sayt.uz` → `sayt.uz` (308) | `next.config.ts` |
| Bo'sh teg sahifasi `noindex` — “yupqa sahifa” jazosi bo'lmasin | `app/(site)/teg/[tag]/page.tsx` |
| Yozuvlar build paytida chiziladi (SSG) — tez ochiladi | `generateStaticParams` |
| `max-image-preview:large` — natijalarda katta rasm | `app/layout.tsx` |

### Search Console'ga qo'shish

1. **Manzil to'g'riligini tekshiring.** Vercel → Settings → Environment
   Variables → `NEXT_PUBLIC_SITE_URL`. Qiymat **qo'shtirnoqsiz** bo'lsin:
   `https://jaloliddinhikmat.uz`. (Qo'shtirnoq bilan yozilgani uzoq vaqt
   canonical va sitemap manzillarini `https://"https` qilib buzib turgan edi —
   endi kod uni o'zi tozalaydi, lekin toza yozilgani baribir ma'qul.)
2. <https://search.google.com/search-console> → **Add property**. Ikki yo'l bor:
   - **Domain** (tavsiya) — DNS orqali tasdiqlanadi, `www` va boshqa
     ost-domenlarni ham qamrab oladi;
   - **URL prefix** — `https://jaloliddinhikmat.uz` deb yozib, «HTML tag»
     usulini tanlang va kodni `GOOGLE_SITE_VERIFICATION` muhit
     o'zgaruvchisiga qo'ying (Vercel'da ham), keyin qayta deploy qiling.
3. **Sitemaps** bo'limiga `sitemap.xml` ni yuboring.
4. **URL Inspection** → bosh sahifa manzilini kiriting → **Request indexing**.
   Har bir muhim sahifa uchun bir marta shunday qiling.
5. Yangi yozuv chiqarganingizda ham o'sha yozuvni «Request indexing» qiling —
   sitemap o'zi yangilanadi, lekin bu tezlatadi.

> Natija bir kunda ko'rinmaydi. Yangi domen odatda 3–14 kunda indeksga tushadi.
> Search Console'dagi **Pages** bo'limida qaysi sahifa indekslangani ko'rinadi.

Yandex uchun ham xuddi shunday: <https://webmaster.yandex.com> → saytni
qo'shing, tasdiqlash kodini `YANDEX_VERIFICATION` ga yozing.

### Har bir sahifaning sarlavha va tavsifi

`/admin` → **Sahifalar** → sahifani oching → **Qidiruvda ko'rinishi**:

- **Qidiruv sarlavhasi** — 60 belgigacha. Bo'sh qoldirsangiz, saytning odatiy
  sarlavhasi ishlatiladi.
- **Qidiruv tavsifi** — 120–160 belgi eng yaxshisi. Bo'sh qoldirsangiz, sahifa
  matnining boshidan olinadi; matn juda qisqa bo'lsa (masalan ikki so'z),
  saytning umumiy tavsifi ishlatiladi.

O'ng tomonda Google natijasining namunasi va belgilar hisobi turadi.

### Yozuv yozayotganda

- **Sarlavha** — asosiy so'z boshida bo'lsin, 60 belgigacha.
- **Qisqa tavsif** (Sozlamalar bo'limida) — bo'sh qoldirmang: aynan shu matn
  Google natijasida va ijtimoiy tarmoqda ko'rinadi.
- **Teglar** — har bir teg o'z sahifasini oladi va ichki havolalarni ko'paytiradi.
- **Manzil (slug)** — bir marta tanlanadi. Nashrdan keyin o'zgartirsangiz, eski
  manzil 404 bo'ladi va yig'ilgan “og'irlik” yo'qoladi.

---

## 11. Loyiha tuzilishi

```
app/
  (site)/            saytning ochiq qismi
    page.tsx         bosh sahifa
    [slug]/          yozuv sahifasi (+ loading skeleton)
    yozuvlar/        arxiv, yillar bo'yicha
    teg/[tag]/       teg bo'yicha yozuvlar
    haqida/          "Haqida" sahifasi (matni bazadan, paneldan tahrirlanadi)
  admin/
    login/           kirish sahifasi
    (panel)/         ro'yxat, yangi yozuv, tahrir, sahifalar
  api/admin/         login, logout, posts CRUD, pages, preview
  api/views/         ko'rishlarni qayd qilish
  rss.xml/           RSS lentasi (saytda havolasi ko'rsatilmaydi)
  opengraph-image.tsx  ijtimoiy tarmoq rasmi (yozuvlarniki [slug] ichida)
  manifest.ts apple-icon.tsx
  sitemap.ts robots.ts
components/          UI: header, footer, ro'yxat, belgilar, admin
assets/              OG rasmlaridagi shrift
lib/
  mongodb.ts         ulanish (dev'da qayta ishlatiladi)
  posts.ts           barcha so'rovlar; ochiq o'qishlar xatoda bo'sh qaytadi
  content.ts         sahifa matnlarining maydonlari va dastlabki qiymati
  pages.ts           sahifa matnlarini o'qish va saqlash
  auth.ts session.ts kirish va sessiya
  markdown.ts        Markdown → xavfsiz HTML
  schema.ts          JSON-LD (Google uchun ma'lumot tuguni)
  og.tsx             ijtimoiy tarmoq rasmining chizilishi
  site.ts            sayt manzili, canonical va OG yordamchilari
  device.ts          brauzerdagi qurilma kaliti
  validate.ts        yozuv maydonlarini tekshirish
proxy.ts             /admin/* ni himoyalaydi
scripts/             seed va kalit yaratuvchi skriptlar
```

---

## 12. Dizayn tizimi

Barcha ranglar `app/globals.css` faylining boshida OKLCH'da, ikkita to'plam
bilan: yorug' va qorong'i rejim. Ularni o'zgartirsangiz, butun sayt
o'zgaradi.

| Token | Vazifasi |
| --- | --- |
| `--bg`, `--surface`, `--line` | yuzalar va chegaralar |
| `--ink`, `--ink-soft`, `--muted` | matn darajalari |
| `--primary` | archa-yashil: havolalar, tugmalar, urg'u |
| `--accent` | iliq gil: teglar va kichik belgilar |

Shriftlar: **Alegreya** (matn) va **Alegreya Sans** (interfeys) — ikkalasi
ham `next/font` orqali saytning o'zidan beriladi, tashqi so'rov yo'q.

Maqola tipografiyasi `app/globals.css` dagi `.prose` sinfida: qator uzunligi
~68 belgi, mobilda 19px, kattaroq ekranda 20px.

---

## 13. Yodda tutish uchun

- `/haqida` sahifasidagi matn hozircha kodda turibdi
  (`app/(site)/haqida/page.tsx`) — uni o'zingizga moslang.
- Sayt nomi, tavsifi va domeni `lib/site.ts` faylida.
- Qorong'i rejim tanlovi brauzerda saqlanadi; hech narsa tanlanmagan bo'lsa,
  tizim sozlamasiga ergashadi.
