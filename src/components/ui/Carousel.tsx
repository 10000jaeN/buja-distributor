"use client";

import { useState } from "react";

const items = [
  { title: "소", bg: "bg-[#68aae2]" },
  { title: "보", bg: "bg-[#ab68e2]" },
  { title: "와", bg: "bg-[#e068e2]" },
];

const Carousel = () => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);

  const onClickPrevious = () => {
    setCurrentIdx((prevIdx) =>
      prevIdx === 0 ? items.length - 1 : prevIdx - 1,
    );
  };

  const onClickNext = () => {
    setCurrentIdx((prevIdx) =>
      prevIdx === items.length - 1 ? 0 : prevIdx + 1,
    );
  };

  const onClickPagination = (idx: number) => {
    setCurrentIdx(idx);
  };

  return (
    <div className="relative mb-4">
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
      <button
        type="button"
        className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-black px-1 py-2 text-white hover:cursor-pointer"
        onClick={onClickPrevious}
      >
        &#8249;
      </button>
      <button
        type="button"
        className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-black px-1 py-2 text-white hover:cursor-pointer"
        onClick={onClickNext}
      >
        &#8250;
      </button>

      <div className="absolute bottom-2 left-1/2 flex -translate-1/2 gap-2">
        {items &&
          items.map((_, idx) => (
            <button
              type="button"
              className={`${currentIdx === idx ? "w-7" : "w-3"} h-3 rounded-full bg-white duration-300 hover:cursor-pointer`}
              onClick={() => onClickPagination(idx)}
            ></button>
          ))}
      </div>
    </div>
  );
};

export default Carousel;
