"use client";

import { userService, UserProfile } from "@/api/userService";
import useAuthStore from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatPhoneNumber } from "@/lib/utils";

const PROVIDER_LABEL: Record<string, string> = {
  google: "구글",
  kakao: "카카오",
  naver: "네이버",
  local: "이메일",
};

type EditField = "nickName" | "phoneNumber" | "email" | null;

export default function MypageProfileClient() {
  const { user, setUser } = useAuthStore();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editField, setEditField] = useState<EditField>(null);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    userService
      .getProfile()
      .then((data) => setProfile(data))
      .catch(() => setError("프로필을 불러오지 못했습니다."))
      .finally(() => setIsLoading(false));
  }, []);

  const startEdit = (field: EditField, currentValue: string) => {
    setEditField(field);
    setEditValue(currentValue);
  };

  const cancelEdit = () => {
    setEditField(null);
    setEditValue("");
  };

  const handleSave = async () => {
    if (!editField || !profile) return;
    if (editField === "nickName" && (!editValue.trim() || editValue.length < 2))
      return;

    setIsSaving(true);
    try {
      const updated = await userService.updateProfile({
        [editField]: editValue.trim() || null,
      });
      setProfile(updated);
      if (editField === "nickName")
        setUser({ ...user!, nickName: updated.nickName });
      setEditField(null);
    } catch {
      toast.error("저장에 실패했습니다.");
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
    return (
      <p className="text-sm text-gray-500">{error ?? "오류가 발생했습니다."}</p>
    );
  }

  const renderField = (
    field: "nickName" | "phoneNumber" | "email",
    label: string,
    value: string,
    placeholder: string,
    options?: {
      inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
      maxLength?: number;
    },
  ) => {
    const isEditing = editField === field;
    return (
      <div>
        <p className="mb-1.5 text-xs font-medium text-gray-400">{label}</p>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              value={editValue}
              onChange={(e) =>
                setEditValue(
                  field === "phoneNumber"
                    ? formatPhoneNumber(e.target.value)
                    : e.target.value,
                )
              }
              className="focus:border-brand-blue focus:ring-brand-blue/20 h-9 flex-1 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-1"
              maxLength={options?.maxLength ?? 50}
              inputMode={options?.inputMode}
              placeholder={placeholder}
              autoFocus
            />
            <button
              onClick={handleSave}
              disabled={
                isSaving || (field === "nickName" && editValue.length < 2)
              }
              className="bg-brand-blue rounded-lg px-3 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              저장
            </button>
            <button
              onClick={cancelEdit}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              취소
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-800">
              {value || (
                <span className="font-normal text-gray-400">{placeholder}</span>
              )}
            </p>
            <button
              onClick={() => startEdit(field, value)}
              className="text-brand-blue text-xs font-medium hover:underline"
            >
              {value ? "수정" : "추가"}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-base font-bold text-gray-900">기본 정보</h2>
      <div className="space-y-5">
        {renderField(
          "nickName",
          "닉네임",
          profile.nickName,
          "닉네임을 입력하세요",
          { maxLength: 20 },
        )}
        {renderField(
          "phoneNumber",
          "전화번호",
          profile.phoneNumber ?? "",
          "전화번호를 입력하세요",
          {
            inputMode: "numeric",
            maxLength: 13,
          },
        )}
        {profile.provider === "local"
          ? renderField(
              "email",
              "이메일",
              profile.email ?? "",
              "이메일을 입력하세요",
            )
          : profile.email && (
              <div>
                <p className="mb-1.5 text-xs font-medium text-gray-400">
                  이메일
                </p>
                <p className="text-sm text-gray-800">{profile.email}</p>
              </div>
            )}
        <div>
          <p className="mb-1.5 text-xs font-medium text-gray-400">
            로그인 방법
          </p>
          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            {PROVIDER_LABEL[profile.provider] ?? profile.provider}
          </span>
        </div>
        <div>
          <p className="mb-1.5 text-xs font-medium text-gray-400">가입일</p>
          <p className="text-sm text-gray-800">
            {new Date(profile.createdAt).toLocaleDateString("ko-KR")}
          </p>
        </div>
      </div>
    </div>
  );
}
