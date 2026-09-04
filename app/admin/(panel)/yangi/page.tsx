import type { Metadata } from "next";
import { PostEditor } from "@/components/admin/post-editor";
import { DEFAULT_SECTION, getSection, isSectionKey } from "@/lib/sections";
import type { SectionKey } from "@/lib/sections";

/** `/admin/yangi?bolim=sher` — ro'yxatdagi «Yangi She'r» tugmasidan keladi. */
function requestedSection(raw: string | string[] | undefined): SectionKey {
  return isSectionKey(raw) ? raw : DEFAULT_SECTION;
}

export async function generateMetadata(
  props: PageProps<"/admin/yangi">,
): Promise<Metadata> {
  const section = requestedSection((await props.searchParams).bolim);
  return { title: `Yangi ${getSection(section).singular}` };
}

export default async function NewPostPage(props: PageProps<"/admin/yangi">) {
  const section = requestedSection((await props.searchParams).bolim);
  return <PostEditor section={section} />;
}
