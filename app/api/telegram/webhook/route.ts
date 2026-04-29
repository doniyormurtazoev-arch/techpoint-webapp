import { NextResponse } from "next/server";
import { addOrderToSheet } from "@/lib/googleSheets";

export async function GET() {
  return NextResponse.json({ ok: true });
}

function parseOrderFromText(text: string) {
  const name = text.match(/Имя:\s*(.+)/)?.[1]?.trim() || "";
  const phone = text.match(/Телефон:\s*(.+)/)?.[1]?.trim() || "";
  const totalText = text.match(/Итого:\s*([\d\s]+)/)?.[1] || "0";
  const total = Number(totalText.replace(/\s/g, ""));

  const itemsBlock = text
    .split("\n")
    .filter((line) => /^\d+\.\s/.test(line))
    .join(", ");

  return {
    form: { name, phone },
    items: [{ title: itemsBlock, qty: 1 }],
    totalPrice: total,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const botToken = process.env.BOT_TOKEN;

    const callback = body.callback_query;
    if (!callback) return NextResponse.json({ ok: true });

    const action = callback.data;
    const chatId = callback.message.chat.id;
    const messageId = callback.message.message_id;
    const oldText = callback.message.text || "";

    let newText = oldText;

    if (action === "accept_order") {
      const order = parseOrderFromText(oldText);
      const trackCode = await addOrderToSheet(order);

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
