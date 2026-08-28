import type { Metadata } from "next";
import { PostEditor } from "@/components/admin/post-editor";

export const metadata: Metadata = { title: "Yangi yozuv" };

export default function NewPostPage() {
  return <PostEditor />;
}
