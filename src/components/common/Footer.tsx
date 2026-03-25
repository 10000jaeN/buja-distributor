const Footer = () => {
  return (
    <footer className="bg-neutral-950 pb-21.25 text-sm text-gray-300">
      {/* 상단 브랜드 섹션 */}
      <div className="border-b border-neutral-800 px-5 py-6 lg:mx-auto lg:max-w-256">
        <p className="text-base font-bold tracking-wide text-white">부자유통</p>
        <p className="mt-1 text-xs text-gray-400">유통을 내 손 안에</p>
      </div>

      {/* 사업자 정보 섹션 */}
      <div className="px-5 py-5 lg:mx-auto lg:max-w-256">
        <ul className="grid gap-y-2 md:grid-cols-2 md:gap-x-8">
          <li className="flex gap-2">
            <span className="shrink-0 text-gray-500">회사명</span>
            <span className="text-gray-200">부자유통</span>
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 text-gray-500">대표자</span>
            <span className="text-gray-200">김동빈</span>
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 text-gray-500">사업자 등록번호</span>
            <span className="text-gray-200">000-00-00000</span>
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 text-gray-500">통신판매업신고번호</span>
            <span className="text-gray-200">0000-ㅇㅇㅇㅇ-0000</span>
          </li>
          <li className="flex gap-2 md:col-span-2">
            <span className="shrink-0 text-gray-500">주소</span>
            <span className="text-gray-200">강원도 춘천시 ---</span>
          </li>
          <li className="flex gap-2 md:col-span-2">
            <span className="shrink-0 text-gray-500">통신판매신고</span>
            <span className="text-gray-200">제 000</span>
          </li>
        </ul>
      </div>

      {/* 하단 카피라이트 */}
      <div className="border-t border-neutral-800 px-5 py-4 lg:mx-auto lg:max-w-256">
        <p className="text-xs text-gray-400">
          &copy; {new Date().getFullYear()} 부자유통. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
