import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import ProductDetailClient from './product-detail-client';

async function getProductAndRelated(id: string) {
    const supabase = await createClient();
    
    // Query main product
    const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
        
    if (error || !product) {
        return { product: null, related: [] };
    }
    
    // Query related products by brand
    const { data: relatedData } = await supabase
        .from('products')
        .select('*')
        .eq('brand', product.brand)
        .neq('id', id)
        .limit(4);
        
    return { product, related: relatedData || [] };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const { product, related } = await getProductAndRelated(resolvedParams.id);

    if (!product) {
        return (
            <div className="text-center text-white py-20 min-h-[50vh] flex flex-col items-center justify-center">
                <h1 className="text-3xl font-bold mb-4">Product not found</h1>
                <p className="text-zinc-500 mb-8 text-lg">The product you are looking for does not exist or has been removed.</p>
                <Link href="/" className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-zinc-200 transition">
                    Back to homepage
                </Link>
            </div>
        );
    }

    return <ProductDetailClient product={product} relatedProducts={related} />;
}
