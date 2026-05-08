export default function ContactsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Контакты</h1>
      <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 space-y-1 text-sm">
        {[
          ['📞 Телефон', '+7 (923) 213-01-01', 'tel:+79232130101'],
          ['📧 Email', 'info.truckline@mail.ru', 'mailto:info.truckline@mail.ru'],
          ['📍 Адрес', '655017, Республика Хакасия, Усть-Абаканский р-н, ул. 70 лет БелАЗу, 51 стр1', null],
          ['🕐 Режим работы', 'Пн–Пт 8:00–19:00, Сб–Вс 9:00–17:00', null],
        ].map(([label, value, href]) => (
          <div key={label} className="flex flex-col sm:flex-row sm:gap-4 py-3 border-b border-gray-100 last:border-0">
            <div className="text-gray-400 text-xs sm:text-sm sm:w-40 shrink-0 mb-1 sm:mb-0">{label}</div>
            {href ? (
              <a href={href} className="font-medium text-gray-800 hover:text-orange-500">{value}</a>
            ) : (
              <div className="font-medium text-gray-800">{value}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
