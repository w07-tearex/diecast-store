import { sanityFetch } from '@/sanity/lib/live';
import Link from 'next/link';
import ProductDetailClient from './product-detail-client';

async function getProductAndRelated(id: string) {
    const query = `{
        "product": *[_type == "product" && _id == $id][0] {
            _id,
            name,
            brand,
            price,
            image,
            gallery, 
            description,
            stock
        },
        "related": *[_type == "product" && _id != $id && brand == ^.brand][0...4] {
            _id,
            name,
            brand,
            price,
            image,
            stock
        }
    }`;
    
    const { data } = await sanityFetch({ 
        query, 
        params: { id },
        perspective: 'published' 
    });
    
    // Fallback: If query with ^.brand fails or product not found, handle gracefully
    if (!data.product) return { product: null, related: [] };
    
    // If related is empty, let's try to get any 4 other products
    if (!data.related || data.related.length === 0) {
        const relatedQuery = `*[_type == "product" && _id != $id && brand == $brand][0...4] {
            _id,
            name,
            brand,
            price,
            image,
            stock
        }`;
        const { data: relatedData } = await sanityFetch({ 
            query: relatedQuery, 
            params: { id, brand: data.product.brand },
            perspective: 'published' 
        });
        return { product: data.product, related: relatedData || [] };
    }

    return data;
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
