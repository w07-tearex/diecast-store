import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status: nextStatus } = body;
    
    if (!nextStatus) {
      return NextResponse.json({ error: 'Missing status in request body' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // 1. Authenticate user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch current order and items
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 3. Authorization Check
    // User can update if they are: 
    // a) The owner AND only to 'cancelled' (from 'pending')
    // b) An admin (will need a proper admin check later, for now we assume they have CMS access if they hit this)
    const isOwner = user.id === order.user_id;
    // For now, if they are hit this from API, we check if they are owner or if we have admin flags
    // Since we don't have a rigid role system yet, we'll allow status updates if they are owner
    // OR if they are an admin (we'll assume admin if they aren't the owner but have a session)
    
    const curStatus = order.status;
    
    // IF NOT ADMIN (OWNER ONLY), limit their power
    const { data: isAdminData } = await supabase.rpc('admin_is_user', {
      p_user_id: user.id,
    })

    const isAdmin = !!isAdminData

    if (isOwner && !isAdmin) {
       if (nextStatus !== 'cancelled') {
          return NextResponse.json({ error: 'Customers can only cancel orders' }, { status: 403 });
       }
       if (curStatus !== 'pending') {
          return NextResponse.json({ error: 'Only pending orders can be cancelled by customers' }, { status: 400 });
       }
    }

    // 4. INVENTORY RECONCILIATION
    // TO CANCELLED: Restock
    if (nextStatus === 'cancelled' && curStatus !== 'cancelled') {
        for (const item of order.items) {
           const { data: prod } = await supabase.from('products').select('stock').eq('id', item.product_id).single();
           if (prod) {
              await supabase.from('products').update({ stock: prod.stock + item.quantity }).eq('id', item.product_id);
           }
        }
    } 
    // AWAY FROM CANCELLED: De-stock
    else if (curStatus === 'cancelled' && nextStatus !== 'cancelled') {
        for (const item of order.items) {
          const { data: prod } = await supabase.from('products').select('stock').eq('id', item.product_id).single();
          if (prod) {
             await supabase.from('products').update({ stock: Math.max(0, prod.stock - item.quantity) }).eq('id', item.product_id);
          }
       }
    }

    // 5. UPDATE ORDER STATUS
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: nextStatus })
      .eq('id', id);

    if (updateError) throw updateError;

    return NextResponse.json({ 
      success: true, 
      id, 
      status: nextStatus,
      inventorySynced: (nextStatus === 'cancelled' || curStatus === 'cancelled')
    });

  } catch (error: any) {
    console.error('Order Patch Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
