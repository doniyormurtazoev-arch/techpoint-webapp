"use client";
declare global {
  interface Window {
    Telegram?: any;
  }
}
import { useEffect, useMemo, useState } from "react";

type Category = {
  id: string;
  name: string;
  active: boolean;
  sort: number;
};

type Product = {
  id: string;
  category: string;
  title: string;
  price: number;
  status: string;
  description: string;
  image: string;
  active: boolean;
};

type CartItem = Product & {
  qty: number;
};

type Tab = "home" | "catalog" | "cart" | "profile";

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [qtyMap, setQtyMap] = useState<Record<string, number>>({});

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");

  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("ru-RU").format(price) + " сум";

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        setLoadingCatalog(true);
        const res = await fetch("/api/catalog", { cache: "no-store" });
        const data = await res.json();

        if (!res.ok) {
          alert("Ошибка каталога: " + JSON.stringify(data));
          return;
        }

        setCategories(data.categories || []);
        setProducts(data.products || []);

        const initialQty: Record<string, number> = {};
        (data.products || []).forEach((p: Product) => {
          initialQty[p.id] = 1;
        });
        setQtyMap(initialQty);
      } catch (error) {
        console.error(error);
        alert("Не удалось загрузить каталог");
      } finally {
        setLoadingCatalog(false);
      }
    };

    loadCatalog();
  }, []);

  useEffect(() => {
    const tg = (window as any)?.Telegram?.WebApp;
    const user = tg?.initDataUnsafe?.user;

    if (user && !name) {
      const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");
      if (fullName) setName(fullName);
    }
  }, [name]);

  const featuredProducts = useMemo(() => products.slice(0, 4), [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === "all" || p.category === selectedCategory;

      const matchesSearch =
        !search.trim() ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, search]);

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.qty, 0),
    [cart]
  );

  const totalPrice = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cart]
  );

  const decreaseQty = (productId: string) => {
    setQtyMap((prev) => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) - 1),
    }));
  };

  const increaseQty = (productId: string) => {
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
    setTimeout(() => setSuccessMessage(""), 1400);
  };

  const changeCartQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === productId ? { ...item, qty: item.qty + delta } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const buyNow = (product: Product) => {
    const qtyToAdd = qtyMap[product.id] || 1;

    setCart([
      {
        ...product,
        qty: qtyToAdd,
      },
    ]);
    setActiveTab("cart");
    setSuccessMessage(`Готово к оформлению: ${product.title}`);
    setTimeout(() => setSuccessMessage(""), 1400);
  };

  const sendOrder = async () => {
    if (cart.length === 0) {
      alert("Корзина пустая");
      return;
    }

    if (!name.trim()) {
      setActiveTab("profile");
      alert("Введите имя");
      return;
    }

    if (!phone.trim()) {
      setActiveTab("profile");
      alert("Введите телефон");
      return;
    }

    try {
      setLoadingOrder(true);

const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

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

  customer: tgUser
    ? {
        id: tgUser.id,
        first_name: tgUser.first_name,
        last_name: tgUser.last_name,
        username: tgUser.username,
      }
    : null,

  form: {
    name: name.trim(),
    phone,
    comment,
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
        alert("Ошибка заказа: " + JSON.stringify(data));
        return;
      }

      setCart([]);
      setComment("");
      setSuccessMessage("Заказ успешно отправлен");
      setTimeout(() => setSuccessMessage(""), 2500);
      setActiveTab("home");
    } catch (error) {
      console.error(error);
      alert("Не удалось отправить заказ");
    } finally {
      setLoadingOrder(false);
    }
  };

  const shellStyle: React.CSSProperties = {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #0b0b0c 0%, #141414 45%, #1c1c1f 100%)",
    padding: 16,
    paddingBottom: 96,
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    color: "white",
  };

  const glassStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(10px)",
    borderRadius: 22,
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: 24,
    fontWeight: 900,
    marginBottom: 14,
    color: "#ffffff",
    letterSpacing: "-0.02em",
  };

  const whiteCardStyle: React.CSSProperties = {
    background: "#ffffff",
    color: "#111827",
    borderRadius: 20,
    padding: 14,
    boxShadow: "0 10px 30px rgba(0,0,0,0.16)",
  };

  const statusStyle = (status: string): React.CSSProperties => ({
    display: "inline-block",
    background: status === "В наличии" ? "#dcfce7" : "#fef3c7",
    color: status === "В наличии" ? "#166534" : "#92400e",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 10,
  });

  const renderHome = () => (
    <>
      <section style={{ marginBottom: 22 }}>
        <div
          style={{
            ...glassStyle,
            padding: 18,
            boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontWeight: 900,
              letterSpacing: "-0.03em",
              marginBottom: 6,
            }}
          >
            TechPoint
          </div>
          <div
            style={{
              fontSize: 15,
              color: "#d4d4d8",
              lineHeight: 1.5,
              marginBottom: 16,
            }}
          >
            Техника, комплектующие и аксессуары — быстро, удобно, в одном месте.
          </div>

          <button
            onClick={() => setActiveTab("catalog")}
            style={{
              width: "100%",
              padding: 14,
              border: "none",
              borderRadius: 16,
              background: "#ffffff",
              color: "#111827",
              fontWeight: 800,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            Перейти в каталог
          </button>
        </div>
      </section>

      <section style={{ marginBottom: 26 }}>
        <div style={sectionTitleStyle}>Категории</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 10,
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setActiveTab("catalog");
              }}
              style={{
                background: "#ffffff",
                color: "#111827",
                padding: 14,
                borderRadius: 18,
                border: "none",
                textAlign: "left",
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 10px 24px rgba(0,0,0,0.14)",
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 26 }}>
        <div style={sectionTitleStyle}>Хиты</div>

        {loadingCatalog ? (
          <div style={{ color: "#d1d5db" }}>Загрузка каталога...</div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 12,
            }}
          >
            {featuredProducts.map((p) => (
              <div key={p.id} style={whiteCardStyle}>
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.title}
                    style={{
                      width: "100%",
                      height: 140,
                      objectFit: "cover",
                      borderRadius: 14,
                      marginBottom: 10,
                    }}
                  />
                ) : null}

                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 15,
                    lineHeight: 1.3,
                    minHeight: 40,
                    marginBottom: 8,
                  }}
                >
                  {p.title}
                </div>

                <div style={statusStyle(p.status)}>{p.status}</div>

                <div
                  style={{
                    fontWeight: 900,
                    fontSize: 17,
                    marginBottom: 10,
                  }}
                >
                  {formatPrice(p.price)}
                </div>

                <button
                  onClick={() => buyNow(p)}
                  style={{
                    width: "100%",
                    padding: 10,
                    border: "none",
                    borderRadius: 12,
                    background: "#111827",
                    color: "#fff",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Купить
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );

  const renderCatalog = () => (
    <>
      <section style={{ marginBottom: 18 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск товара"
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 16,
            border: "1px solid #27272a",
            fontSize: 16,
            outline: "none",
            boxSizing: "border-box",
            background: "#ffffff",
            color: "#111827",
          }}
        />
      </section>

      <section style={{ marginBottom: 22 }}>
        <div style={sectionTitleStyle}>Каталог</div>

        <div
          style={{
            display: "flex",
            gap: 10,
            overflowX: "auto",
            paddingBottom: 4,
          }}
        >
          <button
            onClick={() => setSelectedCategory("all")}
            style={{
              padding: "10px 14px",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              fontWeight: 800,
              background: selectedCategory === "all" ? "#fff" : "#27272a",
              color: selectedCategory === "all" ? "#111827" : "#fff",
              whiteSpace: "nowrap",
            }}
          >
            Все
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: "10px 14px",
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                fontWeight: 800,
                background: selectedCategory === cat.id ? "#fff" : "#27272a",
                color: selectedCategory === cat.id ? "#111827" : "#fff",
                whiteSpace: "nowrap",
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 26 }}>
        {loadingCatalog ? (
          <div style={{ color: "#d1d5db" }}>Загрузка каталога...</div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 12,
            }}
          >
            {filteredProducts.map((p) => (
              <div key={p.id} style={whiteCardStyle}>
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.title}
                    style={{
                      width: "100%",
                      height: 160,
                      objectFit: "cover",
                      borderRadius: 14,
                      marginBottom: 10,
                    }}
                  />
                ) : null}

                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 15,
                    lineHeight: 1.3,
                    minHeight: 42,
                    marginBottom: 8,
                  }}
                >
                  {p.title}
                </div>

                <div style={statusStyle(p.status)}>{p.status}</div>

                <div
                  style={{
                    color: "#4b5563",
                    fontSize: 12,
                    lineHeight: 1.4,
                    minHeight: 34,
                    marginBottom: 8,
                    overflow: "hidden",
                  }}
                >
                  {p.description}
                </div>

                <div
                  style={{
                    fontWeight: 900,
                    fontSize: 17,
                    marginBottom: 10,
                  }}
                >
                  {formatPrice(p.price)}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  <button
                    onClick={() => decreaseQty(p.id)}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 10,
                      border: "none",
                      background: "#e5e7eb",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    -
                  </button>

                  <div
                    style={{
                      minWidth: 24,
                      textAlign: "center",
                      fontWeight: 800,
                    }}
                  >
                    {qtyMap[p.id] || 1}
                  </div>

                  <button
                    onClick={() => increaseQty(p.id)}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 10,
                      border: "none",
                      background: "#e5e7eb",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    +
                  </button>
                </div>

                <div style={{ display: "grid", gap: 8 }}>
                  <button
                    onClick={() => addToCart(p)}
                    style={{
                      width: "100%",
                      padding: 10,
                      border: "none",
                      borderRadius: 12,
                      background: "#111827",
                      color: "#fff",
                      fontWeight: 800,
                      cursor: "pointer",
                      fontSize: 13,
                    }}
                  >
                    В корзину
                  </button>

                  <button
                    onClick={() => buyNow(p)}
                    style={{
                      width: "100%",
                      padding: 10,
                      border: "1px solid #d1d5db",
                      borderRadius: 12,
                      background: "#fff",
                      color: "#111827",
                      fontWeight: 800,
                      cursor: "pointer",
                      fontSize: 13,
                    }}
                  >
                    Купить сейчас
                  </button>
                </div>
              </div>
            ))}

            {!filteredProducts.length && (
              <div style={{ color: "#d1d5db" }}>Ничего не найдено</div>
            )}
          </div>
        )}
      </section>
    </>
  );

  const renderCart = () => (
    <section style={{ marginBottom: 20 }}>
      <div style={whiteCardStyle}>
        <h3
          style={{
            marginTop: 0,
            marginBottom: 14,
            fontSize: 22,
            fontWeight: 900,
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
                    background: "#f3f4f6",
                  }}
                >
                  <div style={{ fontWeight: 800, marginBottom: 6 }}>
                    {index + 1}. {item.title}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    <button
                      onClick={() => changeCartQty(item.id, -1)}
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

                    <span
                      style={{
                        minWidth: 20,
                        textAlign: "center",
                        fontWeight: 800,
                      }}
                    >
                      {item.qty}
                    </span>

                    <button
                      onClick={() => changeCartQty(item.id, 1)}
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

                    <button
                      onClick={() => removeFromCart(item.id)}
                      style={{
                        marginLeft: "auto",
                        padding: "8px 12px",
                        border: "none",
                        borderRadius: 10,
                        background: "#111827",
                        color: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      Удалить
                    </button>
                  </div>

                  <div style={{ fontWeight: 900 }}>
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
                marginBottom: 14,
              }}
            >
              Итого: {formatPrice(totalPrice)}
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <button
                onClick={sendOrder}
                disabled={loadingOrder}
                style={{
                  width: "100%",
                  padding: 16,
                  background: "#000000",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 14,
                  fontSize: 16,
                  fontWeight: 900,
                  cursor: "pointer",
                  opacity: loadingOrder ? 0.7 : 1,
                }}
              >
                {loadingOrder ? "Отправка..." : `Оформить заказ (${totalItems})`}
              </button>

              <button
                onClick={clearCart}
                style={{
                  width: "100%",
                  padding: 14,
                  background: "#e5e7eb",
                  color: "#111827",
                  border: "none",
                  borderRadius: 14,
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Очистить корзину
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );

  const renderProfile = () => {
    const tg = (window as any)?.Telegram?.WebApp;
    const user = tg?.initDataUnsafe?.user;

    return (
      <section style={{ marginBottom: 20 }}>
        <div style={whiteCardStyle}>
          <h3
            style={{
              marginTop: 0,
              marginBottom: 14,
              fontSize: 22,
              fontWeight: 900,
            }}
          >
            Личный кабинет
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
              marginBottom: 14,
            }}
          />

          <div
            style={{
              background: "#f3f4f6",
              borderRadius: 14,
              padding: 14,
              color: "#374151",
            }}
          >
            <div style={{ fontWeight: 900, marginBottom: 8 }}>
              Данные Telegram
            </div>
            <div>Имя: {user?.first_name || "-"}</div>
            <div>Фамилия: {user?.last_name || "-"}</div>
            <div>Username: {user?.username ? `@${user.username}` : "-"}</div>
          </div>
        </div>
      </section>
    );
  };

  return (
    <main style={shellStyle}>
      <div
        style={{
          ...glassStyle,
          padding: 18,
          marginBottom: 18,
          boxShadow: "0 10px 28px rgba(0,0,0,0.22)",
        }}
      >
        <div
          style={{
            fontSize: 30,
            fontWeight: 900,
            letterSpacing: "-0.03em",
            marginBottom: 6,
          }}
        >
          TechPoint
        </div>
        <div
          style={{
            fontSize: 14,
            color: "#d4d4d8",
          }}
        >
          Техника и комплектующие в чёрно-белом стиле
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
            fontWeight: 800,
          }}
        >
          {successMessage}
        </div>
      )}

      {activeTab === "home" && renderHome()}
      {activeTab === "catalog" && renderCatalog()}
      {activeTab === "cart" && renderCart()}
      {activeTab === "profile" && renderProfile()}

      <nav
        style={{
          position: "fixed",
          left: 12,
          right: 12,
          bottom: 12,
          background: "rgba(17,17,17,0.96)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          padding: 10,
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
          backdropFilter: "blur(12px)",
          boxShadow: "0 12px 32px rgba(0,0,0,0.32)",
        }}
      >
        {[
          { key: "home", label: "Главная", icon: "🏠" },
          { key: "catalog", label: "Каталог", icon: "🛍" },
          { key: "cart", label: "Корзина", icon: "🛒" },
          { key: "profile", label: "Кабинет", icon: "👤" },
        ].map((item) => {
          const isActive = activeTab === item.key;

          return (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key as Tab)}
              style={{
                border: "none",
                borderRadius: 14,
                padding: "10px 6px",
                background: isActive ? "#ffffff" : "transparent",
                color: isActive ? "#111827" : "#ffffff",
                fontWeight: 800,
                cursor: "pointer",
                fontSize: 12,
                position: "relative",
              }}
            >
              <div style={{ fontSize: 18, marginBottom: 4 }}>{item.icon}</div>
              <div>{item.label}</div>

              {item.key === "cart" && totalItems > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 10,
                    minWidth: 18,
                    height: 18,
                    padding: "0 4px",
                    borderRadius: 999,
                    background: isActive ? "#111827" : "#ffffff",
                    color: isActive ? "#ffffff" : "#111827",
                    fontSize: 11,
                    fontWeight: 900,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {totalItems}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </main>
  );
}
