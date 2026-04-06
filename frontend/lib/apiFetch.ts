/**
 * 비우면 브라우저에서 상대 경로 `/api/...`로 요청 → Next rewrites로 백엔드 프록시(CORS 회피).
 * 절대 URL을 주면 해당 호스트로 직접 요청(백엔드 CORS 필요).
 */
function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()
  if (raw) return raw.replace(/\/$/, "")
  if (typeof window !== "undefined") return ""
  return (
    process.env.API_URL_SERVER?.trim().replace(/\/$/, "") ??
    "http://localhost:8080/api"
  )
}

export type ApiFetchMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export type ApiFetchOptions = {
  method?: ApiFetchMethod
  body?: unknown
  /** 병합되며, 동일 키는 이 값이 우선합니다. */
  headers?: HeadersInit
  /**
   * true이면 localStorage의 userId를 X-User-Id에 넣지 않습니다.
   * 로그인/회원가입 등 비인증 요청에 사용합니다.
   */
  skipUserId?: boolean
  signal?: AbortSignal
}

function buildUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path
  }
  const normalized = path.startsWith("/") ? path : `/${path}`
  const base = getApiBaseUrl()
  if (base === "") {
    return normalized.startsWith("/api") ? normalized : `/api${normalized}`
  }
  return `${base}${normalized}`
}

function getUserIdFromStorage(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("userId")
}

type ApiEnvelope = {
  success: boolean
  data?: unknown
  error?: { code?: string; message?: string } | null
}

function isApiEnvelope(value: unknown): value is ApiEnvelope {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    typeof (value as ApiEnvelope).success === "boolean"
  )
}

function parseErrorMessage(
  res: Response,
  data: unknown,
  isJson: boolean
): string {
  if (isJson && typeof data === "object" && data !== null) {
    const err = (data as ApiEnvelope).error
    if (err && typeof err.message === "string" && err.message) {
      return err.message
    }
    if (
      "error" in data &&
      typeof (data as { error: unknown }).error === "string"
    ) {
      return (data as { error: string }).error
    }
  }
  if (typeof data === "string" && data.trim()) return data
  return res.statusText || `HTTP ${res.status}`
}

function unwrapApiData<T>(data: unknown): T {
  if (isApiEnvelope(data)) {
    if (!data.success) {
      const msg = data.error?.message
      throw new Error(msg && msg.length > 0 ? msg : "요청에 실패했습니다.")
    }
    return data.data as T
  }
  return data as T
}

/**
 * fetch 기반 API 클라이언트. baseURL, JSON, X-User-Id, HTTP 메서드를 공통 처리합니다.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const {
    method = "GET",
    body,
    headers: extraHeaders,
    skipUserId = false,
    signal,
  } = options

  const headers = new Headers({ "Content-Type": "application/json" })

  if (!skipUserId) {
    const userId = getUserIdFromStorage()
    if (userId) headers.set("X-User-Id", userId)
  }

  if (extraHeaders) {
    new Headers(extraHeaders).forEach((value, key) => {
      headers.set(key, value)
    })
  }

  const init: RequestInit = {
    method,
    headers,
    signal,
  }

  if (body !== undefined && method !== "GET") {
    init.body = JSON.stringify(body)
  }

  const res = await fetch(buildUrl(path), init)
  const contentType = res.headers.get("content-type") ?? ""
  const isJson = contentType.includes("application/json")

  const text = await res.text()
  let data: unknown = undefined
  if (text) {
    if (isJson) {
      try {
        data = JSON.parse(text) as unknown
      } catch {
        data = text
      }
    } else {
      data = text
    }
  }

  if (!res.ok) {
    throw new Error(parseErrorMessage(res, data, isJson))
  }

  if (text === "" || data === undefined) {
    return undefined as T
  }

  return unwrapApiData<T>(data)
}
