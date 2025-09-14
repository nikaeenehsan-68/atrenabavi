export const dynamic = "force-dynamic";
export const revalidate = 0;

const API = process.env.BACKEND_URL ?? "http://localhost:3001";

type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = params;
  const ts = new Date().toISOString();
  try {
    const upstream = await fetch(`${API}/api/students/${id}`, {
      method: "GET",
      cache: "no-store",
      next: { revalidate: 0 },
    });
    const text = await upstream.text();
    console.log(`[WEB]/api/students/${id} ${ts} upstream ${upstream.status}:`, text);
    return new Response(text, {
      status: upstream.status,
      headers: { "Content-Type": upstream.headers.get("content-type") || "application/json" },
    });
  } catch (e: any) {
    console.error(`[WEB]/api/students/${id} ${ts} proxy error:`, e?.message || e);
    return Response.json({ message: "Proxy error", detail: String(e?.message || e) }, { status: 502 });
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = params;
  const ts = new Date().toISOString();
  const body = await req.text();
  try {
    const upstream = await fetch(`${API}/api/students/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body,
      cache: "no-store",
      next: { revalidate: 0 },
    });
    const text = await upstream.text();
    console.log(`[WEB]/api/students/${id} ${ts} upstream ${upstream.status}:`, text);
    return new Response(text, {
      status: upstream.status,
      headers: { "Content-Type": upstream.headers.get("content-type") || "application/json" },
    });
  } catch (e: any) {
    console.error(`[WEB]/api/students/${id} ${ts} proxy error:`, e?.message || e);
    return Response.json({ message: "Proxy error", detail: String(e?.message || e) }, { status: 502 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = params;
  const ts = new Date().toISOString();
  try {
    const upstream = await fetch(`${API}/api/students/${id}`, {
      method: "DELETE",
      cache: "no-store",
      next: { revalidate: 0 },
    });
    const text = await upstream.text();
    console.log(`[WEB]/api/students/${id} ${ts} upstream ${upstream.status}:`, text);
    return new Response(text, {
      status: upstream.status,
      headers: { "Content-Type": upstream.headers.get("content-type") || "application/json" },
    });
  } catch (e: any) {
    console.error(`[WEB]/api/students/${id} ${ts} proxy error:`, e?.message || e);
    return Response.json({ message: "Proxy error", detail: String(e?.message || e) }, { status: 502 });
  }
}
