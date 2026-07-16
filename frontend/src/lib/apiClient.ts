import { toast } from "sonner";
import useAuthStore from "@/store/useAuthStore";

const isServer = typeof window === "undefined";
const isProd = process.env.NODE_ENV === "production";

function getBaseURL(): string {
  const url = isProd
    ? isServer
      ? process.env.API_URL
      : process.env.NEXT_PUBLIC_API_URL
    : isServer
      ? process.env.API_TEST_URL
      : process.env.NEXT_PUBLIC_API_TEST_URL;

  if (!url) throw new Error("API base URL이 설정되지 않았습니다.");
  return url;
}

type FetchOptions = Omit<RequestInit, "body"> & {
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
};

async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { params, body, ...init } = options;

  const url = new URL(path, getBaseURL());
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, String(value));
    });
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };

  if (!isServer) {
    const token =
      localStorage.getItem("accessToken") ??
      sessionStorage.getItem("accessToken");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), isProd ? 60000 : 10000);

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      ...init,
      headers,
      credentials: "include",
      signal: controller.signal,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!isServer) {
    const newToken = res.headers.get("x-new-access-token");
    if (newToken) {
      const isAutoLogin = localStorage.getItem("autoLogin") !== "false";
      if (isAutoLogin) {
        localStorage.setItem("accessToken", newToken);
      } else {
        sessionStorage.setItem("accessToken", newToken);
      }
    }
  }

  if (res.status === 401 && !isServer) {
    useAuthStore.getState().clearSession();
    const isAdmin = window.location.pathname.startsWith("/admin/") || window.location.pathname === "/admin";
    const loginPath = isAdmin ? "/admin/login" : "/login";
    if (window.location.pathname !== loginPath) {
      toast.warning("로그인이 만료되었습니다. 다시 로그인해 주세요.");
      setTimeout(() => { window.location.href = loginPath; }, 1500);
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const err = new Error(errorData.message || `HTTP ${res.status}`);
    (err as Error & { status: number }).status = res.status;
    throw err;
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<FetchOptions, "body">) =>
    apiFetch<T>(path, { ...options, method: "GET" }),

  post: <T>(
    path: string,
    body?: unknown,
    options?: Omit<FetchOptions, "body">,
  ) => apiFetch<T>(path, { ...options, method: "POST", body }),

  patch: <T>(
    path: string,
    body?: unknown,
    options?: Omit<FetchOptions, "body">,
  ) => apiFetch<T>(path, { ...options, method: "PATCH", body }),

  delete: <T>(path: string, options?: Omit<FetchOptions, "body">) =>
    apiFetch<T>(path, { ...options, method: "DELETE" }),
};
