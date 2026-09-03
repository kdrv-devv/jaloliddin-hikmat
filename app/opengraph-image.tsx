import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from "@/lib/og";
import { site } from "@/lib/site";

export const alt = site.title;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogImage({ title: site.tagline });
}
