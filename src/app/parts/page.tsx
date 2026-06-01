import Link from 'next/link'

export const metadata = { title: 'Запчасти — TruckLine' }

export default function PartsPage() {
  return (
    <div style={{ background: '#F0F2F5', minHeight: '100vh', padding: '40px 16px' }}>
      <style>{`
        .parts-card {
          background: white;
          border-radius: 20px;
          padding: 32px 28px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.07);
          border: 2px solid transparent;
          display: flex;
          flex-direction: column;
          gap: 16px;
          text-decoration: none;
          transition: transform .2s, box-shadow .2s, border-color .2s;
        }
        .parts-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 28px rgba(15,39,68,0.13);
          border-color: #FF6B00;
        }
      `}</style>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: '#0F2744', marginBottom: 8 }}>
            Запчасти
          </h1>
          <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.6 }}>
            Выберите тип техники или воспользуйтесь поиском по ОЕМ номеру
          </p>
        </div>

        {/* Карточки */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16,
          marginBottom: 40,
        }}>

          {/* Тягачи и полуприцепы */}
          <Link href="/special" className="parts-card">
            <div style={{
              width: 60, height: 60, borderRadius: 16,
              background: '#FFF3E8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 17V11l2-3h4l2 2v7"/>
                <line x1="5" y1="8" x2="5" y2="11"/>
                <line x1="11" y1="17" x2="21" y2="17"/>
                <line x1="15" y1="15" x2="20" y2="15"/>
                <circle cx="6" cy="19" r="2"/>
                <circle cx="14" cy="19" r="1.7"/>
                <circle cx="18" cy="19" r="1.7"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 19, fontWeight: 800, color: '#0F2744', marginBottom: 6 }}>
                Тягачи и полуприцепы
              </div>
              <div style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>
                Volvo, Scania, DAF, Mercedes, КамАЗ. Седельные тягачи и полуприцепы — наша основная специализация
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#FF6B00', fontWeight: 700, fontSize: 14 }}>
              Перейти в каталог
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>
          </Link>

          {/* Самосвалы и спецтехника */}
          <Link href="/special" className="parts-card">
            <div style={{
              width: 60, height: 60, borderRadius: 16,
              background: '#EFF6FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 17V12l2-2h3l1 1v6"/>
                <line x1="3" y1="11" x2="7" y2="11"/>
                <path d="M9 17V9l13-3v8"/>
                <line x1="9" y1="11" x2="22" y2="11"/>
                <circle cx="5" cy="19" r="2"/>
                <circle cx="14" cy="19" r="1.7"/>
                <circle cx="18" cy="19" r="1.7"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 19, fontWeight: 800, color: '#0F2744', marginBottom: 6 }}>
                Самосвалы и спецтехника
              </div>
              <div style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>
                КамАЗ, МАЗ, SHACMAN, FAW, Volvo. Запчасти для самосвалов и спецтехники
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#2563EB', fontWeight: 700, fontSize: 14 }}>
              Перейти в каталог
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>
          </Link>

          {/* Поиск по ОЕМ */}
          <Link href="/search" className="parts-card">
            <div style={{
              width: 60, height: 60, borderRadius: 16,
              background: '#F0FDF4',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 19, fontWeight: 800, color: '#0F2744', marginBottom: 6 }}>
                Поиск по ОЕМ номеру
              </div>
              <div style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>
                Введите ОЕМ номер запчасти — найдём оригинал или подберём аналог по кросс-номерам
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#16A34A', fontWeight: 700, fontSize: 14 }}>
              Найти запчасть
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>
          </Link>

        </div>

        {/* Подсказка */}
        <div style={{
          background: '#0F2744', borderRadius: 16, padding: '24px 28px',
          display: 'flex', gap: 16, alignItems: 'flex-start',
        }}>
          <div style={{ flexShrink: 0, marginTop: 2 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 4 }}>
              Не знаете ОЕМ номер?
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, marginBottom: 14 }}>
              Позвоните — менеджер подберёт нужную деталь по марке, модели, году выпуска или фотографии.
            </div>
            <a href="tel:+79232130101" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#FF6B00', color: 'white', padding: '10px 20px',
              borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              +7 (923) 213-01-01
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
