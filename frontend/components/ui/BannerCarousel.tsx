"use client";

import { useEffect, useRef, useState } from "react";
import { listarBanners } from "@/lib/api/banners";
import type { Banner } from "@/lib/api/types";

const AUTO_ADVANCE_MS = 5000;

export default function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listarBanners()
      .then(setBanners)
      .catch(() => setBanners([]));
  }, []);

  useEffect(() => {
    if (banners.length < 2) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % banners.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [banners.length]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const target = scroller.children[activeIndex] as HTMLElement | undefined;
    target?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }, [activeIndex]);

  const handleScroll = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const index = Math.round(scroller.scrollLeft / scroller.clientWidth);
    setActiveIndex(index);
  };

  if (banners.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory gap-0 overflow-x-auto rounded-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {banners.map((banner) => (
          <div key={banner.id} className="w-full shrink-0 snap-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={banner.imagemUrl}
              alt={banner.titulo ?? "Banner"}
              className="h-40 w-full rounded-2xl object-cover ring-1 ring-gov-navy/5"
            />
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          {banners.map((banner, index) => (
            <span
              key={banner.id}
              className={`h-1.5 rounded-full transition-all ${
                index === activeIndex ? "w-4 bg-brand-500" : "w-1.5 bg-gov-navy/15"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
