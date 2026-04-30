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

function updateStatus(text: string, statusText: string) {
  if (text.includes("Статус:")) {
    return text.replace(/Статус:.*/g, `Статус: ${statusText}`);
  }

  return text + `\n\nСтатус: ${statusText}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const botToken = process.env.BOT_TOKEN;
if (body.message) {
  const text = body.message.text;
  const chatId = body.message.chat.id;
  const botToken = process.env.BOT_TOKEN;

  if (text === "📦 Мои заказы") {
    await fetch(`${process.env.BASE_URL}/api/telegram/my-orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    return NextResponse.json({ ok: true });
  }
}
    const callback = body.callback_query;
    if (!callback) return NextResponse.json({ ok: true });

    const action = callback.data;
    const chatId = callback.message.chat.id;
    const messageId = callback.message.message_id;
    const oldText = callback.message.text || "";

    let newText = oldText;
    let answerText = "Готово";

    if (action === "accept_order") {
      const order = {
  ...parseOrderFromText(oldText),
  telegramId: callback.from.id,
};
      const trackCode = await addOrderToSheet(order);

      newText = updateStatus(oldText, "✅ Заказ принят");
      newText += `\n\n🔎 Трек-код: ${trackCode}`;
      answerText = "Заказ принят";
    }

    if (action === "reject_order") {
      newText = updateStatus(oldText, "❌ Заказ отклонён");
      answerText = "Заказ отклонён";
    }

    if (action === "status_packing") {
      newText = updateStatus(oldText, "📦 Собирается");
      answerText = "Статус: собирается";
    }

    if (action === "status_delivery") {
      newText = updateStatus(oldText, "🚚 В доставке");
      answerText = "Статус: в доставке";
    }

    if (action === "status_done") {
      newText = updateStatus(oldText, "✅ Завершён");
      answerText = "Заказ завершён";
    }

    await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text: newText,
        reply_markup: {
          inline_keyboard: [
            [
              { text: "📦 Сборка", callback_data: "status_packing" },
              { text: "🚚 Доставка", callback_data: "status_delivery" },
              { text: "✅ Завершить", callback_data: "status_done" },
            ],
          ],
        },
      }),
    });

    await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callback.id,
        text: answerText,
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
