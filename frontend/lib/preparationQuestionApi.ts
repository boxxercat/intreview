import { apiFetch } from "@/lib/apiFetch"
import type { PageResponse } from "@/lib/questionBankApi"

export type PreparationQuestionSourceType = "FROM_BANK" | "CUSTOM"

export type PreparationQuestion = {
  id: number
  questionBankQuestionId: number | null
  sourceType: PreparationQuestionSourceType
  questionTextSnapshot: string
  practiceAnswer: string
  createdAt: string
  updatedAt: string
}

const BASE = "/preparation-questions"

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

export type CreatePreparationQuestionBody =
  | {
      sourceType: "CUSTOM"
      questionTextSnapshot: string
      practiceAnswer?: string | null
    }
  | {
      sourceType: "FROM_BANK"
      questionBankQuestionId: number
      practiceAnswer?: string | null
    }

export async function listPreparationQuestions(params?: {
  page?: number
  size?: number
  sort?: string
}): Promise<PageResponse<PreparationQuestion>> {
  return apiFetch<PageResponse<PreparationQuestion>>(
    `${BASE}${buildListQuery(params)}`
  )
}

export async function createPreparationQuestion(
  body: CreatePreparationQuestionBody
): Promise<PreparationQuestion> {
  return apiFetch<PreparationQuestion>(BASE, {
    method: "POST",
    body:
      body.sourceType === "CUSTOM"
        ? {
            sourceType: body.sourceType,
            questionTextSnapshot: body.questionTextSnapshot,
            practiceAnswer: body.practiceAnswer ?? null,
            questionBankQuestionId: null,
          }
        : {
            sourceType: body.sourceType,
            questionBankQuestionId: body.questionBankQuestionId,
            practiceAnswer: body.practiceAnswer ?? null,
            questionTextSnapshot: null,
          },
  })
}

export async function patchPreparationQuestion(
  id: number,
  body: { questionTextSnapshot?: string; practiceAnswer?: string }
): Promise<PreparationQuestion> {
  const payload: Record<string, string> = {}
  if (body.questionTextSnapshot !== undefined) {
    payload.questionTextSnapshot = body.questionTextSnapshot
  }
  if (body.practiceAnswer !== undefined) {
    payload.practiceAnswer = body.practiceAnswer
  }
  return apiFetch<PreparationQuestion>(`${BASE}/${id}`, {
    method: "PATCH",
    body: payload,
  })
}

export async function deletePreparationQuestion(id: number): Promise<void> {
  await apiFetch<void>(`${BASE}/${id}`, { method: "DELETE" })
}

export const PREPARATION_SOURCE_LABEL: Record<
  PreparationQuestionSourceType,
  string
> = {
  FROM_BANK: "문제 은행",
  CUSTOM: "직접 입력",
}
