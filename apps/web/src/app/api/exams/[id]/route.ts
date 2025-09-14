export const dynamic = "force-dynamic";
export const revalidate = 0;

const API = process.env.BACKEND_URL ?? "http://localhost:3001";

export async function PATCH(_: Request, { params }: { params: { id: string } }) {
  const body = await _.json();
  const r = await fetch(`${API}/api/exams/${params.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
    next: { revalidate: 0 },
  });
  const t = await r.text();
  return new Response(t, { status: r.status, headers: { "Content-Type": r.headers.get("content-type") || "application/json" } });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const r = await fetch(`${API}/api/exams/${params.id}`, {
    method: "DELETE",
    cache: "no-store",
    next: { revalidate: 0 },
  });
  const t = await r.text();
  return new Response(t, { status: r.status, headers: { "Content-Type": r.headers.get("content-type") || "application/json" } });
}