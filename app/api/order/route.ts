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

    const itemsText = body.items
      .map(
        (item: any, index: number) =>
          `${index + 1}. ${item.title} x${item.qty} — ${formatPrice(
            item.price * item.qty
          )}`
      )
      .join("\n");

    const customerText = body.customer
      ? [
          `Telegram: ${body.customer.first_name || ""} ${body.customer.last_name || ""}`.trim(),
          body.customer.username ? `Username: @${body.customer.username}` : null,
          `Telegram ID: ${body.customer.id}`,
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
      `Всего товаров: ${body.totalItems}\n` +
      `Итого: ${formatPrice(body.totalPrice)}\n\n` +
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
