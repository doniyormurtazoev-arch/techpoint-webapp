import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const botToken = process.env.BOT_TOKEN;
    const adminChatId = process.env.ADMIN_CHAT_ID;

    if (!botToken || !adminChatId) {
      return NextResponse.json(
        {
          error: "Missing env vars",
          botTokenExists: Boolean(botToken),
          adminChatIdExists: Boolean(adminChatId),
        },
        { status: 500 }
      );
    }

    const formatPrice = (price: number) =>
      new Intl.NumberFormat("ru-RU").format(price) + " сум";

    const itemsText = Array.isArray(body.items)
      ? body.items
          .map(
            (item: any, index: number) =>
              `${index + 1}. ${item.title} x${item.qty} — ${formatPrice(
                Number(item.price || 0) * Number(item.qty || 1)
              )}`
          )
          .join("\n")
      : "Товары не указаны";

    const customerText = body.customer
      ? [
          `Telegram: ${body.customer.first_name || ""} ${
            body.customer.last_name || ""
          }`.trim(),
          body.customer.username ? `Username: @${body.customer.username}` : null,
          body.customer.id ? `Telegram ID: ${body.customer.id}` : null,
        ]
          .filter(Boolean)
          .join("\n")
      : "Telegram: не определён";

    const formText = [
      `Имя: ${body.form?.name || "-"}`,
      `Телефон: ${body.form?.phone || "-"}`,
      `Комментарий: ${body.form?.comment || "-"}`,
    ].join("\n");

    const message =
      `🛒 Новый заказ TechPoint\n\n` +
      `${formText}\n\n` +
      `${customerText}\n\n` +
      `${itemsText}\n\n` +
      `Всего товаров: ${body.totalItems || 0}\n` +
      `Итого: ${formatPrice(Number(body.totalPrice || 0))}\n\n` +
      `Оплата: 50% предоплата / 50% после получения`;

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
        {
          error: "Telegram API error",
          status: telegramRes.status,
          telegram: telegramJson,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Server error",
        message: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
