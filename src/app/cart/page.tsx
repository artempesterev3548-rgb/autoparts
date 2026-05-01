'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getCart, removeFromCart, updateQuantity, clearCart, cartTotal } from '@/lib/cart'
import { CartItem } from '@/lib/types'

type CustomerType = 'individual' | 'company'

const EMPTY_IND = { name: '', phone: '', address: '', comment: '' }
const EMPTY_CO = {
  company_name: '', inn: '', kpp: '', ogrn: '', legal_address: '',
  bank: '', bik: '', account: '', corr_account: '', edo: '',
  contact_name: '', contact_position: '', contact_phone: '',
  delivery_address: '', comment: '',
}

const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400'
const lbl = 'text-xs text-gray-500 mb-1 block'

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([])
  const [type, setType] = useState<CustomerType>('individual')
  const [ind, setInd] = useState(EMPTY_IND)
  const [co, setCo] = useState(EMPTY_CO)
  const [agreed, setAgreed] = useState(false)
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setItems(getCart())
    const update = () => setItems(getCart())
    window.addEventListener('cart-updated', update)
    return () => window.removeEventListener('cart-updated', update)
  }, [])

  const handleRemove = (id: number) => { removeFromCart(id); setItems(getCart()) }
  const handleQty = (id: number, q: number) => { updateQuantity(id, q); setItems(getCart()) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed) { setError('Необходимо принять условия соглашения'); return }

    const isInd = type === 'individual'
    const customer_name = isInd ? ind.name : co.contact_name
    const customer_phone = isInd ? ind.phone : co.contact_phone

    if (!customer_name.trim() || !customer_phone.trim()) {
      setError('Укажите имя и телефон'); return
    }
    if (isInd && !ind.address.trim()) {
      setError('Укажите адрес доставки'); return
    }
    if (!isInd) {
      if (!co.company_name.trim() || !co.inn.trim()) {
        setError('Укажите название организации и ИНН'); return
      }
      if (!co.delivery_address.trim()) {
        setError('Укажите адрес доставки'); return
      }
    }

    setSending(true)
    setError('')
    try {
      const customer_data = isInd
        ? { type: 'individual', name: ind.name, phone: ind.phone, address: ind.address, comment: ind.comment }
        : { type: 'company', ...co }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name,
          customer_phone,
          customer_comment: JSON.stringify(customer_data),
          customer_type: type,
          items,
          total_price: cartTotal(items),
        }),
      })
      if (!res.ok) throw new Error()
      clearCart()
      setItems([])
      setSuccess(true)
    } catch {
      setError('Ошибка отправки. Попробуйте ещё раз или позвоните нам.')
    } finally {
      setSending(false)
    }
  }

  if (success) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Заявка принята!</h1>
        <p style={{ color: '#888', marginBottom: 24 }}>Менеджер свяжется с вами в ближайшее время для уточнения деталей.</p>
        <Link href="/catalog" style={{ background: '#FF6B00', color: 'white', padding: '12px 28px', borderRadius: 10, fontWeight: 700, textDecoration: 'none' }}>
          Продолжить покупки
        </Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Корзина</h1>

      {items.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 16, padding: '64px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
          <div style={{ color: '#999', marginBottom: 16 }}>Корзина пуста</div>
          <Link href="/catalog" style={{ background: '#FF6B00', color: 'white', padding: '12px 28px', borderRadius: 10, fontWeight: 700, textDecoration: 'none' }}>
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>

          {/* Товары */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map(item => (
              <div key={item.product_id} style={{ background: 'white', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ width: 44, height: 44, background: '#f4f6f8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🔧</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: '#aaa', fontFamily: 'monospace' }}>{item.article}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                  <div style={{ fontSize: 11, marginTop: 2, color: item.in_stock ? '#22c55e' : '#f97316' }}>
                    {item.in_stock ? '✓ В наличии' : `⏱ ${item.delivery_days} дн.`}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => handleQty(item.product_id, item.quantity - 1)} style={{ width: 28, height: 28, border: '1px solid #e5e7eb', borderRadius: 8, background: 'white', cursor: 'pointer' }}>−</button>
                  <span style={{ width: 28, textAlign: 'center', fontSize: 13, fontWeight: 600 }}>{item.quantity}</span>
                  <button onClick={() => handleQty(item.product_id, item.quantity + 1)} style={{ width: 28, height: 28, border: '1px solid #e5e7eb', borderRadius: 8, background: 'white', cursor: 'pointer' }}>+</button>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 700 }}>{(item.price * item.quantity).toLocaleString('ru')} ₽</div>
                  <div style={{ fontSize: 11, color: '#aaa' }}>{item.price.toLocaleString('ru')} ₽/{item.unit}</div>
                </div>
                <button onClick={() => handleRemove(item.product_id)} style={{ color: '#ccc', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, lineHeight: 1, flexShrink: 0 }}>✕</button>
              </div>
            ))}
            <div style={{ textAlign: 'right', fontSize: 17, fontWeight: 700, paddingRight: 4 }}>
              Итого: {cartTotal(items).toLocaleString('ru')} ₽
            </div>
          </div>

          {/* Форма */}
          <div style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 1px 8px rgba(0,0,0,0.07)', position: 'sticky', top: 80 }}>
            <h2 style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Оформить заявку</h2>

            {/* Переключатель типа */}
            <div style={{ display: 'flex', background: '#f4f6f8', borderRadius: 10, padding: 4, marginBottom: 18, gap: 4 }}>
              {(['individual', 'company'] as CustomerType[]).map(t => (
                <button key={t} onClick={() => setType(t)} style={{
                  flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all .15s',
                  background: type === t ? '#FF6B00' : 'transparent',
                  color: type === t ? 'white' : '#666',
                }}>
                  {t === 'individual' ? 'Физ. лицо' : 'Юр. лицо'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

              {type === 'individual' ? (
                <>
                  <div>
                    <label className={lbl}>ФИО *</label>
                    <input className={inp} value={ind.name} onChange={e => setInd(f => ({ ...f, name: e.target.value }))} placeholder="Иванов Иван Иванович" required />
                  </div>
                  <div>
                    <label className={lbl}>Телефон *</label>
                    <input className={inp} value={ind.phone} onChange={e => setInd(f => ({ ...f, phone: e.target.value }))} placeholder="+7 (999) 123-45-67" type="tel" required />
                  </div>
                  <div>
                    <label className={lbl}>Адрес СДЭК для доставки *</label>
                    <input className={inp} value={ind.address} onChange={e => setInd(f => ({ ...f, address: e.target.value }))} placeholder="Город, улица, дом, индекс" required />
                  </div>
                  <div>
                    <label className={lbl}>Комментарий</label>
                    <textarea className={inp} value={ind.comment} onChange={e => setInd(f => ({ ...f, comment: e.target.value }))} placeholder="Уточнения по заказу..." rows={2} style={{ resize: 'none' }} />
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#FF6B00', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 2 }}>Реквизиты организации</div>
                  <div>
                    <label className={lbl}>Название организации *</label>
                    <input className={inp} value={co.company_name} onChange={e => setCo(f => ({ ...f, company_name: e.target.value }))} placeholder='ООО "Компания"' required />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <label className={lbl}>ИНН *</label>
                      <input className={inp} value={co.inn} onChange={e => setCo(f => ({ ...f, inn: e.target.value }))} placeholder="0000000000" required />
                    </div>
                    <div>
                      <label className={lbl}>КПП</label>
                      <input className={inp} value={co.kpp} onChange={e => setCo(f => ({ ...f, kpp: e.target.value }))} placeholder="000000000" />
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>ОГРН</label>
                    <input className={inp} value={co.ogrn} onChange={e => setCo(f => ({ ...f, ogrn: e.target.value }))} placeholder="0000000000000" />
                  </div>
                  <div>
                    <label className={lbl}>Юридический адрес</label>
                    <input className={inp} value={co.legal_address} onChange={e => setCo(f => ({ ...f, legal_address: e.target.value }))} placeholder="Город, улица, дом" />
                  </div>

                  <div style={{ fontSize: 11, fontWeight: 700, color: '#FF6B00', letterSpacing: '0.5px', textTransform: 'uppercase', marginTop: 4, marginBottom: 2 }}>Банковские реквизиты</div>
                  <div>
                    <label className={lbl}>Банк</label>
                    <input className={inp} value={co.bank} onChange={e => setCo(f => ({ ...f, bank: e.target.value }))} placeholder="ПАО Сбербанк" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <label className={lbl}>БИК</label>
                      <input className={inp} value={co.bik} onChange={e => setCo(f => ({ ...f, bik: e.target.value }))} placeholder="000000000" />
                    </div>
                    <div>
                      <label className={lbl}>Р/с</label>
                      <input className={inp} value={co.account} onChange={e => setCo(f => ({ ...f, account: e.target.value }))} placeholder="00000000000000000000" />
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>К/с</label>
                    <input className={inp} value={co.corr_account} onChange={e => setCo(f => ({ ...f, corr_account: e.target.value }))} placeholder="00000000000000000000" />
                  </div>
                  <div>
                    <label className={lbl}>ЭДО (оператор и идентификатор, при наличии)</label>
                    <input className={inp} value={co.edo} onChange={e => setCo(f => ({ ...f, edo: e.target.value }))} placeholder="Диадок / 2BE..." />
                  </div>

                  <div style={{ fontSize: 11, fontWeight: 700, color: '#FF6B00', letterSpacing: '0.5px', textTransform: 'uppercase', marginTop: 4, marginBottom: 2 }}>Контактное лицо</div>
                  <div>
                    <label className={lbl}>ФИО *</label>
                    <input className={inp} value={co.contact_name} onChange={e => setCo(f => ({ ...f, contact_name: e.target.value }))} placeholder="Иванов Иван Иванович" required />
                  </div>
                  <div>
                    <label className={lbl}>Должность</label>
                    <input className={inp} value={co.contact_position} onChange={e => setCo(f => ({ ...f, contact_position: e.target.value }))} placeholder="Менеджер по закупкам" />
                  </div>
                  <div>
                    <label className={lbl}>Телефон *</label>
                    <input className={inp} value={co.contact_phone} onChange={e => setCo(f => ({ ...f, contact_phone: e.target.value }))} placeholder="+7 (999) 123-45-67" type="tel" required />
                  </div>
                  <div>
                    <label className={lbl}>Адрес СДЭК для доставки *</label>
                    <input className={inp} value={co.delivery_address} onChange={e => setCo(f => ({ ...f, delivery_address: e.target.value }))} placeholder="Город, улица, дом, индекс" required />
                  </div>
                  <div>
                    <label className={lbl}>Комментарий</label>
                    <textarea className={inp} value={co.comment} onChange={e => setCo(f => ({ ...f, comment: e.target.value }))} placeholder="Уточнения по заказу..." rows={2} style={{ resize: 'none' }} />
                  </div>
                </>
              )}

              {/* Согласие */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer', marginTop: 4 }}>
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  style={{ marginTop: 2, accentColor: '#FF6B00', width: 15, height: 15, flexShrink: 0 }}
                />
                <span style={{ fontSize: 11, color: '#666', lineHeight: 1.5 }}>
                  Я принимаю условия{' '}
                  <Link href="/terms" target="_blank" style={{ color: '#FF6B00' }}>Пользовательского соглашения</Link>,{' '}
                  <Link href="/privacy" target="_blank" style={{ color: '#FF6B00' }}>Политики конфиденциальности</Link>{' '}
                  и даю согласие на{' '}
                  <Link href="/personal-data" target="_blank" style={{ color: '#FF6B00' }}>обработку персональных данных</Link>
                </span>
              </label>

              {error && <div style={{ color: '#ef4444', fontSize: 12 }}>{error}</div>}

              <button type="submit" disabled={sending || !agreed} style={{
                background: agreed ? '#FF6B00' : '#ccc',
                color: 'white', border: 'none', padding: '12px 0',
                borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: agreed ? 'pointer' : 'not-allowed',
                transition: 'background .2s', marginTop: 4,
              }}>
                {sending ? 'Отправляем...' : 'Отправить заявку'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
