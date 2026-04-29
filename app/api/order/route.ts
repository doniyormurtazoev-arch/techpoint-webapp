import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const botToken = process.env.BOT_TOKEN;
    const adminChatId = process.env.ADMIN_CHAT_ID;

    if (!botToken || !adminChatId) {
      return NextResponse.json({ error: "Missing env vars" }, { status: 500 });
    }

    const formatPrice = (price: number) =>
      new Intl.NumberFormat("ru-RU").format(price) + " сум";

    const itemsText = body.items
      .map(
        (item: any, index: number) =>
          `${index + 1}. ${item.title} x${item.qty} — ${formatPrice(
            item.price * item.qty
          )}`
      )
      .join("\n");

    const message =
      `🛒 Новый заказ TechPoint\n\n` +
      `Имя: ${body.form?.name || "-"}\n` +
      `Телефон: ${body.form?.phone || "-"}\n\n` +
      `${itemsText}\n\n` +
      `Итого: ${formatPrice(body.totalPrice)}\n`;

    const telegramRes = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: adminChatId,
          text: message,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "✅ Принять",
                  callback_data: "accept_order",
                },
                {
                  text: "❌ Отклонить",
                  callback_data: "reject_order",
                },
              ],
            ],
          },
        }),
      }
    );

    const telegramJson = await telegramRes.json();

    if (!telegramRes.ok || !telegramJson.ok) {
      return NextResponse.json(
        { error: "Telegram error", telegramJson },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    );
  }
}
