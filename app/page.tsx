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

  const products = [
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

  return (
    <main style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>TechPoint</h1>
      <p>Электроника и комплектующие под заказ</p>

      <input
        placeholder="Поиск товара"
        style={{
          width: "100%",
          padding: 10,
          margin: "10px 0",
          borderRadius: 8,
        }}
      />

      <h2>Категории</h2>
      {categories.map((cat, i) => (
        <div
          key={i}
          style={{
            padding: 10,
            marginBottom: 5,
            background: "#eee",
            borderRadius: 8,
          }}
        >
          {cat}
        </div>
      ))}

      <h2>Популярные товары</h2>
      {products.map((p) => (
        <div
          key={p.id}
          style={{
            padding: 10,
            marginBottom: 10,
            background: "#f5f5f5",
            borderRadius: 10,
          }}
        >
          <b>{p.title}</b>
          <p>{p.status}</p>
          <p>{p.price}</p>
          <button>В корзину</button>
        </div>
      ))}
    </main>
  );
}
