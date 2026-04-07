import { apiFetch } from "@/lib/apiFetch"
import type { PageResponse } from "@/lib/questionBankApi"

export type InterviewSummary = {
  id: number
  companyName: string
  positionTitle: string
  interviewDate: string
  /** 1차 면접, 직무 면접 등 */
  interviewRound: string
  createdAt: string
}

export type InterviewDetail = InterviewSummary & {
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
  interviewRound?: string | null
}): Promise<InterviewDetail> {
  return apiFetch<InterviewDetail>(BASE, {
    method: "POST",
    body: {
      companyName: body.companyName,
      positionTitle: body.positionTitle,
      interviewDate: body.interviewDate,
      interviewRound: body.interviewRound ?? null,
    },
  })
}

export async function updateInterview(
  id: number,
  body: {
    companyName: string
    positionTitle: string
    interviewDate: string
    interviewRound?: string | null
  }
): Promise<InterviewDetail> {
  return apiFetch<InterviewDetail>(`${BASE}/${id}`, {
    method: "PUT",
    body: {
      companyName: body.companyName,
      positionTitle: body.positionTitle,
      interviewDate: body.interviewDate,
      interviewRound: body.interviewRound ?? null,
    },
  })
}

export async function deleteInterview(id: number): Promise<void> {
  await apiFetch<void>(`${BASE}/${id}`, { method: "DELETE" })
}
