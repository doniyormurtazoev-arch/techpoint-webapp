"use client";

import { useMemo, useState } from "react";

type Product = {
  id: number;
  title: string;
  price: number;
  status: string;
  emoji: string;
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
      emoji: "🎧",
    },
    {
      id: 2,
      title: "Logitech G102",
      price: 280000,
      status: "В наличии",
      emoji: "🖱️",
    },
    {
      id: 3,
      title: "Redragon Kumara",
      price: 540000,
      status: "Под заказ",
      emoji: "⌨️",
    },
    {
      id: 4,
      title: "Samsung 980 1TB",
      price: 990000,
      status: "В наличии",
      emoji: "💾",
    },
  ];

  const [cart, setCart] = useState<CartItem[]>([]);
  const [qtyMap, setQtyMap] = useState<Record<number, number>>(
    Object.fromEntries(products.map((p) => [p.id, 1]))
  );

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");

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

    if (!name.trim()) {
      alert("Введите имя");
      return;
    }

    if (!phone.trim()) {
      alert("Введите телефон");
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
        form: {
          name: name.trim(),
          phone: phone.trim(),
          comment: comment.trim(),
        },
      };

      const res = await fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert("Ошибка: " + JSON.stringify(data));
        throw new Error("Order failed");
      }

      setCart([]);
      setName("");
      setPhone("");
      setComment("");
      setSuccessMessage("Заказ успешно отправлен");
      setTimeout(() => setSuccessMessage(""), 2500);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: 24,
    fontWeight: 800,
    marginBottom: 14,
    color: "#ffffff",
  };

  const cardStyle: React.CSSProperties = {
    background: "#f8fafc",
    color: "#111827",
    borderRadius: 18,
    padding: 16,
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #1f2937 0%, #111827 50%, #0b1220 100%)",
        padding: 18,
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        color: "white",
      }}
    >
      <div
        style={{
          marginBottom: 20,
          padding: 18,
          borderRadius: 22,
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          style={{
            fontSize: 32,
            fontWeight: 900,
            letterSpacing: "-0.02em",
            marginBottom: 6,
          }}
        >
          TechPoint
        </div>
        <div
          style={{
            fontSize: 15,
            color: "#d1d5db",
            lineHeight: 1.5,
          }}
        >
          Электроника и комплектующие под заказ
        </div>
      </div>

      {successMessage && (
        <div
          style={{
            background: "#dcfce7",
            color: "#166534",
            padding: 14,
            borderRadius: 16,
            marginBottom: 18,
            fontWeight: 700,
            boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
          }}
        >
          {successMessage}
        </div>
      )}

      <div style={{ marginBottom: 28 }}>
        <input
          placeholder="Поиск товара"
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 16,
            border: "1px solid #d1d5db",
            fontSize: 16,
            outline: "none",
            boxSizing: "border-box",
            background: "#ffffff",
            boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
          }}
        />
      </div>

      <section style={{ marginBottom: 28 }}>
        <div style={sectionTitleStyle}>Категории</div>

        <div
          style={{
            display: "grid",
            gap: 10,
          }}
        >
          {categories.map((cat, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.95)",
                color: "#111827",
                padding: 14,
                borderRadius: 16,
                fontWeight: 600,
                boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
              }}
            >
              {cat}
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 28 }}>
        <div style={sectionTitleStyle}>Популярные товары</div>

        <div style={{ display: "grid", gap: 14 }}>
          {products.map((p) => (
            <div key={p.id} style={cardStyle}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 14,
                    background: "#e5e7eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    flexShrink: 0,
                  }}
                >
                  {p.emoji}
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      marginBottom: 8,
                    }}
                  >
                    {p.title}
                  </div>

                  <div
                    style={{
                      display: "inline-block",
                      background: p.status === "В наличии" ? "#dcfce7" : "#fef3c7",
                      color: p.status === "В наличии" ? "#166534" : "#92400e",
                      borderRadius: 999,
                      padding: "6px 10px",
                      fontSize: 13,
                      fontWeight: 700,
                      marginBottom: 10,
                    }}
                  >
                    {p.status}
                  </div>

                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 900,
                      marginBottom: 14,
                    }}
                  >
                    {formatPrice(p.price)}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
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
                    borderRadius: 14,
                  }}
                >
                  <button
                    onClick={() => decreaseQty(p.id)}
                    style={{
                      width: 36,
                      height: 36,
                      border: "none",
                      borderRadius: 10,
                      cursor: "pointer",
                      fontSize: 18,
                      fontWeight: 700,
                      background: "#fff",
                    }}
                  >
                    -
                  </button>

                  <span
                    style={{
                      minWidth: 28,
                      textAlign: "center",
                      fontWeight: 800,
                      fontSize: 16,
                    }}
                  >
                    {qtyMap[p.id] || 1}
                  </span>

                  <button
                    onClick={() => increaseQty(p.id)}
                    style={{
                      width: 36,
                      height: 36,
                      border: "none",
                      borderRadius: 10,
                      cursor: "pointer",
                      fontSize: 18,
                      fontWeight: 700,
                      background: "#fff",
                    }}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => addToCart(p)}
                  style={{
                    flex: 1,
                    minWidth: 180,
                    padding: "12px 16px",
                    background: "#111827",
                    color: "white",
                    border: "none",
                    borderRadius: 14,
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 15,
                  }}
                >
                  Добавить в корзину
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 20 }}>
        <div style={cardStyle}>
          <h3
            style={{
              marginTop: 0,
              marginBottom: 14,
              fontSize: 22,
              fontWeight: 800,
            }}
          >
            Корзина
          </h3>

          {cart.length === 0 ? (
            <p style={{ color: "#6b7280", margin: 0 }}>Пока пусто</p>
          ) : (
            <>
              <div style={{ display: "grid", gap: 10 }}>
                {cart.map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      padding: 12,
                      borderRadius: 14,
                      background: "#eef2f7",
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>
                      {index + 1}. {item.title}
                    </div>
                    <div style={{ color: "#4b5563" }}>
                      Кол-во: {item.qty}
                    </div>
                    <div
                      style={{
                        marginTop: 6,
                        fontWeight: 800,
                      }}
                    >
                      {formatPrice(item.price * item.qty)}
                    </div>
                  </div>
                ))}
              </div>

              <hr
                style={{
                  margin: "16px 0",
                  border: 0,
                  borderTop: "1px solid #d1d5db",
                }}
              />

              <div style={{ color: "#374151", marginBottom: 6 }}>
                Всего товаров: {totalItems}
              </div>
              <div
                style={{
                  fontWeight: 900,
                  fontSize: 20,
                }}
              >
                Итого: {formatPrice(totalPrice)}
              </div>
            </>
          )}
        </div>
      </section>

      <section style={{ marginBottom: 20 }}>
        <div style={cardStyle}>
          <h3
            style={{
              marginTop: 0,
              marginBottom: 14,
              fontSize: 22,
              fontWeight: 800,
            }}
          >
            Данные клиента
          </h3>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ваше имя"
            style={{
              width: "100%",
              padding: 14,
              marginBottom: 10,
              borderRadius: 14,
              border: "1px solid #d1d5db",
              fontSize: 16,
              boxSizing: "border-box",
            }}
          />

          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Телефон"
            style={{
              width: "100%",
              padding: 14,
              marginBottom: 10,
              borderRadius: 14,
              border: "1px solid #d1d5db",
              fontSize: 16,
              boxSizing: "border-box",
            }}
          />

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Комментарий к заказу"
            rows={4}
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 14,
              border: "1px solid #d1d5db",
              fontSize: 16,
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
        </div>
      </section>

      <button
        onClick={sendOrder}
        disabled={loading}
        style={{
          width: "100%",
          padding: 18,
          background: "#000000",
          color: "#ffffff",
          border: "none",
          borderRadius: 16,
          fontSize: 17,
          fontWeight: 800,
          cursor: "pointer",
          opacity: loading ? 0.7 : 1,
          boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
          marginBottom: 30,
        }}
      >
        {loading ? "Отправка..." : `Оформить заказ (${totalItems})`}
      </button>
    </main>
  );
}
