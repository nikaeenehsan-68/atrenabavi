import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL!;

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json().catch(() => ({}));
  const r = await fetch(`${API}/academic-years/${params.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => null);
  return NextResponse.json(data, { status: r.status });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const r = await fetch(`${API}/academic-years/${params.id}`, {
    method: "DELETE",
  });
  const data = await r.json().catch(() => null);
  return NextResponse.json(data, { status: r.status });
}
