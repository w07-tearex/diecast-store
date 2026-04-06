import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatVND } from '@/lib/utils'
import WithdrawListingButton from '@/components/WithdrawListingButton'

type MarketItemRow = {
  id: string
  title?: string
  price?: number
  status?: string
  image_urls?: string[]
}

async function getMyListings(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('market_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) return []
  return (data || []) as MarketItemRow[]
}

export default async function MyMarketplaceListingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?next=/marketplace/my')

  const items = await getMyListings(user.id)

  return (
    <div className="min-h-screen bg-[#0b0d17] py-20 px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black italic text-white uppercase tracking-tighter">
              MY <span className="text-[#FF42B0]">LISTINGS</span>
            </h1>
            <p className="text-zinc-500 font-medium uppercase tracking-[0.2em] text-[10px] italic">
              Listings you submitted to the P2P marketplace
            </p>
          </div>
          <Link
            href="/marketplace/submit"
            className="group relative px-10 py-5 bg-[#FF42B0] hover:bg-[#E52292] text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all duration-500 hover:scale-105 shadow-[0_20px_40px_-15px_rgba(255,66,176,0.4)] italic"
          >
            Submit New
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center border border-dashed border-white/10 rounded-3xl">
            <p className="text-zinc-600 font-black text-[10px] uppercase tracking-[0.5em] italic">
              No listings yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => {
              const status = (item.status || '').toLowerCase()
              const disableWithdraw = status !== 'pending'
              return (
                <div
                  key={item.id}
                  className="group relative bg-[#12141d] border border-white/5 rounded-3xl overflow-hidden hover:border-[#FF42B0]/30 transition-all duration-700 hover:shadow-[0_40px_80px_-40px_rgba(0,0,0,1)]"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-zinc-900 relative">
                    {item.image_urls && item.image_urls.length > 0 ? (
                      <div className="w-full h-full relative">
                        <Image
                          src={item.image_urls[0]}
                          alt={item.title || 'Listing'}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-110 p-2"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-600 font-black">
                        NO IMAGE
                      </div>
                    )}
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <p className="text-[8px] text-[#FF42B0] font-black uppercase tracking-[0.2em] italic opacity-80">
                        Status
                      </p>
                      <div className="text-sm font-black text-white italic uppercase tracking-tight line-clamp-2">
                        {item.title}
                      </div>
                    </div>

                    <div className="flex justify-between items-end border-t border-white/5 pt-4">
                      <div className="space-y-1">
                        <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest leading-none font-gaming">
                          Price
                        </p>
                        <p className="text-2xl font-black text-white italic tracking-tighter drop-shadow-[0_0_10px_rgba(0,243,255,0.2)] font-tech">
                          {formatVND(item.price)}
                        </p>
                      </div>

                      <WithdrawListingButton
                        listingId={item.id}
                        disabled={disableWithdraw}
                      />
                    </div>

                    <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em] opacity-70">
                      Mod: {item.status}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

