"use client";

import { useMemo, useState } from "react";

type Product = {
  id: number;
  title: string;
  price: number;
  status: string;
};

type CartItem = Product & {
  qty: number;
};

export default function Home() {
  const categories = [
    "Процессоры",
    "Видеокарты",
    "Материнские платы",
    "SSD",
    "Наушники",
    "Клавиатуры",
    "Мышки",
  ];

  const products: Product[] = [
    {
      id: 1,
      title: "HyperX Cloud Alpha",
      price: 1200000,
      status: "Под заказ",
    },
    {
      id: 2,
      title: "Logitech G102",
      price: 280000,
      status: "В наличии",
    },
    {
      id: 3,
      title: "Redragon Kumara",
      price: 540000,
      status: "Под заказ",
    },
    {
      id: 4,
      title: "Samsung 980 1TB",
      price: 990000,
      status: "В наличии",
    },
  ];

  const [cart, setCart] = useState<CartItem[]>([]);
  const [qtyMap, setQtyMap] = useState<Record<number, number>>(
    Object.fromEntries(products.map((p) => [p.id, 1]))
  );
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("ru-RU").format(price) + " сум";

  const decreaseQty = (productId: number) => {
    setQtyMap((prev) => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) - 1),
    }));
  };

  const increaseQty = (productId: number) => {
    setQtyMap((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 1) + 1,
    }));
  };

  const addToCart = (product: Product) => {
    const qtyToAdd = qtyMap[product.id] || 1;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);

      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, qty: item.qty + qtyToAdd }
            : item
        );
      }

      return [...prev, { ...product, qty: qtyToAdd }];
    });

    setSuccessMessage(`Добавлено: ${product.title} x${qtyToAdd}`);
    setTimeout(() => setSuccessMessage(""), 1500);
  };

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.qty, 0),
    [cart]
  );

  const totalPrice = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cart]
  );

  const sendOrder = async () => {
    if (cart.length === 0) {
      alert("Корзина пустая");
      return;
    }

    try {
      setLoading(true);

      const tg = (window as any)?.Telegram?.WebApp;
      const user = tg?.initDataUnsafe?.user;

      const payload = {
        items: cart.map((item) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          qty: item.qty,
          status: item.status,
        })),
        totalItems,
        totalPrice,
        customer: user
          ? {
              id: user.id,
              first_name: user.first_name,
              last_name: user.last_name,
              username: user.username,
            }
          : null,
      };

      const res = await fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Ошибка отправки заказа");
      }

      setCart([]);
      setSuccessMessage("Заказ успешно отправлен");
      setTimeout(() => setSuccessMessage(""), 2500);
    } catch (error) {
      alert("Не удалось отправить заказ");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        padding: 20,
        fontFamily: "sans-serif",
        background: "#222b33",
        minHeight: "100vh",
        color: "white",
      }}
    >
      <h1 style={{ fontSize: 28, marginBottom: 10 }}>TechPoint</h1>
      <p style={{ marginBottom: 20 }}>Электроника и комплектующие под заказ</p>

      {successMessage && (
        <div
          style={{
            background: "#d1fae5",
            color: "#065f46",
            padding: 12,
            borderRadius: 10,
            marginBottom: 16,
            fontWeight: 600,
          }}
        >
          {successMessage}
        </div>
      )}

      <input
        placeholder="Поиск товара"
        style={{
          width: "100%",
          padding: 12,
          marginBottom: 25,
          borderRadius: 10,
          border: "1px solid #ccc",
          fontSize: 16,
        }}
      />

      <h2 style={{ fontSize: 22, marginBottom: 12 }}>Категории</h2>
      <div style={{ marginBottom: 30 }}>
        {categories.map((cat, i) => (
          <div
            key={i}
            style={{
              padding: 12,
              marginBottom: 8,
              background: "#f3f3f3",
              color: "#111",
              borderRadius: 10,
            }}
          >
            {cat}
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 22, marginBottom: 12 }}>Популярные товары</h2>
      <div style={{ marginBottom: 30 }}>
        {products.map((p) => (
          <div
            key={p.id}
            style={{
              padding: 14,
              marginBottom: 12,
              background: "#f7f7f7",
              color: "#111",
              borderRadius: 12,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 18 }}>{p.title}</div>
            <div style={{ marginTop: 10 }}>{p.status}</div>
            <div style={{ marginTop: 10, fontSize: 20 }}>
              {formatPrice(p.price)}
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                marginTop: 14,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#e5e7eb",
                  padding: 6,
                  borderRadius: 10,
                }}
              >
                <button
                  onClick={() => decreaseQty(p.id)}
                  style={{
                    width: 32,
                    height: 32,
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                >
                  -
                </button>

                <span style={{ minWidth: 24, textAlign: "center" }}>
                  {qtyMap[p.id] || 1}
                </span>

                <button
                  onClick={() => increaseQty(p.id)}
                  style={{
                    width: 32,
                    height: 32,
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                >
                  +
                </button>
              </div>

              <button
                onClick={() => addToCart(p)}
                style={{
                  padding: "10px 14px",
                  background: "black",
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                Добавить в корзину
              </button>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          padding: 14,
          background: "#f7f7f7",
          color: "#111",
          borderRadius: 12,
          marginBottom: 20,
        }}
      >
        <h3 style={{ marginTop: 0 }}>Корзина</h3>

        {cart.length === 0 ? (
          <p>Пока пусто</p>
        ) : (
          <>
            {cart.map((item, index) => (
              <div key={item.id} style={{ marginBottom: 8 }}>
                {index + 1}. {item.title} x{item.qty} —{" "}
                {formatPrice(item.price * item.qty)}
              </div>
            ))}

            <hr style={{ margin: "12px 0" }} />
            <div>Всего товаров: {totalItems}</div>
            <div style={{ fontWeight: 700, marginTop: 6 }}>
              Итого: {formatPrice(totalPrice)}
            </div>
          </>
        )}
      </div>

      <button
        onClick={sendOrder}
        disabled={loading}
        style={{
          width: "100%",
          padding: 16,
          background: "#000",
          color: "#fff",
          border: "none",
          borderRadius: 12,
          fontSize: 16,
          cursor: "pointer",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Отправка..." : `Оформить заказ (${totalItems})`}
      </button>
    </main>
  );
}
