# 부자유통 (buja-distributor)

> 유통을 내 손 안에 — 다양한 상품을 합리적인 가격에 만나보세요.

## 프로젝트 구조

```
buja-distributor/        # 모노레포 루트
├── frontend/            # Next.js 프론트엔드
├── backend/             # Express API 서버
├── docker-compose.yml   # 로컬 개발 환경
└── .github/             # PR 템플릿
```

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS 4, Zustand |
| Backend | Node.js, Express, MongoDB, Mongoose |
| 배포 | Vercel (frontend), Render (backend) |
| 인프라 | Docker, Docker Compose |

## 로컬 개발 환경 실행

### 방법 1. Docker로 한 번에 실행 (권장)

```bash
docker compose up
```

| 서비스 | 주소 |
|--------|------|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8080 |

```bash
# 이미지 새로 빌드
docker compose up --build

# 종료
docker compose down
```

### 방법 2. 직접 실행

```bash
# 프론트엔드
cd frontend
pnpm install
pnpm dev

# 백엔드 (새 터미널)
cd backend
npm install
npm run dev
```

## 환경변수

각 디렉토리에 `.env` 파일을 설정합니다.

**frontend/.env**
```
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_API_TEST_URL=
NEXT_PUBLIC_SITE_URL=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET=
```

**backend/.env**
```
PORT=8080
MONGODB_URI=
JWT_SECRET=
```

## 브랜치 전략

- 작업 브랜치: `staging`
- PR: `staging` → `main`
