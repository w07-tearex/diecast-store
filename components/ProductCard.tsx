"use client";

import Link from 'next/link';
import Image from 'next/image';
import React, { useState, memo } from 'react';
import { useCartStore } from '@/store/useCartStore';
import toast from 'react-hot-toast';
import { formatVND } from '@/lib/utils';

interface ProductCardProps {
    product: any;
    imageUrl: string;
}

const ProductCard = memo(({ product, imageUrl }: ProductCardProps) => {
    const addToCart = useCartStore((state) => state.addToCart);
    const stock = product.stock ?? 10;
    const isOutOfStock = stock <= 0;
    const [qty, setQty] = useState(1);

    const stopNav = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleIncrease = (e: React.MouseEvent) => {
        stopNav(e);
        if (isOutOfStock) return;
        if (qty < stock) {
            setQty(prev => prev + 1);
        } else {
            toast.error(`Only ${stock} items left in stock!`, {
                style: { background: '#18181b', color: '#f87171', border: '1px solid #7f1d1d' }
            });
        }
    };

    const handleDecrease = (e: React.MouseEvent) => {
        stopNav(e);
        if (isOutOfStock) return;
        if (qty > 1) setQty(prev => prev - 1);
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        stopNav(e);
        if (isOutOfStock) {
            toast.error("Product sold out!");
            return;
        }

        addToCart({
            id: product.id || product._id,
            name: product.name,
            price: product.price,
            image: imageUrl,
            stock: stock
        }, qty);
        
        toast.success(`Added ${qty} ${product.name} to cart!`, {
            icon: '🔥',
            style: { 
                background: '#18181b', 
                color: '#fff', 
                border: '1px solid #FF42B0',
                fontSize: '12px',
                fontWeight: 'bold'
            }
        });
        
        setQty(1);
    };

    return (
        <Link
            href={`/product/${product.id || product._id}`}
            className={`group block p-[1px] rounded-2xl transition-all duration-500 relative ${
                isOutOfStock
                ? 'opacity-60 cursor-not-allowed'
                : 'hover:shadow-[0_0_30px_rgba(255,66,176,0.3)]'
            }`}
        >
            <div className="bg-[#0d1117] rounded-[15px] overflow-hidden h-full flex flex-col relative border-2 border-white/5 group-hover:border-[#FF42B0]/50 transition-colors">
                {/* 1. Image Container with Neon Border Effect */}
                <div className="relative aspect-[4/3] bg-zinc-900/50 overflow-hidden flex items-center justify-center m-2 rounded-xl group-hover:rounded-none group-hover:m-0 transition-all duration-300">
                    {imageUrl && (
                        <Image
                            src={imageUrl}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className={`object-cover transition-all duration-700 ease-out ${
                                isOutOfStock ? 'grayscale blur-[2px]' : 'group-hover:scale-110 group-hover:rotate-1'
                            }`}
                        />
                    )}

                    {/* Badge Style: Level/Scale */}
                    <div className="absolute top-3 left-3 z-40">
                        <span className="bg-[#FF42B0] text-black text-[9px] font-black px-3 py-1 rounded-sm shadow-[4px_4px_0_0_rgba(0,0,0,0.5)] uppercase tracking-widest font-gaming">
                            LVL 1:64
                        </span>
                    </div>
                </div>

                {/* 2. Content */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between relative z-20">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]">
                            <span className="text-[#FF42B0] drop-shadow-[0_0_8px_rgba(255,66,176,0.4)]">{product.brand || 'Premium'}</span>
                            <span className={stock < 5 ? 'text-orange-500 blink-slow' : 'text-[#10b981] drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]'}>
                                {isOutOfStock ? 'DEAD' : `HP: ${stock}`}
                            </span>
                        </div>
                        <h3 className="text-sm font-bold text-zinc-100 line-clamp-2 leading-tight group-hover:text-white transition-colors font-tech uppercase tracking-tight">
                            {product.name}
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {/* Dedicated Price Row: Full width to prevent symbol truncation */}
                        <div className="flex flex-col">
                            <span className="text-[9px] text-zinc-500 font-black font-gaming uppercase tracking-widest leading-none mb-1 opacity-60">Value Asset</span>
                            <span 
                                className={`text-xl font-black italic tracking-tighter font-tech truncate block ${isOutOfStock ? 'text-zinc-700' : 'text-[#FF42B0] drop-shadow-[0_0_10px_rgba(255, 66, 176, 0.4)]'}`}
                                title={formatVND(product.price)}
                            >
                                {formatVND(product.price)}
                            </span>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between gap-3">
                                {/* Quantity Selector - Optimized for Side-by-Side */}
                                {!isOutOfStock && (
                                    <div className="flex items-center bg-zinc-900 border border-white/5 rounded-lg overflow-hidden h-9 font-tech">
                                        <button 
                                            onClick={handleDecrease}
                                            className="px-2.5 h-full hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
                                        >
                                            −
                                        </button>
                                        <span className="text-[10px] font-black w-6 text-center text-white">
                                            {qty}
                                        </span>
                                        <button 
                                            onClick={handleIncrease}
                                            className="px-2.5 h-full hover:bg-[#FF42B0]/10 text-zinc-400 hover:text-[#FF42B0] transition-all"
                                        >
                                            +
                                        </button>
                                    </div>
                                )}

                                <button
                                    onClick={handleAddToCart}
                                    disabled={isOutOfStock}
                                    className={`flex-1 h-9 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 font-gaming relative overflow-hidden group/btn shadow-[4px_4px_0_0_rgba(0,0,0,0.5)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                                        isOutOfStock
                                        ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                        : 'bg-white text-black hover:bg-[#FF42B0] hover:text-black border border-white/10 transition-colors'
                                    }`}
                                >
                                    {!isOutOfStock && (
                                        <div className="w-4 h-4 bg-black/10 rounded-full flex items-center justify-center border border-black/10 text-[8px] group-hover/btn:bg-white/20 group-hover/btn:text-white transition-colors">B</div>
                                    )}
                                    <span className="relative z-10">{isOutOfStock ? 'GAME OVER' : 'ADD TO BAG'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
});

export default ProductCard;