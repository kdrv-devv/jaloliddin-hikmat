import { PageView } from "@/components/page-view";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      {/* Har bir sahifa ochilishini statistikaga yozadi. */}
      <PageView />
      <a href="#main" className="skip-link">
        Asosiy matnga o'tish
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
