export default function ReturnsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Возврат товара</h1>
      <div className="bg-white rounded-2xl shadow-sm p-8 text-gray-700 space-y-4 text-sm">
        <p className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-orange-800">
          В соответствии с Постановлением Правительства РФ от 31.12.2020 № 2463 и Законом «О защите прав потребителей».
        </p>

        <h2 className="font-semibold text-gray-800">Условия возврата</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Возврат товара надлежащего качества возможен в течение <strong>14 дней</strong> с момента получения</li>
          <li>Товар должен быть в оригинальной упаковке, без следов установки и эксплуатации</li>
          <li>Необходимо сохранить товарный чек или иной документ, подтверждающий покупку</li>
        </ul>

        <h2 className="font-semibold text-gray-800">Возврат товара ненадлежащего качества</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Если в товаре обнаружен производственный дефект — замена или возврат в течение гарантийного срока</li>
          <li>Гарантийный срок устанавливается производителем</li>
        </ul>

        <h2 className="font-semibold text-gray-800">Невозвратные товары</h2>
        <p>Технически сложные товары, товары для технического обслуживания, а также запчасти, бывшие в установке, возврату не подлежат согласно Постановлению Правительства РФ № 2463.</p>

        <h2 className="font-semibold text-gray-800">Как оформить возврат</h2>
        <p>Свяжитесь с нами по телефону или на странице <a href="/contacts" className="text-orange-500 hover:underline">Контакты</a>. Менеджер согласует порядок возврата.</p>
      </div>
    </div>
  )
}
