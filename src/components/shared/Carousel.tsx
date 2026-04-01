"use client";

import { ArrowIcon } from "@/assets";
import { useEffect, useState } from "react";

const items = [
  { title: "광고 및 이벤트가 들어갈 자리입니다.", bg: "bg-[#7bf1b0]" },
  { title: "소", bg: "bg-[#68aae2]" },
  { title: "보", bg: "bg-[#ab68e2]" },
  { title: "와", bg: "bg-[#e068e2]" },
];

const Carousel = () => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);

  const onClickPrevious = () => {
    setCurrentIdx((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const onClickNext = () => {
    setCurrentIdx((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  const onClickPagination = (idx: number) => {
    setCurrentIdx(idx);
  };

  useEffect(() => {
    const timer = setInterval(onClickNext, 7000);

    return () => clearInterval(timer);
  }, [currentIdx]);

  return (
    <div className="relative mx-auto mb-4 max-w-320">
      <div className="overflow-hidden">
        <div className="flex">
          {items.map((item) => (
            <div
              key={item.title}
              className={`flex h-80 w-full shrink-0 items-center justify-center text-2xl font-bold text-white duration-300 ${item.bg}`}
              style={{ transform: `translateX(-${currentIdx * 100}%)` }}
            >
              {item.title}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-2 left-1/2 flex -translate-1/2 items-center gap-2">
        <button
          type="button"
          className="-scale-x-100"
          onClick={onClickPrevious}
        >
          <ArrowIcon className="fill-white" />
        </button>

        {items &&
          items.map((item, idx) => (
            <button
              key={item.title}
              type="button"
              className={`${currentIdx === idx ? "w-7" : "w-3"} h-3 rounded-full bg-white duration-300`}
              onClick={() => onClickPagination(idx)}
            ></button>
          ))}

        <button type="button" onClick={onClickNext}>
          <ArrowIcon className="fill-white" />
        </button>
      </div>
    </div>
  );
};

export default Carousel;
