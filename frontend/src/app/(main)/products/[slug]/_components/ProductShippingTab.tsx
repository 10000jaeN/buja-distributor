type Props = {
  shippingFee: number;
  freeShippingThreshold: number;
};

export function ProductShippingTab({ shippingFee, freeShippingThreshold }: Props) {
  return (
    <div className="space-y-6 px-4 py-8 text-sm text-gray-700">
      <section className="space-y-3">
        <h3 className="font-semibold text-gray-900">배송 안내</h3>
        <dl className="space-y-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-4">
          <div className="flex justify-between">
            <dt className="text-gray-500">배송사</dt>
            <dd className="font-medium">한진택배</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">배송비</dt>
            <dd className="font-medium">
              {shippingFee === 0 ? (
                <span className="text-brand-blue">무료배송</span>
              ) : (
                <>
                  {shippingFee.toLocaleString()}원
                  {freeShippingThreshold > 0 && (
                    <span className="ml-1 text-xs text-gray-400">
                      ({freeShippingThreshold.toLocaleString()}원 이상 무료)
                    </span>
                  )}
                </>
              )}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">제주 추가 배송비</dt>
            <dd className="font-medium">3,000원</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">도서산간 추가 배송비</dt>
            <dd className="font-medium">5,000원</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">배송 기간</dt>
            <dd className="font-medium">결제 완료 후 1~3 영업일</dd>
          </div>
        </dl>
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold text-gray-900">교환 / 반품 안내</h3>
        <dl className="space-y-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-4">
          <div className="flex justify-between">
            <dt className="text-gray-500">교환/반품 신청</dt>
            <dd className="font-medium">수령 후 7일 이내</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">반품 배송비</dt>
            <dd className="font-medium">3,000원 (왕복 6,000원)</dd>
          </div>
        </dl>
        <ul className="list-inside list-disc space-y-1.5 text-xs text-gray-400">
          <li>단순 변심에 의한 반품 시 배송비는 고객 부담입니다.</li>
          <li>상품 불량 및 오배송의 경우 무료 반품 처리됩니다.</li>
          <li>식품 특성상 개봉 후 반품이 불가합니다.</li>
        </ul>
      </section>
    </div>
  );
}
