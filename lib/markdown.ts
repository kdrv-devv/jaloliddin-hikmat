import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";

const schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    a: [...(defaultSchema.attributes?.a ?? []), "target", "rel"],
    img: [
      ...(defaultSchema.attributes?.img ?? []),
      "loading",
      "decoding",
      "width",
      "height",
    ],
  },
};

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSanitize, schema)
  .use(rehypeSlug)
  .use(rehypeStringify);

/** Markdown -> sanitised HTML. Safe to render with dangerouslySetInnerHTML. */
export async function renderMarkdown(markdown: string): Promise<string> {
  const file = await processor.process(markdown ?? "");
  return String(file);
}

/** Matn yordamchisi bu yerdan ham chiqadi — eski importlar ishlayversin. */
export { plainText } from "./text";
