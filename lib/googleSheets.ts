import { google } from "googleapis";

export async function addOrderToSheet(order: any) {
  const auth = new google.auth.JWT(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    undefined,
    process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    ["https://www.googleapis.com/auth/spreadsheets"]
  );

  const sheets = google.sheets({ version: "v4", auth });

  const trackCode = "TP-" + Date.now();

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "orders!A:H",
    valueInputOption: "USER_ENTERED",
    requestBody: {
    values: [
  [
    trackCode,
    new Date().toISOString(),
    order.form?.name || "",
    order.form?.phone || "",
    order.items?.map((i: any) => `${i.title} x${i.qty}`).join(", "),
    order.totalPrice || 0,
    "accepted",
    order.telegramId || "", // 👈 добавили
  ],
],
    },
  });

  return trackCode;
}
export async function getOrdersByTelegramId(telegramId: number) {
  const auth = new google.auth.JWT(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    undefined,
    process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    ["https://www.googleapis.com/auth/spreadsheets.readonly"]
  );

  const sheets = google.sheets({ version: "v4", auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "orders!A:H",
  });

  const rows = res.data.values || [];

  const orders = rows
    .filter((row: any) => String(row[7]) === String(telegramId))
    .map((row: any) => ({
      trackCode: row[0],
      status: row[6],
      total: row[5],
    }));

  return orders;
}
