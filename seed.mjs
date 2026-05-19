const BASE = "http://localhost:4000";

// 1. 어드민 로그인
const loginRes = await fetch(`${BASE}/auth/admin/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "admin@buja.com", password: "admin1234" }),
});
const loginData = await loginRes.json();
const token = loginData.accessToken ?? loginData.data?.accessToken;

if (!token) {
  console.error("로그인 실패:", loginData);
  process.exit(1);
}
console.log("✅ 로그인 성공");

// 2. 기존 카테고리 전체 삭제 후 재생성
const catListRes = await fetch(`${BASE}/categories`);
const catListData = await catListRes.json();
const existingCats = catListData.data ?? [];

console.log(`\n🗑️  기존 카테고리 ${existingCats.length}개 삭제 중...`);
for (const cat of existingCats) {
  const res = await fetch(`${BASE}/categories/${encodeURIComponent(cat.parent)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.ok) console.log(`  삭제: ${cat.parent}`);
  else console.error(`  삭제 실패: ${cat.parent}`);
}

const categories = [
  { parent: "김",   children: ["도시락 김", "구운김", "조미김"],            order: 1 },
  { parent: "반찬", children: ["나물", "조림", "볶음"],                     order: 2 },
  { parent: "양념", children: ["고춧가루", "다진마늘", "참기름", "들기름"], order: 3 },
  { parent: "장류", children: ["된장", "간장", "고추장", "쌈장"],           order: 4 },
  { parent: "젓갈", children: ["오징어젓", "낙지젓"],                       order: 5 },
];

console.log("\n📂 카테고리 생성 중...");
for (const cat of categories) {
  const res = await fetch(`${BASE}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(cat),
  });
  const data = await res.json();
  if (res.ok) console.log(`  ✅ ${cat.parent} (${cat.children.join(", ")})`);
  else console.error(`  ❌ ${cat.parent}:`, data.message);
}
console.log("✅ 카테고리 생성 완료\n");

// 3. 기존 상품 전체 삭제
const listRes = await fetch(`${BASE}/products`);
const listData = await listRes.json();
const existing = listData.data ?? [];

console.log(`\n🗑️  기존 상품 ${existing.length}개 삭제 중...`);
for (const product of existing) {
  const res = await fetch(`${BASE}/products/${encodeURIComponent(product.slug)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.ok) {
    console.log(`  삭제: ${product.name}`);
  } else {
    console.error(`  삭제 실패: ${product.name}`);
  }
}
console.log("✅ 기존 상품 삭제 완료\n");

// 4. 새 시드 데이터 (content 필드 사용)
const products = [
  // 김
  {
    name: "프리미엄 도시락 김 30봉",
    price: 12000,
    shippingFee: 3000,
    freeShippingThreshold: 0,
    bundleShipping: false,
    category: { parent: "김", child: "도시락 김" },
    isAvailable: true,
    thumbnail: [],
    content: `<h2>프리미엄 도시락 김 30봉</h2>
<p>국산 원초를 사용해 바삭하고 고소한 풍미가 일품인 도시락 김입니다. 아이 도시락부터 성인 간식까지 온 가족이 즐길 수 있습니다.</p>
<h3>제품 특징</h3>
<ul>
<li>국산 원초 100% 사용</li>
<li>무방부제 · 무색소</li>
<li>낱봉 개별 포장으로 신선함 유지</li>
<li>1봉 기준 8매 구성</li>
</ul>
<h3>보관 방법</h3>
<p>직사광선을 피해 서늘하고 건조한 곳에 보관하세요. 개봉 후에는 밀봉하여 냉장 보관하시고 빠르게 드시기를 권장합니다.</p>`,
  },
  {
    name: "달콤 도시락 김 20봉",
    price: 8500,
    shippingFee: 3000,
    freeShippingThreshold: 0,
    bundleShipping: false,
    category: { parent: "김", child: "도시락 김" },
    isAvailable: true,
    thumbnail: [],
    content: `<h2>달콤 도시락 김 20봉</h2>
<p>은은한 단맛이 더해진 도시락 김으로 아이들이 특히 좋아하는 맛입니다. 참기름과 천일염으로 맛을 낸 건강한 간식입니다.</p>
<h3>제품 특징</h3>
<ul>
<li>천일염 · 참기름 사용</li>
<li>어린이 입맛에 맞춘 약한 단맛</li>
<li>1봉 기준 8매 구성</li>
</ul>`,
  },
  {
    name: "국산 구운김 10봉",
    price: 9800,
    shippingFee: 3000,
    freeShippingThreshold: 0,
    bundleShipping: false,
    category: { parent: "김", child: "구운김" },
    isAvailable: true,
    thumbnail: [],
    content: `<h2>국산 구운김 10봉</h2>
<p>국내산 돌김을 저온에서 천천히 구워낸 구운김입니다. 기름을 최소화하여 담백하고 건강하게 즐길 수 있습니다.</p>
<h3>제품 특징</h3>
<ul>
<li>국내산 돌김 100%</li>
<li>저온 건식 구이 방식</li>
<li>기름 · 조미료 최소화</li>
</ul>
<h3>추천 섭취 방법</h3>
<p>밥 위에 올려 먹거나 주먹밥 재료로 활용하면 더욱 맛있습니다.</p>`,
  },
  {
    name: "바삭한 구운김 선물세트",
    price: 24000,
    shippingFee: 0,
    freeShippingThreshold: 0,
    bundleShipping: false,
    category: { parent: "김", child: "구운김" },
    isAvailable: true,
    thumbnail: [],
    content: `<h2>바삭한 구운김 선물세트</h2>
<p>명절이나 특별한 날 선물하기 좋은 프리미엄 구운김 선물세트입니다. 고급 케이스에 담아 정성을 더했습니다.</p>
<h3>구성</h3>
<ul>
<li>구운김 5봉 × 1세트</li>
<li>참기름 조미김 5봉 × 1세트</li>
<li>고급 선물 케이스 포함</li>
</ul>
<h3>배송 안내</h3>
<p>선물용 포장 상태를 유지하기 위해 전용 보호 포장재로 발송됩니다.</p>`,
  },
  {
    name: "참기름 조미김 15봉",
    price: 11000,
    shippingFee: 3000,
    freeShippingThreshold: 0,
    bundleShipping: false,
    category: { parent: "김", child: "조미김" },
    isAvailable: true,
    thumbnail: [],
    content: `<h2>참기름 조미김 15봉</h2>
<p>국산 참기름과 천일염으로 맛을 낸 고소한 조미김입니다. 밥반찬으로 최고의 선택입니다.</p>
<h3>제품 특징</h3>
<ul>
<li>국산 참기름 사용</li>
<li>천일염으로 간 맞춤</li>
<li>바삭한 식감 유지 개별 포장</li>
</ul>`,
  },

  // 반찬
  {
    name: "시골 시금치나물 300g",
    price: 6500,
    shippingFee: 3000,
    freeShippingThreshold: 0,
    bundleShipping: false,
    category: { parent: "반찬", child: "나물" },
    isAvailable: true,
    thumbnail: [],
    content: `<h2>시골 시금치나물 300g</h2>
<p>국내산 시금치를 손질하여 참기름과 천일염으로 무쳐낸 나물 반찬입니다. 엄마의 손맛 그대로 재현했습니다.</p>
<h3>원재료</h3>
<ul>
<li>시금치(국내산) 70%</li>
<li>참기름, 천일염, 마늘</li>
<li>무방부제 · 무색소</li>
</ul>
<h3>보관 및 유통기한</h3>
<p>냉장 보관(0~5°C), 제조일로부터 5일 이내 섭취 권장합니다.</p>`,
  },
  {
    name: "고사리나물 무침 200g",
    price: 7200,
    shippingFee: 3000,
    freeShippingThreshold: 0,
    bundleShipping: false,
    category: { parent: "반찬", child: "나물" },
    isAvailable: true,
    thumbnail: [],
    content: `<h2>고사리나물 무침 200g</h2>
<p>부드럽게 삶은 국내산 고사리를 들기름과 간장으로 조물조물 무쳐낸 정갈한 나물입니다.</p>
<h3>제품 특징</h3>
<ul>
<li>국내산 고사리 사용</li>
<li>들기름으로 고소함 강조</li>
<li>비빔밥 토핑으로 활용 가능</li>
</ul>`,
  },
  {
    name: "매콤 감자조림 250g",
    price: 5800,
    shippingFee: 3000,
    freeShippingThreshold: 0,
    bundleShipping: false,
    category: { parent: "반찬", child: "조림" },
    isAvailable: true,
    thumbnail: [],
    content: `<h2>매콤 감자조림 250g</h2>
<p>국내산 햇감자를 고추장과 간장으로 조려낸 밥도둑 반찬입니다. 매콤달콤한 맛이 밥 한 공기를 순식간에 비우게 합니다.</p>
<h3>원재료</h3>
<ul>
<li>감자(국내산), 고추장, 간장, 설탕, 참기름</li>
</ul>
<h3>추천 활용법</h3>
<p>도시락 반찬으로 활용하거나 따뜻한 밥 위에 올려 드시면 더욱 맛있습니다.</p>`,
  },
  {
    name: "두부 간장조림 300g",
    price: 6000,
    shippingFee: 3000,
    freeShippingThreshold: 0,
    bundleShipping: false,
    category: { parent: "반찬", child: "조림" },
    isAvailable: true,
    thumbnail: [],
    content: `<h2>두부 간장조림 300g</h2>
<p>단단한 두부를 노릇하게 구운 뒤 달콤짭조름한 간장 양념에 조린 인기 반찬입니다.</p>
<h3>제품 특징</h3>
<ul>
<li>국내산 콩으로 만든 두부 사용</li>
<li>달콤짭조름한 간장 양념</li>
<li>단백질 풍부</li>
</ul>`,
  },
  {
    name: "멸치 볶음 200g",
    price: 8900,
    shippingFee: 3000,
    freeShippingThreshold: 0,
    bundleShipping: false,
    category: { parent: "반찬", child: "볶음" },
    isAvailable: true,
    thumbnail: [],
    content: `<h2>멸치 볶음 200g</h2>
<p>잔멸치를 고소하게 볶아 견과류와 함께 버무린 칼슘 풍부한 밥반찬입니다.</p>
<h3>제품 특징</h3>
<ul>
<li>국내산 잔멸치 사용</li>
<li>아몬드 · 땅콩 견과류 포함</li>
<li>칼슘 풍부, 성장기 어린이에게 추천</li>
</ul>`,
  },

  // 양념
  {
    name: "국산 고춧가루 1kg",
    price: 18000,
    shippingFee: 3000,
    freeShippingThreshold: 0,
    bundleShipping: false,
    category: { parent: "양념", child: "고춧가루" },
    isAvailable: true,
    thumbnail: [],
    content: `<h2>국산 고춧가루 1kg</h2>
<p>국내산 태양초를 100% 사용한 붉고 매운 고춧가루입니다. 김치, 찌개, 무침 등 다양한 요리에 활용하세요.</p>
<h3>제품 특징</h3>
<ul>
<li>국내산 태양초 100%</li>
<li>HACCP 인증 시설 생산</li>
<li>고운 분쇄로 음식에 잘 스며듦</li>
</ul>
<h3>보관 방법</h3>
<p>개봉 후 밀봉하여 냉동 보관하면 장기간 신선하게 사용할 수 있습니다.</p>`,
  },
  {
    name: "청양 고춧가루 500g",
    price: 11000,
    shippingFee: 3000,
    freeShippingThreshold: 0,
    bundleShipping: false,
    category: { parent: "양념", child: "고춧가루" },
    isAvailable: true,
    thumbnail: [],
    content: `<h2>청양 고춧가루 500g</h2>
<p>매운맛을 즐기는 분들을 위한 청양고추 전용 고춧가루입니다. 찌개나 볶음 요리에 넣으면 깊은 매운맛을 냅니다.</p>
<h3>제품 특징</h3>
<ul>
<li>청양고추(국내산) 100%</li>
<li>일반 고춧가루 대비 2배 이상 매운맛</li>
</ul>`,
  },
  {
    name: "다진마늘 500g",
    price: 7500,
    shippingFee: 3000,
    freeShippingThreshold: 0,
    bundleShipping: false,
    category: { parent: "양념", child: "다진마늘" },
    isAvailable: true,
    thumbnail: [],
    content: `<h2>다진마늘 500g</h2>
<p>국내산 마늘을 신선하게 다져 즉시 냉장 포장한 제품입니다. 요리할 때마다 편리하게 사용하세요.</p>
<h3>제품 특징</h3>
<ul>
<li>국내산 마늘 100%</li>
<li>방부제 無 첨가</li>
<li>냉장 유통으로 신선함 유지</li>
</ul>`,
  },
  {
    name: "국산 참기름 320ml",
    price: 14500,
    shippingFee: 3000,
    freeShippingThreshold: 0,
    bundleShipping: false,
    category: { parent: "양념", child: "참기름" },
    isAvailable: true,
    thumbnail: [],
    content: `<h2>국산 참기름 320ml</h2>
<p>국내산 참깨를 저온 압착 방식으로 짜낸 고소하고 향기로운 참기름입니다.</p>
<h3>제품 특징</h3>
<ul>
<li>국내산 참깨 100%</li>
<li>저온 압착으로 영양 성분 보존</li>
<li>나물, 비빔밥, 무침에 최적</li>
</ul>`,
  },
  {
    name: "들기름 320ml",
    price: 13000,
    shippingFee: 3000,
    freeShippingThreshold: 0,
    bundleShipping: false,
    category: { parent: "양념", child: "들기름" },
    isAvailable: true,
    thumbnail: [],
    content: `<h2>들기름 320ml</h2>
<p>국내산 들깨를 압착한 고소한 들기름입니다. 나물 무침이나 볶음 요리에 활용하면 풍미가 살아납니다.</p>
<h3>제품 특징</h3>
<ul>
<li>국내산 들깨 100%</li>
<li>오메가-3 풍부</li>
<li>나물, 볶음, 두부 요리에 잘 어울림</li>
</ul>`,
  },

  // 장류
  {
    name: "전통 된장 500g",
    price: 9500,
    shippingFee: 3000,
    freeShippingThreshold: 0,
    bundleShipping: false,
    category: { parent: "장류", child: "된장" },
    isAvailable: true,
    thumbnail: [],
    content: `<h2>전통 된장 500g</h2>
<p>메주를 직접 띄워 전통 방식으로 담근 된장입니다. 깊고 구수한 발효 향이 찌개와 쌈장에 잘 어울립니다.</p>
<h3>제품 특징</h3>
<ul>
<li>국내산 콩으로 직접 메주를 쑤어 제조</li>
<li>24개월 이상 숙성</li>
<li>인공 감미료 無 첨가</li>
</ul>`,
  },
  {
    name: "국산콩 된장 1kg",
    price: 16000,
    shippingFee: 0,
    freeShippingThreshold: 0,
    bundleShipping: false,
    category: { parent: "장류", child: "된장" },
    isAvailable: true,
    thumbnail: [],
    content: `<h2>국산콩 된장 1kg</h2>
<p>국내산 콩만 사용한 대용량 된장입니다. 가정에서 오래 두고 사용하기 좋은 실속 사이즈입니다.</p>
<h3>제품 특징</h3>
<ul>
<li>국내산 콩 100%</li>
<li>대용량 1kg으로 경제적</li>
<li>된장찌개, 쌈장으로 활용</li>
</ul>`,
  },
  {
    name: "양조 간장 900ml",
    price: 8800,
    shippingFee: 3000,
    freeShippingThreshold: 0,
    bundleShipping: false,
    category: { parent: "장류", child: "간장" },
    isAvailable: true,
    thumbnail: [],
    content: `<h2>양조 간장 900ml</h2>
<p>콩과 밀을 발효시켜 만든 양조 간장으로 나물 무침, 조림, 찌개 등 다양한 요리에 활용할 수 있습니다.</p>
<h3>제품 특징</h3>
<ul>
<li>자연 발효 180일 숙성</li>
<li>깔끔하고 깊은 감칠맛</li>
<li>무방부제</li>
</ul>`,
  },
  {
    name: "국산 고추장 500g",
    price: 10500,
    shippingFee: 3000,
    freeShippingThreshold: 0,
    bundleShipping: false,
    category: { parent: "장류", child: "고추장" },
    isAvailable: true,
    thumbnail: [],
    content: `<h2>국산 고추장 500g</h2>
<p>국내산 고춧가루와 찹쌀을 넣어 전통 방식으로 담근 고추장입니다. 비빔밥, 떡볶이, 제육볶음에 최적입니다.</p>
<h3>제품 특징</h3>
<ul>
<li>국내산 고춧가루 · 찹쌀 사용</li>
<li>적당한 매운맛과 달콤함의 균형</li>
<li>HACCP 인증</li>
</ul>`,
  },
  {
    name: "매콤 쌈장 500g",
    price: 7800,
    shippingFee: 3000,
    freeShippingThreshold: 0,
    bundleShipping: false,
    category: { parent: "장류", child: "쌈장" },
    isAvailable: true,
    thumbnail: [],
    content: `<h2>매콤 쌈장 500g</h2>
<p>된장과 고추장을 적절히 배합하고 참기름과 마늘로 풍미를 더한 쌈장입니다. 삼겹살 쌈에 곁들이면 최고입니다.</p>
<h3>제품 특징</h3>
<ul>
<li>된장 · 고추장 황금 비율 배합</li>
<li>참기름 · 마늘 향 풍부</li>
<li>야채쌈, 보쌈에 잘 어울림</li>
</ul>`,
  },

  // 젓갈
  {
    name: "오징어젓 500g",
    price: 19000,
    shippingFee: 3000,
    freeShippingThreshold: 0,
    bundleShipping: false,
    category: { parent: "젓갈", child: "오징어젓" },
    isAvailable: true,
    thumbnail: [],
    content: `<h2>오징어젓 500g</h2>
<p>신선한 오징어를 천일염에 절여 숙성시킨 정통 오징어젓입니다. 쫄깃한 식감과 깊은 감칠맛이 특징입니다.</p>
<h3>제품 특징</h3>
<ul>
<li>국내산 오징어 사용</li>
<li>천일염 사용, 3개월 이상 숙성</li>
<li>김치 담글 때 또는 밥반찬으로 활용</li>
</ul>
<h3>보관 방법</h3>
<p>냉장 보관(0~5°C). 개봉 후에는 냉동 보관하시면 더 오래 드실 수 있습니다.</p>`,
  },
  {
    name: "매콤 오징어젓 300g",
    price: 13500,
    shippingFee: 3000,
    freeShippingThreshold: 0,
    bundleShipping: false,
    category: { parent: "젓갈", child: "오징어젓" },
    isAvailable: true,
    thumbnail: [],
    content: `<h2>매콤 오징어젓 300g</h2>
<p>오징어젓에 청양고추를 더해 매콤하게 양념한 제품입니다. 매운 음식을 좋아하는 분들께 추천합니다.</p>
<h3>제품 특징</h3>
<ul>
<li>국내산 오징어 + 청양고추</li>
<li>칼칼한 매운맛</li>
<li>밥도둑 반찬으로 인기</li>
</ul>`,
  },
  {
    name: "낙지젓 500g",
    price: 22000,
    shippingFee: 0,
    freeShippingThreshold: 0,
    bundleShipping: false,
    category: { parent: "젓갈", child: "낙지젓" },
    isAvailable: true,
    thumbnail: [],
    content: `<h2>낙지젓 500g</h2>
<p>통통하고 신선한 낙지를 천일염에 절여 숙성시킨 프리미엄 낙지젓입니다. 김장 김치의 감칠맛을 한층 높여줍니다.</p>
<h3>제품 특징</h3>
<ul>
<li>국내산 낙지 사용</li>
<li>천일염 절임, 6개월 이상 숙성</li>
<li>김장용 또는 밥반찬으로 활용</li>
</ul>`,
  },
  {
    name: "국산 낙지젓 300g",
    price: 15000,
    shippingFee: 3000,
    freeShippingThreshold: 0,
    bundleShipping: false,
    category: { parent: "젓갈", child: "낙지젓" },
    isAvailable: true,
    thumbnail: [],
    content: `<h2>국산 낙지젓 300g</h2>
<p>소량으로 즐길 수 있는 국내산 낙지젓 소용량 제품입니다. 혼자 또는 소가족 가정에 적합합니다.</p>
<h3>제품 특징</h3>
<ul>
<li>국내산 낙지 100%</li>
<li>소용량 300g으로 신선하게 즐기기 좋음</li>
</ul>`,
  },
  {
    name: "낙지젓 선물세트 1kg",
    price: 42000,
    shippingFee: 0,
    freeShippingThreshold: 0,
    bundleShipping: false,
    category: { parent: "젓갈", child: "낙지젓" },
    isAvailable: true,
    thumbnail: [],
    content: `<h2>낙지젓 선물세트 1kg</h2>
<p>명절 선물로 인기 높은 프리미엄 낙지젓 선물세트입니다. 정성스러운 포장으로 특별한 날 선물하기 좋습니다.</p>
<h3>구성</h3>
<ul>
<li>낙지젓 500g × 2개</li>
<li>고급 선물 케이스 + 쇼핑백 포함</li>
</ul>
<h3>배송 안내</h3>
<p>신선 유지를 위해 아이스팩과 함께 아이스박스 포장으로 발송됩니다.</p>`,
  },
];

// 5. 상품 생성
console.log("📦 새 상품 생성 중...");
let success = 0;
for (const product of products) {
  const res = await fetch(`${BASE}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(product),
  });
  const data = await res.json();
  if (res.ok) {
    console.log(`  ✅ ${product.name}`);
    success++;
  } else {
    console.error(`  ❌ ${product.name}:`, data.message);
  }
}

console.log(`\n완료: ${success}/${products.length}개 생성`);
