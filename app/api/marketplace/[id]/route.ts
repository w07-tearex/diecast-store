import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Chỉ cho phép user xoá listing của chính họ.
    const { error: deleteError } = await supabase
      .from('market_items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
      .eq('status', 'pending')

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to delete listing'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

