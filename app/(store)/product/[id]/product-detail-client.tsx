'use client';

import { useState } from 'react';
import Link from 'next/link';
import { urlForLarge } from '@/lib/utils';
import { useCartStore } from '@/store/useCartStore';
import ProductGallery from '@/components/ProductGallery';
import toast from 'react-hot-toast';

interface ProductDetailClientProps {
  product: any;
  relatedProducts?: any[];
}

export default function ProductDetailClient({ product, relatedProducts = [] }: ProductDetailClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);

  const mainImgUrl = product.image ? urlForLarge(product.image) : '';
  const galleryUrls = product.gallery ? product.gallery.map((img: any) => urlForLarge(img)) : [];
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
      toast.success(`Added ${quantity} item${quantity > 1 ? 's' : ''} to cart`);
      setQuantity(1);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <nav className="text-sm text-zinc-500 flex items-center space-x-2">
        <Link href="/" className="hover:text-zinc-300 transition">
          Home
        </Link>
        <span>/</span>
        <span>1/64 scale</span>
        <span>/</span>
        <span className="text-zinc-300 truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-10">
          <ProductGallery images={allImages} />

          <div className="space-y-4 pt-6 border-t border-zinc-800">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">Description</h3>
            <div className="text-zinc-400 text-sm space-y-2 leading-relaxed whitespace-pre-line">
              {product.description || 'Description coming soon...'}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 relative">
          <div className="sticky top-24 space-y-8">
            <div className="space-y-4">
              <h1 className="text-2xl sm:text-3xl font-medium text-white leading-snug">
                1/64 {product.name} - {product.brand}
              </h1>
              <p className="text-3xl font-light text-red-500">
                ${product.price ? product.price.toFixed(2) : '0.00'}
              </p>
              {isOutOfStock && <p className="text-sm font-medium text-red-400">Out of Stock</p>}
              {!isOutOfStock && (
                <p className="text-sm font-medium text-green-400">In Stock ({product.stock} available)</p>
              )}
            </div>

            <div className="space-y-6 pt-6 border-t border-zinc-800">
              <div className="space-y-3">
                <label className="text-sm font-medium text-zinc-400">Quantity</label>
                <div className="flex space-x-4">
                  <div className="flex border border-zinc-700 rounded bg-zinc-900 items-center w-32">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={isOutOfStock}
                      className="flex-1 py-2 text-zinc-400 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className="w-10 text-center bg-transparent text-white font-medium border-x border-zinc-700 focus:outline-none"
                    />
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={isOutOfStock}
                      className="flex-1 py-2 text-zinc-400 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAddingToCart}
                className="w-full bg-white text-zinc-950 hover:bg-zinc-200 font-bold py-4 px-8 rounded transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingToCart ? 'Adding...' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
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
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel: any) => {
              const relImg = rel.image ? urlForLarge(rel.image) : '';
              return (
                <Link 
                  key={rel._id} 
                  href={`/product/${rel._id}`}
                  className="group block space-y-3"
                >
                  <div className="aspect-[3/2] bg-zinc-900 rounded-lg overflow-hidden relative border-2 border-pink-500/10 group-hover:border-pink-500/40 group-hover:shadow-[0_0_15px_rgba(236,72,153,0.2)] transition-all duration-300">
                    {relImg && (
                      <img 
                        src={relImg} 
                        alt={rel.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                      />
                    )}
                    {rel.stock === 0 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-[10px] font-black tracking-widest bg-red-600 text-white px-2 py-1 rounded">SOLD OUT</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-zinc-200 group-hover:text-pink-500 transition line-clamp-2 min-h-[40px]">
                      {rel.name}
                    </h3>
                    <p className="text-lg font-bold text-white">${rel.price?.toFixed(2)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
