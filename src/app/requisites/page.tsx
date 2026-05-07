export default function RequisitesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Реквизиты компании</h1>
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="space-y-3 text-sm">
          {[
            ['Полное наименование', 'ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ «ТРАНСПОРТНАЯ КОМПАНИЯ САЯНЫ ПЛЮС»'],
            ['Краткое наименование', 'ООО «ТК Саяны Плюс»'],
            ['ИНН', '2413007682'],
            ['КПП', '241301001'],
            ['ОГРН', '—'],
            ['Расчётный счёт', '40702810702500056039'],
            ['Банк', 'ООО «Банк Точка»'],
            ['БИК', '044525104'],
            ['Корр. счёт', '30101810745374525104'],
          ].map(([label, value]) => (
            <div key={label} className="flex gap-4 py-2 border-b border-gray-100 last:border-0">
              <div className="text-gray-400 w-44 shrink-0">{label}</div>
              <div className="font-medium text-gray-800">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
