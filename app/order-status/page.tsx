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

  const totalText =
    data?.total ? `${String(data.total)} сум` : "-";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        padding: "30px 16px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 520,
          margin: "0 auto",
          background: "#111827",
          borderRadius: 24,
          padding: 24,
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 48 }}>🛒</div>
          <h1 style={{ fontSize: 30, margin: "10px 0" }}>
            Проверка заказа
          </h1>
          <p style={{ color: "#9ca3af" }}>
            Введите трек-код, который вы получили после оформления заказа
          </p>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="TP-1777463472496"
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 12,
              border: "1px solid #374151",
              background: "#1f2937",
              color: "white",
              outline: "none",
            }}
          />

          <button
            onClick={checkOrder}
            disabled={loading || !code.trim()}
            style={{
              padding: "14px 18px",
              borderRadius: 12,
              border: "none",
              background: "#2563eb",
              color: "white",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {loading ? "..." : "Проверить"}
          </button>
        </div>

        {error && (
          <div
            style={{
              marginTop: 18,
              padding: 14,
              borderRadius: 12,
              background: "#7f1d1d",
              color: "#fecaca",
            }}
          >
            {error}
          </div>
        )}

        {data && (
          <div
            style={{
              marginTop: 24,
              background: "#1f2937",
              borderRadius: 18,
              padding: 20,
            }}
          >
            <p><b>Трек-код:</b> {data.trackCode}</p>
            <p><b>Статус:</b> {statusMap[data.status] || data.status}</p>
            <p><b>Имя:</b> {data.name || "-"}</p>
            <p><b>Телефон:</b> {data.phone || "-"}</p>
            <p><b>Товары:</b> {data.items || "-"}</p>
            <p style={{ fontSize: 22 }}>
              <b>Сумма:</b> {totalText}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
