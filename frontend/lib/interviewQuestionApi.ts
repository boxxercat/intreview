import { apiFetch } from "@/lib/apiFetch"
import type { PageResponse } from "@/lib/questionBankApi"

export type InterviewQuestionSourceType =
  | "FROM_PREPARATION"
  | "FROM_BANK"
  | "CUSTOM"

export type InterviewQuestionSummary = {
  id: number
  sourceType: InterviewQuestionSourceType
  questionTextSnapshot: string
  sortOrder: number
  createdAt: string
}

export type InterviewQuestionDetail = InterviewQuestionSummary & {
  preparationQuestionId: number | null
  questionBankQuestionId: number | null
  answerText: string
  reviewText: string
  updatedAt: string
}

function base(interviewId: number) {
  return `/interviews/${interviewId}/questions`
}

function buildListQuery(params?: {
  page?: number
  size?: number
  sort?: string
}): string {
  const search = new URLSearchParams()
  if (params?.page != null) search.set("page", String(params.page))
  if (params?.size != null) search.set("size", String(params.size))
  if (params?.sort != null) search.set("sort", params.sort)
  const q = search.toString()
  return q ? `?${q}` : ""
}

export type CreateInterviewQuestionBody =
  | {
      sourceType: "CUSTOM"
      questionTextSnapshot: string
      sortOrder: number
    }
  | {
      sourceType: "FROM_PREPARATION"
      preparationQuestionId: number
      sortOrder: number
    }
  | {
      sourceType: "FROM_BANK"
      questionBankQuestionId: number
      sortOrder: number
    }

export async function listInterviewQuestions(
  interviewId: number,
  params?: { page?: number; size?: number; sort?: string }
): Promise<PageResponse<InterviewQuestionSummary>> {
  return apiFetch<PageResponse<InterviewQuestionSummary>>(
    `${base(interviewId)}${buildListQuery(params)}`
  )
}

export async function getInterviewQuestion(
  interviewId: number,
  questionId: number
): Promise<InterviewQuestionDetail> {
  return apiFetch<InterviewQuestionDetail>(
    `${base(interviewId)}/${questionId}`
  )
}

export async function createInterviewQuestion(
  interviewId: number,
  body: CreateInterviewQuestionBody
): Promise<InterviewQuestionDetail> {
  return apiFetch<InterviewQuestionDetail>(base(interviewId), {
    method: "POST",
    body,
  })
}

function prunePatch(body: {
  answerText?: string
  reviewText?: string
}): Record<string, string> {
  const out: Record<string, string> = {}
  if (body.answerText !== undefined) out.answerText = body.answerText
  if (body.reviewText !== undefined) out.reviewText = body.reviewText
  return out
}

export async function patchInterviewQuestion(
  interviewId: number,
  questionId: number,
  body: { answerText?: string; reviewText?: string }
): Promise<InterviewQuestionDetail> {
  const payload = prunePatch(body)
  if (Object.keys(payload).length === 0) {
    return getInterviewQuestion(interviewId, questionId)
  }
  return apiFetch<InterviewQuestionDetail>(
    `${base(interviewId)}/${questionId}`,
    { method: "PATCH", body: payload }
  )
}

export async function deleteInterviewQuestion(
  interviewId: number,
  questionId: number
): Promise<void> {
  await apiFetch<void>(`${base(interviewId)}/${questionId}`, {
    method: "DELETE",
  })
}

/** 질문 id를 화면 순서대로 전달하면 sortOrder가 0…n-1로 재설정됩니다. */
export async function reorderInterviewQuestions(
  interviewId: number,
  orderedQuestionIds: number[]
): Promise<InterviewQuestionSummary[]> {
  return apiFetch<InterviewQuestionSummary[]>(
    `${base(interviewId)}/reorder`,
    {
      method: "POST",
      body: { orderedQuestionIds },
    }
  )
}

export const INTERVIEW_QUESTION_SOURCE_LABEL: Record<
  InterviewQuestionSourceType,
  string
> = {
  FROM_PREPARATION: "준비 질문에서",
  FROM_BANK: "문제 은행에서",
  CUSTOM: "직접 입력",
}
