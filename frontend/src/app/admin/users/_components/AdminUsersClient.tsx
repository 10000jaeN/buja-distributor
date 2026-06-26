"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { RotateCcw, Search, Trash2 } from "lucide-react";
import { adminUserService, AdminUser } from "@/api/adminUserService";
import { formatDate } from "@/lib/dateUtils";
import { Spinner } from "@/components/shared/Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const PROVIDER_LABEL: Record<string, string> = {
  local: "이메일",
  google: "Google",
  kakao: "카카오",
  naver: "네이버",
};

export default function AdminUsersClient() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = useCallback(async (search?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminUserService.getUsers(search);
      setUsers(data);
    } catch {
      setError("회원 목록을 불러오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(inputValue);
    fetchUsers(inputValue);
  };

  const handleReset = () => {
    setInputValue("");
    setSearchQuery("");
    fetchUsers();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await adminUserService.deleteUser(deleteTarget._id);
      setUsers((prev) => prev.filter((u) => u._id !== deleteTarget._id));
      toast.success("회원이 삭제되었습니다.");
      setDeleteTarget(null);
    } catch (err: unknown) {
      const status = (err as Error & { status?: number })?.status;
      if (status === 403) toast.error("권한 오류", { description: "관리자 권한이 필요합니다." });
      else toast.error("회원 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">회원 관리</h1>
          {!isLoading && !error && (
            <p className="mt-0.5 text-sm text-gray-500">
              총 <span className="font-semibold text-gray-700">{users.length}</span>명
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="gap-1.5"
        >
          <RotateCcw className="size-3.5" />
          새로고침
        </Button>
      </div>

      {/* 검색 */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="닉네임 또는 이메일 검색"
            className="pl-9"
          />
        </div>
        <Button type="submit" size="sm">
          검색
        </Button>
        {searchQuery && (
          <Button type="button" variant="outline" size="sm" onClick={handleReset}>
            초기화
          </Button>
        )}
      </form>

      {/* 테이블 */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {/* 데스크탑 테이블 */}
        <div className="hidden lg:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium text-gray-500">
                <th className="px-4 py-3">닉네임</th>
                <th className="px-4 py-3">이메일</th>
                <th className="px-4 py-3">가입경로</th>
                <th className="px-4 py-3">역할</th>
                <th className="px-4 py-3">가입일</th>
                <th className="px-4 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Spinner size="sm" label="불러오는 중..." className="inline-flex" />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-sm text-red-500">
                    {error}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-sm text-gray-400">
                    {searchQuery ? `"${searchQuery}" 검색 결과가 없습니다.` : "등록된 회원이 없습니다."}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{user.nickName}</td>
                    <td className="px-4 py-3 text-gray-500">{user.email ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="text-xs">
                        {PROVIDER_LABEL[user.provider] ?? user.provider}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {user.roles.includes("admin") ? (
                        <Badge className="bg-brand-blue/10 text-brand-blue text-xs hover:bg-brand-blue/10">
                          관리자
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          일반
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteTarget(user)}
                        disabled={user.roles.includes("admin")}
                      >
                        <Trash2 className="size-3.5" />
                        삭제
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 모바일 카드 */}
        <div className="divide-y divide-gray-100 lg:hidden">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner size="sm" label="불러오는 중..." />
            </div>
          ) : error ? (
            <p className="py-16 text-center text-sm text-red-500">{error}</p>
          ) : users.length === 0 ? (
            <p className="py-16 text-center text-sm text-gray-400">
              {searchQuery ? `"${searchQuery}" 검색 결과가 없습니다.` : "등록된 회원이 없습니다."}
            </p>
          ) : (
            users.map((user) => (
              <div key={user._id} className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">{user.nickName}</span>
                    {user.roles.includes("admin") ? (
                      <Badge className="bg-brand-blue/10 text-brand-blue text-xs hover:bg-brand-blue/10">
                        관리자
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        일반
                      </Badge>
                    )}
                  </div>
                  <p className="truncate text-xs text-gray-500">{user.email ?? "이메일 없음"}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {PROVIDER_LABEL[user.provider] ?? user.provider}
                    </Badge>
                    <span className="text-xs text-gray-400">{formatDate(user.createdAt)}</span>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="icon-sm"
                  onClick={() => setDeleteTarget(user)}
                  disabled={user.roles.includes("admin")}
                  aria-label="회원 삭제"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>회원 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-semibold">{deleteTarget?.nickName}</span> 회원을 삭제하시겠습니까?
              삭제된 회원은 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
