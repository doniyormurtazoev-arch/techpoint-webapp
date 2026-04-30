import { NextResponse } from "next/server";
import { getOrdersByTelegramId } from "@/lib/googleSheets";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const chatId = body.message.chat.id;

    const orders = await getOrdersByTelegramId(chatId);

    const botToken = process.env.BOT_TOKEN;

    let text = "📦 Ваши заказы:\n\n";

    if (!orders.length) {
      text = "❌ У вас пока нет заказов";
    } else {
      text += orders
        .map(
          (o: any, i: number) =>
            `${i + 1}. ${o.trackCode}\nСтатус: ${o.status}\nСумма: ${o.total} сум`
        )
        .join("\n\n");
    }

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    );
  }
}
