import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase'

async function getData() {
  const [{ data: categories }, { data: makes }] = await Promise.all([
    supabaseAdmin.from('categories').select('id,name,slug').eq('section', 'special').is('parent_id', null).eq('is_active', true).order('sort_order'),
    supabaseAdmin.from('vehicles').select('make').eq('section', 'special').order('make'),
  ])
  const uniqueMakes = [...new Set((makes ?? []).map(v => v.make))]
  return { categories: categories ?? [], makes: uniqueMakes }
}

const ICONS: Record<string, string> = {
  'dvigatel': '⚙️', 'transmissiya': '🔩', 'hodovaya-chast': '🛞',
  'tormoznaya-sistema': '🔴', 'elektrika': '⚡', 'kuzov-kabina': '🚛',
  'toplivnaya-sistema': '⛽', 'filtry': '🔵', 'gidravlika-spectehniki': '💧',
  'hodovaya-spectehniki': '🦾',
}

export default async function SpecialPage() {
  const { categories, makes } = await getData()

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-orange-500">Главная</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">Спецтехника и грузовики</span>
      </div>

      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl p-7 mb-8 flex items-center gap-6">
        <div className="text-6xl shrink-0">🚛</div>
        <div>
          <h1 className="text-2xl font-bold mb-1">Запчасти для спецтехники и грузовиков</h1>
          <p className="text-gray-400">КамАЗ, МАЗ, Урал, ЯМЗ, Komatsu, Hitachi, JCB, Scania, Volvo и другие</p>
        </div>
      </div>

      <h2 className="text-lg font-bold text-gray-800 mb-4">Категории запчастей</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {categories.map(cat => (
          <Link key={cat.id} href={`/catalog?category=${cat.slug}&section=special`}
            className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md hover:border-orange-300 border border-transparent transition group">
            <div className="text-3xl mb-2">{ICONS[cat.slug] ?? '🔧'}</div>
            <div className="text-sm font-medium text-gray-700 group-hover:text-orange-600">{cat.name}</div>
          </Link>
        ))}
      </div>

      <h2 className="text-lg font-bold text-gray-800 mb-4">Выбрать по марке техники</h2>
      <div className="flex flex-wrap gap-2">
        {makes.map(make => (
          <Link key={make} href={`/catalog?make=${encodeURIComponent(make)}&section=special`}
            className="bg-white border border-gray-200 hover:border-orange-400 hover:text-orange-600 px-4 py-2 rounded-lg text-sm font-medium transition">
            {make}
          </Link>
        ))}
        <Link href="/catalog?section=special"
          className="bg-orange-500 text-white border border-orange-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition">
          Все запчасти спецтехники →
        </Link>
      </div>
    </div>
  )
}
