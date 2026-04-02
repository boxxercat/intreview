# Entity 설계서

## 문서 정보
- 프로젝트명: Intreview
- 작성자: 권서진진
- 작성일: 2026-03-30
- 버전: v1.0

---

## 1. Entity 설계 개요

### 1.1 설계 목적
- ORM 기반(JPA)에서 도메인 개념(회원/면접/질문 자산/준비 질문/실제 질문/답변/복기)을 엔티티로 명확히 모델링한다.
- “면접 이후 복기 중심” 흐름에서 데이터가 자산화(Question Bank)되고 재사용될 수 있도록, 질문의 출처 및 스냅샷 개념을 엔티티 제약으로 보장한다.

### 1.2 설계 원칙
- 단일 책임 원칙: 각 Entity는 자신의 도메인 상태와 불변성을 직접 관리한다.
- 캡슐화: 컬렉션/필드 변경은 도메인 메서드를 통해서만 일어나도록 설계한다.
- 불변성: 질문 텍스트는 출처 변경/수정에 영향을 덜 받도록 스냅샷 형태로 보존한다.
- 연관관계 최소화: 깊은 fetch를 기본값으로 만들지 않고, 필요한 경우에만 fetch join/EntityGraph로 최적화한다.
- 모든 질문은 snapshot 기반으로 저장되며, 원본 변경과 독립성을 유지한다.

### 1.3 기술 스택
- ORM 프레임워크: Spring Data JPA
- 데이터베이스: H2(개발), 추후 RDBMS 확장 고려
- 검증 프레임워크: Bean Validation(JSR-380)
- 감사(Auditing) 기능: Spring Data JPA Auditing

---

## 2. Entity 목록 및 분류

### 2.1 Entity 분류 매트릭스
| Entity명 | 유형 | 비즈니스 중요도 | 기술적 복잡도 | 우선순위 |
|---|---|---:|---:|---:|
| `User` | Owner(계정) | 상 | 중 | 1 |
| `QuestionBankQuestion` | 자산(질문 저장소) | 상 | 중 | 1 |
| `Interview` | 면접(집계 루트) | 상 | 중 | 1 |
| `PreparationQuestion` | 준비 질문(스냅샷) | 상 | 중 | 1 |
| `InterviewQuestion` | 실제 질문(스냅샷) | 상 | 중 | 1 |

### 2.2 Entity 상속 구조
- `BaseEntity`를 `@MappedSuperclass`로 정의한다.
- 모든 엔티티는 `BaseEntity`를 상속받아 createdAt/updatedAt 및(선택) createdBy/updatedBy를 공통화한다.

---

## 3. 공통 설계 규칙

### 3.1 네이밍 규칙
| 구분 | 규칙 | 예시 | 비고 |
|---|---|---|---|
| Entity | 단수 명사 사용 | `Interview` | JPA 관례 |
| Table | snake_case | `interviews` | 기본적으로 복수형 권장 |
| Column | snake_case | `company_name` | 가독성 우선 |
| PK | `id` | `id` | 공통 |
| FK | `owner_id`, `interview_id` | `interview_id` | 관계 명시 |
| Unique 제약 | `uk_<table>_<column>` | `uk_users_username` | 일관성 |

### 3.2 공통 어노테이션 규칙
- 기본 Entity 구조 예시(로직 핵심만 포함).
```java
@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends BaseEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id", updatable = false, nullable = false)
  private Long id;
}
```

### 3.3 ID 생성 전략
| Entity | 전략 | 이유 | 예시 |
|---|---|---|---|
| 모든 엔티티 | `GenerationType.IDENTITY` | H2/실무 RDB 기본 호환, 단순성 | `@GeneratedValue(strategy = GenerationType.IDENTITY)` |

---

## 4. 상세 Entity 설계

> 표기 규칙: 아래 코드는 “설계 문서” 목적이며, 실제 프로젝트에서는 Lombok/패키지/리포지토리 구현 스타일에 맞춰 조정한다.

---

### 4.1 User Entity

#### 4.1.1 기본 정보
- 설명: 서비스 사용자를 나타내며, 자신의 면접/질문 자산을 소유한다.
- 기본 클래스 코드
```java
@Entity
@Table(
  name = "users",
  uniqueConstraints = {
    @UniqueConstraint(name = "uk_users_username", columnNames = {"username"})
  }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends BaseEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id", updatable = false, nullable = false)
  private Long id;

  @Column(name = "username", nullable = false, length = 30)
  private String username;

  @Column(name = "password_hash", nullable = false, length = 200)
  private String passwordHash;

  @Enumerated(EnumType.STRING)
  @Column(name = "role", nullable = false, length = 20)
  private UserRole role;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false, length = 20)
  private UserStatus status;

  protected User(String username, String passwordHash) {
    this.username = username;
    this.passwordHash = passwordHash;
    this.role = UserRole.USER;
    this.status = UserStatus.ACTIVE;
  }

  public static User register(String username, String passwordHash) {
    // 비밀번호는 BCrypt 등으로 hash된 값이 들어온다고 가정
    return new User(username, passwordHash);
  }
}
```

#### 4.1.2 필드 상세 명세
| 필드명 | 데이터 타입 | 컬럼명 | 제약조건 | 설명 | 비즈니스 규칙 |
|---|---|---|---|---|---|
| `username` | `String` | `username` | `NOT NULL`, `UNIQUE`, `length<=30` | 로그인 아이디 | 공백 제외/형식 검증 필요 |
| `passwordHash` | `String` | `password_hash` | `NOT NULL` | 해시된 비밀번호 | 평문 저장 금지 |
| `role` | `UserRole` | `role` | `NOT NULL` | 권한 | MVP는 단일 `USER` |
| `status` | `UserStatus` | `status` | `NOT NULL` | 계정 상태 | `INACTIVE`는 로그인 차단 |

#### 4.1.3 연관관계 매핑
- 설명: `Interview`는 `User`를 `ManyToOne`으로 참조한다. 반대로 `User`에서 `Interview`로의 양방향 역참조는 조회 패턴이 분명할 때만 추가한다(기본은 단방향).

#### 4.1.4 비즈니스 메서드
```java
public void deactivate() {
  if (this.status == UserStatus.INACTIVE) return;
  this.status = UserStatus.INACTIVE;
}
```

---

### 4.2 QuestionBankQuestion Entity

#### 4.2.1 기본 정보
- 설명: Question Bank의 “개별 질문 자산”을 나타낸다. 질문의 출처(직접 등록/면접에서 복사)를 추적한다.
- 기본 클래스 코드
```java
@Entity
@Table(
  name = "question_bank_questions",
  indexes = {
    @Index(name = "idx_qbq_owner_date", columnList = "owner_id, created_at")
  }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class QuestionBankQuestion extends BaseEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id", updatable = false, nullable = false)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "owner_id", nullable = false)
  private User owner;

  @Column(name = "question_text", nullable = false, length = 4000)
  private String questionText;

  @Enumerated(EnumType.STRING)
  @Column(name = "source_type", nullable = false, length = 30)
  private QuestionAssetSourceType sourceType;

<<<<<<< HEAD
=======
  @Enumerated(EnumType.STRING)
  @Column(name = "difficulty", nullable = false, length = 20)
  private QuestionDifficulty difficulty;

>>>>>>> b08cc8d453cc8b2581f1270ee662d3a1e2aab927
  @Column(name = "archived", nullable = false)
  private boolean archived;

  protected QuestionBankQuestion() {}

<<<<<<< HEAD
  private QuestionBankQuestion(User owner, String questionText, QuestionAssetSourceType sourceType) {
    this.owner = owner;
    this.questionText = questionText;
    this.sourceType = sourceType;
=======
  private QuestionBankQuestion(User owner, String questionText, QuestionAssetSourceType sourceType, QuestionDifficulty difficulty) {
    this.owner = owner;
    this.questionText = questionText;
    this.sourceType = sourceType;
    this.difficulty = difficulty;
>>>>>>> b08cc8d453cc8b2581f1270ee662d3a1e2aab927
    this.archived = false;
  }

  public static QuestionBankQuestion create(User owner, String questionText, QuestionAssetSourceType sourceType) {
<<<<<<< HEAD
    return new QuestionBankQuestion(owner, questionText, sourceType);
=======
    return new QuestionBankQuestion(owner, questionText, sourceType, QuestionDifficulty.NORMAL);
>>>>>>> b08cc8d453cc8b2581f1270ee662d3a1e2aab927
  }

  public void archive() {
    this.archived = true;
  }
}
```

#### 4.2.2 필드 상세 명세
| 필드명 | 데이터 타입 | 컬럼명 | 제약조건 | 설명 | 비즈니스 규칙 |
|---|---|---|---|---|---|
| `owner` | `User` | `owner_id` | `NOT NULL` | 질문 자산 소유자 | 사용자별 자산 분리 |
| `questionText` | `String` | `question_text` | `NOT NULL`, `length<=4000` | 질문 내용 | 스냅샷/복제 대비 원본 역할 |
| `sourceType` | `QuestionAssetSourceType` | `source_type` | `NOT NULL` | 생성 출처 | 직접/면접 복사 구분 |
<<<<<<< HEAD
=======
| `difficulty` | `QuestionDifficulty` | `difficulty` | `NOT NULL` | 난이도 | MVP는 `NORMAL` 기본 |
>>>>>>> b08cc8d453cc8b2581f1270ee662d3a1e2aab927
| `archived` | `boolean` | `archived` | `NOT NULL` | 비활성화 | 삭제 대신 보관(선택) |

#### 4.2.3 연관관계 매핑
```java
@ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "owner_id", nullable = false)
private User owner;
```
- 설명: 자산은 사용자 소유이며, Preparation/Interview에서 필요한 경우 스냅샷을 저장한다.

#### 4.2.4 비즈니스 메서드
```java
public void updateText(String newText) {
  if (archived) throw new IllegalStateException("Archived asset cannot be edited.");
  this.questionText = newText;
}
```

---

### 4.3 Interview Entity

#### 4.3.1 기본 정보
- 설명: 사용자의 “하나의 면접”을 나타내며 준비 질문/실제 질문의 집계 루트 역할을 한다.
- 기본 클래스 코드
```java
@Entity
@Table(
  name = "interviews",
  indexes = {
    @Index(name = "idx_interviews_owner_date", columnList = "user_id, interview_date")
  }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Interview extends BaseEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id", updatable = false, nullable = false)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(name = "company_name", nullable = false, length = 120)
  private String companyName;

  @Column(name = "position_title", nullable = false, length = 120)
  private String positionTitle;

  @Column(name = "interview_date", nullable = false)
  private LocalDate interviewDate;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false, length = 30)
  private InterviewStatus status;

  @Column(name = "memo", nullable = false, length = 2000)
  private String memo;

  @OneToMany(mappedBy = "interview", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<InterviewQuestion> interviewQuestions = new ArrayList<>();

  protected Interview() {}

  private Interview(User user, String companyName, String positionTitle, LocalDate interviewDate, String memo) {
    this.user = user;
    this.companyName = companyName;
    this.positionTitle = positionTitle;
    this.interviewDate = interviewDate;
    this.status = InterviewStatus.DRAFT;
    this.memo = memo == null ? "" : memo;
  }

  public static Interview create(User user, String companyName, String positionTitle, LocalDate interviewDate, String memo) {
    return new Interview(user, companyName, positionTitle, interviewDate, memo);
  }

  public void markCompleted() {
    if (this.status == InterviewStatus.COMPLETED) return;
    this.status = InterviewStatus.COMPLETED;
  }
}
```

#### 4.3.2 필드 상세 명세
| 필드명 | 데이터 타입 | 컬럼명 | 제약조건 | 설명 | 비즈니스 규칙 |
|---|---|---|---|---|---|
| `user` | `User` | `user_id` | `NOT NULL` | 면접 소유자 | 사용자 단위 격리 |
| `companyName` | `String` | `company_name` | `NOT NULL` | 회사명 | 1~120자 |
| `positionTitle` | `String` | `position_title` | `NOT NULL` | 직무/포지션 | 1~120자 |
| `interviewDate` | `LocalDate` | `interview_date` | `NOT NULL` | 면접 날짜 | 과거/미래 모두 허용(선택) |
| `status` | `InterviewStatus` | `status` | `NOT NULL` | 상태 | DRAFT/COMPLETED |
| `memo` | `String` | `memo` | `NOT NULL`, `length<=2000` | 메모 | null 저장 금지 |

#### 4.3.3 연관관계 매핑
```java
@OneToMany(mappedBy = "interview", cascade = CascadeType.ALL, orphanRemoval = true)
private List<InterviewQuestion> interviewQuestions = new ArrayList<>();
```
- 설명: Interview는 `InterviewQuestion`의 “구성(composition) 루트”에 가깝다. orphanRemoval로 면접 삭제 시 연관 데이터 정리를 보장한다.

#### 4.3.4 비즈니스 메서드
```java
public void addInterviewQuestion(InterviewQuestion interviewQuestion) {
  interviewQuestions.add(interviewQuestion);
  interviewQuestion.setInterview(this);
}
```

> 주의: `setInterview`는 외부에서 호출되지 않도록 `package-private` 또는 `private` 접근자를 권장한다.

---

### 4.4 PreparationQuestion Entity
#### 4.4.1 기본 정보
- 설명: Interview에 “사용되는” 준비 질문 데이터이며, 특정 `Interview`에 종속되지 않고 사용자 단위로 재사용된다.
- 핵심: 질문 텍스트는 `questionTextSnapshot`으로 보관하여, 이후 원본 변경과 독립성을 유지한다.
- 기본 클래스 코드
```java
@Entity
@Table(
  name = "preparation_questions",
  indexes = {
    @Index(name = "idx_prepq_owner_created", columnList = "owner_id, created_at")
  }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PreparationQuestion extends BaseEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id", updatable = false, nullable = false)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "owner_id", nullable = false)
  private User owner;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "question_bank_question_id")
  private QuestionBankQuestion questionBankQuestion; // optional

  @Enumerated(EnumType.STRING)
  @Column(name = "source_type", nullable = false, length = 30)
  private PreparationQuestionSourceType sourceType;

  @Column(name = "question_text_snapshot", nullable = false, length = 4000)
  private String questionTextSnapshot;

<<<<<<< HEAD
  @Column(name = "practice_answer", length = 8000)
  private String practiceAnswer;

=======
>>>>>>> b08cc8d453cc8b2581f1270ee662d3a1e2aab927
  protected PreparationQuestion() {}

  private PreparationQuestion(
    User owner,
    QuestionBankQuestion questionBankQuestion,
    PreparationQuestionSourceType sourceType,
<<<<<<< HEAD
    String questionTextSnapshot,
    String practiceAnswer
=======
    String questionTextSnapshot
>>>>>>> b08cc8d453cc8b2581f1270ee662d3a1e2aab927
  ) {
    this.owner = owner;
    this.questionBankQuestion = questionBankQuestion;
    this.sourceType = sourceType;
    this.questionTextSnapshot = questionTextSnapshot;
<<<<<<< HEAD
    this.practiceAnswer = practiceAnswer;
  }

  public static PreparationQuestion fromBank(User owner, QuestionBankQuestion asset, String practiceAnswer) {
=======
  }

  public static PreparationQuestion fromBank(User owner, QuestionBankQuestion asset) {
>>>>>>> b08cc8d453cc8b2581f1270ee662d3a1e2aab927
    return new PreparationQuestion(
      owner,
      asset,
      PreparationQuestionSourceType.FROM_BANK,
<<<<<<< HEAD
      asset.getQuestionText(),
      practiceAnswer
    );
  }

  public static PreparationQuestion fromCustom(User owner, String customText, String practiceAnswer) {
=======
      asset.getQuestionText()
    );
  }

  public static PreparationQuestion fromCustom(User owner, String customText) {
>>>>>>> b08cc8d453cc8b2581f1270ee662d3a1e2aab927
    return new PreparationQuestion(
      owner,
      null,
      PreparationQuestionSourceType.CUSTOM,
<<<<<<< HEAD
      customText,
      practiceAnswer
=======
      customText
>>>>>>> b08cc8d453cc8b2581f1270ee662d3a1e2aab927
    );
  }

  public void updateQuestionTextSnapshot(String newSnapshot) {
    if (newSnapshot == null || newSnapshot.isBlank()) throw new IllegalArgumentException("questionTextSnapshot is blank");
    this.questionTextSnapshot = newSnapshot;
  }
<<<<<<< HEAD

  public void updatePracticeAnswer(String newAnswer) {
    if (newAnswer == null || newAnswer.isBlank()) throw new IllegalArgumentException("practiceAnswer is blank");
    this.practiceAnswer = newAnswer;
  }
=======
>>>>>>> b08cc8d453cc8b2581f1270ee662d3a1e2aab927
}
```

#### 4.4.2 필드 상세 명세
| 필드명 | 데이터 타입 | 컬럼명 | 제약조건 | 설명 | 비즈니스 규칙 |
|---|---|---|---|---|---|
| `owner` | `User` | `owner_id` | `NOT NULL` | 질문 자산 소유자 | 사용자별 자산 분리 |
| `questionBankQuestion` | `QuestionBankQuestion` | `question_bank_question_id` | `NULL 허용` | 자산 참조(선택) | sourceType=FROM_BANK일 때만 존재 |
| `sourceType` | `PreparationQuestionSourceType` | `source_type` | `NOT NULL` | 질문 출처 | FROM_BANK 또는 CUSTOM |
| `questionTextSnapshot` | `String` | `question_text_snapshot` | `NOT NULL` | 스냅샷 | 원본 변경과 독립성 유지 |
<<<<<<< HEAD
| `practiceAnswer` | `String` | `practice_answer` | `NULL 허용`, `length<=8000` | 연습 답변 | 준비 질문별 답변 초안 저장 |
=======
>>>>>>> b08cc8d453cc8b2581f1270ee662d3a1e2aab927

#### 4.4.3 연관관계 매핑
```java
@ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "owner_id", nullable = false)
private User owner;

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "question_bank_question_id")
private QuestionBankQuestion questionBankQuestion;
```

#### 4.4.4 비즈니스 메서드
```java
public void updateQuestionTextSnapshot(String newSnapshot) {
  if (newSnapshot == null || newSnapshot.isBlank()) throw new IllegalArgumentException("questionTextSnapshot is blank");
  this.questionTextSnapshot = newSnapshot;
}
<<<<<<< HEAD

public void updatePracticeAnswer(String newAnswer) {
  if (newAnswer == null || newAnswer.isBlank()) throw new IllegalArgumentException("practiceAnswer is blank");
  this.practiceAnswer = newAnswer;
}
=======
>>>>>>> b08cc8d453cc8b2581f1270ee662d3a1e2aab927
```

> 무결성(예: FROM_BANK면 `questionBankQuestion` null 금지)은 생성 메서드에서 강제하고, 추가 검증은 서비스 레이어에서 수행한다.

---

### 4.5 InterviewQuestion Entity

#### 4.5.1 기본 정보
- 설명: 실제 면접에서 나온 질문 기록이다. 준비 질문/질문 자산/직접 입력 중 출처를 기록한다.
- 핵심: `questionTextSnapshot`을 통해 “면접 당시 질문”을 보존한다.
- 기본 클래스 코드
```java
@Entity
@Table(
  name = "interview_questions",
  indexes = {
    @Index(name = "idx_interview_questions_interview_sort", columnList = "interview_id, sort_order")
  }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class InterviewQuestion extends BaseEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id", updatable = false, nullable = false)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "interview_id", nullable = false)
  private Interview interview;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "preparation_question_id")
  private PreparationQuestion preparationQuestion; // optional

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "question_bank_question_id")
  private QuestionBankQuestion questionBankQuestion; // optional

  @Enumerated(EnumType.STRING)
  @Column(name = "source_type", nullable = false, length = 30)
  private InterviewQuestionSourceType sourceType;

  @Column(name = "question_text_snapshot", nullable = false, length = 4000)
  private String questionTextSnapshot;

  @Column(name = "sort_order", nullable = false)
  private int sortOrder;

  @Column(name = "answer_text", length = 8000)
  private String answerText;

  @Column(name = "review_text", length = 8000)
  private String reviewText;

  protected InterviewQuestion() {}

  private InterviewQuestion(
    Interview interview,
    PreparationQuestion preparationQuestion,
    QuestionBankQuestion questionBankQuestion,
    InterviewQuestionSourceType sourceType,
    String questionTextSnapshot,
    int sortOrder
  ) {
    this.interview = interview;
    this.preparationQuestion = preparationQuestion;
    this.questionBankQuestion = questionBankQuestion;
    this.sourceType = sourceType;
    this.questionTextSnapshot = questionTextSnapshot;
    this.sortOrder = sortOrder;
  }

  public static InterviewQuestion fromPreparation(Interview interview, PreparationQuestion preparationQuestion, int sortOrder) {
    return new InterviewQuestion(
      interview,
      preparationQuestion,
      null,
      InterviewQuestionSourceType.FROM_PREPARATION,
      preparationQuestion.getQuestionTextSnapshot(),
      sortOrder
    );
  }

  public static InterviewQuestion fromBank(Interview interview, QuestionBankQuestion asset, int sortOrder) {
    return new InterviewQuestion(
      interview,
      null,
      asset,
      InterviewQuestionSourceType.FROM_BANK,
      asset.getQuestionText(),
      sortOrder
    );
  }

  public static InterviewQuestion fromCustom(Interview interview, String customText, int sortOrder) {
    return new InterviewQuestion(
      interview,
      null,
      null,
      InterviewQuestionSourceType.CUSTOM,
      customText,
      sortOrder
    );
  }

  void setInterview(Interview interview) {
    this.interview = interview;
  }

  public void updateAnswerText(String content) {
    if (content == null || content.isBlank()) throw new IllegalArgumentException("answerText is blank");
    this.answerText = content;
  }

  public void updateReviewText(String reviewText) {
    if (reviewText == null || reviewText.isBlank()) throw new IllegalArgumentException("reviewText is blank");
    this.reviewText = reviewText;
  }
}
```

#### 4.5.2 필드 상세 명세
| 필드명 | 데이터 타입 | 컬럼명 | 제약조건 | 설명 | 비즈니스 규칙 |
|---|---|---|---|---|---|
| `interview` | `Interview` | `interview_id` | `NOT NULL` | 소속 면접 | 구성 관계 |
| `preparationQuestion` | `PreparationQuestion` | `preparation_question_id` | `NULL 허용` | 준비 질문 참조(선택) | sourceType=FROM_PREPARATION일 때만 존재 |
| `questionBankQuestion` | `QuestionBankQuestion` | `question_bank_question_id` | `NULL 허용` | 자산 참조(선택) | sourceType=FROM_BANK일 때만 존재 |
| `sourceType` | `InterviewQuestionSourceType` | `source_type` | `NOT NULL` | 출처 | FROM_PREPARATION/FROM_BANK/CUSTOM |
| `questionTextSnapshot` | `String` | `question_text_snapshot` | `NOT NULL` | 면접 당시 질문 스냅샷 | null 금지 |
| `sortOrder` | `int` | `sort_order` | `NOT NULL` | 정렬 순서 | 0 이상(선택) |
| `answerText` | `String` | `answer_text` | `NULL 허용` | 답변 텍스트 | 서비스 입력 시 blank 금지 |
| `reviewText` | `String` | `review_text` | `NULL 허용` | 복기 텍스트 | 서비스 입력 시 blank 금지 |

#### 4.5.3 연관관계 매핑
```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "preparation_question_id")
private PreparationQuestion preparationQuestion;

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "question_bank_question_id")
private QuestionBankQuestion questionBankQuestion;
```

#### 4.5.4 비즈니스 메서드
- 설명: `sourceType`과 참조 필드(`preparationQuestion`, `questionBankQuestion`) 조합 검증은 `fromPreparation/fromBank/fromCustom` 팩토리 메서드에서 강제한다.
```java
public void updateAnswerText(String content) {
  if (content == null || content.isBlank()) throw new IllegalArgumentException("answerText is blank");
  this.answerText = content;
}

public void updateReviewText(String reviewText) {
  if (reviewText == null || reviewText.isBlank()) throw new IllegalArgumentException("reviewText is blank");
  this.reviewText = reviewText;
}
```

---

### 4.6 Answer Text

#### 4.6.1 기본 정보
- 설명: Answer는 별도 `Entity`로 분리하지 않고 `InterviewQuestion.answerText` 컬럼에 저장한다.

---

### 4.7 Review Text

#### 4.7.1 기본 정보
- 설명: Review는 별도 `Entity`로 분리하지 않고 `InterviewQuestion.reviewText` 컬럼에 저장한다.

---

## 5. Enum 타입 정의

### 5.1 UserRole
```java
public enum UserRole {
  USER
}
```

- 상태 설명: MVP에서는 `USER` 단일 역할만 운영한다(향후 확장 가능).

### 5.2 UserStatus
```java
public enum UserStatus {
  ACTIVE,
  INACTIVE
}
```

- 상태 설명: `INACTIVE`는 로그인/접근 제한에 사용한다.

### 5.3 InterviewStatus
```java
public enum InterviewStatus {
  DRAFT,
  COMPLETED
}
```

- 상태 설명: 면접 완료 시 상태 전환(복기 작성 흐름과 자연스럽게 연결).

### 5.4 QuestionAssetSourceType
```java
public enum QuestionAssetSourceType {
  MANUAL,
  IMPORTED_FROM_INTERVIEW
}
```

- 상태 설명: Question Bank 자산이 어떤 경로로 생성되었는지 추적한다.

<<<<<<< HEAD
### 5.5 PreparationQuestionSourceType
=======
### 5.5 QuestionDifficulty
```java
public enum QuestionDifficulty {
  EASY,
  NORMAL,
  HARD
}
```

- 상태 설명: 난이도 필드(선택). 추후 추천/통계에 활용 가능.

### 5.6 PreparationQuestionSourceType
>>>>>>> b08cc8d453cc8b2581f1270ee662d3a1e2aab927
```java
public enum PreparationQuestionSourceType {
  FROM_BANK,
  CUSTOM
}
```

- 상태 설명: 준비 질문의 출처 구분.

<<<<<<< HEAD
### 5.6 InterviewQuestionSourceType
=======
### 5.7 InterviewQuestionSourceType
>>>>>>> b08cc8d453cc8b2581f1270ee662d3a1e2aab927
```java
public enum InterviewQuestionSourceType {
  FROM_PREPARATION,
  FROM_BANK,
  CUSTOM
}
```

- 상태 설명: 실제 질문이 어디서 왔는지(준비/자산/직접) 구분한다.

---

## 6. 연관관계 매핑 전략

### 6.1 연관관계 매핑 규칙
| 관계 유형 | 기본 전략 | 이유 | 예외 상황 |
|---|---|---|---|
| `User` - `Interview` | `LAZY` + 조회 시 fetch join | 목록/상세에 따라 필요 데이터가 달라짐 | DTO projection 사용 |
| `Interview` - `InterviewQuestion` | `LAZY` + 필요 시 fetch join | 답변/복기 포함 시 N+1 주의 | `@EntityGraph` |
| `InterviewQuestion` - `PreparationQuestion` | `LAZY` + 필요 시 fetch join | 준비 질문 스냅샷 참조 | 상세 조회에서 fetch |
| `InterviewQuestion` - `QuestionBankQuestion` | `LAZY` + snapshot 중심 | 깊은 fetch 방지 | 자산 선택 UI에서만 필요한 텍스트 조회 |

### 6.2 Cascade 옵션 가이드
- 부모-자식 관계 예시: `Interview` -> `InterviewQuestion`(composition) 에 `CascadeType.ALL` + `orphanRemoval=true` 적용.
- 참조 관계 예시: `InterviewQuestion` -> `PreparationQuestion` / `QuestionBankQuestion`은 optional 참조이므로 cascade를 걸지 않는다.

### 6.3 양방향 연관관계 관리
- 컬렉션을 가진 `Interview`에서 편의 메서드로 양방향을 동기화한다.
```java
public void addInterviewQuestion(InterviewQuestion q) {
  this.interviewQuestions.add(q);
  q.setInterview(this);
}
```
- 설명: 양방향 연관관계는 “한 쪽(집계 루트)”에서만 변경되도록 강제하면 버그(중복/고아 엔티티)를 줄일 수 있다.

---

## 7. 감사(Auditing) 설정

### 7.1 BaseEntity 구현
```java
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@Getter
public abstract class BaseEntity {
  @CreatedDate
  @Column(name = "created_at", updatable = false)
  private Instant createdAt;

  @LastModifiedDate
  @Column(name = "updated_at")
  private Instant updatedAt;

  @CreatedBy
  @Column(name = "created_by", updatable = false, length = 100)
  private String createdBy;

  @LastModifiedBy
  @Column(name = "updated_by", length = 100)
  private String updatedBy;
}
```

### 7.2 Auditing 설정
```java
@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorAware")
public class AuditingConfig {
  @Bean
  public AuditorAware<String> auditorAware() {
    return new HttpSessionAuditorAware();
  }
}

// 예시: 세션 기반 로그인이라면 세션에서 사용자 아이디를 읽어 auditor로 사용
public class HttpSessionAuditorAware implements AuditorAware<String> {
  @Override
  public Optional<String> getCurrentAuditor() {
    // 구현 예시(프로젝트의 세션 구조에 맞게 수정)
    // String username = (String) request.getSession().getAttribute("LOGIN_USERNAME");
    // return Optional.ofNullable(username);
    return Optional.of("system"); // 문서용 기본값
  }
}
```

---

## 8. 성능 최적화 전략

### 8.1 N+1 문제 해결
- fetch join 예시(상세 조회):
```java
@Query("select i from Interview i " +
       "left join fetch i.interviewQuestions iq " +
       "left join fetch iq.preparationQuestion pq " +
       "left join fetch iq.questionBankQuestion qbq " +
       "where i.id = :id")
Optional<Interview> findByIdWithQuestions(@Param("id") Long id);
```
- @EntityGraph 예시(Repository 메서드별 최적화):
```java
@EntityGraph(attributePaths = {
  "interviewQuestions",
  "interviewQuestions.preparationQuestion",
  "interviewQuestions.questionBankQuestion"
})
Optional<Interview> findById(Long id);
```

### 8.2 쿼리 최적화
- 페이징/정렬: `Interview` 목록 조회는 `createdAt` 또는 `interviewDate` 기준 정렬 + 페이징 적용.
- DTO projection 사용: 화면에 필요한 컬럼만 SELECT하여 메모리 사용량 감소.

---

## 9. 검증 및 제약조건

### 9.1 Bean Validation 어노테이션
- 예시(필드 레벨 검증):
```java
@NotBlank
@Size(max = 120)
@Column(name = "company_name", nullable = false)
private String companyName;

@NotNull
@Column(name = "interview_date", nullable = false)
private LocalDate interviewDate;
```
- 설명: 서비스 계층에서 DTO 입력 검증 후 엔티티 생성에 반영한다.

### 9.2 데이터베이스 제약조건
- unique 제약: `User.username`에 `UNIQUE`를 둔다.
- 답변/복기: `InterviewQuestion.answerText`, `InterviewQuestion.reviewText` 컬럼으로 저장(별도 테이블/1:1 관계 없음).
- `sourceType`과 참조 필드(`preparationQuestion`, `questionBankQuestion`) 조합 검증은 생성 팩토리/서비스 레이어에서 수행한다.

---

## 10. 테스트 전략

### 10.1 Entity 단위 테스트
- 목표: 엔티티 불변성/검증 로직이 깨지지 않는지 확인.
- 예시:
```java
@DataJpaTest
class InterviewQuestionFactoryTest {
  @Autowired InterviewRepository interviewRepository;
  @Autowired QuestionBankQuestionRepository questionBankRepository;

  @Test
  void fromPreparation_creates_consistent_snapshot_reference() {
    Interview interview = interviewRepository.save(
      Interview.create(/* user */ , "company", "role", LocalDate.now(), "")
    );

    // given: preparationQuestion(QuestionBank에서 스냅샷 생성 또는 직접 입력)
    // when: InterviewQuestion.fromPreparation(...)
    // then: preparationQuestion 참조 및 questionTextSnapshot이 일치함을 검증
  }
}
```

### 10.2 Repository 테스트
- 목표: fetch join / EntityGraph가 예상대로 동작하고, N+1이 발생하지 않는지 확인(초점은 쿼리 수).
- 예시:
```java
@DataJpaTest
class InterviewRepositoryPerformanceTest {
  @Autowired InterviewRepository interviewRepository;

  @Test
  void findByIdWithQuestions_fetches_associations() {
    interviewRepository.findByIdWithQuestions(1L);
    // Hibernate Statistics 또는 SQL 로그로 쿼리 수를 검증(프로파일링 도구 권장)
  }
}
```

---

## 11. 성능 모니터링

### 11.1 쿼리 성능 모니터링
```yaml
spring:
  jpa:
    properties:
      hibernate:
        generate_statistics: true
logging:
  level:
    org.hibernate.SQL: debug
    org.hibernate.orm.jdbc.bind: trace
```

- 설명: 개발 환경에서 SQL 바인딩을 포함해 N+1 여부 및 쿼리 형태를 관찰한다.
- 운영 전환 시에는 로깅 레벨을 낮추거나 통계 수집을 비활성화한다.

