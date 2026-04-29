"use client";

import { useState } from "react";

export default function OrderStatusPage() {
  const [code, setCode] = useState("");
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  const checkOrder = async () => {
    setError("");
    setData(null);

    const res = await fetch(`/api/order-status?trackCode=${code}`);
    const json = await res.json();

    if (!res.ok) {
      setError("Заказ не найден");
      return;
    }

    setData(json);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Проверка заказа</h1>

      <input
        placeholder="Введите трек-код"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        style={{ padding: 10, width: 300 }}
      />

      <button onClick={checkOrder} style={{ marginLeft: 10 }}>
        Проверить
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {data && (
        <div style={{ marginTop: 20 }}>
          <p><b>Трек-код:</b> {data.trackCode}</p>
          <p><b>Имя:</b> {data.name}</p>
          <p><b>Телефон:</b> {data.phone}</p>
          <p><b>Товары:</b> {data.items}</p>
          <p><b>Сумма:</b> {data.total}</p>
          <p><b>Статус:</b> {data.status}</p>
        </div>
      )}
    </div>
  );
}
