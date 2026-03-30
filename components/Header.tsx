"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/useCartStore';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Component chuyên dụng cho Avatar với cơ chế Fallback thông minh
const UserAvatar = React.memo(({ user }: { user: any }) => {
    const [imgError, setImgError] = useState(false);
    
    // Ưu tiên lấy avatar_url hoặc picture từ metadata Google
    const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
    const fullName = user.user_metadata?.full_name || "User";
    const initial = fullName.charAt(0).toUpperCase();

    if (!imgError && avatarUrl) {
        return (
            <div className="relative w-10 h-10">
                <Image 
                    src={avatarUrl} 
                    alt={fullName} 
                    fill
                    onError={() => setImgError(true)}
                    className="rounded-full border-2 border-transparent group-hover:border-[#FF42B0] transition-all object-cover"
                />
            </div>
        );
    }

    // Giao diện dự phòng chuyên nghiệp nếu không có ảnh hoặc ảnh lỗi
    return (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF42B0] to-[#E52292] border-2 border-white/20 flex items-center justify-center group-hover:border-[#FF42B0] transition-all shadow-lg">
            <span className="text-white font-black text-sm tracking-tighter italic">{initial}</span>
        </div>
    );
});

export default function Header() {
    const totalItems = useCartStore((state) => state.getTotalItems());
    const clearCart = useCartStore((state) => state.clearCart);
    const [isMounted, setIsMounted] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const router = useRouter();
    
    const supabase = useMemo(() => createClient(), []);

    useEffect(() => {
        setIsMounted(true);
        
        const initUser = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          setUser(user);
        };
        initUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const handleConfirmClear = useCallback(() => {
        clearCart();
        toast.success("Cart wiped clean! Ready for a new haul.");
        setShowConfirmModal(false);
    }, [clearCart]);


    if (!isMounted) return null;

    return (
        <>
            <header className="relative w-full bg-[#0b0d17]/80 backdrop-blur-xl border-b border-white/10 z-50">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#FF42B0] to-transparent opacity-50"></div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-2xl font-black tracking-tighter text-white uppercase transition-all duration-300 cursor-pointer shrink-0 hover:drop-shadow-[0_0_15px_rgba(255,66,176,0.8)] glow-pink">
                            DIECAST<span className="text-[#FF42B0]">STORE</span>
                        </Link>
                        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-md">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]"></div>
                            <span className="text-[9px] font-black text-white uppercase tracking-widest font-gaming opacity-70">Player 1 Ready</span>
                        </div>
                    </div>


                    <div className="flex items-center gap-6 shrink-0">
                        {user ? (
                            <div className="relative">
                                <button 
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-3 group p-1.5 pr-3 rounded-full bg-white/5 border border-white/10 hover:border-[#FF42B0]/40 transition-all shadow-2xl"
                                >
                                    <UserAvatar user={user} />
                                    <div className="text-left hidden md:block">
                                        <p className="text-white text-[10px] font-black uppercase tracking-widest leading-none font-tech">
                                            {user.user_metadata.full_name?.split(' ')[0]}
                                        </p>
                                        <p className="text-zinc-500 text-[9px] mt-1 font-mono uppercase tracking-widest opacity-50">Stage: {totalItems > 5 ? 'Veteran' : 'Rookie'}</p>
                                    </div>
                                </button>
                                {/* ... user menu dropdown remains same ... */}

                                {showUserMenu && (
                                    <div className="absolute right-0 mt-3 w-64 bg-zinc-950/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,1)] py-2 z-50 animate-in fade-in slide-in-from-top-2">
                                        <div className="px-4 py-4 border-b border-white/10 space-y-2">
                                            <p className="text-[10px] text-pink-500 uppercase font-black tracking-[0.2em] italic">Identity</p>
                                            <p className="text-sm font-black text-white truncate uppercase tracking-tight">{user.user_metadata.full_name}</p>
                                            <p className="text-[10px] text-zinc-500 truncate font-medium underline">{user.email}</p>
                                        </div>
                                        <Link 
                                            href="/orders" 
                                            className="block px-4 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-4"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                            Order History
                                        </Link>
                                        
                                        <div className="p-2 pt-0 mt-2">
                                            <button 
                                                onClick={async () => {
                                                    await supabase.auth.signOut();
                                                    window.location.href = '/';
                                                }}
                                                className="w-full text-left px-3 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-red-500 hover:text-white hover:bg-red-600 rounded-xl transition-all flex items-center gap-4"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                                Kill Session
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                href="/api/auth/google"
                                className="group relative overflow-hidden bg-gradient-to-r from-[#FF42B0] to-[#FF42B0] text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_10px_20px_-10px_rgba(255,66,176,0.3)] hover:scale-105 active:scale-95 btn-glossy font-gaming"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M228,128a100.11,100.11,0,0,1-100,100C72.76,228,28,183.24,28,128S72.76,28,128,28a99.4,99.4,0,0,1,69.56,27.35,8,8,0,0,1,0,11.31L183.3,81a8,8,0,0,1-10.93.36,68,68,0,1,0,21.14,54.6H128a8,8,0,0,1-8-8v-24a8,8,0,0,1,8-8h88A8,8,0,0,1,228,128Z"></path></svg>
                                    Sign In
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                            </Link>
                        )}

                        <div className="flex items-center gap-3 border-l border-white/10 pl-6">
                            {totalItems > 0 && (
                                <button
                                    onClick={() => setShowConfirmModal(true)}
                                    title="Wipe entire cart"
                                    className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            )}

                            <Link
                                href="/cart"
                                className="group bg-[#D42A7B] hover:bg-[#FF42B0] text-white px-5 py-2.5 rounded-full text-[10px] font-black tracking-[0.2em] transition-all duration-300 flex items-center space-x-3 hover:shadow-[0_0_20px_rgba(255,66,176,0.6)] hover:scale-105 active:scale-95 shadow-2xl"
                            >
                                <span>CART</span>
                                <span className="bg-white text-[#A81A71] group-hover:text-[#FF42B0] px-2.5 py-0.5 rounded-full text-[10px] font-black transition-colors duration-300">
                                    {totalItems}
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {showConfirmModal && (
                <div className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center p-4 overflow-hidden">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200"></div>
                    
                    <div className="relative bg-[#0d1117] border-2 border-white/10 rounded-[2.5rem] p-10 w-full max-w-sm shadow-[0_0_100px_rgba(255,66,176,0.3)] animate-in zoom-in-95 duration-200 text-center">
                        <div className="w-20 h-20 bg-pink-500/10 rounded-3xl flex items-center justify-center text-pink-500 mb-8 mx-auto shadow-inner border border-pink-500/20">
                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </div>
                        <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter italic">CLEAR CART?</h3>
                        <p className="text-zinc-500 mb-10 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">System will wipe your entire collection. This action is final.</p>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={handleConfirmClear}
                                className="py-5 text-[10px] font-black text-zinc-400 hover:text-white bg-white/5 hover:bg-[#FF42B0] rounded-2xl transition-all hover:shadow-[0_15px_30px_-10px_rgba(255,66,176,0.5)] hover:scale-105 uppercase tracking-widest active:scale-95 group font-gaming"
                            >
                                <span className="relative z-10">Yes</span>
                            </button>
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="py-5 text-[10px] font-black text-zinc-400 hover:text-white bg-white/5 hover:bg-zinc-700 rounded-2xl transition-all hover:shadow-[0_15px_30px_-10px_rgba(255,255,255,0.1)] hover:scale-105 uppercase tracking-widest border border-white/10 active:scale-95 font-gaming"
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}