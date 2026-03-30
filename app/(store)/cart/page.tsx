"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/useCartStore";
import { formatVND } from '@/lib/utils';

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
                <h1 className="text-4xl font-black text-white mb-4 uppercase tracking-widest font-tech italic">YOUR CART IS EMPTY</h1>
                <p className="text-zinc-400 mb-8 text-lg font-medium opacity-60">You haven't added any models to your cart yet.</p>
                <Link
                    href="/"
                    className="px-10 py-5 bg-zinc-800 hover:bg-[#FF42B0] text-white font-black tracking-[0.2em] rounded-md transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,66,176,0.5)] font-gaming text-xs uppercase btn-glossy"
                >
                    CONTINUE SHOPPING
                </Link>
            </div>
        );
    }

    // CART WITH ITEMS
    return (
        <div className="max-w-6xl mx-auto py-12 px-4 relative z-20">
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic mb-12 border-l-4 border-[#FF42B0] pl-6">
                YOUR <span className="text-[#FF42B0]">CART</span>
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* ITEM LIST */}
                <div className="lg:col-span-2 space-y-6">
                    {items.map((item) => (
                        <div key={item.id} className="flex flex-col sm:flex-row items-center gap-6 bg-zinc-950/30 backdrop-blur-[1px] p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all shadow-2xl group">

                            <Link href={`/product/${item.id}`} className="w-full sm:w-32 h-32 bg-zinc-900 rounded-2xl overflow-hidden shrink-0 relative block border border-white/5 shadow-inner">
                                <Image 
                                    src={item.image || 'https://images.unsplash.com/photo-1546213271-73b520a7860b?auto=format&fit=crop&q=80&w=400'} 
                                    alt={item.name} 
                                    fill
                                    quality={100}
                                    priority
                                    className="object-cover group-hover:scale-110 transition-transform duration-700" 
                                />
                            </Link>

                            <div className="flex-1 w-full flex flex-col justify-between h-full py-1">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-pink-500 font-black tracking-widest mb-1 block uppercase font-gaming">1:64 MODEL</span>
                                        <Link href={`/product/${item.id}`}>
                                            <h3 className="text-lg font-black text-white hover:text-[#FF42B0] transition-colors leading-tight uppercase font-tech italic">{item.name}</h3>
                                        </Link>
                                    </div>
                                    <p className="text-xl font-black text-white font-tech italic">{formatVND(item.price)}</p>
                                </div>

                                <div className="flex items-center justify-between mt-8">
                                    <div className="flex items-center bg-white/5 rounded-xl border border-white/10 h-11 overflow-hidden font-tech">
                                        <button 
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                                            className="px-5 h-full text-zinc-400 hover:text-[#FF42B0] hover:bg-[#FF42B0]/10 transition-all text-xl"
                                        >
                                            −
                                        </button>
                                        <span className="text-sm font-black w-10 text-center text-white border-x border-white/5">{item.quantity}</span>
                                        <button 
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                                            disabled={item.quantity >= item.stock}
                                            className="px-5 h-full text-zinc-400 hover:text-[#FF42B0] hover:bg-[#FF42B0]/10 transition-all text-xl disabled:opacity-20 disabled:cursor-not-allowed"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <button 
                                        onClick={() => removeFromCart(item.id)} 
                                        className="text-zinc-500 hover:text-red-500 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Drop Item
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ORDER SUMMARY */}
                <div className="bg-zinc-950/50 backdrop-blur-3xl border border-white/10 p-8 rounded-[2rem] h-fit sticky top-24 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]">
                    <h2 className="text-xl font-black text-white mb-8 tracking-widest font-gaming uppercase border-b border-white/10 pb-4">Check <span className="text-[#FF42B0]">Point</span></h2>

                    <div className="space-y-4 text-zinc-400 border-b border-white/5 pb-8 mb-8 font-medium italic">
                        <div className="flex justify-between items-center text-sm">
                            <span className="uppercase tracking-widest text-[10px] font-black not-italic opacity-60">Subtotal</span>
                            <span className="text-white font-tech">{formatVND(getTotalPrice())}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="uppercase tracking-widest text-[10px] font-black not-italic opacity-60">Shipping</span>
                            <span className="text-white font-tech">LVL UP AT CHECKOUT</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 mb-10">
                        <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em] font-gaming opacity-60">Total Amount Due</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl sm:text-4xl font-black text-[#FF42B0] drop-shadow-[0_0_20px_rgba(255,66,176,0.6)] font-tech italic tracking-tighter whitespace-nowrap">
                                {formatVND(getTotalPrice())}
                            </span>
                        </div>
                    </div>

                    <Link 
                        href="/checkout" 
                        className="block w-full text-center py-6 bg-gradient-to-r from-[#FF42B0] to-[#FF42B0] text-white font-black uppercase tracking-[0.3em] rounded-xl transition-all duration-500 hover:shadow-[0_0_50px_rgba(255,66,176,0.5)] hover:scale-[1.05] active:scale-95 font-gaming text-xs btn-glossy shadow-2xl relative overflow-hidden group/gate"
                    >
                        <span className="relative z-10">PROCEED TO GATE</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/gate:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                    </Link>
                </div>

            </div>
        </div>
    );
}