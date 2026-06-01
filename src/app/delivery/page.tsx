export const metadata = { title: 'Доставка и оплата — TruckLine' }

function IconBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      width: 44, height: 44, background: '#FFF0E8', borderRadius: 11,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      {children}
    </div>
  )
}

function SvgIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  )
}

export default function DeliveryPage() {
  return (
    <div style={{ background: '#F0F2F5', minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        <h1 style={{ fontSize: 30, fontWeight: 800, color: '#0F2744', marginBottom: 8 }}>Доставка и оплата</h1>
        <p style={{ fontSize: 15, color: '#6B7280', marginBottom: 36, lineHeight: 1.6 }}>
          Доставляем запчасти по всей России. Стоимость доставки рассчитывается при оформлении заказа
          и зависит от габаритов, веса и региона получателя.
        </p>

        {/* ─── ДОСТАВКА ─── */}
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F2744', marginBottom: 16 }}>Доставка</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>

          <div style={{ background: 'white', borderRadius: 16, padding: '20px 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <IconBox>
                <SvgIcon>
                  <path d="M2 17h20"/>
                  <path d="M3 17v-6a1 1 0 0 1 1-1h6v7"/>
                  <path d="M10 11h6l3 3v3"/>
                  <circle cx="6.5" cy="19" r="2"/>
                  <circle cx="16.5" cy="19" r="2"/>
                </SvgIcon>
              </IconBox>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0F2744', marginBottom: 4 }}>СДЭК</div>
                <div style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.65 }}>
                  Доставка по всей России до пункта выдачи или курьером до двери.
                  Срок: 2–7 рабочих дней в зависимости от региона. Трек-номер
                  отправляем сразу после отгрузки.
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: 16, padding: '20px 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <IconBox>
                <SvgIcon>
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </SvgIcon>
              </IconBox>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0F2744', marginBottom: 4 }}>Почта России</div>
                <div style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.65 }}>
                  Подходит для труднодоступных регионов и небольших по весу деталей.
                  Срок: 7–14 рабочих дней. Отправляем 1-м классом или посылкой.
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: 16, padding: '20px 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <IconBox>
                <SvgIcon>
                  <path d="M2 17h20"/>
                  <path d="M3 17V9a1 1 0 0 1 1-1h6v9"/>
                  <rect x="4" y="9" width="5" height="3" rx="0.3"/>
                  <line x1="13" y1="14" x2="20" y2="14"/>
                  <circle cx="6.5" cy="19" r="2"/>
                  <circle cx="14.5" cy="19" r="2"/>
                  <circle cx="18.5" cy="19" r="2"/>
                </SvgIcon>
              </IconBox>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0F2744', marginBottom: 4 }}>Деловые линии</div>
                <div style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.65 }}>
                  Оптимально для крупногабаритных и тяжёлых запчастей: двигатели,
                  КПП, мосты, рамные элементы. Срок: 3–10 рабочих дней.
                  Доставка до терминала или адреса.
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: 16, padding: '20px 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <IconBox>
                <SvgIcon>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </SvgIcon>
              </IconBox>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0F2744', marginBottom: 4 }}>Самовывоз</div>
                <div style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.65 }}>
                  Забрать заказ можно из нашего офиса в Усть-Абакане:
                  ул. 70 лет БелАЗу, 51 стр1. Режим работы склада совпадает
                  с рабочими часами: Пн–Пт 8:00–19:00, Сб–Вс 9:00–17:00.
                  Предупредите менеджера заранее.
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Важно при получении */}
        <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 14, padding: '16px 20px', marginBottom: 40, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <div style={{ fontSize: 13, color: '#92400E', lineHeight: 1.65 }}>
            <strong>При получении обязательно проверьте</strong> целостность упаковки и соответствие
            количества мест документам. При обнаружении повреждений составьте акт
            с представителем транспортной компании прямо при получении и сообщите нам
            в течение 24 часов с фото/видео фиксацией.
          </div>
        </div>

        {/* ─── ОПЛАТА ─── */}
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F2744', marginBottom: 6 }}>Оплата</h2>
        <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.65, marginBottom: 20 }}>
          Отгрузка производится после поступления оплаты. Итоговая стоимость,
          включая доставку, согласовывается с менеджером перед оплатой.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>

          <div style={{ background: 'white', borderRadius: 16, padding: '20px 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <IconBox>
                <SvgIcon>
                  <rect x="2" y="5" width="20" height="14" rx="2"/>
                  <line x1="2" y1="10" x2="22" y2="10"/>
                  <line x1="6" y1="15" x2="9" y2="15"/>
                </SvgIcon>
              </IconBox>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0F2744', marginBottom: 4 }}>Банковский перевод</div>
                <div style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.65 }}>
                  Перевод на расчётный счёт ООО «ТК Саяны Плюс» в банке Точка.
                  Реквизиты высылаем после подтверждения заказа. Зачисление: 1–2 банковских дня.
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: 16, padding: '20px 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <IconBox>
                <SvgIcon>
                  <path d="M8 4v16"/>
                  <path d="M8 4h5a4 4 0 0 1 0 8H8"/>
                  <line x1="5" y1="15" x2="14" y2="15"/>
                </SvgIcon>
              </IconBox>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0F2744', marginBottom: 4 }}>Наличные</div>
                <div style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.65 }}>
                  Только при самовывозе из офиса в Усть-Абакане. Выдаём кассовый чек.
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: 16, padding: '20px 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <IconBox>
                <SvgIcon>
                  <path d="M3 21h18"/>
                  <path d="M5 21V7l8-4v18"/>
                  <path d="M19 21V11l-6-4"/>
                  <line x1="9" y1="9" x2="9" y2="9.01"/>
                  <line x1="9" y1="12" x2="9" y2="12.01"/>
                  <line x1="9" y1="15" x2="9" y2="15.01"/>
                  <line x1="9" y1="18" x2="9" y2="18.01"/>
                </SvgIcon>
              </IconBox>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0F2744', marginBottom: 4 }}>Счёт для юридических лиц и ИП</div>
                <div style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.65 }}>
                  Выставляем счёт на оплату. Работаем с НДС и без НДС — уточняйте
                  при оформлении. После отгрузки предоставляем полный пакет закрывающих
                  документов: УПД (счёт-фактура + накладная) или ТН + счёт-фактура.
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Документы для юр. лиц */}
        <div style={{ background: 'white', borderRadius: 16, padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: 32 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0F2744', marginBottom: 14 }}>Документы, которые мы предоставляем</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
            {[
              'Счёт на оплату',
              'Универсальный передаточный документ (УПД)',
              'Счёт-фактура (при НДС)',
              'Товарная накладная (ТОРГ-12)',
              'Товарно-транспортная накладная (ТТН)',
              'Кассовый чек (при наличной оплате)',
            ].map(name => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: '#0F2744', borderRadius: 16, padding: '28px 24px' }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: 'white', marginBottom: 8 }}>Есть вопросы по оплате или доставке?</div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: 20 }}>
            Менеджер подберёт удобный вариант и ответит на все вопросы.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <a href="tel:+79232130101" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#FF6B00', color: 'white', padding: '13px 24px', borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              +7 (923) 213-01-01
            </a>
            <a href="mailto:info.truckline@mail.ru" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)', padding: '13px 24px', borderRadius: 10, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
              info.truckline@mail.ru
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
