"use client";
import Link from 'next/link';
import { useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import toast from 'react-hot-toast';

export default function ProductCard({ product, imageUrl }: { product: any, imageUrl: string }) {
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
        if (qty < stock) setQty(prev => prev + 1);
        else toast.error(`Only ${stock} available!`);
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
            _id: product._id,
            name: product.name,
            price: product.price,
            image: imageUrl,
            stock: stock
        }, qty);
        setQty(1);
    };

    return (
        <Link
            href={`/product/${product._id}`}
            className={`group block p-[1px] rounded-xl bg-zinc-800 transition-all duration-500 relative ${isOutOfStock
                ? 'opacity-70 cursor-not-allowed'
                : 'hover:bg-gradient-to-br hover:from-orange-400 hover:to-yellow-300 hover:shadow-[0_0_20px_rgba(251,146,60,0.5)] cursor-pointer'
                }`}
        >
            <div className="bg-zinc-900 rounded-[11px] overflow-hidden h-full flex flex-col relative">
                {!isOutOfStock && (
                    <div className="absolute top-0 -left-[150%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-[30deg] z-50 transition-all duration-800 ease-in-out group-hover:left-[200%] pointer-events-none"></div>
                )}

                <div className="relative aspect-[3/2] bg-zinc-800 overflow-hidden flex items-center justify-center">
                    {imageUrl && (
                        <img
                            src={imageUrl}
                            alt={product.name}
                            className={`w-full h-full object-cover transition duration-500 ease-in-out ${isOutOfStock ? 'grayscale' : 'group-hover:scale-110'}`}
                        />
                    )}

                    {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/50 z-30 flex items-center justify-center">
                            <span className="bg-red-600 text-white font-black tracking-widest px-6 py-2 rounded-lg -rotate-12 border-2 border-white shadow-[0_0_20px_rgba(220,38,38,0.8)]">
                                SOLD OUT
                            </span>
                        </div>
                    )}
                </div>

                <div className="p-4 space-y-2 flex-1 relative z-20">
                    <div className="flex justify-between items-center text-xs text-zinc-500 font-medium">
                        <span>1:64</span>
                        <span className="text-zinc-400">Stock: {stock}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-200 line-clamp-2 h-10">
                        {product.name}
                    </h3>

                    <div className="flex items-center justify-between pt-2">
                        <span className={`text-lg font-bold ${isOutOfStock ? 'text-zinc-500 line-through' : 'text-white'}`}>
                            ${product.price ? product.price.toFixed(2) : "0.00"}
                        </span>

                        <div className="flex items-center gap-2">
                            <div className={`flex items-center rounded-lg border ${isOutOfStock ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-950 border-zinc-700'}`}>
                                <button onClick={handleDecrease} disabled={isOutOfStock} className="px-2 py-1 text-zinc-500 hover:text-white disabled:opacity-50">-</button>
                                <span className="text-xs font-bold w-4 text-center text-zinc-400">{isOutOfStock ? 0 : qty}</span>
                                <button onClick={handleIncrease} disabled={isOutOfStock} className="px-2 py-1 text-zinc-500 hover:text-white disabled:opacity-50">+</button>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                disabled={isOutOfStock}
                                className={`p-2 rounded-lg transition ${isOutOfStock
                                    ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                    : 'text-zinc-400 hover:text-white bg-zinc-800 hover:bg-[#FF42B0]'
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M222.14,58.87A8,8,0,0,0,216,56H54.68L49.79,29.14A16,16,0,0,0,34.05,16H16a8,8,0,0,0,0,16h18L59.56,172.29a24,24,0,0,0,5.33,11.27,28,28,0,1,0,44.4,8.44h45.42a27.75,27.75,0,0,0-2.71-12h-98.4a8,8,0,0,1-7.16-4.29l-3.23-17.71H195.83a24,24,0,0,0,23.64-19.72l12.16-66.86A8,8,0,0,0,222.14,58.87ZM96,204a12,12,0,1,1-12-12A12,12,0,0,1,96,204Zm96,0a12,12,0,1,1-12-12A12,12,0,0,1,192,204Zm26.31-92.41a8,8,0,0,1-7.88,6.57H72.84L60.5,50.77l-1.44-8h155l-12.16,66.86Z"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}