export const dynamic = "force-dynamic";
export const revalidate = 0;

const API = process.env.BACKEND_URL ?? "http://localhost:3001";

export async function GET() {
  const r = await fetch(`${API}/api/exams`, { cache: "no-store", next: { revalidate: 0 } });
  const t = await r.text();
  return new Response(t, { status: r.status, headers: { "Content-Type": r.headers.get("content-type") || "application/json" } });
}

export async function POST(req: Request) {
  const body = await req.json();
  const r = await fetch(`${API}/api/exams`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
    next: { revalidate: 0 },
  });
  const t = await r.text();
  return new Response(t, { status: r.status, headers: { "Content-Type": r.headers.get("content-type") || "application/json" } });
}