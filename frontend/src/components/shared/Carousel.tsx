"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { settingsService, Banner } from "@/api/settingsService";

const Carousel = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    settingsService.getSettings().then((s) => {
      setBanners(s.banners ?? []);
      setLoaded(true);
    });
  }, []);

  const onClickPrevious = () => {
    setCurrentIdx((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const onClickNext = () => {
    setCurrentIdx((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (banners.length < 2) return;
    const timer = setInterval(onClickNext, 7000);
    return () => clearInterval(timer);
  }, [currentIdx, banners.length]);

  if (!loaded)
    return <div className="mx-auto mb-4 h-[400px] max-w-320 bg-gray-100" />;

  if (banners.length === 0) {
    return (
      <div className="mx-auto mb-4 flex h-[400px] max-w-320 items-center justify-center bg-gray-100">
        <p className="text-sm text-gray-400">광고 및 이벤트가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="relative mx-auto mb-4 max-w-320 overflow-hidden">
      <div className="flex">
        {banners.map((banner, idx) => (
          <div
            key={idx}
            className="relative w-full shrink-0 duration-300"
            style={{ height: "400px", transform: `translateX(-${currentIdx * 100}%)` }}
          >
            {banner.linkUrl ? (
              <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer" className="block h-full">
                <Image
                  src={banner.imageUrl}
                  alt={`배너 ${idx + 1}`}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority={idx === 0}
                />
              </a>
            ) : (
              <Image
                src={banner.imageUrl}
                alt={`배너 ${idx + 1}`}
                fill
                sizes="100vw"
                className="object-cover"
                priority={idx === 0}
              />
            )}
          </div>
        ))}
      </div>

      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-2">
        <button type="button" onClick={onClickPrevious}>
          <ChevronLeft className="h-5 w-5 text-white" />
        </button>
        {banners.map((_, idx) => (
          <button
            key={idx}
            type="button"
            className={`${currentIdx === idx ? "w-7" : "w-3"} h-3 rounded-full bg-white duration-300`}
            onClick={() => setCurrentIdx(idx)}
          />
        ))}
        <button type="button" onClick={onClickNext}>
          <ChevronRight className="h-5 w-5 text-white" />
        </button>
      </div>
    </div>
  );
};

export default Carousel;
