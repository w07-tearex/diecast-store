"use client";
import React, { useState, useEffect } from 'react';

export default function HeroBanner() {
    const [rotation, setRotation] = useState(0);

    const images = [
        "https://horizondiecast.com/cdn/shop/files/1762497491297_15697815726795106_1ff22955-d1f3-4766-a66d-2f13e9ab30a5_1800x1800.jpg?v=1762548201",
        "https://horizondiecast.com/cdn/shop/files/Image_20241207004853152_1800x1800.jpg?v=1733554688",
        "https://horizondiecast.com/cdn/shop/files/8531755763282_.pic_1800x1800.jpg?v=1755974475",
        "https://horizondiecast.com/cdn/shop/files/14181748336329_.pic_1800x1800.jpg?v=1748362508",
        "https://horizondiecast.com/cdn/shop/files/1758792728389_969610978876957_1800x1800.jpg?v=1759001481",
        "https://horizondiecast.com/cdn/shop/files/WhatsApp_Image_2025-03-08_at_12.43.12_PM_1800x1800.jpg?v=1762745155",
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setRotation(prev => prev - 0.15); // Tốc độ xoay chậm, mượt
        }, 16);
        return () => clearInterval(interval);
    }, []);

    const angle = 360 / images.length;

    return (
        // Dùng pt-20 pb-16 để đẩy khoảng cách, bỏ hoàn toàn các class màu nền đen
        <div className="relative w-full min-h-[700px] flex flex-col items-center pt-20 pb-16 overflow-hidden bg-transparent">

            {/* 1. Tiêu đề - Đã hạ xuống bằng cách bỏ absolute, dùng margin-bottom đẩy vòng xoay */}
            <div className="text-center z-20 mb-16 px-4">
                <h1 className="text-5xl md:text-8xl font-black italic text-white uppercase tracking-tighter">
                    START YOUR <span className="text-[#FF42B0] drop-shadow-[0_0_15px_rgba(255,66,176,0.4)]">COLLECTION</span>
                </h1>
                <p className="text-zinc-400 mt-4 text-sm md:text-base uppercase tracking-widest font-medium">
                    Premium 1:64 scale diecast model cars
                </p>
            </div>

            {/* 2. Container 3D - Đã thu nhỏ Card lại (w-[400px] thay vì 500px) */}
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
                            className="absolute inset-0 rounded-2xl overflow-hidden border border-white/20 shadow-[0_0_30px_rgba(0,0,0,0.6)] bg-zinc-900/80"
                            style={{
                                // Ép translateZ về 450px cho vừa với vòng xoay nhỏ hơn
                                transform: `rotateY(${i * angle}deg) translateZ(450px)`,
                                backfaceVisibility: 'hidden',
                            }}
                        >
                            <img src={src} className="w-full h-full object-cover" alt="car" />
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. Trả lại Button nằm ngay ngắn phía dưới */}
            <button className="relative z-20 px-10 py-4 bg-[#D42A7B] hover:bg-[#FF42B0] text-white font-extrabold tracking-widest rounded-full transition-all duration-300 hover:scale-105 shadow-[0_5px_15px_rgba(0,0,0,0.3)] hover:shadow-[0_0_25px_rgba(255,66,176,0.5)] uppercase text-sm">
                VIEW ALL MODELS
            </button>

            {/* ĐÃ XÓA SẠCH HAI CÁI DIV GRADIENT GÂY RA NỀN ĐEN BÊN CẠNH */}
        </div>
    );
}