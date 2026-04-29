import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase'

async function getData() {
  const [{ data: categories }, { data: makes }] = await Promise.all([
    supabaseAdmin.from('categories').select('id,name,slug').eq('section', 'cars').eq('is_active', true).order('sort_order'),
    supabaseAdmin.from('vehicles').select('make').eq('section', 'cars').order('make'),
  ])
  const uniqueMakes = [...new Set((makes ?? []).map(v => v.make))]
  return { categories: categories ?? [], makes: uniqueMakes }
}

const ICONS: Record<string, string> = {
  'cars-dvigatel': '⚙️', 'cars-podveska': '🛞', 'cars-tormoza': '🔴',
  'cars-transmissiya': '🔩', 'cars-elektrika': '⚡', 'cars-kuzov': '🚗',
  'cars-filtry': '🔵', 'cars-ohlaghdenie': '❄️',
}

export default async function CarsPage() {
  const { categories, makes } = await getData()

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-orange-500">Главная</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">Легковые авто</span>
      </div>

      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl p-7 mb-8 flex items-center gap-6">
        <div className="text-6xl shrink-0">🚗</div>
        <div>
          <h1 className="text-2xl font-bold mb-1">Запчасти для легковых автомобилей</h1>
          <p className="text-gray-400">Toyota, Lada, Kia, Hyundai, Volkswagen, Renault, Skoda и другие</p>
        </div>
      </div>

      <h2 className="text-lg font-bold text-gray-800 mb-4">Категории запчастей</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {categories.map(cat => (
          <Link key={cat.id} href={`/catalog?category=${cat.slug}&section=cars`}
            className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md hover:border-orange-300 border border-transparent transition group">
            <div className="text-3xl mb-2">{ICONS[cat.slug] ?? '🔧'}</div>
            <div className="text-sm font-medium text-gray-700 group-hover:text-orange-600">{cat.name}</div>
          </Link>
        ))}
      </div>

      <h2 className="text-lg font-bold text-gray-800 mb-4">Выбрать по марке автомобиля</h2>
      <div className="flex flex-wrap gap-2">
        {makes.map(make => (
          <Link key={make} href={`/catalog?make=${encodeURIComponent(make)}&section=cars`}
            className="bg-white border border-gray-200 hover:border-orange-400 hover:text-orange-600 px-4 py-2 rounded-lg text-sm font-medium transition">
            {make}
          </Link>
        ))}
        <Link href="/catalog?section=cars"
          className="bg-orange-500 text-white border border-orange-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition">
          Все запчасти для авто →
        </Link>
      </div>
    </div>
  )
}
