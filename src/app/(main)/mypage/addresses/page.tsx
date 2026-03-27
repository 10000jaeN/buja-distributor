"use client";

import { userService, Address } from "@/api/userService";
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

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState<{ mode: "add" | "edit"; address?: Address } | null>(null);
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
    if (!form.recipientName || !form.phoneNumber || !form.zipCode || !form.mainAddress) {
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

  if (isLoading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <div className="border-t-brand-blue h-7 w-7 animate-spin rounded-full border-3 border-gray-200" />
      </div>
    );
  }

  return (
    <>
    <Script
      src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
      strategy="lazyOnload"
    />
    <div className="space-y-3">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">최대 10개까지 등록 가능합니다.</p>
        <button
          onClick={openAddModal}
          disabled={addresses.length >= 10}
          className="bg-brand-blue rounded-lg px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
        >
          + 배송지 추가
        </button>
      </div>

      {/* 목록 */}
      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-100 bg-white py-16 shadow-sm">
          <p className="text-sm text-gray-400">등록된 배송지가 없습니다.</p>
          <button onClick={openAddModal} className="text-brand-blue text-sm font-medium hover:underline">
            배송지 추가하기
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          {addresses.map((addr) => (
            <li
              key={addr._id}
              className={`rounded-xl border bg-white p-5 shadow-sm ${addr.isDefault ? "border-brand-blue/40" : "border-gray-100"}`}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{addr.recipientName}</span>
                {addr.isDefault && (
                  <span className="bg-brand-blue/10 text-brand-blue rounded-full px-2 py-0.5 text-xs font-medium">
                    기본 배송지
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">{addr.phoneNumber}</p>
              <p className="text-sm text-gray-600">
                [{addr.zipCode}] {addr.mainAddress}
                {addr.detailAddress && ` ${addr.detailAddress}`}
              </p>

              <div className="mt-3 flex gap-3">
                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr._id)}
                    className="text-xs text-gray-400 hover:text-gray-700"
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

      {/* 추가/수정 모달 */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-5 text-base font-bold text-gray-900">
              {modal.mode === "add" ? "배송지 추가" : "배송지 수정"}
            </h2>
            <div className="space-y-3">
              {/* 수령인 */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">수령인 *</label>
                <input
                  value={form.recipientName}
                  onChange={(e) => setForm((prev) => ({ ...prev, recipientName: e.target.value }))}
                  placeholder="홍길동"
                  className="focus:border-brand-blue h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-1 focus:ring-brand-blue/20"
                />
              </div>
              {/* 전화번호 */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">전화번호 *</label>
                <input
                  value={form.phoneNumber}
                  onChange={(e) => setForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="010-0000-0000"
                  className="focus:border-brand-blue h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-1 focus:ring-brand-blue/20"
                />
              </div>
              {/* 주소 검색 */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">주소 *</label>
                <div className="flex gap-2">
                  <input
                    value={form.zipCode}
                    readOnly
                    placeholder="우편번호"
                    className="h-9 w-24 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={openPostcode}
                    className="bg-brand-blue rounded-lg px-3 text-sm font-medium text-white hover:opacity-90"
                  >
                    주소 검색
                  </button>
                </div>
                <input
                  value={form.mainAddress}
                  readOnly
                  placeholder="기본 주소"
                  className="mt-2 h-9 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-500 outline-none"
                />
                <input
                  value={form.detailAddress}
                  onChange={(e) => setForm((prev) => ({ ...prev, detailAddress: e.target.value }))}
                  placeholder="상세 주소 (동/호수 등)"
                  className="focus:border-brand-blue mt-2 h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-1 focus:ring-brand-blue/20"
                />
              </div>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) => setForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
                  className="accent-brand-blue h-4 w-4"
                />
                <span className="text-sm text-gray-600">기본 배송지로 설정</span>
              </label>
            </div>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setModal(null)}
                className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-brand-blue flex-1 rounded-lg py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {isSaving ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-72 rounded-2xl bg-white p-6 shadow-xl">
            <p className="mb-1 text-base font-bold text-gray-900">배송지 삭제</p>
            <p className="mb-6 text-sm text-gray-500">해당 배송지를 삭제하시겠습니까?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={() => handleDelete(deleteTargetId)}
                className="flex-1 rounded-lg bg-red-500 py-2 text-sm font-medium text-white hover:bg-red-600"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
