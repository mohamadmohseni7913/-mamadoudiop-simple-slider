// src/Swiper.tsx
import  { useState, useEffect, Children, type ReactNode } from "react";

export interface SwiperProps {
    children: ReactNode[];
    /** تعداد اسلاید همزمان */
    slidesPerView?: number | "auto";
    /** فاصله بین اسلایدها (px) */
    spaceBetween?: number;
    /** اسلاید وسط بزرگ‌تر بشه (مثل اینستاگرام/تیندر) */
    centeredSlides?: boolean;
    /** لوپ بی‌نهایت */
    loop?: boolean;
    /** پخش خودکار */
    autoplay?: boolean | { delay?: number; disableOnInteraction?: boolean };
    /** نوع انیمیشن */
    effect?: "slide" | "fade" | "coverflow";
    /** تنظیمات افکت Coverflow */
    coverflow?: {
        rotate?: number;
        stretch?: number;
        depth?: number;
        scale?: number;
    };
    /** نمایش دات‌ها */
    pagination?: boolean;
    /** نمایش فلش‌ها */
    navigation?: boolean;
    /** کلاس کانتینر */
    className?: string;
}

export function Swiper({
    children,
    slidesPerView = 1,
    spaceBetween = 0,
    centeredSlides = false,
    loop = false,
    autoplay = false,
    effect = "slide",
    coverflow: coverflowProp,
    pagination = true,
    navigation = true,
    className = "",
}: SwiperProps) {
    const items = Children.toArray(children);
    const [activeIndex, setActiveIndex] = useState(0);

    // تنظیمات پیش‌فرض coverflow + merge با props کاربر
    const coverflow = {
        rotate: 50,
        stretch: 0,
        depth: 100,
        scale: 0.85,
        ...(coverflowProp ?? {}),
    };

    const totalSlides = items.length;
    const autoplayDelay = typeof autoplay === "object" ? autoplay.delay ?? 3000 : 3000;

    // محاسبه تعداد اسلایدهای قابل نمایش
    const getSlidesPerView = () => {
        if (slidesPerView === "auto") return totalSlides;
        return typeof slidesPerView === "number" ? slidesPerView : 1;
    };
    const slidesToShow = getSlidesPerView();

    // حرکت به اسلاید بعدی/قبلی
    const goTo = (index: number) => {
        let newIndex = index;
        if (loop) {
            newIndex = ((index % totalSlides) + totalSlides) % totalSlides;
        } else {
            newIndex = Math.max(0, Math.min(index, totalSlides - slidesToShow));
        }
        setActiveIndex(newIndex);
    };

    const next = () => goTo(activeIndex + 1);
    const prev = () => goTo(activeIndex - 1);

    // Autoplay
    useEffect(() => {
        if (!autoplay) return;
        const id = setInterval(next, autoplayDelay);
        return () => clearInterval(id);
    }, [activeIndex, autoplay, autoplayDelay]);

    // Keyboard support
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") next();
            if (e.key === "ArrowLeft") prev();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [activeIndex]);

    // استایل مخصوص Coverflow
    const getCoverflowStyle = (index: number) => {
        if (effect !== "coverflow" || !centeredSlides) return {};

        const diff = index - activeIndex;
        const absDiff = Math.abs(diff);

        if (absDiff === 0) {
            return {
                transform: "translateZ(0px) scale(1)",
                zIndex: 10,
                opacity: 1,
            };
        }

        const rotateY = diff > 0 ? coverflow.rotate : -coverflow.rotate;
        const translateZ = absDiff * coverflow.depth;
        const scale = Math.pow(coverflow.scale, absDiff);

        return {
            transform: `perspective(1200px) rotateY(${rotateY}deg) translateZ(-${translateZ}px) scale(${scale})`,
            zIndex: 10 - absDiff,
            opacity: 1 - absDiff * 0.3,
        };
    };

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* اسلایدر اصلی */}
            <div
                className="flex transition-transform duration-600 ease-out"
                style={{
                    transform:
                        effect === "slide"
                            ? `translateX(-${activeIndex * (100 / slidesToShow)}%)`
                            : "none",
                    gap: `${spaceBetween}px`,
                }}
            >
                {items.map((child, i) => (
                    <div
                        key={i}
                        className="flex-shrink-0 transition-all duration-600"
                        style={{
                            width: slidesPerView === "auto" ? "auto" : `${100 / slidesToShow}%`,
                            ...(effect === "coverflow" && centeredSlides ? getCoverflowStyle(i) : {}),
                        }}
                    >
                        {child}
                    </div>
                ))}
            </div>

            {/* فلش‌های ناوبری */}
            {navigation && (
                <>
                    <button
                        onClick={prev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 text-white w-12 h-12 rounded-full flex items-center justify-center text-3xl backdrop-blur-sm"
                        aria-label="Previous"
                    >
                        ‹
                    </button>
                    <button
                        onClick={next}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 text-white w-12 h-12 rounded-full flex items-center justify-center text-3xl backdrop-blur-sm"
                        aria-label="Next"
                    >
                        ›
                    </button>
                </>
            )
            }

            {/* دات‌های پایین */}
            {pagination && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                    {Array.from({ length: totalSlides }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => goTo(i)}
                            className={`transition-all duration-300 ${i === activeIndex
                                    ? "bg-white w-10 h-3 rounded-full"
                                    : "bg-white/50 w-3 h-3 rounded-full hover:bg-white/80"
                                }`}
                            aria-label={`Go to slide ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}