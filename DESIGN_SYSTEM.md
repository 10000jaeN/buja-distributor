# 부자유통 디자인 시스템

## 색상

### 브랜드 색상
```css
--color-brand-blue:      #1285ff   /* 주요 액션, 링크, 포커스 */
--color-brand-blue-dark: #0831ffeb /* 호버, 강조 */
```

Tailwind 클래스: `text-brand-blue`, `bg-brand-blue`, `border-brand-blue`

### 시맨틱 색상 (CSS 변수 / OKLch)

| 변수 | 용도 |
|------|------|
| `--background` | 페이지 배경 |
| `--foreground` | 기본 텍스트 |
| `--muted` | 서브 배경 (입력창, 섹션) |
| `--muted-foreground` | 보조 텍스트 |
| `--border` | 테두리 기본값 |
| `--input` | 입력 필드 테두리 |
| `--ring` | 포커스 링 |
| `--destructive` | 에러, 삭제 |
| `--primary` | 기본 버튼 배경 |
| `--secondary` | 보조 버튼 배경 |
| `--card` / `--popover` | 카드, 팝업 배경 |

### 자주 쓰이는 그레이 (인라인 스타일)
```
text-gray-400    보조 텍스트, placeholder
text-gray-500    서브 텍스트
text-gray-600    본문 보조
text-gray-700    본문 주요
text-gray-800    강조 텍스트
border-gray-100  구분선 (카드 내부)
border-gray-200  입력 필드, 카드 테두리
border-gray-300  네비게이션, 컨테이너
bg-gray-50       테이블 헤더, 섹션 배경
```

---

## 타이포그래피

### 폰트 패밀리
- **Geist** (`font-sans`): 기본 폰트 (영문, 숫자)
- **Pretendard** (`font-pretendard`): 한글 전용 (가변 폰트 45~920)

### 크기 체계

| 용도 | 클래스 |
|------|--------|
| 페이지 제목 | `text-xl font-bold` |
| 섹션 제목 | `text-lg font-bold` |
| 컴포넌트 제목 | `text-base font-medium` |
| 본문 | `text-sm` |
| 보조 텍스트 | `text-xs` |
| 레이블/캡션 | `text-[11px]` |
| 버튼 | `text-sm font-semibold` |
| 배지 | `text-xs font-medium` |
| Tooltip | `text-[11px] font-medium` |

---

## 간격 & 레이아웃

### 컨테이너
```
max-width: max-w-[1024px]
padding: p-5 (20px)
```

### 반응형 브레이크포인트
```
sm: 640px
md: 768px
lg: 1024px   ← 주요 기준 (모바일/데스크탑 분기)
```

### 자주 쓰이는 간격
```
gap-1    4px   (아이콘-텍스트)
gap-2    8px   (컴포넌트 내부)
gap-3    12px  (폼 필드 간)
gap-4    16px  (섹션 내부)
gap-6    24px  (섹션 간)
p-3      12px  (카드 내부 패딩)
p-4      16px  (Dialog footer)
p-6      24px  (Dialog content)
px-4 py-2      버튼 기본 패딩
```

---

## 테두리 반경

```
--radius: 0.625rem (10px) — 기준값

rounded-md   6px    소형 요소
rounded-lg   8px    입력 필드, Select, 기본 컴포넌트
rounded-xl   12px   Button, Dialog, 카드
rounded-2xl  18px   큰 카드
rounded-4xl  64px   Badge (pill 형태)
rounded-full 100%   SearchBar, Avatar
```

---

## 그림자

```
shadow-sm   툴팁
shadow-md   Select 드롭다운
shadow-lg   Dropdown 메뉴
```

---

## 컴포넌트

### Button

| Variant | 용도 | 스타일 |
|---------|------|--------|
| `default` | 주요 액션 | `bg-brand-blue text-white` |
| `outline` | 보조 액션 | `border bg-background hover:bg-muted` |
| `secondary` | 3차 액션 | `bg-secondary hover:bg-secondary/80` |
| `ghost` | 텍스트형 | `hover:bg-muted` |
| `destructive` | 삭제/경고 | `bg-destructive/10 text-destructive` |
| `link` | 링크형 | `text-primary underline-offset-4` |

| Size | Height | 용도 |
|------|--------|------|
| `default` | auto | 일반 |
| `sm` | 28px | 테이블 내 액션 |
| `lg` | 36px | 강조 액션 |
| `xs` | 24px | 밀집 레이아웃 |
| `icon` | 32px | 아이콘 전용 |
| `icon-sm` | 28px | 소형 아이콘 |

### Badge

| Variant | 용도 |
|---------|------|
| `default` | 기본 상태 |
| `secondary` | 보조 상태 |
| `destructive` | 에러/위험 |
| `outline` | 테두리형 |
| `ghost` | 배경 없음 |

### Input / Textarea
```
height: 36px (h-9)
padding: px-3
border: border-gray-200 rounded-lg
focus: border-brand-blue ring-1 ring-brand-blue/20
placeholder: text-gray-400
error: border-destructive ring-destructive/20
```

### Dialog
```
content: max-w-sm (기본) → className으로 override
  - 예: sm:max-w-2xl, sm:max-w-4xl
padding: p-6
border-radius: rounded-xl
footer: -mx-6 -mb-6 p-4 border-t bg-muted/50
```

> Dialog 너비를 넓힐 때는 반드시 `sm:max-w-{size}` prefix 사용
> (`max-w-{size}`만 쓰면 기본 `sm:max-w-sm`에 덮어쓰여짐)

---

## 애니메이션

### Dialog / Overlay 등장
```
data-open:animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-3
data-closed:animate-out fade-out-0 zoom-out-95 slide-out-to-bottom-3
duration-200
```

### 트랜지션
```
transition-colors    입력 필드, 버튼 색상 변화
transition-all       버튼 전체 효과
duration-300         이미지 호버 확대 (ProductCard)
duration-200         Dialog 오버레이
```

### 인터랙션 패턴
```
ProductCard 이미지: group-hover:scale-105 duration-300
ProductCard 텍스트: group-hover:text-brand-blue
버튼 클릭: active:translate-y-px
Nav 아이콘: hover:text-brand-blue
```

---

## 포커스 & 에러 상태

```css
/* 포커스 */
focus-visible:border-ring
focus-visible:ring-3
focus-visible:ring-ring/50

/* 에러 */
aria-invalid:border-destructive
aria-invalid:ring-3
aria-invalid:ring-destructive/20

/* 비활성 */
disabled:pointer-events-none
disabled:opacity-50
```

---

## 다크 모드

CSS 변수가 `.dark` 클래스로 자동 전환됩니다.  
컴포넌트에 `dark:` prefix로 추가 스타일을 명시합니다.

```
dark:bg-input/30
dark:hover:bg-input/50
dark:border-input
dark:bg-destructive/20
```

---

## 유틸리티

### `cn()` 함수
```typescript
import { cn } from "@/lib/utils";

// clsx + tailwind-merge 조합
cn("base-class", condition && "conditional-class", className)
```

### CVA (class-variance-authority)
버튼, 배지 등 variant가 있는 컴포넌트에 사용:
```typescript
const variants = cva("base-styles", {
  variants: {
    variant: { default: "...", outline: "..." },
    size: { default: "...", sm: "..." },
  },
  defaultVariants: { variant: "default", size: "default" },
});
```

### 아이콘 크기 기준
```
기본: size-4 (16px)
소형: size-3 ~ size-3.5 (12~14px)
네비: size-6 (24px)
Badge 내: size-3! (강제 12px)
```
