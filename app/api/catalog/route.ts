import { NextResponse } from "next/server";
import { google } from "googleapis";

function toBool(value: unknown) {
  return String(value).toLowerCase() === "true";
}

export async function GET() {
  try {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;

    const [categoriesRes, productsRes] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "categories!A2:D",
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "products!A2:H",
      }),
    ]);

    const categories =
      categoriesRes.data.values?.map((row) => ({
        id: row[0],
        name: row[1],
        active: toBool(row[2]),
        sort: Number(row[3] || 999),
      })) || [];

    const products =
      productsRes.data.values?.map((row) => ({
        id: row[0],
        category: row[1],
        title: row[2],
        price: Number(row[3]),
        status: row[4],
        description: row[5],
        image: row[6],
        active: toBool(row[7]),
      })) || [];

    return NextResponse.json({
      categories: categories.filter((c) => c.active),
      products: products.filter((p) => p.active),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
