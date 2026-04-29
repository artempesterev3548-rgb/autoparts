export default function DeliveryPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Доставка и оплата</h1>
      <div className="bg-white rounded-2xl shadow-sm p-8 text-gray-700 space-y-6 text-sm">
        <div>
          <h2 className="font-semibold text-gray-800 text-base mb-3">Доставка</h2>
          <div className="space-y-2">
            {[
              ['🚚 СДЭК', 'Доставка по всей России. Срок 2–7 дней в зависимости от региона.'],
              ['📦 Почта России', 'Доставка до 14 дней. Подходит для труднодоступных регионов.'],
              ['🚛 Деловые линии', 'Для крупногабаритных запчастей. Срок 3–10 дней.'],
              ['🏪 Самовывоз', 'Забрать из нашего офиса — по адресу из раздела Контакты.'],
            ].map(([title, text]) => (
              <div key={title} className="bg-gray-50 rounded-lg p-3">
                <div className="font-medium text-gray-800">{title}</div>
                <div className="text-gray-500 mt-0.5">{text}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-semibold text-gray-800 text-base mb-3">Оплата</h2>
          <p className="text-gray-500 mb-3">Условия оплаты согласовываются с менеджером при подтверждении заказа.</p>
          <div className="space-y-2">
            {[
              ['💳 Банковский перевод', 'Оплата по реквизитам для физических и юридических лиц.'],
              ['💵 Наличные', 'При самовывозе из офиса.'],
              ['🏢 Счёт для юр. лиц', 'Работаем с НДС и без НДС. Предоставляем все закрывающие документы.'],
            ].map(([title, text]) => (
              <div key={title} className="bg-gray-50 rounded-lg p-3">
                <div className="font-medium text-gray-800">{title}</div>
                <div className="text-gray-500 mt-0.5">{text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
