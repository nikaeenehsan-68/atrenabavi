// apps/web/src/app/api/staff-roles/route.ts  (Next.js proxy to Nest)
export const dynamic = "force-dynamic";
export const revalidate = 0;
const API = process.env.BACKEND_URL ?? "http://localhost:3001";

export async function GET() {
  const upstream = await fetch(`${API}/api/staff-roles`, { cache: "no-store", next: { revalidate: 0 } });
  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("content-type") || "application/json" },
  });
}

export async function POST(req: Request) {
  const body = await req.text();
  const upstream = await fetch(`${API}/api/staff-roles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    cache: "no-store",
    next: { revalidate: 0 },
  });
  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("content-type") || "application/json" },
  });
}
