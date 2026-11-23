import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShieldAlert, LogOut } from "lucide-react";
import Admin from "@/components/pages/Admin";
import { useAuth } from "@/hooks/use-auth";
import { Container, Spinner } from "@/components/site-ui";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "لوحة الإدارة | طاقة بلس" },
      { name: "description", content: "إدارة طلبات العروض والمشاريع والمنتجات والمقالات في منصة طاقة بلس." },
      { property: "og:title", content: "لوحة الإدارة | طاقة بلس" },
      { property: "og:description", content: "إدارة طلبات العروض والمشاريع والمنتجات والمقالات في منصة طاقة بلس." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminGate,
});

function AdminGate() {
  const { loading, isAdmin, user, signOut } = useAuth();
  const navigate = useNavigate();
  if (loading) return <Spinner label="جارٍ التحقق من الجلسة..." />;
  if (isAdmin) return <Admin />;
  return (
    <div className="flex min-h-[70vh] items-center py-12">
      <Container className="max-w-md">
        <div className="rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-xl">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <ShieldAlert className="h-8 w-8" />
          </span>
          <h1 className="mt-4 text-xl font-extrabold text-slate-900">لا تملك صلاحية الإدارة</h1>
          <p className="mt-2 text-sm text-slate-500">
            الحساب <span dir="ltr" className="font-semibold">{user?.email}</span> ليس من حسابات الإدارة.
          </p>
          <button
            onClick={async () => {
              await signOut();
              navigate({ to: "/login", replace: true });
            }}
            className="mt-6 inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" /> تسجيل الخروج
          </button>
        </div>
      </Container>
    </div>
  );
}
