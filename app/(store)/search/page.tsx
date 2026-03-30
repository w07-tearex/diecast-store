import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q: query = '' } = await searchParams;
  const supabase = await createClient();

  const searchWords = query.trim().split(/\s+/).filter(word => word.length > 0);
  
  let products: any[] = [];

  if (searchWords.length > 0) {
    const filterString = searchWords.map(word => `name.ilike.%${word}%,brand.ilike.%${word}%`).join(',');
    const { data } = await supabase.from('products').select('*').or(filterString);
    products = data || [];
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      <nav className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-zinc-600 mb-8 italic">
        <Link href="/" className="hover:text-[#FF42B0] transition-colors">Home</Link>
        <span>/</span>
        <span className="text-white uppercase tracking-widest text-zinc-400">Search Results</span>
      </nav>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic leading-none">
            Search <span className="text-[#FF42B0]">Results</span>
          </h1>
          <p className="text-zinc-500 text-[10px] font-medium uppercase tracking-[0.2em]">
            Found {products.length} {products.length === 1 ? 'matching model' : 'matching models'} for "{query}"
          </p>
        </div>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              imageUrl={product.image_url || ''} 
            />
          ))}
        </div>
      ) : (
        <div className="py-32 text-center space-y-6 bg-white/5 rounded-3xl border border-dashed border-white/10 max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10 opacity-50 text-zinc-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">No match found</h2>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest px-8 max-w-sm mx-auto leading-relaxed">
              We couldn't locate any records for "{query}". <br/>
              Try using broader terms or check your spelling.
            </p>
          </div>
          <Link href="/products" className="inline-block border-b-2 border-[#FF42B0] text-white text-[10px] font-black uppercase tracking-widest py-1 hover:border-white transition-all">Back to Gallery</Link>
        </div>
      )}
    </div>
  );
}
