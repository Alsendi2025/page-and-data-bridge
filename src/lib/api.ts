/* Data access for the site, replacing the original /api/* endpoints.
 * Reads and writes go straight to Lovable Cloud; row-level security decides
 * who may do what (public reads, visitor submissions, admin-only management). */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from "@/integrations/supabase/client";

type Row = any;

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

// ---------- Products ----------
export async function listProducts(
  opts: { category?: string; search?: string; limit?: number } = {},
): Promise<Row[]> {
  let q = supabase.from("products").select("*").order("id", { ascending: true });
  if (opts.category && opts.category !== "all") q = q.eq("category", opts.category);
  if (opts.search) {
    const s = opts.search.replace(/[,%()]/g, " ").trim();
    if (s) q = q.or(`name.ilike.%${s}%,brand.ilike.%${s}%`);
  }
  if (opts.limit) q = q.limit(opts.limit);
  return unwrap(await q) ?? [];
}

export async function getProduct(id: string | number): Promise<Row | null> {
  const n = Number(id);
  if (!Number.isFinite(n)) return null;
  return unwrap(await supabase.from("products").select("*").eq("id", n).maybeSingle());
}

export async function createProduct(body: Record<string, unknown>): Promise<Row> {
  return unwrap(await supabase.from("products").insert(body as any).select().single());
}

export async function deleteProduct(id: number): Promise<void> {
  unwrap(await supabase.from("products").delete().eq("id", id));
}

// ---------- Articles ----------
export async function listArticles(
  opts: { category?: string; slug?: string; limit?: number; includeDrafts?: boolean } = {},
): Promise<Row[]> {
  let q = supabase.from("articles").select("*").order("created_at", { ascending: false });
  if (!opts.includeDrafts) q = q.eq("published", true);
  if (opts.slug) q = q.eq("slug", opts.slug);
  if (opts.category && opts.category !== "all") q = q.eq("category", opts.category);
  if (opts.limit) q = q.limit(opts.limit);
  return unwrap(await q) ?? [];
}

export async function createArticle(body: Record<string, unknown>): Promise<Row> {
  return unwrap(await supabase.from("articles").insert(body as any).select().single());
}

export async function updateArticle(id: number, patch: Record<string, unknown>): Promise<void> {
  unwrap(await supabase.from("articles").update(patch as any).eq("id", id));
}

export async function deleteArticle(id: number): Promise<void> {
  unwrap(await supabase.from("articles").delete().eq("id", id));
}

// ---------- Saved projects ----------
export async function saveProject(body: Record<string, unknown>): Promise<void> {
  // Visitors may save but not read back, so no .select() here.
  unwrap(await supabase.from("projects").insert(body as any));
}

export async function listProjects(): Promise<Row[]> {
  return (
    unwrap(await supabase.from("projects").select("*").order("created_at", { ascending: false })) ??
    []
  );
}

export async function deleteProject(id: number): Promise<void> {
  unwrap(await supabase.from("projects").delete().eq("id", id));
}

// ---------- Quote requests ----------
export async function submitQuoteRequest(body: {
  name: string;
  phone: string;
  city: string;
  service_type: string;
  details: string;
}): Promise<void> {
  unwrap(await supabase.from("quote_requests").insert({ ...body, status: "new" }));
}

export async function listQuoteRequests(): Promise<Row[]> {
  return (
    unwrap(
      await supabase.from("quote_requests").select("*").order("created_at", { ascending: false }),
    ) ?? []
  );
}

export async function updateQuoteStatus(id: number, status: string): Promise<void> {
  unwrap(await supabase.from("quote_requests").update({ status }).eq("id", id));
}

export async function deleteQuoteRequest(id: number): Promise<void> {
  unwrap(await supabase.from("quote_requests").delete().eq("id", id));
}
