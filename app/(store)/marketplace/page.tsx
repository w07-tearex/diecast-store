import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { formatVND } from '@/lib/utils';

type MarketItemRow = {
  id: string
  title?: string
  price?: number
  condition?: string
  image_urls?: string[]
}

async function getMarketItems() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('market_items')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });
    
  if (error) console.error('Error fetching market items:', error);
  return (data || []) as MarketItemRow[];
}

export default async function MarketplacePage() {
  const items = await getMarketItems();

  return (
    <div className="min-h-screen bg-[#0b0d17] py-20 px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black italic text-white uppercase tracking-tighter">
              P2P <span className="text-[#FF42B0]">MARKETPLACE</span>
            </h1>
            <p className="text-zinc-500 font-medium uppercase tracking-[0.2em] text-[10px] italic">
              COLLECTOR-TO-COLLECTOR DIRECT BRIDGE. FIND RARE ITEMS FROM PEERS.
            </p>
          </div>
          <Link 
            href="/marketplace/submit"
            className="group relative px-10 py-5 bg-[#FF42B0] hover:bg-[#E52292] text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all duration-500 hover:scale-105 shadow-[0_20px_40px_-15px_rgba(255,66,176,0.4)] italic"
          >
            Submit Listing
          </Link>
          <Link
            href="/marketplace/my"
            className="px-10 py-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/90 font-black uppercase tracking-widest text-[10px] transition-all italic"
          >
            My Listings
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center border border-dashed border-white/10 rounded-3xl">
            <p className="text-zinc-600 font-black text-[10px] uppercase tracking-[0.5em] italic">No active listings in the market yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {items.map((item) => (
              <Link 
                key={item.id} 
                href={`/marketplace/${item.id}`}
                className="group relative bg-[#12141d] border border-white/5 rounded-3xl overflow-hidden hover:border-[#FF42B0]/30 transition-all duration-700 hover:shadow-[0_40px_80px_-40px_rgba(0,0,0,1)]"
              >
                <div className="aspect-[4/3] overflow-hidden bg-zinc-900 relative">
                  {item.image_urls && item.image_urls.length > 0 && (
                    <div className="w-full h-full relative">
                      <Image 
                        src={item.image_urls[0]} 
                        alt={item.title || 'Listing'} 
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-1000 group-hover:scale-110 p-2" 
                      />
                    </div>
                  )}
                  {/* BADGE ALBUM */}
                   <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all shadow-xl font-mono ${
                            item.condition === 'new' ? 'bg-green-500/80 text-white border-green-400' : 'bg-blue-500/80 text-white border-blue-400'
                        }`}>
                        {item.condition}
                        </span>
                  </div>
                </div>
                
                <div className="p-6 space-y-5 relative">
                  <div className="space-y-2">
                    <p className="text-[8px] text-[#FF42B0] font-black uppercase tracking-[0.2em] italic opacity-80">Collector Listing</p>
                    <h2 className="text-sm font-black text-white italic uppercase tracking-tight line-clamp-2 leading-none group-hover:text-[#FF42B0] transition-colors font-tech">{item.title}</h2>
                  </div>
                  
                  <div className="flex items-end justify-between border-t border-white/5 pt-5 relative z-10">
                    <div className="space-y-1">
                      <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest leading-none font-gaming">Bounty Price:</p>
                      <p className="text-2xl font-black text-white italic tracking-tighter group-hover:text-[#FF42B0] transition-colors font-tech drop-shadow-[0_0_10px_rgba(0,243,255,0.2)]">
                        {formatVND(item.price)}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-500 group-hover:bg-[#FF42B0] group-hover:text-white group-hover:border-transparent transition-all shadow-xl group-hover:scale-110 active:scale-90">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
