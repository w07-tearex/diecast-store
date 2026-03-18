"use client";

import { useState } from "react";

export default function ProductGallery({ images }: { images: string[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);
    const prevImage = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

    if (!images || images.length === 0) return <div className="aspect-[3/2] bg-zinc-900 rounded-lg"></div>;

    return (
        <div className="space-y-4">
            <div className="relative aspect-[3/2] bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 group cursor-crosshair">
                <img
                    src={images[currentIndex]}
                    alt="Product Detail"
                    className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-125"
                />

                <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-zinc-900/80 hover:bg-red-600 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 shadow-lg"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-zinc-900/80 hover:bg-red-600 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 shadow-lg"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {images.map((imgUrl, index) => (
                    <div
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`p-[2px] rounded-lg cursor-pointer transition-all duration-300 ${currentIndex === index
                            ? 'bg-gradient-to-br from-orange-400 to-yellow-300 shadow-[0_0_15px_rgba(251,146,60,0.6)] opacity-100 scale-105'
                            : 'bg-zinc-800 opacity-50 hover:opacity-100 hover:bg-zinc-600'
                            }`}
                    >
                        <div className="relative aspect-[3/2] bg-zinc-900 rounded-[6px] overflow-hidden h-full">
                            <img src={imgUrl} alt={`Thumbnail ${index}`} className="w-full h-full object-cover" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}