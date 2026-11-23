import { createFileRoute } from "@tanstack/react-router";
import Login from "@/components/pages/Login";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول | طاقة بلس" },
      { name: "description", content: "تسجيل الدخول إلى لوحة إدارة منصة طاقة بلس." },
      { property: "og:title", content: "تسجيل الدخول | طاقة بلس" },
      { property: "og:description", content: "تسجيل الدخول إلى لوحة إدارة منصة طاقة بلس." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Login,
});
