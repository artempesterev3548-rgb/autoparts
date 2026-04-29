export interface Product {
  id: number
  article: string
  name: string
  description: string | null
  image_url: string | null
  unit: string
  weight_kg: number | null
  brand: { id: number; name: string } | null
  category: { id: number; name: string; slug: string; parent_id: number | null } | null
  stock: StockItem[]
}

export interface StockItem {
  id: number
  price_sell: number
  price_buy: number | null
  quantity: number
  in_stock: boolean
  delivery_days: number
  supplier: { id: number; name: string; type: string }
}

export interface Category {
  id: number
  parent_id: number | null
  name: string
  slug: string
  markup_percent: number
  children?: Category[]
}

export interface Vehicle {
  id: number
  make: string
  model: string
  modification: string | null
  year_from: number | null
  year_to: number | null
  engine: string | null
  type: string
}

export interface CartItem {
  product_id: number
  article: string
  name: string
  price: number
  quantity: number
  unit: string
  in_stock: boolean
  delivery_days: number
}

export interface Order {
  id: number
  order_number: string
  customer_name: string
  customer_phone: string
  customer_comment: string | null
  items: CartItem[]
  total_price: number
  status: 'new' | 'processing' | 'completed' | 'cancelled'
  manager_notes: string | null
  created_at: string
  updated_at: string
}
