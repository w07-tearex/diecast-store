import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const supabase = await createClient();
    
    // Lấy tất cả ảnh từ FormData
    const files = formData.getAll('files') as File[];
    const title = formData.get('title') as string;
    const price = parseFloat(formData.get('price') as string);
    const condition = formData.get('condition') as string;
    const description = formData.get('description') as string;
    const sellerName = formData.get('sellerName') as string;
    const sellerPhone = formData.get('sellerPhone') as string;

    if (files.length === 0 || !title || isNaN(price) || !sellerName || !sellerPhone) {
      return NextResponse.json({ error: 'Missing required listing data' }, { status: 400 });
    }

    // 1. UPLOAD ẢNH LÊN SUPABASE STORAGE
    const imageUrls: string[] = [];
    
    // Upload song song để tối ưu tốc độ
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 10)}-${Date.now()}.${fileExt}`;
      const filePath = `marketplace/${fileName}`;

      const { data, error } = await supabase.storage
        .from('diecast-images')
        .upload(filePath, file, {
           cacheControl: '3600',
           upsert: false
        });

      if (error) {
        throw new Error(`Failed to upload ${file.name}: ${error.message}`);
      }

      // Lấy Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('diecast-images')
        .getPublicUrl(filePath);

      return publicUrl;
    });

    const uploadedUrls = await Promise.all(uploadPromises);
    imageUrls.push(...uploadedUrls);

    // 2. TẠO DATA VÀO BẢNG SUPABASE 'market_items'
    const { data: result, error: insertError } = await supabase
      .from('market_items')
      .insert({
        title,
        price,
        condition,
        description,
        image_urls: imageUrls,
        seller_name: sellerName,
        seller_phone: sellerPhone,
        status: 'pending' // Chờ Admin duyệt
      })
      .select('id')
      .single();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({ 
      success: true, 
      id: result.id,
      message: 'Listing submitted successfully to Supabase!' 
    }, { status: 201 });

  } catch (error: any) {
    console.error('Marketplace Upload to Supabase Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Error processing marketplace submisison' 
    }, { status: 500 });
  }
}
