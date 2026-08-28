import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";
import { ArrowLeftIcon } from "@/components/icons";
import { JuniperSprig } from "@/components/marks";

export const metadata: Metadata = { title: "Kirish" };

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-[22rem]">
        <div className="mb-8 flex flex-col items-center text-center">
          <JuniperSprig className="h-20 w-auto text-primary opacity-35" />
          <h1 className="mt-4 font-serif text-[1.6rem] font-medium tracking-[-0.015em] text-ink">
            Boshqaruvga kirish
          </h1>
          <p className="mt-1.5 text-[0.875rem] text-muted">
            Yozuvlarni faqat egasi tahrirlaydi.
          </p>
        </div>

        <Suspense fallback={<div className="h-64" />}>
          <LoginForm />
        </Suspense>

        <div className="mt-7 text-center">
          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 text-[0.875rem] text-muted transition-colors duration-200 hover:text-primary"
          >
            <ArrowLeftIcon className="size-3.5 transition-transform duration-300 ease-[var(--ease-out-quint)] group-hover:-translate-x-0.5" />
            Saytga qaytish
          </Link>
        </div>
      </div>
    </main>
  );
}
