"use client";

import { useRouter } from "next/navigation";

const BackButton = () => {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-600 transition-colors duration-300 hover:bg-gray-100"
    >
      이전 페이지로
    </button>
  );
};

export default BackButton;
