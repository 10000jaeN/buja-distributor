import Link from "next/link";
import BackButton from "@/components/shared/BackButton";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 py-20 text-center">
      {/* 404 숫자 강조 */}
      <p className="text-brand-blue text-[100px] font-black leading-none tracking-tight md:text-[140px] lg:text-[160px]">
        404
      </p>

      {/* 구분선 */}
      <div className="bg-brand-blue mt-4 mb-8 h-1 w-12 rounded-full md:w-16" />

      {/* 안내 문구 */}
      <h1 className="mb-3 text-xl font-bold text-gray-800 md:text-2xl">
        페이지를 찾을 수 없습니다.
      </h1>
      <p className="mb-10 text-sm leading-relaxed text-gray-500 md:text-base">
        요청하신 페이지가 삭제되었거나 주소가 변경되었습니다.
        <br />
        입력하신 주소를 다시 확인해 주세요.
      </p>

      {/* 액션 버튼 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Link
          href="/"
          className="bg-brand-blue hover:bg-brand-blue-dark rounded-lg px-6 py-3 text-sm font-semibold text-white transition-colors duration-300"
        >
          홈으로 돌아가기
        </Link>
        <BackButton />
      </div>
    </div>
  );
}
