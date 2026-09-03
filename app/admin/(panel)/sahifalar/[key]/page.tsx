import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageEditor } from "@/components/admin/page-editor";
import { getPageDefinition } from "@/lib/content";
import { readPageContent } from "@/lib/pages";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: PageProps<"/admin/sahifalar/[key]">,
): Promise<Metadata> {
  const { key } = await props.params;
  const definition = getPageDefinition(key);
  return { title: definition ? definition.label : "Sahifa" };
}

export default async function EditPagePage(
  props: PageProps<"/admin/sahifalar/[key]">,
) {
  const { key } = await props.params;
  const definition = getPageDefinition(key);
  if (!definition) notFound();
  const values = await readPageContent(key);
  return (
    <PageEditor
      definition={definition}
      values={values}
      domain={site.domain}
      siteDescription={site.description}
    />
  );
}
