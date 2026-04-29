import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  const body = await req.json();
  console.log("Telegram webhook:", body);

  return NextResponse.json({ ok: true });
}
