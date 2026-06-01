export const metadata = { title: 'Как заказать — TruckLine' }

const steps = [
  {
    num: '01',
    title: 'Найдите нужную запчасть',
    desc: 'Воспользуйтесь каталогом или поиском по ОЕМ номеру. Если ОЕМ номер неизвестен — просто позвоните, менеджер подберёт деталь по марке, модели и году выпуска.',
    tips: ['Для точного подбора подготовьте ОЕМ номер детали', 'Можно искать по бренду: Volvo, Scania, DAF, Mercedes, КамАЗ и другие'],
  },
  {
    num: '02',
    title: 'Уточните наличие и цену',
    desc: 'Цены и наличие на сайте актуальны, но могут меняться. После добавления товара в корзину наш менеджер свяжется с вами и подтвердит стоимость и сроки поставки. Если товара нет в наличии — предложим аналог или сообщим срок ожидания.',
    tips: ['Позвоните сразу — ответим быстрее', 'Для юр. лиц выставляем счёт с НДС'],
  },
  {
    num: '03',
    title: 'Оформите заявку',
    desc: 'Добавьте товары в корзину и заполните форму заявки: укажите контактные данные и способ доставки. Физическим лицам достаточно имени и телефона. Юридическим лицам — название компании и ИНН для выставления счёта. Заявки принимаем круглосуточно, обрабатываем в рабочее время.',
    tips: ['Пн–Пт 8:00–19:00, Сб–Вс 9:00–17:00', 'Заявки вне рабочего времени обработаем утром'],
  },
  {
    num: '04',
    title: 'Подтвердите заказ и оплатите',
    desc: 'Менеджер перезвонит, уточнит детали и согласует итоговую стоимость с учётом доставки. После подтверждения выставим счёт или пришлём реквизиты для оплаты. Отгрузка производится после поступления оплаты на счёт.',
    tips: ['Оплата: банковский перевод, наличные при самовывозе', 'Для юр. лиц — счёт-фактура и товарная накладная'],
  },
  {
    num: '05',
    title: 'Получите заказ',
    desc: 'После отправки вы получите трек-номер для отслеживания. Доставляем СДЭК, Почтой России и Деловыми линиями по всей России. Самовывоз из офиса в Усть-Абакане. При получении проверьте комплектность и целостность упаковки — при повреждениях составьте акт с перевозчиком.',
    tips: ['Трек-номер отправим на телефон или email', 'При повреждении упаковки — фиксируйте на фото до вскрытия'],
  },
]

const faqs = [
  {
    q: 'Можно ли заказать по телефону без регистрации?',
    a: 'Да. Просто позвоните на +7 (923) 213-01-01, назовите ОЕМ номер или опишите нужную деталь — менеджер оформит заказ за вас.',
  },
  {
    q: 'Как долго хранится резерв товара?',
    a: 'Мы резервируем товар на 24 часа после подтверждения заказа. Если оплата не поступила — резерв снимается.',
  },
  {
    q: 'Работаете ли вы с юридическими лицами?',
    a: 'Да. Работаем с ООО, ИП и бюджетными организациями. Оформляем все закрывающие документы: счёт, УПД, счёт-фактуру, ТТН.',
  },
  {
    q: 'Что делать, если деталь не подошла?',
    a: 'Свяжитесь с нами в течение 7 дней после получения. Оформим возврат или обмен согласно условиям возврата.',
  },
]

export default function HowToOrderPage() {
  return (
    <div style={{ background: '#F0F2F5', minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: '#0F2744', marginBottom: 10 }}>Как заказать</h1>
          <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.6 }}>
            Оформить заказ можно онлайн через корзину или по телефону{' '}
            <a href="tel:+79232130101" style={{ color: '#FF6B00', fontWeight: 700 }}>+7 (923) 213-01-01</a>.
            Работаем с физическими лицами, ИП и организациями.
          </p>
        </div>

        {/* Шаги */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
          {steps.map(step => (
            <div key={step.num} style={{ background: 'white', borderRadius: 16, padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
                <div style={{ fontSize: 30, fontWeight: 900, color: '#FF6B00', lineHeight: 1, flexShrink: 0, minWidth: 40 }}>{step.num}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#0F2744', marginBottom: 8 }}>{step.title}</div>
                  <div style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.7, marginBottom: 12 }}>{step.desc}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {step.tips.map(tip => (
                      <div key={tip} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#6B7280' }}>
                        <span style={{ color: '#FF6B00', flexShrink: 0, marginTop: 1 }}>→</span>
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Заказ по телефону */}
        <div style={{ background: '#0F2744', borderRadius: 16, padding: '28px 24px', marginBottom: 32 }}>
          <div style={{ fontSize: 11, color: '#FF6B00', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8 }}>Быстрый вариант</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'white', marginBottom: 10 }}>Заказ по телефону</div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 20 }}>
            Не хотите заполнять форму? Позвоните нам — менеджер подберёт запчасть,
            уточнит наличие и оформит заказ за 5 минут. Подготовьте марку, модель
            автомобиля и год выпуска.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <a href="tel:+79232130101" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#FF6B00', color: 'white', padding: '13px 24px', borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              +7 (923) 213-01-01
            </a>
            <a href="mailto:info.truckline@mail.ru" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.15)', padding: '13px 24px', borderRadius: 10, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
              info.truckline@mail.ru
            </a>
          </div>
          <div style={{ marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
            Пн–Пт 8:00–19:00 · Сб–Вс 9:00–17:00
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F2744', marginBottom: 16 }}>Частые вопросы</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {faqs.map(faq => (
              <div key={faq.q} style={{ background: 'white', borderRadius: 14, padding: '20px 24px', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0F2744', marginBottom: 8 }}>{faq.q}</div>
                <div style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.65 }}>{faq.a}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
