import { createFileRoute } from "@tanstack/react-router";
import ResetPassword from "@/components/pages/ResetPassword";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "اختيار كلمة مرور جديدة | طاقة بلس" },
      { name: "description", content: "تأكيد البريد واختيار كلمة مرور جديدة لحساب لوحة الإدارة." },
      { property: "og:title", content: "اختيار كلمة مرور جديدة | طاقة بلس" },
      { property: "og:description", content: "تأكيد البريد واختيار كلمة مرور جديدة لحساب لوحة الإدارة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPassword,
});
