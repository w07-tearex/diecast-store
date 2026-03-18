export const dynamic = 'force-dynamic';

import { sanityFetch } from '@/sanity/lib/live'
import { urlFor } from '@/lib/utils'
import HeroBanner from "@/components/HeroBanner";
import ProductCard from '@/components/ProductCard';

async function getProducts() {
  const query = `*[_type == "product"] {
    _id,
    name,
    brand,
    price,
    image,
    stock
  }`;
  return await sanityFetch({ query, perspective: 'published' });
}

export default async function Home() {
  const { data: products } = await getProducts();
  const uniqueBrands = Array.from(new Set(products.map((p: any) => p.brand)));

  return (
    <div className="space-y-16 pb-20">
      <HeroBanner />

      {uniqueBrands.map((brandName) => {
        const brandProducts = products.filter((p: any) => p.brand === brandName);
        if (!brandName) return null;

        return (
          <section key={brandName as string} className="px-4 md:px-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white uppercase tracking-wide border-l-4 border-[#FF42B0] pl-3 drop-shadow-[0_0_8px_rgba(255,66,176,0.5)]">
                {brandName as string} Collection
              </h2>
              <a href="#" className="text-sm text-zinc-400 hover:text-white transition">View all {brandName as string} &rarr;</a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {brandProducts.map((product: any) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  imageUrl={product.image ? urlFor(product.image) : ''}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}