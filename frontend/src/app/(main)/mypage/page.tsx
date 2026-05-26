"use client";

import { userService, UserProfile } from "@/api/userService";
import useAuthStore from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const PROVIDER_LABEL: Record<string, string> = {
  google: "구글",
  kakao: "카카오",
  naver: "네이버",
  local: "이메일",
};

export default function MypagePage() {
  const { user, setUser, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    toast.success("로그아웃 됐습니다.");
    router.push("/");
  };
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [nickName, setNickName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    userService
      .getProfile()
      .then((data) => {
        setProfile(data);
        setNickName(data.nickName);
      })
      .catch(() => setError("프로필을 불러오지 못했습니다."))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    if (!nickName.trim() || nickName.length < 2) return;
    setIsSaving(true);
    try {
      const updated = await userService.updateProfile({ nickName });
      setProfile(updated);
      setUser({ ...user!, nickName: updated.nickName });
      setIsEditing(false);
    } catch {
      alert("닉네임 변경에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <div className="border-t-brand-blue h-7 w-7 animate-spin rounded-full border-3 border-gray-200" />
      </div>
    );
  }

  if (error || !profile) {
    return <p className="text-sm text-gray-500">{error ?? "오류가 발생했습니다."}</p>;
  }

  return (
    <div className="space-y-4">
      {/* 프로필 카드 */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-base font-bold text-gray-900">기본 정보</h2>
        <div className="space-y-5">
          {/* 닉네임 */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-gray-400">닉네임</p>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  value={nickName}
                  onChange={(e) => setNickName(e.target.value)}
                  className="focus:border-brand-blue h-9 flex-1 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-1 focus:ring-brand-blue/20"
                  maxLength={20}
                  autoFocus
                />
                <button
                  onClick={handleSave}
                  disabled={isSaving || nickName.length < 2}
                  className="bg-brand-blue rounded-lg px-3 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                  저장
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setNickName(profile.nickName);
                  }}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  취소
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-800">{profile.nickName}</p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-brand-blue text-xs font-medium hover:underline"
                >
                  수정
                </button>
              </div>
            )}
          </div>

          {/* 이메일 */}
          {profile.email && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-400">이메일</p>
              <p className="text-sm text-gray-800">{profile.email}</p>
            </div>
          )}

          {/* 소셜 로그인 */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-gray-400">로그인 방법</p>
            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              {PROVIDER_LABEL[profile.provider] ?? profile.provider}
            </span>
          </div>

          {/* 가입일 */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-gray-400">가입일</p>
            <p className="text-sm text-gray-800">
              {new Date(profile.createdAt).toLocaleDateString("ko-KR")}
            </p>
          </div>
        </div>
      </div>

      {/* 로그아웃 */}
      <button
        onClick={handleLogout}
        className="w-full rounded-xl border border-red-100 py-3 text-sm font-medium text-red-500 hover:bg-red-50"
      >
        로그아웃
      </button>
    </div>
  );
}
