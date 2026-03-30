import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { TAX_RATE, SHIPPING_COST } from '@/lib/constants'

// NGUYÊN TẮC: Database (Supabase) là Root CMS duy nhất.

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items, customer, paymentMethod } = body
    const supabase = await createClient()
    
    const round = (num: number) => Math.round(num * 100) / 100

    // 0. CHECK & UPDATE STOCK TRÊN NGUỒN GỐC (SUPABASE PRODUCTS)
    const productIds = items.map((i: any) => i.productId).filter(Boolean)
    
    if (productIds.length === 0) {
      console.error('API Error: No valid productIds provided in items:', items);
      return NextResponse.json({ error: 'Missing product IDs in request' }, { status: 400 });
    }

    const { data: currentProducts, error: fetchError } = await supabase
      .from('products')
      .select('id, name, stock')
      .in('id', productIds)

    if (fetchError || !currentProducts) {
       console.error('Supabase Product Fetch Error:', fetchError);
       return NextResponse.json({ error: 'Failed to access product data' }, { status: 500 })
    }
    
    for (const item of items) {
      const product = currentProducts.find((p: any) => p.id === item.productId)
      if (!product || product.stock < item.quantity) {
        return NextResponse.json({ 
          error: `Sản phẩm "${item.productName}" đã cháy hàng.`,
          details: 'OUT_OF_STOCK'
        }, { status: 400 })
      }
    }

    // 1. UPDATE KHO (SUPABASE UPDATE)
    for (const item of items) {
      const product = currentProducts.find((p: any) => p.id === item.productId)
      const newStock = product!.stock - item.quantity;
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', item.productId);
      
      if (updateError) {
        throw new Error('Lỗi liên kết cập nhật tồn kho.');
      }
    }

    // 2. TÍNH TOÁN DỮ LIỆU CHUẨN (ROOT)
    const subtotal = round(items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0))
    const tax = round(subtotal * TAX_RATE)
    const shipping = SHIPPING_COST
    const total = round(subtotal + tax + shipping)
    const orderNumber = `ORD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`

    // 3. LƯU DUY NHẤT VÀO DATABASE GỐC (SUPABASE)
    const { data: { user } } = await supabase.auth.getUser()
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user?.id || null,
        order_number: orderNumber,
        total_amount: total,
        status: 'pending',
        payment_method: paymentMethod,
        customer_name: customer.name,
        customer_email: customer.email,
        shipping_address: `${customer.address}, ${customer.city}, ${customer.country}`,
      })
      .select()
      .single()

    if (orderError) throw orderError

    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.productName,
      quantity: item.quantity,
      price: item.price,
      image_url: item.image,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    return NextResponse.json({ 
      success: true, 
      orderId: order.id, 
      orderNumber: orderNumber 
    }, { status: 201 })

  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
