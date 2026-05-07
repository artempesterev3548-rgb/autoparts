import { supabaseAdmin } from '@/lib/supabase'
import ServiceKanban from './ServiceKanban'

export const dynamic = 'force-dynamic'

export default async function ServicePage() {
  const { data: orders } = await supabaseAdmin
    .from('orders')
    .select('*')
    .like('order_number', 'SVC-%')
    .order('created_at', { ascending: false })
    .limit(500)

  return <ServiceKanban orders={orders ?? []} />
}
