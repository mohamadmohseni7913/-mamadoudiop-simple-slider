// src/types.ts
export type CarouselMode = "slide" | "fade";

export interface CarouselProps {
  children: React.ReactNode[];
  slidesToShow?: number | { [breakpoint: number]: number };
  autoplay?: boolean;
  autoplayInterval?: number;
  infinite?: boolean;
  mode?: CarouselMode;
  showDots?: boolean;
  showArrows?: boolean;
  pauseOnHover?: boolean;
  className?: string;
}