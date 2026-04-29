'use client'
import { useState, useEffect } from 'react'
import { getCart, removeFromCart, updateQuantity, clearCart, cartTotal } from '@/lib/cart'
import { CartItem } from '@/lib/types'

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([])
  const [form, setForm] = useState({ name: '', phone: '', comment: '' })
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
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Укажите имя и телефон')
      return
    }
    setSending(true)
    setError('')
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, items, total_price: cartTotal(items) }),
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
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Заявка принята!</h1>
        <p className="text-gray-500 mb-6">Менеджер свяжется с вами в ближайшее время для уточнения деталей.</p>
        <a href="/catalog" className="bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-800 transition">
          Продолжить покупки
        </a>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Корзина</h1>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">🛒</div>
          <div className="text-gray-500 mb-4">Корзина пуста</div>
          <a href="/catalog" className="bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-800 transition">
            Перейти в каталог
          </a>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Товары */}
          <div className="md:col-span-2 space-y-3">
            {items.map(item => (
              <div key={item.product_id} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl shrink-0">🔧</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-400 font-mono">{item.article}</div>
                  <div className="text-sm font-medium text-gray-800 truncate">{item.name}</div>
                  <div className={`text-xs mt-0.5 ${item.in_stock ? 'text-green-600' : 'text-orange-500'}`}>
                    {item.in_stock ? '✓ В наличии' : `⏱ ${item.delivery_days} дн.`}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleQty(item.product_id, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg border text-gray-600 hover:bg-gray-100 flex items-center justify-center">−</button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button onClick={() => handleQty(item.product_id, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg border text-gray-600 hover:bg-gray-100 flex items-center justify-center">+</button>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-gray-900">{(item.price * item.quantity).toLocaleString('ru')} ₽</div>
                  <div className="text-xs text-gray-400">{item.price.toLocaleString('ru')} ₽/{item.unit}</div>
                </div>
                <button onClick={() => handleRemove(item.product_id)}
                  className="text-gray-300 hover:text-red-500 transition text-lg shrink-0">✕</button>
              </div>
            ))}

            <div className="text-right text-lg font-bold text-gray-900 pr-1">
              Итого: {cartTotal(items).toLocaleString('ru')} ₽
            </div>
          </div>

          {/* Форма */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-5 sticky top-4">
              <h2 className="font-bold text-gray-800 mb-4">Оформить заявку</h2>
              <p className="text-xs text-gray-400 mb-4">Менеджер свяжется с вами и обсудит условия оплаты и доставки</p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Ваше имя *</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Иван Иванов"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Телефон *</label>
                  <input
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+7 (999) 123-45-67"
                    type="tel"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Комментарий</label>
                  <textarea
                    value={form.comment}
                    onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                    placeholder="Уточнения по заказу..."
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
                {error && <div className="text-red-600 text-xs">{error}</div>}
                <button type="submit" disabled={sending}
                  className="w-full bg-blue-700 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition disabled:opacity-60">
                  {sending ? 'Отправляем...' : '📋 Отправить заявку'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
