import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Check if any admin exists at all
  const { count: adminCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'admin')

  const hasAdmin = (adminCount || 0) > 0

  if (!user) {
    return NextResponse.json({ hasAdmin, isAdmin: false })
  }

  // Check if current user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return NextResponse.json({ 
    hasAdmin, 
    isAdmin: profile?.role === 'admin' 
  })
}

