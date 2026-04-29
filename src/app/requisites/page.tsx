export default function RequisitesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Реквизиты компании</h1>
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="space-y-3 text-sm">
          {[
            ['Полное наименование', 'Общество с ограниченной ответственностью «АвтоЗапчасти»'],
            ['Краткое наименование', 'ООО «АвтоЗапчасти»'],
            ['ИНН', '0000000000'],
            ['КПП', '000000000'],
            ['ОГРН', '0000000000000'],
            ['Юридический адрес', '000000, г. Москва, ул. Примерная, д. 1, офис 1'],
            ['Фактический адрес', '000000, г. Москва, ул. Примерная, д. 1, офис 1'],
            ['Расчётный счёт', '00000000000000000000'],
            ['Банк', 'ПАО «Сбербанк России»'],
            ['БИК', '000000000'],
            ['Корр. счёт', '00000000000000000000'],
          ].map(([label, value]) => (
            <div key={label} className="flex gap-4 py-2 border-b border-gray-100 last:border-0">
              <div className="text-gray-400 w-44 shrink-0">{label}</div>
              <div className="font-medium text-gray-800">{value}</div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-orange-600 bg-orange-50 rounded-lg p-3">
          ⚠️ Замените эти данные на реальные реквизиты вашей компании перед публикацией сайта.
        </p>
      </div>
    </div>
  )
}
