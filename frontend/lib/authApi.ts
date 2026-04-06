import { apiFetch } from "@/lib/apiFetch"

/** 백엔드 스키마에 맞게 필드명을 조정하세요. */
export type LoginRequest = {
  username: string
  password: string
}

export type LoginResponse = {
  userId: string
  // 필요 시 세션 쿠키 등은 백엔드 방식에 맞게 확장
}

export type RegisterRequest = {
  username: string
  password: string
}

export type RegisterResponse = {
  userId: string
}

/**
 * 로그인 — userId 헤더 없이 호출 (skipUserId)
 * 경로는 실제 백엔드에 맞게 수정하세요.
 */
export async function login(payload: LoginRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: payload,
    skipUserId: true,
  })
}

/**
 * 회원가입 — userId 헤더 없이 호출
 */
export async function register(
  payload: RegisterRequest
): Promise<RegisterResponse> {
  return apiFetch<RegisterResponse>("/auth/register", {
    method: "POST",
    body: payload,
    skipUserId: true,
  })
}
