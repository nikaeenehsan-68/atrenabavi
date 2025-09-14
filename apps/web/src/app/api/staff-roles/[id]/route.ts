// apps/web/src/app/api/staff-roles/[id]/route.ts
export const dynamic = "force-dynamic";
export const revalidate = 0;
const API = process.env.BACKEND_URL ?? "http://localhost:3001";
type Ctx = { params: { id: string } };

export async function PATCH(req: Request, { params }: Ctx) {
  const body = await req.text();
  const upstream = await fetch(`${API}/api/staff-roles/${params.id}`, {
    method: "PATCH",
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

export async function DELETE(_req: Request, { params }: Ctx) {
  const upstream = await fetch(`${API}/api/staff-roles/${params.id}`, {
    method: "DELETE",
    cache: "no-store",
    next: { revalidate: 0 },
  });
  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("content-type") || "application/json" },
  });
}
