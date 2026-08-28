import type { Metadata } from "next";
import { JuniperSprig, SprigDivider } from "@/components/marks";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Haqida",
  description: `${site.name} va bu blog haqida.`,
  alternates: { canonical: "/haqida" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-[44rem] px-5 pt-12 sm:px-8 sm:pt-20">
      <header className="relative pb-8">
        <JuniperSprig className="pointer-events-none absolute -top-10 right-[-3.5rem] h-[19rem] w-auto -rotate-6 text-primary opacity-[0.11] sm:right-[-4.5rem] sm:h-[23rem]" />
        <h1 className="relative font-serif text-[2rem] leading-[1.1] font-medium tracking-[-0.022em] text-ink sm:text-[2.6rem]">
          Salom, men Jaloliddin
        </h1>
      </header>

      <div className="prose">
        <p>
          Bu sahifa — uzun tanishtiruv emas, qisqa qo’l berish. Men shu
          yerda o’zim uchun yozaman: kunduzi ko’rgan bir narsa, kechqurun
          o’qigan bir sahifa, uzoq vaqt yechilmay turgan bir savol.
        </p>
        <p>
          Yozganlarim ko’pincha shoshilmasdan tugaydi. Bir matnni bir necha
          kun tashlab qo’yib, keyin qaytib o’qiyman — shundagina qaysi jumla
          rost, qaysi biri shunchaki chiroyli ekani ko’rinadi. Shuning uchun
          bu yerda ko’p emas, ammo o’zim ishonadigan narsalar turadi.
        </p>

        <h2>Nima haqida yozaman</h2>
        <p>
          Uchta narsa aylanib-aylanib qaytadi: <em>kundalik kuzatuvlar</em> —
          shahar, ob-havo, odamlar; <em>kitoblar</em> — o’qiganim va nega
          esimda qolgani; va <em>fikrlar</em> — hali javobi topilmagan, lekin
          yozib qo’yishga arzigan savollar.
        </p>
        <p>
          Matnlarim uzun bo’lishi mumkin. Ularni bir o’tirishda tugatish shart
          emas — sahifa qayerda to’xtaganingizni yuqoridagi ingichka chiziqda
          ko’rsatib turadi.
        </p>

        <h2>Aloqa</h2>
        <p>
          Yozganlarim bo’yicha fikringiz bo’lsa, xursand bo’laman. Yangi
          matnlar shoshilmasdan, o’zi tayyor bo’lgan kuni chiqadi — kuzatib
          borish uchun vaqti-vaqti bilan kirib tursangiz kifoya.
        </p>
      </div>

      <SprigDivider className="mt-14" />
    </div>
  );
}
