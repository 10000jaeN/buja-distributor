"use client";

import { userService, Address } from "@/api/userService";
import { formatPhoneNumber } from "@/lib/utils";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Script from "next/script";
import { useEffect, useState } from "react";
import { toast } from "sonner";

declare global {
  interface Window {
    daum: {
      Postcode: new (config: {
        oncomplete: (data: {
          zonecode: string;
          address: string;
          jibunAddress: string;
          addressType: string;
        }) => void;
      }) => { open: () => void };
    };
  }
}

const EMPTY_FORM = {
  recipientName: "",
  phoneNumber: "",
  zipCode: "",
  mainAddress: "",
  detailAddress: "",
  jibunAddress: "",
  isDefault: false,
};

type FormData = typeof EMPTY_FORM;

export default function MypageAddressSection() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState<{
    mode: "add" | "edit";
    address?: Address;
  } | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    userService
      .getProfile()
      .then((data) => setAddresses(data.address))
      .catch(() => toast.error("배송지를 불러오지 못했습니다."))
      .finally(() => setIsLoading(false));
  }, []);

  const openAddModal = () => {
    setForm(EMPTY_FORM);
    setModal({ mode: "add" });
  };

  const openEditModal = (address: Address) => {
    setForm({
      recipientName: address.recipientName,
      phoneNumber: address.phoneNumber,
      zipCode: address.zipCode,
      mainAddress: address.mainAddress,
      detailAddress: address.detailAddress ?? "",
      jibunAddress: address.jibunAddress ?? "",
      isDefault: address.isDefault,
    });
    setModal({ mode: "edit", address });
  };

  const openPostcode = () => {
    if (!window.daum?.Postcode) {
      toast.error(
        "주소 검색 서비스를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
      );
      return;
    }
    new window.daum.Postcode({
      oncomplete: (data) => {
        setForm((prev) => ({
          ...prev,
          zipCode: data.zonecode,
          mainAddress: data.address,
          jibunAddress: data.jibunAddress,
        }));
      },
    }).open();
  };

  const handleSave = async () => {
    if (
      !form.recipientName ||
      !form.phoneNumber ||
      !form.zipCode ||
      !form.mainAddress
    ) {
      toast.error("수령인, 전화번호, 우편번호, 주소는 필수입니다.");
      return;
    }
    setIsSaving(true);
    try {
      let updated: Address[];
      if (modal?.mode === "add") {
        updated = await userService.addAddress(form);
        toast.success("배송지가 추가되었습니다.");
      } else {
        updated = await userService.updateAddress(modal!.address!._id, form);
        toast.success("배송지가 수정되었습니다.");
      }
      setAddresses(updated);
      setModal(null);
    } catch {
      toast.error("저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    try {
      const updated = await userService.deleteAddress(addressId);
      setAddresses(updated);
      setDeleteTargetId(null);
      toast.success("배송지가 삭제되었습니다.");
    } catch {
      toast.error("삭제에 실패했습니다.");
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const updated = await userService.setDefaultAddress(addressId);
      setAddresses(updated);
      toast.success("기본 배송지가 변경되었습니다.");
    } catch {
      toast.error("변경에 실패했습니다.");
    }
  };

  return (
    <>
      <Script
        src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="lazyOnload"
      />

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">배송지 관리</h2>
          <Button
            onClick={openAddModal}
            disabled={addresses.length >= 10}
            size="sm"
          >
            + 배송지 추가
          </Button>
        </div>

        {isLoading ? (
          <div className="flex min-h-24 items-center justify-center">
            <div className="border-t-brand-blue h-6 w-6 animate-spin rounded-full border-3 border-gray-200" />
          </div>
        ) : addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10">
            <p className="text-sm text-gray-400">등록된 배송지가 없습니다.</p>
            <button
              onClick={openAddModal}
              className="text-brand-blue text-sm font-medium hover:underline"
            >
              배송지 추가하기
            </button>
          </div>
        ) : (
          <ul className="space-y-3">
            {addresses.map((addr) => (
              <li
                key={addr._id}
                className={`rounded-xl border p-4 ${addr.isDefault ? "border-brand-blue/40 bg-blue-50/30" : "border-gray-100"}`}
              >
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {addr.recipientName}
                  </span>
                  {addr.isDefault && (
                    <span className="bg-brand-blue/10 text-brand-blue rounded-full px-2 py-0.5 text-xs font-medium">
                      기본 배송지
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{addr.phoneNumber}</p>
                <p className="text-sm text-gray-500">
                  [{addr.zipCode}] {addr.mainAddress}
                  {addr.detailAddress && ` ${addr.detailAddress}`}
                </p>
                <div className="mt-3 flex gap-3">
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr._id)}
                      className="text-brand-blue/60 hover:text-brand-blue text-xs"
                    >
                      기본 배송지 설정
                    </button>
                  )}
                  <button
                    onClick={() => openEditModal(addr)}
                    className="text-xs text-gray-400 hover:text-gray-700"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => setDeleteTargetId(addr._id)}
                    className="text-xs text-gray-400 hover:text-red-500"
                  >
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 추가/수정 Dialog */}
      <Dialog open={!!modal} onOpenChange={(open) => !open && setModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {modal?.mode === "add" ? "배송지 추가" : "배송지 수정"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="mb-1">수령인 *</Label>
              <Input
                value={form.recipientName}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    recipientName: e.target.value,
                  }))
                }
                placeholder="홍길동"
                maxLength={20}
              />
            </div>
            <div>
              <Label className="mb-1">전화번호 *</Label>
              <Input
                value={form.phoneNumber}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    phoneNumber: formatPhoneNumber(e.target.value),
                  }))
                }
                placeholder="전화번호를 입력하세요"
                maxLength={13}
                inputMode="numeric"
              />
            </div>
            <div>
              <Label className="mb-1">주소 *</Label>
              <div className="flex gap-2">
                <Input
                  value={form.zipCode}
                  readOnly
                  placeholder="우편번호"
                  className="w-24 bg-gray-50"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={openPostcode}
                >
                  주소 검색
                </Button>
              </div>
              <Input
                value={form.mainAddress}
                readOnly
                placeholder="기본 주소"
                className="mt-2 bg-gray-50"
              />
              <Input
                value={form.detailAddress}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    detailAddress: e.target.value,
                  }))
                }
                placeholder="상세 주소 (동/호수 등)"
                className="mt-2"
                maxLength={50}
              />
            </div>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, isDefault: e.target.checked }))
                }
                className="accent-brand-blue h-4 w-4"
              />
              <span className="text-sm text-gray-600">기본 배송지로 설정</span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(null)}>
              취소
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 */}
      <ConfirmDialog
        open={!!deleteTargetId}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
        title="배송지 삭제"
        description="해당 배송지를 삭제하시겠습니까?"
        confirmLabel="삭제"
        onConfirm={() => handleDelete(deleteTargetId!)}
        variant="danger"
      />
    </>
  );
}
