"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function HeroBanner() {
    const [rotation, setRotation] = useState(0);
    const requestRef = useRef<number>(undefined);
    const lastTimeRef = useRef<number>(undefined);

    const images = [
        "https://horizondiecast.com/cdn/shop/files/1762497491297_15697815726795106_1ff22955-d1f3-4766-a66d-2f13e9ab30a5_1800x1800.jpg?v=1762548201",
        "https://horizondiecast.com/cdn/shop/files/Image_20241207004853152_1800x1800.jpg?v=1733554688",
        "https://horizondiecast.com/cdn/shop/files/8531755763282_.pic_1800x1800.jpg?v=1755974475",
        "https://horizondiecast.com/cdn/shop/files/14181748336329_.pic_1800x1800.jpg?v=1748362508",
        "https://horizondiecast.com/cdn/shop/files/1758792728389_969610978876957_1800x1800.jpg?v=1759001481",
        "https://horizondiecast.com/cdn/shop/files/WhatsApp_Image_2025-03-08_at_12.43.12_PM_1800x1800.jpg?v=1762745155",
        "https://blackicediecast.com/cdn/shop/files/WhatsAppImage2024-07-26at23.08.00_1_cc085531-c2d7-4bb3-9783-22ec27574ace.jpg?v=1722216100&width=990",
    ];

    useEffect(() => {
        const animate = (time: number) => {
            if (lastTimeRef.current !== undefined) {
                const deltaTime = time - lastTimeRef.current;
                setRotation(prev => prev - (0.009 * deltaTime));
            }
            lastTimeRef.current = time;
            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current !== undefined) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    const angle = 360 / images.length;

    return (
        <div className="relative w-full min-h-[750px] flex flex-col items-center pt-24 pb-16 overflow-hidden bg-transparent pixel-bg font-tech">
            {/* Background scanline overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#FF42B0]/5 to-transparent pointer-events-none"></div>

            {/* 1. Tiêu đề Gaming Style */}
            <div className="text-center z-20 mb-16 px-4 animate-in fade-in slide-in-from-top-10 duration-1000">
                <div className="flex items-center justify-center gap-4 mb-4">
                    <span className="px-2 py-0.5 bg-[#FF42B0] text-black text-[10px] font-black uppercase tracking-[0.2em] font-gaming rounded-sm shadow-[4px_4px_0_0_rgba(255,66,176,0.3)]">Stage 01</span>
                    <span className="px-2 py-0.5 border border-[#FF42B0] text-[#FF42B0] text-[10px] font-black uppercase tracking-[0.2em] font-gaming rounded-sm shadow-[0_0_10px_rgba(0,243,255,0.4)]">1P</span>
                </div>
                <h1 className="text-6xl md:text-9xl font-black italic text-white uppercase tracking-tighter leading-none relative group">
                    START YOUR <br />
                    <span className="text-[#FF42B0] drop-shadow-[0_0_20px_rgba(255,66,176,0.6)] glow-pink inline-block hover:scale-105 transition-transform duration-300">
                        COLLECTION
                    </span>
                    {/* Retro Cursor: Moved out slightly for better spacing */}
                    <span className="inline-block w-4 h-12 md:w-6 md:h-16 bg-[#FF42B0] ml-8 animate-pulse align-middle shadow-[0_0_15px_#FF42B0]"></span>
                </h1>
                <p className="text-zinc-400 mt-6 text-[10px] md:text-xs uppercase tracking-[0.5em] font-black font-gaming opacity-60">
                    High-Octane 1:64 Scale Racing Mods
                </p>
            </div>

            {/* 2. Container 3D Gallery */}
            <div className="relative w-[280px] h-[160px] md:w-[400px] md:h-[240px] z-10 mb-20" style={{ perspective: '2000px' }}>
                <div
                    className="relative w-full h-full"
                    style={{
                        transformStyle: 'preserve-3d',
                        transform: `rotateY(${rotation}deg)`,
                    }}
                >
                    {images.map((src, i) => (
                        <div
                            key={i}
                            className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.8)] bg-zinc-900/80 group"
                            style={{
                                transform: `rotateY(${i * angle}deg) translateZ(450px)`,
                                backfaceVisibility: 'hidden',
                            }}
                        >
                            <Image 
                                src={src} 
                                alt={`Showcase Car ${i}`}
                                fill
                                priority={i < 3}
                                sizes="(max-width: 768px) 280px, 400px"
                                className="object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. Button "Insert Coin" Style */}
            <Link 
                href="/products" 
                className="relative z-20 px-12 py-5 bg-[#D42A7B] text-white font-black tracking-[0.3em] rounded-md transition-all duration-300 hover:bg-[#FF42B0] hover:scale-110 shadow-[8px_8px_0_0_rgba(0,0,0,0.5)] active:translate-x-1 active:translate-y-1 active:shadow-none uppercase text-xs font-gaming btn-glossy flex items-center gap-4 group"
            >
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-[10px] group-hover:bg-white group-hover:text-[#FF42B0] transition-colors">A</div>
                VIEW ALL MODELS
            </Link>

            {/* Floating Pixel Elements */}
            <div className="absolute bottom-20 left-10 w-8 h-8 opacity-20 animate-bounce pointer-events-none">
                <svg viewBox="0 0 24 24" fill="#FF42B0"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </div>
            <div className="absolute top-40 right-20 w-12 h-12 opacity-10 animate-pulse pointer-events-none rotate-45">
                 <svg viewBox="0 0 24 24" fill="#FF42B0"><path d="M12 4v4m0 8v4M4 12h4m8 0h4M6.34 6.34l2.83 2.83m5.66 5.66l2.83 2.83M6.34 17.66l2.83-2.83m5.66-5.66l2.83-2.83"/></svg>
            </div>
        </div>
    );
}