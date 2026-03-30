'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import ProductGallery from '@/components/ProductGallery';
import ProductCard from '@/components/ProductCard';
import toast from 'react-hot-toast';
import { formatVND } from '@/lib/utils';

interface ProductDetailClientProps {
  product: any;
  relatedProducts?: any[];
}

export default function ProductDetailClient({ product, relatedProducts = [] }: ProductDetailClientProps) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [product.id]);

  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);

  // Parse mapped URLs directly from Supabase
  const mainImgUrl = product.image_url || '';
  const galleryUrls = product.gallery_urls || [];
  const allImages = mainImgUrl ? [mainImgUrl, ...galleryUrls] : galleryUrls;
  const isOutOfStock = product.stock === 0;
  const maxQuantity = product.stock || 1;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (isOutOfStock) {
      toast.error('Out of stock');
      return;
    }

    setIsAddingToCart(true);
    try {
      addToCart(product, quantity);
      toast.success(`Added ${quantity} item(s) to cart!`, {
        icon: '🛒',
        style: { 
          background: '#18181b', 
          color: '#fff', 
          border: '1px solid #FF42B0',
          fontSize: '12px'
        }
      });
      setQuantity(1);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24 relative z-20 pt-12">
      <nav className="text-[10px] text-zinc-500 flex items-center space-x-3 font-gaming uppercase tracking-[0.2em] opacity-60">
        <Link href="/" className="hover:text-[#FF42B0] transition-colors">
          COLLECTION
        </Link>
        <span className="text-[#FF42B0]">/</span>
        <span>1:64 SCALE</span>
        <span className="text-[#FF42B0]">/</span>
        <span className="text-zinc-300 truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-7 space-y-12">
          <ProductGallery images={allImages} />

          <div className="space-y-6 pt-10 border-t border-white/5">
            <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] font-gaming flex items-center gap-3">
                <span className="w-2 h-2 bg-[#FF42B0] rotate-45"></span>
                Description
            </h3>
            <div className="text-zinc-400 text-sm space-y-4 leading-relaxed font-medium italic opacity-80">
              {product.description || 'Rare specimen description coming soon to the database...'}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 relative">
          <div className="sticky top-32 space-y-10 bg-zinc-950/30 border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-3xl shadow-2xl overflow-hidden group">
            {/* High-Fidelity Racing Pattern Overlay */}
            <div 
                className="absolute inset-0 opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-500 pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23FF42B0' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M10 10l5 5-5 5-5-5zM50 50l5 5-5 5-5-5z'/%3E%3Crect x='30' y='10' width='4' height='4' /%3E%3Crect x='10' y='30' width='4' height='4' /%3E%3Ccircle cx='70' cy='10' r='2' /%3E%3Ccircle cx='10' cy='70' r='2' /%3E%3Cpath d='M70 30l4 4-4 4-4-4z'/%3E%3Cpath d='M30 70l4 4-4 4-4-4z'/%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '80px 80px'
                }}
            />

            <div className="space-y-6 relative z-10">
              <div className="space-y-2">
                <span className="text-[10px] text-pink-500 font-black tracking-widest uppercase font-gaming block mb-1">Authenticated {product.brand}</span>
                <h1 className="text-3xl sm:text-4xl font-black text-white italic tracking-tighter uppercase font-tech leading-none">
                   {product.name}
                </h1>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic opacity-60 font-gaming">Market Price Appraisal:</p>
                <div className="text-3xl sm:text-4xl font-black text-[#FF42B0] italic tracking-tighter font-tech drop-shadow-[0_0_20px_rgba(255,66,176,0.6)] whitespace-nowrap">
                  {formatVND(product.price)}
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                {isOutOfStock ? (
                    <span className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-[10px] font-black uppercase tracking-widest font-gaming blink-slow">OUT OF STOCK</span>
                ) : (
                    <span className="px-4 py-2 bg-[#FF42B0]/10 text-[#FF42B0] border border-[#FF42B0]/20 rounded-full text-[10px] font-black uppercase tracking-widest font-gaming">HP: {product.stock} UNITS AVAILABLE</span>
                )}
              </div>
            </div>

            <div className="space-y-8 pt-8 border-t border-white/5 relative">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] font-gaming block pl-1">Load Quantity</label>
                <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl h-14 overflow-hidden w-fit font-tech">
                    <button
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={isOutOfStock}
                        className="px-6 h-full text-zinc-400 hover:text-[#FF42B0] hover:bg-[#FF42B0]/10 transition disabled:opacity-30 text-xl"
                    >
                        −
                    </button>
                    <input
                        type="text"
                        value={quantity}
                        onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            handleQuantityChange(val);
                        }}
                        className="w-14 text-center bg-transparent text-white font-black text-lg focus:outline-none border-x border-white/5"
                    />
                    <button
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={isOutOfStock}
                        className="px-6 h-full text-zinc-400 hover:text-[#FF42B0] hover:bg-[#FF42B0]/10 transition disabled:opacity-30 text-xl"
                    >
                        +
                    </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAddingToCart}
                className="w-full bg-gradient-to-r from-[#FF42B0] to-[#FF42B0] text-white font-black py-6 px-8 rounded-2xl transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-[0.3em] font-gaming text-xs btn-glossy shadow-[0_20px_50px_-15px_rgba(255,66,176,0.3)] hover:scale-[1.03] active:scale-95 relative overflow-hidden group/add"
              >
                <span className="relative z-10">{isAddingToCart ? 'TRANSMITTING...' : isOutOfStock ? 'MISSION FAILED' : 'ADD TO COLLECTION'}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/add:translate-x-full transition-transform duration-1000 ease-in-out"></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="pt-20 space-y-12">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <h2 className="text-2xl font-bold text-white uppercase tracking-[0.2em]">Related Products</h2>
            <span className="text-zinc-500 text-sm font-mono tracking-widest uppercase">
              By {product.brand}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {relatedProducts.map((rel: any) => {
              const relImg = rel.image_url || '';
              return (
                <ProductCard key={rel.id} product={rel} imageUrl={relImg} />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
