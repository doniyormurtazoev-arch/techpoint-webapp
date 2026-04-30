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

    const message =
      `🛒 Новый заказ TechPoint\n\n` +
      `Имя: ${body.form?.name || "-"}\n` +
      `Телефон: ${body.form?.phone || "-"}\n` +
      `Telegram ID: ${body.customer?.id || "-"}\n` +
      `Комментарий: ${body.form?.comment || "-"}\n\n` +
      `${itemsText}\n\n` +
      `Всего товаров: ${body.totalItems || 0}\n` +
      `Итого: ${formatPrice(Number(body.totalPrice || 0))}\n\n` +
      `Статус: 🆕 Новый\n\n` +
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
              [
                {
                  text: "📦 Сборка",
                  callback_data: "status_packing",
                },
                {
                  text: "🚚 Доставка",
                  callback_data: "status_delivery",
                },
                {
                  text: "✅ Завершить",
                  callback_data: "status_done",
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
          error: "Telegram error",
          telegramJson,
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
