export const dynamic = "force-dynamic";
export const revalidate = 0;
const API = process.env.BACKEND_URL ?? "http://localhost:3001";

export async function GET() {
  try {
    const upstream = await fetch(`${API}/api/enrollments/meta`, { cache: "no-store", next: { revalidate: 0 } });
    const text = await upstream.text();
    return new Response(text, { status: upstream.status, headers: { "Content-Type": upstream.headers.get("content-type") || "application/json" } });
  } catch (e: any) {
    return Response.json({ message: "Proxy error", detail: String(e?.message || e) }, { status: 502 });
  }
}
