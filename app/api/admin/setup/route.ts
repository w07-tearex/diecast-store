import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const emailFromBody = typeof body?.email === 'string' ? body.email : null
    const email = emailFromBody || user.email

    if (!email) {
      return NextResponse.json({ error: 'Missing admin email' }, { status: 400 })
    }

    const { error: insertError } = await supabase
      .from('admin_accounts')
      .insert({
        user_id: user.id,
        email,
      })

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to setup admin'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

