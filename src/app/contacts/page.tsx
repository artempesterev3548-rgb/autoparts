export default function ContactsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Контакты</h1>
      <div className="bg-white rounded-2xl shadow-sm p-8 space-y-4 text-sm">
        {[
          ['📞 Телефон', '+7 (923) 213-01-01'],
          ['📧 Email', 'info@example.ru'],
          ['📍 Адрес', '655017, Республика Хакасия, Усть-Абаканский р-н, ул. 70 лет БелАЗу, 51 стр1'],
          ['🕐 Режим работы', 'Пн–Пт 8:00–19:00, Сб–Вс 9:00–17:00'],
        ].map(([label, value]) => (
          <div key={label} className="flex gap-4 py-2 border-b border-gray-100 last:border-0">
            <div className="text-gray-500 w-36 shrink-0">{label}</div>
            <div className="font-medium text-gray-800">{value}</div>
          </div>
        ))}
        <p className="text-xs text-orange-600 bg-orange-50 rounded-lg p-3 mt-4">
          ⚠️ Замените на ваши реальные контактные данные.
        </p>
      </div>
    </div>
  )
}
