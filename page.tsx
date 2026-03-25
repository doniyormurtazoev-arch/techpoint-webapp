export default function HomePage() {
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
    <main className="min-h-screen bg-gray-100 pb-24">
      <section className="bg-black px-4 py-5 text-white">
        <h1 className="text-2xl font-bold">TechPoint</h1>
        <p className="mt-1 text-sm text-gray-300">
          Электроника и комплектующие под заказ
        </p>
      </section>

      <section className="px-4 pt-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <input
            type="text"
            placeholder="Поиск товара"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none"
          />
        </div>
      </section>

      <section className="px-4 pt-4">
        <h2 className="mb-3 text-lg font-semibold">Категории</h2>
        <div className="grid grid-cols-2 gap-3">
          {categories.map((category) => (
            <div
              key={category}
              className="rounded-2xl bg-white p-4 text-sm font-medium shadow-sm"
            >
              {category}
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 pt-6">
        <h2 className="mb-3 text-lg font-semibold">Популярные товары</h2>
        <div className="space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="rounded-2xl bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold">{product.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{product.status}</p>
                  <p className="mt-2 font-bold">{product.price}</p>
                </div>
                <button className="rounded-xl bg-black px-4 py-2 text-sm text-white">
                  В корзину
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 pt-6">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Как мы работаем</h2>
          <ol className="mt-3 space-y-2 text-sm text-gray-700">
            <li>1. Вы выбираете товар</li>
            <li>2. Оформляете заказ</li>
            <li>3. Мы подтверждаем наличие и сроки</li>
            <li>4. Вы вносите 50% предоплаты</li>
            <li>5. Остальные 50% — после получения</li>
          </ol>
        </div>
      </section>

      <nav className="fixed bottom-0 left-0 right-0 border-t bg-white">
        <div className="mx-auto flex max-w-md justify-around py-3 text-sm">
          <button className="font-semibold">Главная</button>
          <button>Каталог</button>
          <button>Корзина</button>
          <button>Контакты</button>
        </div>
      </nav>
    </main>
  );
}