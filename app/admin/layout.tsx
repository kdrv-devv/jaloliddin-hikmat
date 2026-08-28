import type { Metadata } from "next";
import { ToastProvider } from "@/components/admin/ui";

export const metadata: Metadata = {
  title: { default: "Boshqaruv", template: "%s — Boshqaruv" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <ToastProvider>{children}</ToastProvider>;
}
