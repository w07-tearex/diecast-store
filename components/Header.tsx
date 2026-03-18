"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { createBrowserClient } from '@supabase/ssr';
import toast from 'react-hot-toast';

export default function Header() {
    const totalItems = useCartStore((state: any) => state.getTotalItems());
    const clearCart = useCartStore((state: any) => state.clearCart());
    const [isMounted, setIsMounted] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [showUserMenu, setShowUserMenu] = useState(false);
    
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        setIsMounted(true);
        const getUser = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          setUser(user);
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [supabase.auth]);

    const handleConfirmClear = () => {
        clearCart();
        toast.success("Cart cleared successfully!");
        setShowConfirmModal(false);
    };

    return (
        <>
            <header className="relative w-full bg-[#0b0d17]/95 backdrop-blur-md border-b border-white/10 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-black tracking-tighter text-white uppercase transition-all duration-300 cursor-pointer shrink-0 hover:drop-shadow-[0_0_15px_rgba(255,66,176,0.8)]">
                        DIECAST<span className="text-[#FF42B0]">STORE</span>
                    </Link>

                    <div className="flex items-center gap-6 shrink-0">
                        {isMounted && user ? (
                            <div className="relative">
                                <button 
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2 group p-1 rounded-full hover:bg-white/5 transition"
                                >
                                    <img 
                                        src={user.user_metadata.avatar_url} 
                                        alt={user.user_metadata.full_name} 
                                        className="w-10 h-10 rounded-full border-2 border-transparent group-hover:border-[#FF42B0] transition"
                                    />
                                    <span className="text-zinc-400 group-hover:text-white transition-colors text-sm font-bold uppercase tracking-wider hidden sm:block">
                                        {user.user_metadata.full_name?.split(' ')[0]}
                                    </span>
                                </button>

                                {showUserMenu && (
                                    <div className="absolute right-0 mt-3 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                                        <div className="px-4 py-3 border-b border-zinc-800">
                                            <p className="text-xs text-zinc-500 uppercase font-black">Account</p>
                                            <p className="text-sm font-bold text-white truncate">{user.email}</p>
                                        </div>
                                        <Link 
                                            href="/orders" 
                                            className="block px-4 py-3 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            My Orders
                                        </Link>
                                        <button 
                                            onClick={async () => {
                                                await supabase.auth.signOut();
                                                setIsMounted(false);
                                                window.location.reload();
                                            }}
                                            className="w-full text-left px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            isMounted && (
                                <Link
                                    href="/api/auth/google"
                                    className="text-xs font-black uppercase text-zinc-400 hover:text-[#FF42B0] tracking-[0.2em] transition-colors flex items-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256"><path d="M228,128a100.11,100.11,0,0,1-100,100C72.76,228,28,183.24,28,128S72.76,28,128,28a99.4,99.4,0,0,1,69.56,27.35,8,8,0,0,1,0,11.31L183.3,81a8,8,0,0,1-10.93.36,68,68,0,1,0,21.14,54.6H128a8,8,0,0,1-8-8v-24a8,8,0,0,1,8-8h88A8,8,0,0,1,228,128Z"></path></svg>
                                    SIGN IN
                                </Link>
                            )
                        )}

                        <div className="flex items-center gap-3 border-l border-white/10 pl-6">
                            {isMounted && totalItems > 0 && (
                                <button
                                    onClick={() => setShowConfirmModal(true)}
                                    title="Clear entire cart"
                                    className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            )}

                            <Link
                                href="/cart"
                                className="group bg-[#D42A7B] hover:bg-[#FF42B0] text-white px-5 py-2 rounded-md text-sm font-bold transition-all duration-300 flex items-center space-x-2 hover:shadow-[0_0_20px_rgba(255,66,176,0.5)]"
                            >
                                <span>CART</span>
                                <span className="bg-white text-[#A81A71] group-hover:text-[#FF42B0] px-2 py-0.5 rounded-full text-xs transition-colors duration-300">
                                    {isMounted ? totalItems : 0}
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {showConfirmModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
                    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-white mb-2">Confirmation</h3>
                        <p className="text-zinc-400 mb-6">Are you sure you want to clear your entire cart?</p>

                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmClear}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}