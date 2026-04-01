import { NextResponse } from "next/server";
import { google } from "googleapis";

type Category = {
  id: string;
  name: string;
  active: boolean;
  sort: number;
};

type Product = {
  id: string;
  category: string;
  title: string;
  price: number;
  status: string;
  description: string;
  image: string;
  active: boolean;
};

function toBool(value: unknown) {
  return String(value).trim().toLowerCase() === "true";
}

export async function GET() {
  try {
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

    if (!clientEmail || !privateKey || !spreadsheetId) {
      return NextResponse.json(
        {
          error: "Missing Google Sheets env vars",
          hasEmail: Boolean(clientEmail),
          hasPrivateKey: Boolean(privateKey),
          hasSpreadsheetId: Boolean(spreadsheetId)
        },
        { status: 500 }
      );
    }

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
    });

    const sheets = google.sheets({
      version: "v4",
      auth
    });

    const [categoriesRes, productsRes] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "categories!A2:D"
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "products!A2:H"
      })
    ]);

    const categoriesRows = categoriesRes.data.values || [];
    const productsRows = productsRes.data.values || [];

    const categories: Category[] = categoriesRows
      .map((row) => ({
        id: row[0] || "",
        name: row[1] || "",
        active: toBool(row[2]),
        sort: Number(row[3] || 999)
      }))
      .filter((item) => item.id && item.name && item.active)
      .sort((a, b) => a.sort - b.sort);

    const products: Product[] = productsRows
      .map((row) => ({
        id: row[0] || "",
        category: row[1] || "",
        title: row[2] || "",
        price: Number(row[3] || 0),
        status: row[4] || "",
        description: row[5] || "",
        image: row[6] || "",
        active: toBool(row[7])
      }))
      .filter((item) => item.id && item.title && item.active);

    return NextResponse.json({
      categories,
      products
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to load catalog",
        message: error?.message || String(error)
      },
      { status: 500 }
    );
  }
}
