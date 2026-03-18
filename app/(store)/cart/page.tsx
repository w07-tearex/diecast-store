"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";

export default function CartPage() {
    const { items, updateQuantity, removeFromCart, getTotalPrice } = useCartStore();

    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    // EMPTY CART
    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center relative z-20">
                <h1 className="text-4xl font-black text-white mb-4 uppercase tracking-widest">YOUR CART IS EMPTY</h1>
                <p className="text-zinc-400 mb-8 text-lg">You haven't added any models to your cart yet.</p>
                <Link
                    href="/"
                    className="px-8 py-4 bg-zinc-800 hover:bg-[#FF42B0] text-white font-bold tracking-widest rounded-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,66,176,0.5)]"
                >
                    CONTINUE SHOPPING
                </Link>
            </div>
        );
    }

    // CART WITH ITEMS
    return (
        <div className="max-w-6xl mx-auto py-10 relative z-20">
            <h1 className="text-3xl font-black text-white uppercase tracking-wider mb-10 border-l-4 border-[#FF42B0] pl-4">
                YOUR CART
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                {/* ITEM LIST */}
                <div className="lg:col-span-2 space-y-6">
                    {items.map((item) => (
                        <div key={item._id} className="flex flex-col sm:flex-row items-center gap-6 bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition">

                            <Link href={`/product/${item._id}`} className="w-full sm:w-32 h-32 bg-zinc-800 rounded-xl overflow-hidden shrink-0 group relative block">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                            </Link>

                            <div className="flex-1 w-full flex flex-col justify-between h-full">
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <span className="text-xs text-zinc-500 font-bold tracking-widest mb-1 block">1:64 MODEL</span>
                                        <Link href={`/product/${item._id}`}>
                                            <h3 className="text-lg font-bold text-zinc-100 line-clamp-2 hover:text-[#FF42B0] transition">{item.name}</h3>
                                        </Link>
                                    </div>
                                    <p className="text-lg text-white font-bold">${item.price.toFixed(2)}</p>
                                </div>

                                <div className="flex items-center justify-between mt-6">
                                    <div className="flex items-center bg-zinc-950 rounded-lg border border-zinc-700 h-10">
                                        <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="px-4 h-full text-zinc-400 hover:text-white transition">-</button>
                                        <span className="text-sm font-bold w-8 text-center text-white">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="px-4 h-full text-zinc-400 hover:text-white transition">+</button>
                                    </div>

                                    <button onClick={() => removeFromCart(item._id)} className="text-zinc-500 hover:text-red-500 flex items-center gap-2 text-sm font-medium transition">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ORDER SUMMARY */}
                <div className="bg-zinc-900/80 border border-zinc-800 p-8 rounded-3xl h-fit sticky top-24 shadow-2xl">
                    <h2 className="text-xl font-bold text-white mb-6 tracking-wide">ORDER SUMMARY</h2>

                    <div className="space-y-4 text-zinc-400 border-b border-zinc-800 pb-6 mb-6">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span className="text-white font-medium">${getTotalPrice().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping:</span>
                            <span className="text-white font-medium">Calculated at checkout</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-end mb-8">
                        <span className="text-lg text-zinc-300">Total:</span>
                        <span className="text-4xl font-black text-[#FF42B0] drop-shadow-[0_0_10px_rgba(255,66,176,0.3)]">
                            ${getTotalPrice().toFixed(2)}
                        </span>
                    </div>

                    <Link href="/checkout" className="block w-full text-center py-4 bg-[#D42A7B] hover:bg-[#FF42B0] text-white font-bold uppercase tracking-widest rounded-xl transition-all duration-300 hover:shadow-[0_0_25px_rgba(255,66,176,0.5)] hover:scale-[1.02]">
                        PROCEED TO CHECKOUT
                    </Link>
                </div>

            </div>
        </div>
    );
}