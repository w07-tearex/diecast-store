import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items, customer, total, subtotal, tax, shipping, paymentMethod } = body
    
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser()
    
    // Generate simple order number
    const orderNumber = `ORD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`

    // 1. Insert into 'orders' table
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user?.id || null, // Optional login
        order_number: orderNumber,
        total_amount: parseFloat(total),
        status: 'pending',
        payment_method: paymentMethod,
        customer_name: customer.name,
        customer_email: customer.email,
        shipping_address: customer.address || 'N/A',
      })
      .select()
      .single()

    if (orderError) throw orderError

    // 2. Insert into 'order_items' table
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item._id,
      product_name: item.name,
      quantity: item.quantity,
      price: parseFloat(item.price),
      image_url: item.image,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    return NextResponse.json({ 
      success: true, 
      orderId: order.id, 
      orderNumber: order.order_number 
    })

  } catch (error: any) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
