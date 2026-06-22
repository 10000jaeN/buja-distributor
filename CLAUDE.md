# 부자유통 (buja-distributor)

> **Claude에게**: 사용자가 "앞으로 ~해줘", "~하지 마", "~하도록 해줘" 등 행동 지시사항을 내리면, 추가할 내용을 먼저 사용자에게 보여주고 확인을 받은 후 이 파일의 적절한 섹션에 추가할 것.

유통을 내 손 안에 — 다양한 상품을 합리적인 가격에 만나보세요.

## 기술 스택

- **Next.js 16.1.0** (App Router, Turbopack)
- **React 19** / **TypeScript 5**
- **Zustand 5** — 상태관리
- **Tailwind CSS 4** / **shadcn (Base UI 기반)** — UI
- **Axios 1.13** — HTTP 클라이언트
- **Recharts** — 차트 (어드민 대시보드)
- **@dnd-kit** — 드래그 앤 드롭
- **AWS S3** — 이미지 업로드
- **Sonner** — 토스트 알림
- **pnpm** — 패키지 매니저

## 폴더 구조

```
src/
├── app/
│   ├── (main)/          # 일반 사용자 페이지
│   ├── admin/           # 어드민 페이지
│   └── api/             # API Routes (이미지 업로드 등)
├── api/                 # API 서비스 계층 (axios 기반)
├── store/               # Zustand 스토어
├── components/
│   ├── ui/              # shadcn UI 컴포넌트
│   ├── common/          # 레이아웃 공통 컴포넌트 (Nav, Footer 등)
│   ├── shared/          # 재사용 컴포넌트 (ProductCard 등)
│   └── provider/        # Context Provider
├── lib/                 # axios 인스턴스, 유틸 함수
├── types/               # TypeScript 타입 정의
└── constants/           # 상수
```

## API 구조

- `src/lib/axios.ts` — Axios 인스턴스. Authorization 헤더 자동 주입, 토큰 갱신, 401 시 자동 리다이렉트
- `src/api/` — 서비스별 API 함수 모음 (userService, productService, cartService, orderService, categoryService, statsService, settingsService)
- API 호출은 반드시 `axiosInstance`를 통해 `src/api/` 계층에서 처리

## 상태관리

| 스토어 | 역할 |
|--------|------|
| `useAuthStore` | 로그인 상태, 유저 정보. autoLogin 플래그에 따라 localStorage/sessionStorage 선택 |
| `useCartStore` | 장바구니 개수. localStorage 동기화 |
| `useMenuStore` | 모바일 사이드바 토글 |

## 인증

- `src/components/provider/AuthProvider.tsx` — 앱 초기화 시 localStorage → sessionStorage 순으로 accessToken 확인 후 세션 복원
- 로그아웃 시 `useAuthStore.logout()` 호출 (토큰 제거 + 장바구니 초기화 포함)

## 브랜치 전략

- 모든 작업은 **`staging` 브랜치**에서만 진행
- PR은 `staging` → `main`으로 올림
- **`main` 브랜치에 직접 커밋 금지** — 반드시 PR을 통해서만 반영

## PR 규칙

PR을 생성할 때는 변경 사항을 충분히 분석하여 아래 내용을 포함:

- **Summary**: 변경 내용 요약 (bullet point)
- **변경 파일 목록**: 수정된 파일과 이유
- **트레이드오프**: 선택한 구현 방식의 장단점, 대안과의 비교
- **Test plan**: 테스트 항목 체크리스트

PR을 올린 후에는 반드시 **`buja-reviewer` 에이전트를 호출해 코드 리뷰를 진행**

## 커밋 컨벤션

```
feat: 새로운 기능
fix: 버그 수정
refactor: 동작 변경 없는 코드 개선
chore: 빌드, 의존성, 설정
design: UI/UX 스타일
docs: 문서
```

- 메시지는 **한글**로 작성
- 예: `feat: 어드민 주문 관리 페이지 추가`
- **커밋은 변경 목적 단위로 분리** — 성격이 다른 변경(refactor + fix + chore 등)은 반드시 별도 커밋으로 나눌 것

## 디자인

UI 작업 전 반드시 `DESIGN_SYSTEM.md`를 읽고 색상, 타이포그래피, 컴포넌트 스타일을 확인할 것.
- 색상은 브랜드 변수(`text-brand-blue`, `bg-brand-blue`) 또는 시맨틱 유틸리티 클래스(`text-label`, `text-caption` 등) 사용
- 자의적으로 `text-gray-*`, `text-[11px]` 등을 직접 쓰지 말고 정의된 유틸리티 클래스 우선 사용

## 코드 작성 규칙

### 컴포넌트 분리

- 파일이 **300줄을 초과**하거나, 하나의 파일에 **2개 이상의 독립적인 UI 블록**이 존재하면 컴포넌트로 분리
- 페이지 전용 컴포넌트는 해당 페이지 디렉터리 아래 `_components/`에 위치
- 2개 이상의 페이지에서 사용되면 `src/components/shared/`로 이동
- Dialog는 별도 파일로 분리 (예: `OrderDetailDialog.tsx`, `OrderEditDialog.tsx`)

### 일반 규칙

- API 호출은 컴포넌트에 직접 작성하지 않고 `src/api/` 서비스 함수를 사용
- 타입은 `src/types/`에 정의하거나 서비스 파일에서 export
- 어드민 전용 기능은 반드시 `src/app/admin/` 하위에 위치
- `.env` 파일은 절대 읽거나 커밋하지 않음

## 빌드 체크

모든 `git commit` 또는 `git push` 후에는 `build-checker` 에이전트를 반드시 백그라운드로 실행할 것.
빌드 성공 시에는 아무 말도 하지 말 것. 실패 시에만 에러 파일명, 줄 번호, 메시지를 사용자에게 보고할 것.

## 개발 명령어

```bash
pnpm dev      # 개발 서버 (localhost:3000)
pnpm build    # 프로덕션 빌드
pnpm lint     # ESLint 검사
```
