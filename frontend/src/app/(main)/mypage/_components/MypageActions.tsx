"use client";

import useAuthStore from "@/store/useAuthStore";
import { userService } from "@/api/userService";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function MypageActions() {
  const { logout, clearSession } = useAuthStore();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("로그아웃 됐습니다.");
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await userService.deleteAccount();
      clearSession();
      toast.success("회원 탈퇴가 완료됐습니다.");
      setTimeout(() => router.push("/"), 1000);
    } catch {
      toast.error("회원 탈퇴에 실패했습니다. 잠시 후 다시 시도해주세요.");
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={handleLogout}
        className="w-full rounded-xl border border-red-100 py-3 text-sm font-medium text-red-500 hover:bg-red-50"
      >
        로그아웃
      </button>

      <AlertDialog>
        <AlertDialogTrigger className="w-full py-2 text-xs text-gray-400 underline-offset-2 hover:underline">
          회원 탈퇴
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 탈퇴하시겠어요?</AlertDialogTitle>
            <AlertDialogDescription>
              탈퇴하면 계정 정보가 삭제되며 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 disabled:opacity-50"
            >
              {isDeleting ? "처리 중..." : "탈퇴하기"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
