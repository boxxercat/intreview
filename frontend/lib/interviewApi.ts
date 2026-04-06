import { apiFetch } from "@/lib/apiFetch"
import type { PageResponse } from "@/lib/questionBankApi"

export type InterviewStatus = "DRAFT" | "COMPLETED"

export type InterviewSummary = {
  id: number
  companyName: string
  positionTitle: string
  interviewDate: string
  status: InterviewStatus
  createdAt: string
}

export type InterviewDetail = InterviewSummary & {
  memo: string
  updatedAt: string
}

const BASE = "/interviews"

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

export async function listInterviews(params?: {
  page?: number
  size?: number
  sort?: string
}): Promise<PageResponse<InterviewSummary>> {
  return apiFetch<PageResponse<InterviewSummary>>(
    `${BASE}${buildListQuery(params)}`
  )
}

export async function getInterview(id: number): Promise<InterviewDetail> {
  return apiFetch<InterviewDetail>(`${BASE}/${id}`)
}

export async function createInterview(body: {
  companyName: string
  positionTitle: string
  interviewDate: string
  memo?: string | null
}): Promise<InterviewDetail> {
  return apiFetch<InterviewDetail>(BASE, {
    method: "POST",
    body: {
      companyName: body.companyName,
      positionTitle: body.positionTitle,
      interviewDate: body.interviewDate,
      memo: body.memo ?? null,
    },
  })
}

export async function updateInterview(
  id: number,
  body: {
    companyName: string
    positionTitle: string
    interviewDate: string
    status: InterviewStatus
    memo?: string | null
  }
): Promise<InterviewDetail> {
  return apiFetch<InterviewDetail>(`${BASE}/${id}`, {
    method: "PUT",
    body: {
      companyName: body.companyName,
      positionTitle: body.positionTitle,
      interviewDate: body.interviewDate,
      status: body.status,
      memo: body.memo ?? null,
    },
  })
}

export async function deleteInterview(id: number): Promise<void> {
  await apiFetch<void>(`${BASE}/${id}`, { method: "DELETE" })
}

export const INTERVIEW_STATUS_LABEL: Record<InterviewStatus, string> = {
  DRAFT: "작성 중",
  COMPLETED: "완료",
}
