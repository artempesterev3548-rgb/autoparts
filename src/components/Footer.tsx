import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-400 mt-12">
      {/* Основные колонки */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

          {/* О компании */}
          <div>
            <div className="text-orange-400 font-semibold mb-4 uppercase text-sm tracking-wide">О компании</div>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white transition">О нас</Link></li>
              <li><Link href="/contacts" className="hover:text-white transition">Контакты</Link></li>
              <li><Link href="/requisites" className="hover:text-white transition">Реквизиты</Link></li>
            </ul>
          </div>

          {/* Покупателям */}
          <div>
            <div className="text-orange-400 font-semibold mb-4 uppercase text-sm tracking-wide">Покупателям</div>
            <ul className="space-y-2 text-sm">
              <li><Link href="/how-to-order" className="hover:text-white transition">Как сделать заказ</Link></li>
              <li><Link href="/delivery" className="hover:text-white transition">Доставка</Link></li>
              <li><Link href="/payment" className="hover:text-white transition">Оплата</Link></li>
              <li><Link href="/returns" className="hover:text-white transition">Возврат товара</Link></li>
            </ul>
          </div>

          {/* Каталог */}
          <div>
            <div className="text-orange-400 font-semibold mb-4 uppercase text-sm tracking-wide">Каталог</div>
            <ul className="space-y-2 text-sm">
              <li><Link href="/cars" className="hover:text-white transition">Запчасти для авто</Link></li>
              <li><Link href="/special" className="hover:text-white transition">Запчасти спецтехника</Link></li>
              <li><Link href="/search" className="hover:text-white transition">Поиск по артикулу</Link></li>
            </ul>
          </div>

          {/* Правовые документы */}
          <div>
            <div className="text-orange-400 font-semibold mb-4 uppercase text-sm tracking-wide">Документы</div>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="hover:text-white transition">Политика конфиденциальности</Link></li>
              <li><Link href="/terms" className="hover:text-white transition">Пользовательское соглашение</Link></li>
              <li><Link href="/personal-data" className="hover:text-white transition">Обработка персональных данных</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Нижняя полоса — юридическая информация */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <div>
            © 2024–{year} ООО «АвтоЗапчасти». Все права защищены.
          </div>
          <div className="text-center">
            ИНН: 0000000000 · ОГРН: 0000000000000 · Юр. адрес: г. Москва, ул. Примерная, д. 1
          </div>
          <div>
            Не является публичной офертой
          </div>
        </div>
      </div>
    </footer>
  )
}
