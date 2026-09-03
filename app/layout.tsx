import type { Metadata, Viewport } from "next";
import { Alegreya, Alegreya_Sans } from "next/font/google";
import { envValue } from "@/lib/env";
import { absoluteUrl, site } from "@/lib/site";
import "./globals.css";

const serif = Alegreya({
  variable: "--font-alegreya",
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  display: "swap",
});

const sans = Alegreya_Sans({
  variable: "--font-alegreya-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700"],
  display: "swap",
});

/** Search Console / Yandex Webmaster tasdiqlash kodlari (ixtiyoriy). */
const verification = {
  ...(envValue(process.env.GOOGLE_SITE_VERIFICATION)
    ? { google: envValue(process.env.GOOGLE_SITE_VERIFICATION) }
    : {}),
  ...(envValue(process.env.YANDEX_VERIFICATION)
    ? { yandex: envValue(process.env.YANDEX_VERIFICATION) }
    : {}),
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s — ${site.name}` },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: absoluteUrl("/haqida") }],
  creator: site.name,
  publisher: site.name,
  keywords: [
    "Jaloliddin",
    "blog",
    "o'zbekcha blog",
    "kundalik",
    "esse",
    "kitoblar",
    "o'qilgan kitoblar",
  ],
  category: "blog",
  manifest: "/manifest.webmanifest",
  formatDetection: { telephone: false, address: false, email: false },
  openGraph: {
    type: "website",
    locale: site.locale,
    siteName: site.name,
    title: site.title,
    description: site.description,
    url: site.url,
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": absoluteUrl("/rss.xml") },
  },
  // `max-image-preview: large` — Google natijalarda va Discover'da katta
  // rasm ko'rsatishi uchun; usiz preview kichkina belgi bo'lib qoladi.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  ...(Object.keys(verification).length > 0 ? { verification } : {}),
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111111" },
  ],
};

/* Sahifa chizilishidan oldin mavzuni tiklaydi — "oq yaltirash" bo'lmaydi. */
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("jh-theme");if(t==="light"||t==="dark"){document.documentElement.dataset.theme=t}}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="uz"
      className={`${serif.variable} ${sans.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col bg-bg text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
