import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { formatVND } from '@/lib/utils';

async function getMarketItem(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('market_items')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error || !data) return null;
  
  return {
    ...data,
    sellerName: data.seller_name,
    sellerPhone: data.seller_phone,
    imageUrls: data.image_urls,
    createdAt: data.created_at
  };
}

export default async function MarketItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getMarketItem(id);

  if (!item) {
    return (
      <div className="min-h-screen bg-[#0b0d17] flex items-center justify-center p-20 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter font-tech">ITEM NOT FOUND</h1>
          <Link href="/marketplace" className="text-zinc-500 font-mono text-[10px] uppercase hover:text-white transition">Back to Marketplace</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0d17] py-20 px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        <Link 
          href="/marketplace"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white font-mono text-[10px] uppercase tracking-widest mb-12 transition-all group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:-translate-x-1"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* GALLERY SECTION */}
          <div className="space-y-6">
            <div className="rounded-3xl overflow-hidden bg-zinc-900 border border-white/5 aspect-square shadow-2xl relative group">
              {item.imageUrls && item.imageUrls.length > 0 && (
                <Image 
                  src={item.imageUrls[0]} 
                  alt={item.title} 
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain p-4 transition-transform duration-700 group-hover:scale-105" 
                />
              )}
              {item.imageUrls && item.imageUrls.length > 1 && (
                <div className="absolute bottom-6 right-6 bg-black/60 backdrop-blur-[1px] px-4 py-2 rounded-full border border-white/10 text-[10px] font-black text-white uppercase tracking-widest font-gaming">
                  1 / {item.imageUrls.length} Shots
                </div>
              )}
            </div>
            
            {/* THUMBNAILS GRID */}
            {item.imageUrls && item.imageUrls.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {item.imageUrls.map((url: string, i: number) => (
                  <div key={i} className="aspect-square rounded-2xl bg-zinc-900 border border-white/5 overflow-hidden hover:border-[#FF42B0] transition-all cursor-pointer shadow-lg outline-none focus:ring-2 focus:ring-[#FF42B0] relative">
                    <Image 
                        src={url} 
                        alt={`Gallery ${i}`} 
                        fill
                        sizes="150px"
                        className="object-cover p-1" 
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between py-2">
            <div className="space-y-10">
              <div className="space-y-4">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-2xl transition-all font-gaming ${
                  item.condition === 'new' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                }`}>
                   {item.condition}
                </span>
                <h1 className="text-5xl md:text-7xl font-black italic text-white uppercase tracking-tighter leading-none mb-4 font-tech">{item.title}</h1>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic tracking-tighter opacity-60">Collector's Price Appraisal:</p>
                <div className="text-6xl font-black text-[#FF42B0] tracking-tighter flex items-center gap-4 italic drop-shadow-[0_0_15px_rgba(255,66,176,0.5)] font-tech">
                  {formatVND(item.price)}
                </div>
              </div>

              <div className="space-y-4 prose prose-invert">
                <p className="text-zinc-400 text-lg leading-relaxed font-medium italic opacity-80">
                  {item.description || 'Rare item with no detailed description. Contact seller for deeper look.'}
                </p>
              </div>

              {/* CONSIGNMENT INFO SECTION */}
              <div className="mt-12 bg-white/5 border border-white/5 rounded-[2rem] p-10 backdrop-blur-3xl shadow-[0_30px_60px_-10px_rgba(0,0,0,0.6)] group">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-8 border-b border-white/5 pb-4 italic opacity-60 font-gaming">
                  Direct Line to Collector
                </p>
                
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-[#FF42B0] border border-white/5 group-hover:scale-110 transition-transform duration-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#FF42B0] font-black uppercase tracking-widest leading-none mb-1 italic font-gaming opacity-80">Profile Authenticated</p>
                      <p className="text-2xl font-black text-white uppercase italic tracking-tight font-tech">{item.sellerName || 'Private Collector'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <a 
                      href={`tel:${item.sellerPhone}`}
                      className="flex items-center justify-center gap-3 bg-gradient-to-r from-[#FF42B0] to-[#FF42B0] text-white px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-[0_20px_40px_-10px_rgba(255,66,176,0.3)] hover:scale-105 active:scale-95 italic font-gaming btn-glossy relative overflow-hidden group/call"
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        Direct Call
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/call:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                    </a>
                    <a 
                      href={`https://zalo.me/${item.sellerPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 border-2 border-zinc-800 hover:border-[#FF42B0] hover:text-[#FF42B0] text-zinc-400 px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl hover:scale-105 active:scale-95 italic font-gaming"
                    >
                      Zalo Link
                    </a>
                  </div>
                </div>

                <p className="mt-8 text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em] leading-relaxed italic text-center opacity-60 font-gaming">
                  Collectors notice: Private P2P transaction. 
                </p>
              </div>
            </div>

            <p className="mt-12 text-[10px] text-zinc-600 font-mono uppercase tracking-[0.3em] font-black pl-4 border-l-2 border-[#FF42B0] opacity-60">
              Entry Locked: {new Date(item.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
