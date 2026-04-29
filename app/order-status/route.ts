import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const trackCode = searchParams.get("trackCode");

    if (!trackCode) {
      return NextResponse.json({ error: "No trackCode" }, { status: 400 });
    }

    const auth = new google.auth.JWT(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      undefined,
      process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/spreadsheets.readonly"]
    );

    const sheets = google.sheets({ version: "v4", auth });

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "orders!A:G",
    });

    const rows = res.data.values || [];

    const order = rows.find((row: any) => row[0] === trackCode);

    if (!order) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      trackCode: order[0],
      createdAt: order[1],
      name: order[2],
      phone: order[3],
      items: order[4],
      total: order[5],
      status: order[6],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    );
  }
}
