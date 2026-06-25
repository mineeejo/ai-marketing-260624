# 여행기획 투어 홈페이지

Next.js 14 (App Router) 기반 투어 소개 홈페이지입니다.

- **투어 상품 소개** — 메인(`/`) + 상세(`/tours/[id]`). 상품은 `app/lib/tours.js` 에서 관리
- **연락처 안내** — `/contact`
- **여행 후기 게시판** — `/reviews`. 사용자가 사진과 함께 후기를 직접 작성 (Supabase 저장)

## 기술 스택
- Next.js 14 / React 18
- Supabase (Postgres + Storage) — 후기 데이터 & 사진 업로드

---

## 🚀 셋업 가이드

### 1. 의존성 설치
```bash
npm install
```

### 2. Supabase 프로젝트 만들기 (무료)
1. https://supabase.com 가입 → **New project** 생성
2. 프로젝트 대시보드 → **SQL Editor** 에서 아래 실행 (후기 테이블 생성):

```sql
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rating int not null check (rating between 1 and 5),
  content text not null,
  image_url text,
  password_hash text not null,           -- 글 수정/삭제용 4자리 비밀번호(해시 저장)
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
```

> 이미 이전 버전 테이블을 만들었다면 아래로 컬럼만 추가하세요:
> ```sql
> alter table reviews add column if not exists password_hash text not null default '';
> alter table reviews add column if not exists updated_at timestamptz;
> ```

3. **Storage** → **New bucket** → 이름 `review-images`, **Public bucket 체크** (사진 공개 표시용)

### 3. 환경변수 등록
`.env.example` 을 참고해 `.env.local` 파일을 만들고 값 채우기:
- `SUPABASE_URL` : Project Settings → API → Project URL
- `SUPABASE_SERVICE_ROLE_KEY` : Project Settings → API → service_role 키 (⚠️ 비공개, 서버에서만 사용)

```bash
cp .env.example .env.local
# 값 입력 후
npm run dev
```

`http://localhost:3000` 접속.

---

## ☁️ Vercel 배포

1. https://vercel.com 에서 GitHub 저장소(`mineeejo/ai-marketing-260624`) 연결 → **Import**
2. **Environment Variables** 에 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` 등록
3. **Deploy** — 이후 브랜치에 push 하면 자동 재배포

> 참고: Supabase 무료 플랜은 1주일간 접속이 전혀 없으면 DB가 일시정지됩니다. 대시보드에서 재개할 수 있습니다.
