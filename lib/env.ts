/**
 * Muhit o'zgaruvchisini tozalaydi.
 *
 * Vercel kabi panellarga qiymat ko'pincha `.env` faylidan qo'shtirnoqlari
 * bilan birga nusxalanadi yoki oxirida probel qolib ketadi. Panel ularni
 * qiymatning bir qismi deb saqlaydi va natijada ulanish satri ham,
 * parol hashi ham ishlamay qoladi.
 */
export function envValue(raw: string | undefined | null): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  const quoted =
    trimmed.length >= 2 &&
    ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'")));
  return quoted ? trimmed.slice(1, -1).trim() : trimmed;
}
