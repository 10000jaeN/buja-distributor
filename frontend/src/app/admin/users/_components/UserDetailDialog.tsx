"use client";

import { AdminUser } from "@/api/adminUserService";
import { formatDate } from "@/lib/dateUtils";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PROVIDER_LABEL: Record<string, string> = {
  local: "이메일",
  google: "Google",
  kakao: "카카오",
  naver: "네이버",
};

interface Props {
  user: AdminUser | null;
  onClose: () => void;
}

export default function UserDetailDialog({ user, onClose }: Props) {
  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>회원 상세 정보</DialogTitle>
        </DialogHeader>

        {user && (
          <div className="space-y-3 text-sm">
            <Row label="닉네임" value={user.nickName} />
            <Row label="이메일" value={user.email ?? "—"} />
            <Row
              label="전화번호"
              value={
                (() => {
                  const addr = user.address?.find((a) => a.isDefault) ?? user.address?.[0];
                  return addr?.phoneNumber ?? "—";
                })()
              }
            />
            <Row
              label="가입경로"
              value={
                <Badge variant="secondary" className="text-xs">
                  {PROVIDER_LABEL[user.provider] ?? user.provider}
                </Badge>
              }
            />
            <Row
              label="역할"
              value={
                user.roles.includes("admin") ? (
                  <Badge className="bg-brand-blue/10 text-brand-blue text-xs hover:bg-brand-blue/10">
                    관리자
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    일반
                  </Badge>
                )
              }
            />
            <Row label="가입일" value={formatDate(user.createdAt)} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
      <span className="w-20 shrink-0 text-xs text-gray-400">{label}</span>
      <span className="text-gray-800">{value}</span>
    </div>
  );
}
