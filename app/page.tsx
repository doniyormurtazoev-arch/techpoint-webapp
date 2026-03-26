"use client";

import { useState } from "react";

type Product = {
  id: number;
  title: string;
  price: string;
  status: string;
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
      price: "1 200 000 сум",
      status: "Под заказ",
    },
    {
      id: 2,
      title: "Logitech G102",
      price: "280 000 сум",
      status: "В наличии",
    },
    {
      id: 3,
      title: "Redragon Kumara",
      price: "540 000 сум",
      status: "Под заказ",
    },
    {
      id: 4,
      title: "Samsung 980 1TB",
      price: "990 000 сум",
      status: "В наличии",
    },
  ];

  const [cart, setCart] = useState<Product[]>([]);

  const addToCart = (product: Product) => {
    setCart((prev) => [...prev, product]);
    alert(product.title + " добавлен в корзину");
  };

  const sendOrder = () => {
    if (cart.length === 0) {
      alert("Корзина пустая");
      return;
    }

    const orderText = cart
      .map((item, index) => `${index + 1}. ${item.title} — ${item.price}`)
      .join("\n");

    const finalText =
      `Новый заказ TechPoint\n\n` +
      `${orderText}\n\n` +
      `Всего товаров: ${cart.length}\n` +
      `Оплата: 50% предоплата / 50% после получения`;

    const tg = (window as any)?.Telegram?.WebApp;

    if (tg && tg.sendData) {
      tg.sendData(finalText);
      alert("Заказ отправлен");
      setCart([]);
    } else {
      alert("Telegram WebApp недоступен");
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
            <div style={{ marginTop: 10, fontSize: 20 }}>{p.price}</div>

            <button
              onClick={() => addToCart(p)}
              style={{
                marginTop: 12,
                padding: "10px 14px",
                background: "black",
                color: "white",
                border: "none",
                borderRadius: 10,
                cursor: "pointer",
              }}
            >
              В корзину
            </button>
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
          cart.map((item, index) => (
            <div key={index} style={{ marginBottom: 8 }}>
              {index + 1}. {item.title} — {item.price}
            </div>
          ))
        )}
      </div>

      <button
        onClick={sendOrder}
        style={{
          width: "100%",
          padding: 16,
          background: "#000",
          color: "#fff",
          border: "none",
          borderRadius: 12,
          fontSize: 16,
          cursor: "pointer",
        }}
      >
        Оформить заказ ({cart.length})
      </button>
    </main>
  );
}
