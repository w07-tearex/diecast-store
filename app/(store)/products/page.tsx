import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { FOOTER_CONFIG } from '@/lib/constants';

export const dynamic = 'force-dynamic';

interface ProductsPageProps {
  searchParams: Promise<{ page?: string; sort?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { page, sort } = await searchParams;
  
  const currentPage = parseInt(page || '1');
  const sortBy = sort || 'newest';
  const pageSize = 12;
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;
  
  const supabase = await createClient();
  
  // 1. Build Query with Sorting
  let query = supabase
    .from('products')
    .select('*', { count: 'exact' });

  if (sortBy === 'az') {
    query = query.order('name', { ascending: true });
  } else if (sortBy === 'price-high') {
    query = query.order('price', { ascending: false });
  } else if (sortBy === 'price-low') {
    query = query.order('price', { ascending: true });
  } else {
    // Default: newest
    query = query.order('created_at', { ascending: false });
  }

  const { data: products, error, count } = await query.range(from, to);

  // 2. Fetch all unique brands for sidebar
  const { data: allProducts } = await supabase.from('products').select('brand');
  const uniqueBrands = Array.from(new Set(allProducts?.map((p: any) => p.brand).filter(Boolean)))
    .sort((a, b) => (a as string).localeCompare(b as string));

  if (error) {
    console.error('Error fetching all products:', error);
  }

  const totalPages = count ? Math.ceil(count / pageSize) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-zinc-600 mb-8 italic">
        <Link href="/" className="hover:text-[#FF42B0] transition-colors">Home</Link>
        <span>/</span>
        <span className="text-white uppercase tracking-widest">All Products</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
          <div>
            <h3 className="text-white font-black text-[10px] uppercase tracking-[0.2em] italic mb-6 border-b border-white/5 pb-2">Brands</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/products" className="block py-2 text-[11px] font-black uppercase tracking-widest text-[#FF42B0] pl-3 border-l-2 border-[#FF42B0]">
                  All Products
                </Link>
              </li>
              {uniqueBrands.map((b) => (
                <li key={b as string}>
                  <Link 
                    href={`/brand/${encodeURIComponent(b as string)}`} 
                    className="block py-2 text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:pl-2 transition-all"
                  >
                    {b as string}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white/5 rounded-2xl p-6 border border-white/5 hidden lg:block">
            <p className="text-[#FF42B0] font-black text-[10px] uppercase tracking-widest italic mb-2">Support 24/7</p>
            <p className="text-white text-xs font-bold mb-4">Looking for rare models?</p>
            <a href={FOOTER_CONFIG.SOCIALS.ZALO} className="block w-full py-3 bg-white text-black text-center text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-all">
              Chat Support
            </a>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/5 pb-8">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic leading-none">
                All <span className="text-[#FF42B0]">Products</span>
              </h1>
              <p className="text-zinc-500 text-[10px] font-medium uppercase tracking-[0.2em]">
                Total of {count || 0} models currently in stock.
              </p>
            </div>
            
            {/* Sorting Controls */}
            <div className="flex items-center gap-4 bg-white/5 p-2 rounded-xl border border-white/5">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-2">Sort By:</span>
              <div className="flex gap-2">
                {[
                  { id: 'newest', label: 'Newest' },
                  { id: 'az', label: 'A-Z' },
                  { id: 'price-high', label: 'Price High' },
                  { id: 'price-low', label: 'Price Low' }
                ].map((s) => (
                  <Link
                    key={s.id}
                    href={`/products?sort=${s.id}`}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${
                      sortBy === s.id 
                        ? 'bg-[#FF42B0] text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {products && products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10">
                {products.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    imageUrl={product.image_url || ''} 
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-20 flex justify-center items-center gap-2">
                  <Link
                    href={`/products?page=${Math.max(1, currentPage - 1)}&sort=${sortBy}`}
                    className={`p-3 rounded-full border border-white/5 bg-white/5 text-zinc-500 hover:text-white hover:border-[#FF42B0] transition-all ${currentPage === 1 ? 'opacity-20 pointer-events-none' : ''}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                  </Link>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <Link
                        key={pageNum}
                        href={`/products?page=${pageNum}&sort=${sortBy}`}
                        className={`w-10 h-10 flex items-center justify-center rounded-full text-[10px] font-black transition-all ${
                          pageNum === currentPage 
                            ? 'bg-[#FF42B0] text-white shadow-[0_0_20px_rgba(255,66,176,0.5)]' 
                            : 'bg-white/5 text-zinc-600 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {pageNum}
                      </Link>
                    ))}
                  </div>

                  <Link
                    href={`/products?page=${Math.min(totalPages, currentPage + 1)}&sort=${sortBy}`}
                    className={`p-3 rounded-full border border-white/5 bg-white/5 text-zinc-500 hover:text-white hover:border-[#FF42B0] transition-all ${currentPage === totalPages ? 'opacity-20 pointer-events-none' : ''}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="py-32 text-center space-y-6 bg-white/5 rounded-3xl border border-dashed border-white/10">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10 opacity-50">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <p className="text-zinc-500 uppercase tracking-[0.3em] font-black text-[10px] italic">No products found.</p>
              <Link href="/products" className="inline-block border-b-2 border-[#FF42B0] text-white text-[10px] font-black uppercase tracking-widest py-1 hover:border-white transition-all">Back to Home</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
