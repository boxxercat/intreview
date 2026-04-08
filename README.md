# Intreview

면접 일정·질문·준비 문항을 관리하고, 연습 답변에 대해 **Groq(LLM)** 기반 STAR 첨삭을 받을 수 있는 풀스택 웹 애플리케이션입니다.

## 주요 기능

- **회원**: 회원가입·로그인 (`/api/auth`)
- **면접**: 면접 CRUD, 목록 페이지네이션 (`/api/interviews`)
- **면접별 질문**: 질문 추가·수정·삭제·순서 변경 (`/api/interviews/{id}/questions`)
- **준비 질문**: 면접 전 따로 모아 두는 질문 관리 (`/api/preparation-questions`)
- **질문 뱅크**: 공통 질문 풀 (`/api/question-bank/questions`)
- **AI 코칭**: 준비 질문에 대한 연습 답변 첨삭 (`POST /api/preparation-questions/{id}/coach-practice-answer`) — Groq API 키가 없으면 해당 기능만 사용 불가(503)

대부분의 보호 API는 HTTP 헤더 **`X-User-Id`**(로그인 후 저장된 사용자 ID)가 필요합니다.

## 기술 스택

| 구분 | 기술 |
|------|------|
| 백엔드 | Java 17, Spring Boot 3.5, Spring Data JPA, Spring AI(OpenAI 호환 → Groq), Validation, Actuator |
| DB | H2 파일 DB (`./data/intreview`, MySQL 호환 모드) |
| 프론트엔드 | Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, dnd-kit |

## 사전 요구사항

- **JDK 17** 이상, **Maven 3**
- **Node.js** (프론트; LTS 권장)
- (선택) **Groq API 키** — 연습 답변 코칭 기능용

## 환경 변수

### 백엔드 (Groq)

애플리케이션은 기동 시 `.env`를 읽어 시스템 프로퍼티로 올립니다. 우선순위는 **OS 환경 변수**가 더 높습니다.

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `GROQ_API_KEY` | Groq API 키 | 없음(비우면 AI 코칭 비활성) |
| `GROQ_BASE_URL` | OpenAI 호환 엔드포인트 | `https://api.groq.com/openai` |
| `GROQ_MODEL` | 채팅 모델 | `llama-3.3-70b-versatile` |

`.env` 위치: **프로젝트 루트** `./.env` (또는 IDE 작업 디렉터리에 맞게 조정). 키가 없어도 서버는 기동됩니다.

### 백엔드 (CORS)

`application.properties`의 `app.cors.allowed-origins`로 허용 출처를 지정합니다. 기본은 Next 개발 서버(`http://localhost:3000` 등)입니다. 프론트를 다른 포트/도메인에서 띄우면 여기에 추가하세요.

### 프론트엔드

| 변수 | 설명 |
|------|------|
| `BACKEND_ORIGIN` | Next **rewrites** 프록시 대상 (기본 `http://localhost:8080`) |
| `NEXT_PUBLIC_API_BASE_URL` | API 베이스 URL을 직접 지정할 때(끝의 `/` 없이). 비우면 브라우저는 `/api/...`로 요청해 rewrite로 백엔드로 전달 |
| `API_URL_SERVER` | 서버 컴포넌트 등에서 쓰는 API 베이스(미설정 시 `http://localhost:8080/api`) |

## 실행 방법

### 1. 백엔드

```bash
cd backend
mvn spring-boot:run
```

기본 포트는 **8080**입니다. H2 콘솔은 개발 설정에서 켜져 있습니다 (`application.properties`).

### 2. 프론트엔드

```bash
cd frontend
npm install
npm run dev
```

개발 서버는 보통 **http://localhost:3000** 입니다. `next.config.mjs`의 rewrite로 `/api/*`가 백엔드로 프록시됩니다.

### 빌드

- 백엔드: `cd backend && mvn -q -DskipTests package`
- 프론트: `cd frontend && npm run build && npm start`

## 프로젝트 구조

```
intreview/
├── backend/          # Spring Boot API
│   └── src/main/java/com/rookies5/intreview/
└── frontend/         # Next.js 앱
    └── app/, components/, lib/
```

## 라이선스 및 기여

저장소 정책에 맞게 LICENSE·기여 가이드를 추가하면 됩니다. (현재 `pom.xml`의 메타데이터는 템플릿 상태입니다.)
