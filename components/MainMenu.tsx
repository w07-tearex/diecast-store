'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export default function MainMenu() {
    const [searchQuery, setSearchQuery] = useState('');
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
    };

    const menuItems = [
        { name: 'IN STOCK', href: '/products' },
        { name: 'PRE-ORDER', href: '#' },
        { name: 'ACCESSORIES', href: '#' },
        { name: 'MARKETPLACE', href: '/marketplace' }
    ];

    return (
        <nav className="relative w-full bg-[#161b22]/95 backdrop-blur-[1px] border-b border-[#FF42B0]/20 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
                {/* Menus: Stage Select Vibe */}
                <div className="flex items-center space-x-8 text-[11px] font-black tracking-widest text-zinc-400 font-gaming">
                    {menuItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="relative hover:text-[#FF42B0] transition-colors duration-300 group py-1 uppercase flex items-center gap-2"
                        >
                            <span className="w-1 h-1 bg-transparent group-hover:bg-[#FF42B0] rotate-45 transition-all"></span>
                            {item.name}
                            <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-[#FF42B0] transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                    ))}
                    
                    {user ? (
                        <>
                            <Link
                                href="/profile"
                                className="relative hover:text-[#FF42B0] transition-colors duration-300 group py-1 uppercase flex items-center gap-2"
                            >
                                <span className="w-1.5 h-1.5 bg-[#FF42B0] rotate-45 transition-all"></span>
                                MY ACCOUNT
                                <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-[#FF42B0] transition-all duration-300 group-hover:w-full"></span>
                            </Link>
                            <button
                                onClick={handleSignOut}
                                className="relative hover:text-red-500 transition-colors duration-300 group py-1 uppercase flex items-center gap-2 opacity-60 hover:opacity-100"
                            >
                                <span className="w-1 h-1 bg-transparent group-hover:bg-red-500 rotate-45 transition-all"></span>
                                LOGOUT
                                <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-red-500 transition-all duration-300 group-hover:w-full"></span>
                            </button>
                        </>
                    ) : (
                        <Link
                            href="/login"
                            className="relative hover:text-[#FF42B0] transition-colors duration-300 group py-1 uppercase flex items-center gap-2"
                        >
                            <span className="w-1 h-1 bg-transparent group-hover:bg-[#FF42B0] rotate-45 transition-all"></span>
                            LOGIN
                            <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-[#FF42B0] transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                    )}
                </div>

                {/* Nintendo-Style Search Console */}
                <form onSubmit={handleSearch} className="hidden md:block w-80">
                    <div className="relative group flex items-center bg-[#0b0d17] border-2 border-white/10 rounded-sm p-1 shadow-[4px_4px_0_0_rgba(255,66,176,0.2)] focus-within:border-[#FF42B0] focus-within:shadow-[4px_4px_0_0_rgba(255,66,176,0.5)] transition-all">
                        {/* D-Pad Decoration */}
                        <div className="flex flex-col gap-0.5 px-2 border-r border-white/10 opacity-40 group-focus-within:opacity-100 transition-opacity">
                            <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full"></div>
                            <div className="flex gap-0.5">
                                <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full"></div>
                                <div className="w-1.5 h-1.5 bg-[#FF42B0] rounded-sm"></div>
                                <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full"></div>
                            </div>
                            <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full"></div>
                        </div>

                        <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="SEARCH MODELS..."
                            className="flex-1 bg-transparent py-1 px-3 text-[10px] text-white focus:outline-none font-gaming placeholder:text-zinc-800 tracking-widest uppercase"
                        />
                        
                        {/* Console Prompt */}
                        <div className="px-2 text-[10px] font-black text-[#FF42B0] font-gaming animate-pulse group-focus-within:animate-none">
                            {'>'}
                        </div>
                    </div>
                </form>
            </div>
        </nav>
    );
}