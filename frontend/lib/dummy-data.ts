/** API 연결 전 UI용 더미 (페이지에서 import 해서 useState 초기값으로 사용) */

export type InterviewListItem = {
  id: number
  company: string
  position: string
}

export const initialInterviews: InterviewListItem[] = [
  { id: 1, company: "네이버", position: "백엔드" },
  { id: 2, company: "카카오", position: "프론트엔드" },
  { id: 3, company: "토스", position: "풀스택" },
]

export type PreparationItem = { id: string; text: string }

export type ReviewItem = {
  id: string
  question: string
  answer: string
  reflection: string
}

export type InterviewDetail = {
  company: string
  position: string
  preparation: PreparationItem[]
  review: ReviewItem[]
}

export const interviewDetailsById: Record<string, InterviewDetail> = {
  "1": {
    company: "네이버",
    position: "백엔드",
    preparation: [
      { id: "p1", text: "REST와 GraphQL의 차이를 설명해 보세요." },
      { id: "p2", text: "트랜잭션 격리 수준에 대해 알고 있는 대로 말해 보세요." },
    ],
    review: [
      {
        id: "r1",
        question: "대규모 트래픽을 다뤄 본 경험이 있나요?",
        answer: "캐시 도입과 읽기 부하 분산 경험을 이야기했습니다.",
        reflection: "수치( QPS, 지연 시간 )를 준비해 두면 좋겠습니다.",
      },
      {
        id: "r2",
        question: "팀 내 기술 의사결정은 어떻게 하시나요?",
        answer: "RFC나 PoC 후 팀 합의로 결정한다고 답했습니다.",
        reflection: "실제 사례 하나를 짧게 붙이기.",
      },
    ],
  },
  "2": {
    company: "카카오",
    position: "프론트엔드",
    preparation: [
      { id: "p1", text: "React 렌더링 성능을 어떻게 측정하나요?" },
    ],
    review: [
      {
        id: "r1",
        question: "상태 관리 라이브러리 선택 기준은?",
        answer: "팀 규모와 도메인 복잡도를 본다고 했습니다.",
        reflection: "Zustand vs Redux 비교 한 줄 정리.",
      },
    ],
  },
  "3": {
    company: "토스",
    position: "풀스택",
    preparation: [
      { id: "p1", text: "MSA 환경에서 인증은 어떻게 설계하나요?" },
    ],
    review: [
      {
        id: "r1",
        question: "장애가 났을 때 대응 프로세스는?",
        answer: "온콜 로테이션과 포스트모템을 언급했습니다.",
        reflection: "본인 역할을 구체적으로.",
      },
    ],
  },
}
