import { apiFetch } from "@/lib/apiFetch"

export type LoginRequest = {
  username: string
  password: string
}

/** 로그인 응답: 백엔드 UserResponse.loginSummary (id, username) */
export type LoginResponse = {
  id: number
  username: string
}

export type RegisterRequest = {
  username: string
  password: string
}

/** 회원가입 응답: 전체 UserResponse */
export type RegisterResponse = {
  id: number
  username: string
  createdAt?: string | null
  updatedAt?: string | null
}

const USER_ID_KEY = "userId"

export function getStoredUserId(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(USER_ID_KEY)
}

export function setStoredUserId(userId: number | string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(USER_ID_KEY, String(userId))
}

export function clearStoredUserId(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(USER_ID_KEY)
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: payload,
    skipUserId: true,
  })
}

export async function register(
  payload: RegisterRequest
): Promise<RegisterResponse> {
  return apiFetch<RegisterResponse>("/auth/register", {
    method: "POST",
    body: payload,
    skipUserId: true,
  })
}
