'use client'
export default function StockFilter({ checked, href }: { checked: boolean; href: string }) {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <input type="checkbox" checked={checked}
        onChange={() => window.location.href = href}
        className="rounded" />
      Только в наличии
    </label>
  )
}
