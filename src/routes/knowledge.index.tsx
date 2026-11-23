import { createFileRoute } from "@tanstack/react-router";
import Knowledge from "@/components/pages/Knowledge";

export const Route = createFileRoute("/knowledge/")({
  head: () => ({
    meta: [
      { title: "مركز المعرفة | طاقة بلس" },
      { name: "description", content: "مقالات وأدلة عملية عن الطاقة الشمسية: الأساسيات، التصميم، البطاريات، والعواكس." },
      { property: "og:title", content: "مركز المعرفة | طاقة بلس" },
      { property: "og:description", content: "مقالات وأدلة عملية عن الطاقة الشمسية: الأساسيات، التصميم، البطاريات، والعواكس." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Knowledge,
});
