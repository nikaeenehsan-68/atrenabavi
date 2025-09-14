export const dynamic = "force-dynamic";
export const revalidate = 0;

const API = process.env.BACKEND_URL ?? "http://localhost:3001";

export async function GET() {
  const ts = new Date().toISOString();
  try {
    const upstream = await fetch(`${API}/api/students`, {
      method: "GET",
      cache: "no-store",
      next: { revalidate: 0 },
    });

    const text = await upstream.text();
    console.log(`[WEB]/api/students ${ts} upstream ${upstream.status}:`, text);

    return new Response(text, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "application/json",
      },
    });
  } catch (e: any) {
    console.error(`[WEB]/api/students ${ts} proxy error:`, e?.message || e);
    return Response.json(
      { message: "Proxy error", detail: String(e?.message || e) },
      { status: 502 },
    );
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  const ts = new Date().toISOString();

  console.log(`[WEB]/api/students ${ts} incoming:`, body);

  try {
    const upstream = await fetch(`${API}/api/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      next: { revalidate: 0 },
    });

    const text = await upstream.text();
    console.log(`[WEB]/api/students ${ts} upstream ${upstream.status}:`, text);

    return new Response(text, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "application/json",
      },
    });
  } catch (e: any) {
    console.error(`[WEB]/api/students ${ts} proxy error:`, e?.message || e);
    return Response.json({ message: "Proxy error", detail: String(e?.message || e) }, { status: 502 });
  }
}
