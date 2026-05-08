import { supabaseAdmin } from './supabase'

export async function rateLimit(key: string, max: number, windowMs: number): Promise<boolean> {
  try {
    const now = Date.now()
    const resetAt = new Date(now + windowMs).toISOString()

    const { data } = await supabaseAdmin
      .from('rate_limits')
      .select('count, reset_at')
      .eq('key', key)
      .maybeSingle()

    if (!data || new Date(data.reset_at).getTime() < now) {
      await supabaseAdmin
        .from('rate_limits')
        .upsert({ key, count: 1, reset_at: resetAt }, { onConflict: 'key' })
      return true
    }

    if (data.count >= max) return false

    await supabaseAdmin
      .from('rate_limits')
      .update({ count: data.count + 1 })
      .eq('key', key)
    return true
  } catch {
    return true
  }
}

export function getClientIp(req: Request): string {
  return (
    (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}
