"use client";

import { useState } from "react";

const statusMap: Record<string, string> = {
  accepted: "✅ Заказ принят",
  packing: "📦 Собирается",
  delivery: "🚚 В доставке",
  done: "✅ Завершён",
  cancelled: "❌ Отменён",
};

export default function OrderStatusPage() {
  const [code, setCode] = useState("");
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const checkOrder = async () => {
    setError("");
    setData(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/order-status?trackCode=${code.trim()}`);
      const json = await res.json();

      if (!res.ok) {
        setError("Заказ не найден. Проверьте трек-код.");
        return;
      }

      setData(json);
    } catch {
      setError("Ошибка проверки заказа.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-4 py-10">
      <div className="mx-auto max-w-xl rounded-3xl bg-neutral-900 p-6 shadow-2xl border border-neutral-800">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🛒</div>
          <h1 className="text-3xl font-bold">Проверка заказа</h1>
          <p className="text-neutral-400 mt-2">
            Введите трек-код, который вы получили после оформления заказа
          </p>
        </div>

        <div className="flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Например: TP-1777463472496"
            className="flex-1 rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-3 outline-none focus:border-blue-500"
          />

          <button
            onClick={checkOrder}
            disabled={loading || !code.trim()}
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold disabled:opacity-50"
          >
            {loading ? "..." : "Проверить"}
          </button>
        </div>

        {error && (
          <div className="mt-5 rounded-xl bg-red-950 border border-red-800 p-4 text-red-200">
            {error}
          </div>
        )}

        {data && (
          <div className="mt-6 rounded-2xl bg-neutral-800 border border-neutral-700 p-5 space-y-4">
            <div>
              <p className="text-neutral-400 text-sm">Трек-код</p>
              <p className="font-bold text-lg">{data.trackCode}</p>
            </div>

            <div>
              <p className="text-neutral-400 text-sm">Статус</p>
              <p className="text-xl font-bold">
                {statusMap[data.status] || data.status}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-neutral-400 text-sm">Имя</p>
                <p>{data.name || "-"}</p>
              </div>

              <div>
                <p className="text-neutral-400 text-sm">Телефон</p>
                <p>{data.phone || "-"}</p>
              </div>
            </div>

            <div>
              <p className="text-neutral-400 text-sm">Товары</p>
              <p>{data.items}</p>
            </div>

            <div>
              <p className="text-neutral-400 text-sm">Сумма</p>
              <p className="text-2xl font-bold">
                {Number(data.total).toLocaleString("ru-RU")} сум
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
