import { NextResponse } from "next/server";
import { addOrderToSheet } from "@/lib/googleSheets";

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const botToken = process.env.BOT_TOKEN;

    const callback = body.callback_query;

    if (!callback) {
      return NextResponse.json({ ok: true });
    }

   let data;

try {
  data = JSON.parse(callback.data);
} catch {
  data = { action: callback.data };
}

const action = data.action;
    const chatId = callback.message.chat.id;
    const messageId = callback.message.message_id;

    let newText = callback.message.text || "";

    if (action === "accept_order") {
      const trackCode = await addOrderToSheet({
  form: {
    name: data.order?.name,
    phone: data.order?.phone
  },
  items: data.order?.items,
  totalPrice: data.order?.total
});

      newText += `\n\n✅ Заказ принят\n🔎 Трек-код: ${trackCode}`;
    }

    if (action === "reject_order") {
      newText += "\n\n❌ Заказ отклонён";
    }

    await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text: newText,
      }),
    });

    await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callback.id,
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
