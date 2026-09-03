import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // O'zbekchada apostrof — tinish belgisi emas, harfning bir qismi
      // (o', g'). Bu qoida JSX matnidagi har bir "o'zgarish" ni xato deb
      // belgilaydi va matnni &apos; bilan to'ldirishga majbur qiladi.
      // Bizda matn ko'p, shuning uchun qoida o'chirilgan: React `'` ni
      // baribir to'g'ri chiqaradi.
      "react/no-unescaped-entities": "off",
    },
  },
]);

export default eslintConfig;
