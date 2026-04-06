"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { ConditionBadge } from "@/components/ConditionBadge";

type ProductGalleryProps = {
  images: string[];
  /** Same scale badge as product cards (default 1:64). */
  scaleLabel?: string;
  condition?: string | null;
};

export default function ProductGallery({
  images,
  scaleLabel = "LVL 1:64",
  condition,
}: ProductGalleryProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loaded, setLoaded] = useState(false);

    const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
        initial: 0,
        loop: true,
        slideChanged(slider) {
            setCurrentSlide(slider.track.details.rel);
        },
        created() {
            setLoaded(true);
        },
    }, [
        (slider) => {
            let timeout: ReturnType<typeof setTimeout>;
            let mouseOver = false;
            
            function clearNextTimeout() {
                clearTimeout(timeout);
            }
            
            function nextTimeout() {
                clearTimeout(timeout);
                if (mouseOver) return;
                timeout = setTimeout(() => {
                    slider.next();
                }, 4000);
            }
            
            slider.on("created", () => {
                slider.container.addEventListener("mouseover", () => {
                    mouseOver = true;
                    clearNextTimeout();
                });
                slider.container.addEventListener("mouseout", () => {
                    mouseOver = false;
                    nextTimeout();
                });
                nextTimeout();
            });
            slider.on("dragStarted", clearNextTimeout);
            slider.on("animationEnded", nextTimeout);
            slider.on("updated", nextTimeout);
        },
    ]);

    if (!images || images.length === 0) return <div className="aspect-[3/2] bg-zinc-900 rounded-lg"></div>;

    return (
        <div className="space-y-4">
            <div className="relative aspect-[3/2] bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 group cursor-grab">
                <div ref={sliderRef} className="keen-slider h-full">
                    {images.map((img, i) => (
                        <div key={i} className="keen-slider__slide h-full w-full relative">
                            <Image
                                src={img}
                                alt={`Product Detail ${i}`}
                                fill
                                priority={i === 0}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                                className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                            />
                        </div>
                    ))}
                </div>

                <div className="absolute top-4 left-4 z-20 pointer-events-none">
                    <span className="bg-[#FF42B0] text-black text-[9px] font-black px-3 py-1 rounded-sm shadow-[4px_4px_0_0_rgba(0,0,0,0.5)] uppercase tracking-widest font-gaming">
                        {scaleLabel}
                    </span>
                </div>
                <div className="absolute top-4 right-4 z-20 pointer-events-none">
                    <ConditionBadge condition={condition ?? "new"} />
                </div>

                {/* Left Arrow */}
                {loaded && instanceRef.current && images.length > 1 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); instanceRef.current?.prev(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-zinc-900/80 hover:bg-[#FF42B0] text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 shadow-xl border border-white/10"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                )}

                {/* Right Arrow */}
                {loaded && instanceRef.current && images.length > 1 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); instanceRef.current?.next(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-zinc-900/80 hover:bg-[#FF42B0] text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 shadow-xl border border-white/10"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                    {images.map((imgUrl, index) => (
                        <div
                            key={index}
                            onClick={() => instanceRef.current?.moveToIdx(index)}
                            className={`p-[2px] rounded-lg cursor-pointer transition-all duration-300 ${currentSlide === index
                                ? 'bg-gradient-to-br from-[#FF42B0] to-[#E52292] shadow-[0_0_15px_rgba(255,66,176,0.6)] opacity-100 scale-105'
                                : 'bg-zinc-800 opacity-50 hover:opacity-100 hover:bg-zinc-600'
                                }`}
                        >
                            <div className="relative aspect-[3/2] bg-zinc-900 rounded-[6px] overflow-hidden h-full">
                                <Image 
                                    src={imgUrl} 
                                    alt={`Thumbnail ${index}`} 
                                    fill
                                    sizes="100px"
                                    className="object-cover" 
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}