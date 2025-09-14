export const dynamic = "force-dynamic";
export const revalidate = 0;

const API = process.env.BACKEND_URL ?? "http://localhost:3001";
type Ctx = { params: { id: string } };

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = params;
  const body = await req.text();
  try {
    const upstream = await fetch(`${API}/api/enrollments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body,
      cache: "no-store", next: { revalidate: 0 },
    });
    const text = await upstream.text();
    return new Response(text, { status: upstream.status, headers: { "Content-Type": upstream.headers.get("content-type") || "application/json" } });
  } catch (e: any) {
    return Response.json({ message: "Proxy error", detail: String(e?.message || e) }, { status: 502 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = params;
  try {
    const upstream = await fetch(`${API}/api/enrollments/${id}`, { method: "DELETE", cache: "no-store", next: { revalidate: 0 } });
    const text = await upstream.text();
    return new Response(text, { status: upstream.status, headers: { "Content-Type": upstream.headers.get("content-type") || "application/json" } });
  } catch (e: any) {
    return Response.json({ message: "Proxy error", detail: String(e?.message || e) }, { status: 502 });
  }
}
