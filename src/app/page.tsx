import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase'

async function getStats() {
  const [{ count: products }, { count: vehicles }] = await Promise.all([
    supabaseAdmin.from('products').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('vehicles').select('*', { count: 'exact', head: true }),
  ])
  return { products: products ?? 0, vehicles: vehicles ?? 0 }
}

export default async function HomePage() {
  const stats = await getStats()

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Hero */}
      <div className="bg-gray-900 text-white rounded-2xl p-8 mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Запчасти для <span className="text-orange-400">любой техники</span>
        </h1>
        <p className="text-gray-400 mb-8 text-lg">Легковые авто, грузовики и спецтехника. Более {stats.products.toLocaleString('ru')} позиций.</p>

        {/* Два главных раздела */}
        <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <Link href="/cars" className="group bg-gray-800 hover:bg-orange-500 border border-gray-700 hover:border-orange-500 rounded-2xl p-6 transition text-left">
            <div className="text-5xl mb-3">🚗</div>
            <h2 className="text-xl font-bold mb-1 group-hover:text-white">Легковые авто</h2>
            <p className="text-gray-400 group-hover:text-orange-100 text-sm">Toyota, Lada, Kia, Hyundai, Volkswagen, Renault и другие</p>
            <div className="mt-4 text-orange-400 group-hover:text-white text-sm font-semibold">Перейти в каталог →</div>
          </Link>

          <Link href="/special" className="group bg-gray-800 hover:bg-orange-500 border border-gray-700 hover:border-orange-500 rounded-2xl p-6 transition text-left">
            <div className="text-5xl mb-3">🚛</div>
            <h2 className="text-xl font-bold mb-1 group-hover:text-white">Спецтехника и грузовики</h2>
            <p className="text-gray-400 group-hover:text-orange-100 text-sm">КамАЗ, МАЗ, Урал, ЯМЗ, Komatsu, JCB и другие</p>
            <div className="mt-4 text-orange-400 group-hover:text-white text-sm font-semibold">Перейти в каталог →</div>
          </Link>
        </div>
      </div>

      {/* Поиск */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-3 text-center">Поиск по артикулу или названию</h2>
        <form method="GET" action="/search" className="flex gap-2 max-w-xl mx-auto">
          <input name="q" placeholder="Введите артикул, название или кросс-номер..."
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400" />
          <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition text-sm">
            Найти
          </button>
        </form>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Товаров в каталоге', value: stats.products.toLocaleString('ru'), icon: '📦' },
          { label: 'Марок техники', value: stats.vehicles.toLocaleString('ru'), icon: '🚘' },
          { label: 'Срок доставки', value: '1–7 дней', icon: '🚚' },
          { label: 'Работаем', value: 'Пн–Сб 9–18', icon: '🕐' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Почему мы */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { icon: '✅', title: 'Оригинал и аналоги', text: 'Работаем с ведущими производителями. Гарантируем качество.' },
          { icon: '📞', title: 'Помощь менеджера', text: 'Подберём нужную деталь по VIN или описанию неисправности.' },
          { icon: '🚚', title: 'Доставка по России', text: 'Отправляем транспортными компаниями и Почтой России.' },
        ].map(c => (
          <div key={c.title} className="bg-white rounded-xl p-5 shadow-sm">
            <div className="text-3xl mb-2">{c.icon}</div>
            <div className="font-semibold text-gray-800 mb-1">{c.title}</div>
            <div className="text-sm text-gray-500">{c.text}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
