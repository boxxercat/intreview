import { apiFetch } from "@/lib/apiFetch"

export type QuestionAssetSourceType = "MANUAL" | "IMPORTED_FROM_INTERVIEW"

export type QuestionBankSummary = {
  id: number
  questionText: string
  sourceType: QuestionAssetSourceType
  archived: boolean
  createdAt: string
}

export type QuestionBankDetail = QuestionBankSummary & {
  updatedAt: string
}

export type PageInfo = {
  number: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  numberOfElements: number
}

export type PageResponse<T> = {
  content: T[]
  page: PageInfo
}

const BASE = "/question-bank/questions"

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

function prunePatchBody(body: {
  questionText?: string
  archived?: boolean
}): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {}
  if (body.questionText !== undefined) out.questionText = body.questionText
  if (body.archived !== undefined) out.archived = body.archived
  return out
}

export async function listQuestionBankQuestions(params?: {
  page?: number
  size?: number
  sort?: string
}): Promise<PageResponse<QuestionBankSummary>> {
  return apiFetch<PageResponse<QuestionBankSummary>>(
    `${BASE}${buildListQuery(params)}`
  )
}

export async function getQuestionBankQuestion(
  id: number
): Promise<QuestionBankDetail> {
  return apiFetch<QuestionBankDetail>(`${BASE}/${id}`)
}

export async function createQuestionBankQuestion(body: {
  questionText: string
  sourceType: QuestionAssetSourceType
}): Promise<QuestionBankDetail> {
  return apiFetch<QuestionBankDetail>(BASE, {
    method: "POST",
    body,
  })
}

export async function patchQuestionBankQuestion(
  id: number,
  body: { questionText?: string; archived?: boolean }
): Promise<QuestionBankDetail> {
  const payload = prunePatchBody(body)
  if (Object.keys(payload).length === 0) {
    return getQuestionBankQuestion(id)
  }
  return apiFetch<QuestionBankDetail>(`${BASE}/${id}`, {
    method: "PATCH",
    body: payload,
  })
}

export async function deleteQuestionBankQuestion(id: number): Promise<void> {
  await apiFetch<void>(`${BASE}/${id}`, { method: "DELETE" })
}

export const SOURCE_TYPE_LABEL: Record<QuestionAssetSourceType, string> = {
  MANUAL: "직접 입력",
  IMPORTED_FROM_INTERVIEW: "면접에서 가져옴",
}
