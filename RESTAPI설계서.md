# REST API 설계서

## 문서 정보

- 프로젝트명: Intreview
- 작성자: 권서진
- 작성일: 2026-04-01
- 버전: v1.0
- API 버전: v1
- Base URL: `https://localhost:8080/api`

> 로그인 후 사용자 `id`를 반환하며, 이후 요청은 **`X-User-Id` 헤더**로 사용자 식별을 수행한다. **인증/인가 기능은 구현하지 않는다.**

### 구현 MVP 권장 범위 (1인 토이)

문서 전체는 확장·포트폴리오용으로 유지하고, **실제 구현 우선순위**는 아래만으로 충분하다.

- 회원가입 / 로그인  
- Interview CRUD  
- Question Bank CRUD  
- InterviewQuestion 생성 (`sourceType` 요청)  
- `answerText` / `reviewText` PATCH  

---

## 1. API 설계 개요

### 1.1 설계 목적

RESTful 원칙에 따라 클라이언트-서버 간 통신 규격을 정의하여 일관되고 확장 가능한 API를 제공한다. Intreview의 핵심 흐름(질문 자산화, 준비 질문, 실제 면접 질문, 답변·복기)을 API로 노출한다.

### 1.2 설계 원칙

- RESTful 아키텍처: HTTP 메서드와 상태 코드의 올바른 사용
- 일관성: 모든 API 엔드포인트에서 동일한 규칙 적용
- 버전 관리: URL 경로를 통한 버전 구분(필요 시 `/api/v1` 접두 확장)
- 단순성: 인증·인가 스택 없음
- 성능: 페이지네이션, 필요 시 캐싱
- 문서화: 명확한 요청/응답 스펙 제공(OpenAPI 3.0)

### 1.3 기술 스택

- 프레임워크: Spring Boot 3.4.6
- 회원: 컨트롤러·서비스에서 직접 아이디/비밀번호 검증(또는 간단한 헬퍼).
- 직렬화: JSON
- API 문서: OpenAPI 3.0 (Swagger / springdoc-openapi)

---

## 2. API 공통 규칙

### 2.1 URL 설계 규칙

| 규칙 | 설명 | 좋은 예 | 나쁜 예 |
|------|------|---------|---------|
| 명사 사용 | 동사가 아닌 명사로 리소스 표현 | `/api/interviews` | `/api/getInterviews` |
| 복수형 사용 | 컬렉션은 복수형으로 표현 | `/api/interviews` | `/api/interview` |
| 계층 구조 | 리소스 간 관계를 URL로 표현 | `/api/interviews/123/questions` | `/api/getInterviewQuestions` |
| 소문자 사용 | URL은 소문자와 하이픈 사용 | `/api/question-bank/questions` | `/api/QuestionBank` |
| 동작 표현 | HTTP 메서드로 동작 구분 | `POST /api/interviews` | `/api/createInterview` |

### 2.2 HTTP 메서드 사용 규칙

| 메서드 | 용도 | 멱등성 | 안전성 | 예시 |
|--------|------|:------:|:------:|------|
| GET | 리소스 조회 | ✅ | ✅ | `GET /api/interviews` |
| POST | 리소스 생성 | ❌ | ❌ | `POST /api/interviews` |
| PUT | 리소스 전체 수정 | ✅ | ❌ | `PUT /api/interviews/123` |
| PATCH | 리소스 부분 수정 | ❌ | ❌ | `PATCH /api/interviews/123/questions/456` |
| DELETE | 리소스 삭제 | ✅ | ❌ | `DELETE /api/interviews/123` |

### 2.3 HTTP 상태 코드 가이드

| 코드 | 상태 | 설명 | 사용 예시 |
|------|------|------|-----------|
| 200 | OK | 성공 (데이터 포함) | GET/PATCH 성공 |
| 201 | Created | 리소스 생성 성공 | POST 성공 |
| 204 | No Content | 성공 (응답 본문 없음) | DELETE, 로그아웃 등 |
| 400 | Bad Request | 잘못된 요청 | 검증 실패 |
| 401 | Unauthorized | 로그인 실패 등 | 아이디/비밀번호 불일치 |
| 403 | Forbidden | 거절(선택) | 다른 사용자 소유 리소스 접근 시(서비스에서 비교할 때) |
| 404 | Not Found | 리소스 없음 | 존재하지 않는 ID |
| 409 | Conflict | 충돌 | username 중복 등 |
| 422 | Unprocessable Entity | 의미상 오류 | 비즈니스 규칙 위반 |
| 500 | Internal Server Error | 서버 오류 | 예기치 못한 오류 |

### 2.4 공통 요청 헤더

로그인·회원가입을 제외한 API는 **`X-User-Id: {로그인 응답 id}`** 를 붙인다.

```
Content-Type: application/json
Accept: application/json
X-User-Id: 1
```

### 2.5 공통 응답 형식

성공·실패 모두 **동일한 뼈대**를 쓴다. 실패 시 `data`는 `null`, `error`에 코드·메시지를 넣는다.

**성공 (단일 객체)**

```json
{
  "success": true,
  "data": {},
  "message": "요청이 성공적으로 처리되었습니다",
  "timestamp": "2026-04-01T10:30:00Z"
}
```

**성공 (목록/페이지네이션)**

```json
{
  "success": true,
  "data": {
    "content": [],
    "page": {
      "number": 0,
      "size": 20,
      "totalElements": 150,
      "totalPages": 8,
      "first": true,
      "last": false,
      "numberOfElements": 20
    }
  },
  "message": "목록 조회가 완료되었습니다",
  "timestamp": "2026-04-01T10:30:00Z"
}
```

**실패 (통일)**

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지"
  },
  "timestamp": "2026-04-01T10:30:00Z"
}
```

---

## 3. 회원 (로그인·식별)

문서 상단 인용문과 동일. 회원가입은 DB 저장, 로그인은 비밀번호 검증 후 `id` 반환, 로그아웃은 클라이언트에서 `id` 삭제로 충분.

### 3.1 회원가입 API

`POST /api/auth/register`  
`Content-Type: application/json`  
`X-User-Id` 불필요

**Request Body:**

```json
{
  "username": "devuser",
  "password": "password123!"
}
```

**Validation Rules:**

- `username`: 필수, 3–30자, 중복 불가
- `password`: 필수, 정책에 맞는 길이·복잡도(프로젝트 정책에 따름)

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "devuser",
    "createdAt": "2026-04-01T10:00:00Z"
  },
  "message": "회원가입이 완료되었습니다"
}
```

- 응답에 **비밀번호·해시는 포함하지 않는다.**

**Response (409 Conflict):**

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "DUPLICATE_USERNAME",
    "message": "이미 사용 중인 아이디입니다"
  },
  "timestamp": "2026-04-01T10:00:00Z"
}
```

### 3.2 로그인 API

`POST /api/auth/login`  
`Content-Type: application/json`  
`X-User-Id` 불필요

**Request Body:**

```json
{
  "username": "devuser",
  "password": "password123!"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "devuser"
  },
  "message": "로그인이 성공하였습니다"
}
```

- 클라이언트는 **`data.id`를 저장**하고 이후 **`X-User-Id`** 로 전달한다.

**Response (401 Unauthorized):**

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "아이디 또는 비밀번호가 올바르지 않습니다"
  },
  "timestamp": "2026-04-01T10:00:00Z"
}
```

---

## 4. 상세 API 명세

### 4.1 현재 사용자 API

#### 4.1.1 내 정보 조회

`GET /api/users/me`  
`X-User-Id: {사용자ID}` (필수, 로그인 응답의 id와 동일)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "devuser",
    "createdAt": "2026-04-01T10:00:00Z",
    "updatedAt": "2026-04-01T10:00:00Z"
  }
}
```

---

### 4.2 Question Bank API (질문 저장소)

#### 4.2.1 질문 자산 목록 조회

`GET /api/question-bank/questions`  
`X-User-Id: {사용자ID}` (필수, 로그인 응답의 id와 동일)

**Query Parameters (MVP):** `page`, `size` 만 사용해도 충분하다.

**Response (200 OK):** 공통 페이지네이션 형식, `content[]`에 질문 자산 요약

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 10,
        "questionText": "자기소개를 해 주세요.",
        "sourceType": "MANUAL",
        "archived": false,
        "createdAt": "2026-04-01T09:00:00Z"
      }
    ],
    "page": {
      "number": 0,
      "size": 20,
      "totalElements": 42,
      "totalPages": 3,
      "first": true,
      "last": false
    }
  }
}
```

#### 4.2.2 질문 자산 상세 조회

`GET /api/question-bank/questions/{questionId}`  
`X-User-Id: {사용자ID}` (필수, 로그인 응답의 id와 동일)

**Path Parameters:**

- `questionId`: long (required)

**Response (404 Not Found):** `QUESTION_BANK_NOT_FOUND`

#### 4.2.3 질문 자산 등록 (직접 입력)

`POST /api/question-bank/questions`  
`Content-Type: application/json`  
`X-User-Id: {사용자ID}` (필수, 로그인 응답의 id와 동일)

**Request Body:**

```json
{
  "questionText": "프로젝트에서 가장 어려웠던 점은 무엇인가요?",
  "sourceType": "MANUAL"
}
```

**Response (201 Created):** 생성된 자산 전체

#### 4.2.4 질문 자산 수정

`PATCH /api/question-bank/questions/{questionId}`  
`Content-Type: application/json`  
`X-User-Id: {사용자ID}` (필수, 로그인 응답의 id와 동일)

**Request Body (부분):**

```json
{
  "questionText": "수정된 질문 텍스트",
  "archived": false
}
```

**Response (200 OK)**

#### 4.2.5 질문 자산 삭제

`DELETE /api/question-bank/questions/{questionId}`  
`X-User-Id: {사용자ID}` (필수, 로그인 응답의 id와 동일)

**Response (204 No Content)**

---

### 4.3 준비 질문 API (Preparation Question)

> 준비 질문은 **특정 면접에 종속되지 않고** 사용자 소유로 재사용된다.

#### 4.3.1 준비 질문 목록 조회

`GET /api/preparation-questions`  
`X-User-Id: {사용자ID}` (필수, 로그인 응답의 id와 동일)

**Query Parameters (MVP):** `page`, `size`

**Response (200 OK):** 페이지네이션

#### 4.3.2 준비 질문 등록

`POST /api/preparation-questions`  
`Content-Type: application/json`  
`X-User-Id: {사용자ID}` (필수, 로그인 응답의 id와 동일)

**Request Body (Question Bank에서 선택):**

```json
{
  "sourceType": "FROM_BANK",
  "questionBankQuestionId": 10,
  "practiceAnswer": "예상 답변 초안"
}
```

**Request Body (직접 입력):**

```json
{
  "sourceType": "CUSTOM",
  "questionTextSnapshot": "직접 작성한 준비 질문",
  "practiceAnswer": "연습용 답변"
}
```

**Business Rules:**

- `FROM_BANK`일 때 `questionBankQuestionId` 필수, 서버가 스냅샷 생성
- `CUSTOM`일 때 `questionTextSnapshot` 필수
- `practiceAnswer`는 선택 입력이며, 준비 질문에 대한 연습 답변을 저장한다

**Response (201 Created)**

#### 4.3.3 준비 질문 상세 조회

`GET /api/preparation-questions/{preparationQuestionId}`  
`X-User-Id: {사용자ID}` (필수, 로그인 응답의 id와 동일)

#### 4.3.4 준비 질문 수정 (스냅샷 등)

`PATCH /api/preparation-questions/{preparationQuestionId}`  
`X-User-Id: {사용자ID}` (필수, 로그인 응답의 id와 동일)

**Request Body 예시:**

```json
{
  "questionTextSnapshot": "수정된 스냅샷 텍스트",
  "practiceAnswer": "수정된 연습 답변"
}
```

**Response (200 OK)**

#### 4.3.5 준비 질문 삭제

`DELETE /api/preparation-questions/{preparationQuestionId}`  
`X-User-Id: {사용자ID}` (필수, 로그인 응답의 id와 동일)

**Response (204 No Content)**

---

### 4.4 면접 API (Interview)

#### 4.4.1 면접 목록 조회

`GET /api/interviews`  
`X-User-Id: {사용자ID}` (필수, 로그인 응답의 id와 동일)

**Query Parameters (MVP):** `page`, `size`

**Response (200 OK):** 페이지네이션

#### 4.4.2 면접 상세 조회

`GET /api/interviews/{interviewId}`  
`X-User-Id: {사용자ID}` (필수, 로그인 응답의 id와 동일)

면접 질문 목록은 `GET /api/interviews/{interviewId}/questions` 로 별도 조회한다.

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": 100,
    "companyName": "테크코프",
    "positionTitle": "백엔드 개발자",
    "interviewDate": "2026-03-28",
    "status": "DRAFT",
    "memo": "",
    "createdAt": "2026-04-01T08:00:00Z",
    "updatedAt": "2026-04-01T08:00:00Z"
  }
}
```

#### 4.4.3 면접 생성

`POST /api/interviews`  
`Content-Type: application/json`  
`X-User-Id: {사용자ID}` (필수, 로그인 응답의 id와 동일)

**Request Body:**

```json
{
  "companyName": "테크코프",
  "positionTitle": "백엔드 개발자",
  "interviewDate": "2026-03-28",
  "memo": "1차 기술면접"
}
```

**Response (201 Created)**

#### 4.4.4 면접 수정

`PUT /api/interviews/{interviewId}`  
`Content-Type: application/json`  
`X-User-Id: {사용자ID}` (필수, 로그인 응답의 id와 동일)

**Request Body:** 생성과 동일 필드 전체 또는 PATCH로 부분 수정 정책 선택

**Response (200 OK)**

#### 4.4.5 면접 삭제

`DELETE /api/interviews/{interviewId}`  
`X-User-Id: {사용자ID}` (필수, 로그인 응답의 id와 동일)

**Response (204 No Content)**  
(정책에 따라 소속 `InterviewQuestion` cascade 삭제)

---

### 4.5 실제 면접 질문 API (Interview Question)

리소스 경로: `/api/interviews/{interviewId}/questions`

#### 4.5.1 면접 질문 목록 조회

`GET /api/interviews/{interviewId}/questions`  
`X-User-Id: {사용자ID}` (필수, 로그인 응답의 id와 동일)

**Query Parameters (MVP):** `page`, `size`

**Response (200 OK):** 페이지네이션

#### 4.5.2 면접 질문 등록

`POST /api/interviews/{interviewId}/questions`  
`Content-Type: application/json`  
`X-User-Id: {사용자ID}` (필수, 로그인 응답의 id와 동일)

**Request Body (준비 질문에서):**

```json
{
  "sourceType": "FROM_PREPARATION",
  "preparationQuestionId": 5,
  "sortOrder": 0
}
```

**Request Body (Question Bank에서):**

```json
{
  "sourceType": "FROM_BANK",
  "questionBankQuestionId": 10,
  "sortOrder": 1
}
```

**Request Body (직접 입력):**

```json
{
  "sourceType": "CUSTOM",
  "questionTextSnapshot": "면접장에서 나온 새 질문",
  "sortOrder": 2
}
```

**Response (201 Created)**

#### 4.5.3 면접 질문 상세 조회

`GET /api/interviews/{interviewId}/questions/{questionId}`  
`X-User-Id: {사용자ID}` (필수, 로그인 응답의 id와 동일)

**Response (200 OK):** `questionTextSnapshot`, `answerText`, `reviewText`, `sourceType`, 참조 ID 등

#### 4.5.4 답변·복기 수정 (부분)

`PATCH /api/interviews/{interviewId}/questions/{questionId}`  
`Content-Type: application/json`  
`X-User-Id: {사용자ID}` (필수, 로그인 응답의 id와 동일)

**Request Body:**

```json
{
  "answerText": "실제로 답한 내용 요약...",
  "reviewText": "복기: 다음에는 OO을 보강하자"
}
```

**Response (200 OK)**

#### 4.5.5 면접 질문 삭제

`DELETE /api/interviews/{interviewId}/questions/{questionId}`  
`X-User-Id: {사용자ID}` (필수, 로그인 응답의 id와 동일)

**Response (204 No Content)**

---

### 4.6 (선택) LLM 피드백 API

프로젝트 개요서상 선택 기능. 구현 시 예시:

`POST /api/interviews/{interviewId}/questions/{questionId}/feedback`  
`X-User-Id: {사용자ID}` (필수, 로그인 응답의 id와 동일)

**Request Body:**

```json
{
  "answerText": "현재 답변 기준으로 피드백 요청"
}
```

**Response (200 OK):** `suggestedAnswer`, `hints` 등 스키마는 구현 시 OpenAPI에 정의

---

## 5. 에러 코드 및 처리

에러 응답 본문은 **§2.5 실패 형식**(`success: false`, `data: null`, `error.code` / `error.message`)으로 통일한다.

### 5.1 표준 에러 코드 정의

| 코드 | HTTP 상태 | 설명 | 해결 방법 |
|------|-----------|------|-----------|
| VALIDATION_ERROR | 400 | 입력값 검증 실패 | 요청 데이터 확인 후 재시도 |
| INVALID_CREDENTIALS | 401 | 로그인 시 아이디/비밀번호 불일치 | 로그인 정보 확인 |
| USER_ID_REQUIRED | 400 | `X-User-Id` 누락(구현 시) | 헤더에 id 추가 |
| ACCESS_DENIED | 403 | 다른 사용자 리소스(구현 시) | id·경로 확인 |
| RESOURCE_NOT_FOUND | 404 | 리소스 없음 | URL 및 ID 확인 |
| DUPLICATE_RESOURCE | 409 | 중복 생성 시도 | 기존 리소스 확인 |
| BUSINESS_RULE_VIOLATION | 422 | 비즈니스 규칙 위반 | 조건 충족 후 재시도 |
| INTERNAL_SERVER_ERROR | 500 | 서버 내부 오류 | 관리자 문의 |

### 5.2 비즈니스 로직 에러 코드 (Intreview)

| 코드 | 설명 | 해결 방법 |
|------|------|-----------|
| USER_NOT_FOUND | 사용자 없음 | id·username 확인 |
| DUPLICATE_USERNAME | 아이디 중복 | 다른 username 사용 |
| INTERVIEW_NOT_FOUND | 면접 없음 | interviewId 확인 |
| QUESTION_BANK_NOT_FOUND | 질문 자산 없음 | ID 및 소유자 확인 |
| PREPARATION_QUESTION_NOT_FOUND | 준비 질문 없음 | ID 확인 |
| INTERVIEW_QUESTION_NOT_FOUND | 면접 질문 없음 | 경로 ID 확인 |
| INVALID_SOURCE_COMBINATION | sourceType과 참조 ID 불일치 | 요청 본문 규칙 확인 |
| ARCHIVED_QUESTION_NOT_EDITABLE | 보관된 자산 수정 불가 | archived 해제 또는 신규 생성 |

---

## 6. API 문서화

### 6.1 OpenAPI 3.0 스펙 예시

```yaml
openapi: 3.0.3
info:
  title: Intreview API
  description: 면접 질문 기록 및 복기 중심 REST API (세션·JWT·Spring Security 없음, X-User-Id 헤더)
  version: 1.0.0

servers:
  - url: https://localhost:8080/api
    description: 로컬 개발

paths:
  /auth/login:
    post:
      summary: 로그인 (비밀번호 검증 후 사용자 id 반환)
      tags: [Auth]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [username, password]
              properties:
                username:
                  type: string
                password:
                  type: string
      responses:
        '200':
          description: 성공 (본문에 id 포함, 세션/토큰 없음)
        '401':
          description: 아이디 또는 비밀번호 불일치

  /interviews:
    get:
      summary: 면접 목록 조회
      tags: [Interviews]
      parameters:
        - name: X-User-Id
          in: header
          required: true
          schema:
            type: integer
            example: 1
        - name: page
          in: query
          schema:
            type: integer
            minimum: 0
            default: 0
        - name: size
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20
      responses:
        '200':
          description: 성공
```

### 6.2 API 문서 생성 도구 (Spring Boot 3 + springdoc-openapi)

```java
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI intreviewOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Intreview API")
                        .version("v1.0.0")
                        .description("면접 질문 기록 및 복기 중심 REST API (인증 프레임워크 없음, X-User-Id 헤더)"));
    }
}
```

의존성: `org.springdoc:springdoc-openapi-starter-webmvc-ui` (버전은 프로젝트에 맞게 지정)

Swagger UI 테스트 시 요청마다 **`X-User-Id` 헤더**를 넣는다.

---

## 7. 체크리스트 및 품질 관리

### 7.1 API 설계 체크리스트

- [ ] RESTful 원칙·URL·HTTP 메서드·상태 코드가 일관되는가?
- [ ] 성공/실패 응답이 §2.5와 같은 구조인가?
- [ ] 목록 API에 `page`/`size`가 있는가?

### 7.2 보안 체크리스트

- [ ] 입력값 검증(Bean Validation 등)이 있는가?
- [ ] `X-User-Id` 방식은 로컬·토이 전제임을 인지했는가?
- [ ] 에러 메시지에 스택·내부 경로가 노출되지 않는가?

### 7.3 성능 체크리스트

- [ ] 목록 조회 N+1이 없는가(fetch join, DTO 등)?
- [ ] 검색·필터 컬럼에 인덱스가 있는가?

---

## 8. 마무리

### 8.1 주요 포인트 요약

- RESTful 설계 + **응답 형식 단일화** (§2.5)
- 도메인: Question Bank, 준비 질문(면접 비종속), 면접, 면접 질문(`sourceType`), 답변·복기
- 사용자 식별: 로그인 후 **`X-User-Id`** (인증/인가 프레임워크 없음)
- **문서는 넓게**, **구현은 문서 상단 MVP 권장 범위**부터

### 8.2 추천 도구 및 라이브러리

- 문서화: Swagger UI(springdoc), Postman
- 테스트: REST Assured, MockMvc
