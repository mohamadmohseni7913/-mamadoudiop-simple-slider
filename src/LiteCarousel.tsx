import { useState, useEffect, useRef, Children } from "react";
import { CarouselProps } from "./types";

export function LiteCarousel({
    children,
    slidesToShow = 1,
    autoplay = false,
    autoplayInterval = 3000,
    infinite = true,
    mode = "slide",
    showDots = true,
    showArrows = true,
    pauseOnHover = true,
    className = "",
}: CarouselProps) {
    const items = Children.toArray(children);
    const [index, setIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const getSlidesToShow = () => {
        if (typeof slidesToShow === "number") return slidesToShow;
        const width = window.innerWidth;
        const breakpoints = Object.keys(slidesToShow).map(Number).sort((a, b) => b - a);
        for (const bp of breakpoints) {
            if (width >= bp) return slidesToShow[bp];
        }
        return 1;
    };

    const [visibleCount, setVisibleCount] = useState(getSlidesToShow());

    useEffect(() => {
        const handleResize = () => setVisibleCount(getSlidesToShow());
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const total = items.length;
    const maxIndex = infinite ? total : Math.max(0, total - visibleCount);

    const goTo = (newIndex: number) => {
        if (infinite) {
            setIndex(((newIndex % total) + total) % total);
        } else {
            setIndex(Math.max(0, Math.min(newIndex, maxIndex)));
        }
    };

    const next = () => goTo(index + visibleCount);
    const prev = () => goTo(index - visibleCount);

    // Autoplay
    useEffect(() => {
        if (!autoplay || isPaused) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }
        intervalRef.current = setInterval(next, autoplayInterval);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [autoplay, autoplayInterval, index, isPaused, visibleCount]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") next();
            if (e.key === "ArrowLeft") prev();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [index]);

    return (
        <div
            className={`relative overflow-hidden ${className}`}
            onMouseEnter={() => pauseOnHover && setIsPaused(true)}
            onMouseLeave={() => pauseOnHover && setIsPaused(false)}
        >
            <div
                className="flex"
                style={{
                    transform: mode === "slide" ? `translateX(-${(index / visibleCount) * 100}%)` : "none",
                    transition: mode === "slide" ? "transform 0.5s ease" : "none",
                }}
            >
                {items.map((child, i) => (
                    <div
                        key={i}
                        className="flex-shrink-0"
                        style={{
                            width: `${100 / visibleCount}%`,
                            opacity: mode === "fade" ? (Math.abs(i - index) < visibleCount ? 1 : 0) : 1,
                            transition: mode === "fade" ? "opacity 0.6s ease" : "none",
                        }}
                    >
                        {child}
                    </div>
                ))}
            </div>

            {/* Dots */}
            {showDots && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {Array.from({ length: Math.ceil(total / visibleCount) }, (_, i) => (
                        <button title="visible"
                            key={i}
                            onClick={() => goTo(i * visibleCount)}
                            className={`w-2 h-2 rounded-full transition ${i === Math.floor(index / visibleCount) ? "bg-white w-8" : "bg-white/50"
                                }`}
                        />
                    ))}
                </div>
            )}

            {/* Arrows */}
            {showArrows && (
                <>
                    <button
                        onClick={prev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full"
                    >
                        ←
                    </button>
                    <button
                        onClick={next}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full"
                    >
                        →
                    </button>
                </>
            )}
        </div>
    );
}