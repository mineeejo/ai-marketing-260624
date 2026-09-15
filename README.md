# 그랜드캐년 투어 홈페이지

Next.js 14 (App Router) 기반 그랜드캐년 투어 홍보 홈페이지입니다.

- **메인 랜딩(`/`)** — 그랜드캐년 풀스크린 배경 영상 + 카카오톡 예약 안내 (Tailwind, lucide-react)
- **투어 상품 소개** — `/tours` 목록 + `/tours/[id]` 상세. 상품은 `app/lib/tours.js` 에서 관리
- **왜 조이감성투어인가요?** — `/why`
- **예약·문의** — `/book` (카카오톡 예약 안내)
- **고객 후기 게시판** — `/reviews`. 사용자가 사진과 함께 후기를 직접 작성 (Supabase 저장)

## 기술 스택
- Next.js 14 / React 18
- Tailwind CSS + lucide-react — 메인 랜딩 UI
- Supabase (Postgres + Storage) — 후기 데이터 & 사진 업로드

## 폴더 구조
- `app/page.js` — 메인 랜딩(풀스크린, 헤더/푸터 없음)
- `app/(site)/` — 헤더·푸터 공통 레이아웃을 쓰는 페이지 그룹(투어/연락처/후기)
- `app/api/reviews/` — 후기 조회·작성·수정·삭제 API

> 메인 배경 영상은 `app/page.js` 상단 `VIDEO_URL` 상수에서 교체할 수 있습니다.

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
  image_urls jsonb not null default '[]'::jsonb,  -- 후기 사진 URL 배열(최대 10장)
  password_hash text not null,                    -- 글 수정/삭제용 4자리 비밀번호(해시 저장)
  admin_reply text,                               -- 사장님(관리자) 답글
  admin_reply_at timestamptz,                     -- 답글 작성 시각
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
```

> 이미 이전 버전 테이블을 만들었다면 아래로 컬럼만 추가하세요:
> ```sql
> alter table reviews add column if not exists image_urls jsonb not null default '[]'::jsonb;
> alter table reviews add column if not exists password_hash text not null default '';
> alter table reviews add column if not exists updated_at timestamptz;
> alter table reviews add column if not exists admin_reply text;
> alter table reviews add column if not exists admin_reply_at timestamptz;
> ```

3. **Storage** → **New bucket** → 이름 `review-images`, **Public bucket 체크** (사진 공개 표시용)

### 3. 환경변수 등록
`.env.example` 을 참고해 `.env.local` 파일을 만들고 값 채우기:
- `SUPABASE_URL` : Project Settings → API → Project URL
- `SUPABASE_SERVICE_ROLE_KEY` : Project Settings → API → service_role 키 (⚠️ 비공개, 서버에서만 사용)
- `ADMIN_USERS` : 관리자 계정. `아이디:비번,아이디:비번` 형태로 최대 여러 명 등록. 예) `bal:bal1234!,manager:pw2,owner:pw3`
- `SESSION_SECRET` : 관리자 로그인 세션 서명용 랜덤 문자열 (`openssl rand -hex 32` 로 생성)

```bash
cp .env.example .env.local
# 값 입력 후
npm run dev
```

`http://localhost:3000` 접속.

> **후기 권한 정리**
> - 조회: 누구나
> - 수정/삭제: 작성 시 등록한 4자리 비밀번호를 아는 본인
> - 관리자(사장님): `/admin` 에서 아이디·비밀번호로 로그인 → 모든 글을 비밀번호 없이 수정·삭제하고 **답글** 작성 가능
>   - (로그인 없이도) 후기 수정/삭제 비밀번호 칸에 관리자 비밀번호를 직접 입력해도 통과됩니다.

---

## ☁️ Vercel 배포

1. https://vercel.com 에서 GitHub 저장소(`mineeejo/ai-marketing-260624`) 연결 → **Import**
2. **Environment Variables** 에 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_USERS`, `SESSION_SECRET` 등록
3. **Deploy** — 이후 브랜치에 push 하면 자동 재배포

> 참고: Supabase 무료 플랜은 1주일간 접속이 전혀 없으면 DB가 일시정지됩니다. 대시보드에서 재개할 수 있습니다.
