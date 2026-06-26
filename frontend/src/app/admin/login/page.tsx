"use client";

import { apiClient } from "@/lib/apiClient";
import useAuthStore from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { isAdminRole } from "@/lib/authUtils";

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, login } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isAdmin = isAdminRole(user?.roles);

  useEffect(() => {
    if (isAdmin) router.replace("/admin/dashboard");
  }, [isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await apiClient.post<{
        accessToken: string;
        userId: string;
        nickName: string;
        email?: string;
        roles: string;
      }>("/auth/admin/login", { email, password });
      localStorage.setItem("accessToken", data.accessToken);
      login({
        userId: data.userId,
        nickName: data.nickName,
        email: data.email || email,
        roles: data.roles,
      });
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      const msg = (err as Error)?.message ?? "로그인에 실패했습니다.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* 왼쪽 브랜드 패널 — 대형 화면에서만 표시 */}
      <div className="bg-brand-blue hidden flex-col items-center justify-center px-16 py-12 lg:flex lg:w-1/2">
        <div className="max-w-xs text-white">
          <div className="mb-8">
            <span className="text-3xl font-extrabold tracking-tight">
              부자유통
            </span>
            <span className="ml-2 rounded-md bg-white/20 px-2 py-0.5 text-xs font-semibold tracking-widest uppercase">
              Admin
            </span>
          </div>
          <p className="text-2xl leading-snug font-bold">
            스마트한 유통 관리,
            <br />한 곳에서 시작하세요.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-white/75">
            부자유통 어드민 시스템으로
            <br />
            상품, 카테고리, 주문을 효율적으로 관리하세요.
          </p>
        </div>
      </div>

      {/* 오른쪽 로그인 폼 패널 */}
      <div className="flex w-full flex-col items-center justify-center bg-gray-50 px-6 py-12 lg:w-1/2 lg:bg-white">
        <div className="w-full max-w-sm">
          {/* 모바일 전용 헤더 */}
          <div className="mb-8 text-center lg:hidden">
            <span className="text-brand-blue text-2xl font-extrabold">
              부자유통
            </span>
            <span className="bg-brand-blue/10 text-brand-blue ml-2 rounded-md px-2 py-0.5 text-xs font-semibold tracking-widest uppercase">
              Admin
            </span>
          </div>

          {/* 폼 헤더 */}
          <div className="mb-8">
            <h1 className="text-foreground text-2xl font-bold">
              관리자 로그인
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              계정 정보를 입력해 주세요.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                이메일
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                autoComplete="email"
                disabled={loading}
                className="focus-visible:border-brand-blue focus-visible:ring-brand-blue/20 h-11 rounded-lg border-gray-200 bg-white px-4 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                비밀번호
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={loading}
                className="focus-visible:border-brand-blue focus-visible:ring-brand-blue/20 h-11 rounded-lg border-gray-200 bg-white px-4 text-sm"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="bg-brand-blue hover:bg-brand-blue-dark h-11 w-full rounded-lg text-sm font-semibold text-white transition-colors duration-200 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  로그인 중...
                </>
              ) : (
                "로그인"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
