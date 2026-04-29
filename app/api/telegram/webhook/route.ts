import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const botToken = process.env.BOT_TOKEN;

    if (!botToken) {
      return NextResponse.json({ error: "Missing BOT_TOKEN" }, { status: 500 });
    }

    const callback = body.callback_query;

    if (!callback) {
      return NextResponse.json({ ok: true });
    }

    const action = callback.data;
    const chatId = callback.message.chat.id;
    const messageId = callback.message.message_id;

    let newText = callback.message.text || "";

    if (action === "accept_order") {
      newText += "\n\n✅ Заказ принят";
    }

    if (action === "reject_order") {
      newText += "\n\n❌ Заказ отклонён";
    }

    await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text: newText,
      }),
    });

    await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        callback_query_id: callback.id,
        text:
          action === "accept_order"
            ? "Заказ принят"
            : "Заказ отклонён",
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
