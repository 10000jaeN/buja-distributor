"use client";

import { categoryService } from "@/api/categoryService";
import { Category } from "@/types/product";
import { useEffect, useState } from "react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // 대분류 생성 모달
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newParent, setNewParent] = useState("");

  // 소분류 추가
  const [addChildTarget, setAddChildTarget] = useState<string | null>(null);
  const [newChild, setNewChild] = useState("");

  // 대분류 수정
  const [editParent, setEditParent] = useState<string | null>(null);
  const [editParentValue, setEditParentValue] = useState("");

  // 소분류 수정
  const [editChild, setEditChild] = useState<{ parent: string; child: string } | null>(null);
  const [editChildValue, setEditChildValue] = useState("");

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleCreateParent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParent.trim()) return;
    await categoryService.createCategory({ parent: newParent.trim() });
    setNewParent("");
    setShowCreateModal(false);
    fetchCategories();
  };

  const handleDeleteParent = async (parent: string) => {
    if (!confirm(`'${parent}' 카테고리를 삭제할까요?`)) return;
    await categoryService.deleteCategory(parent);
    fetchCategories();
  };

  const handleUpdateParent = async (parent: string) => {
    if (!editParentValue.trim() || editParentValue === parent) { setEditParent(null); return; }
    await categoryService.updateCategory(parent, { newParent: editParentValue.trim() });
    setEditParent(null);
    fetchCategories();
  };

  const handleAddChild = async (parent: string) => {
    if (!newChild.trim()) return;
    await categoryService.addChild(parent, newChild.trim());
    setAddChildTarget(null);
    setNewChild("");
    fetchCategories();
  };

  const handleUpdateChild = async () => {
    if (!editChild || !editChildValue.trim() || editChildValue === editChild.child) { setEditChild(null); return; }
    await categoryService.updateChild(editChild.parent, editChild.child, editChildValue.trim());
    setEditChild(null);
    fetchCategories();
  };

  const handleDeleteChild = async (parent: string, child: string) => {
    if (!confirm(`'${child}' 소분류를 삭제할까요?`)) return;
    await categoryService.removeChild(parent, child);
    fetchCategories();
  };

  if (loading) return <p className="text-sm text-gray-500">불러오는 중...</p>;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-800">카테고리 관리</h1>
        <button
          onClick={() => { setNewParent(""); setShowCreateModal(true); }}
          className="bg-brand-blue hover:bg-brand-blue-dark rounded-md px-4 py-2 text-sm font-medium text-white"
        >
          + 카테고리 추가
        </button>
      </div>

      {/* 카테고리 카드 그리드 */}
      {categories.length === 0 ? (
        <p className="text-sm text-gray-400">카테고리가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {categories.map((cat) => (
            <div key={cat.parent} className="rounded-lg border border-gray-200 bg-white shadow-sm">
              {/* 카드 헤더 */}
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
                {editParent === cat.parent ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      autoFocus
                      value={editParentValue}
                      onChange={(e) => setEditParentValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUpdateParent(cat.parent);
                        if (e.key === "Escape") setEditParent(null);
                      }}
                      className="focus:border-brand-blue rounded border border-gray-300 px-2 py-0.5 text-sm font-semibold outline-none"
                    />
                    <button onClick={() => handleUpdateParent(cat.parent)} className="text-brand-blue text-xs hover:underline">저장</button>
                    <button onClick={() => setEditParent(null)} className="text-xs text-gray-400 hover:underline">취소</button>
                  </div>
                ) : (
                  <div className="flex flex-1 items-center gap-3">
                    <span className="font-semibold text-gray-800">{cat.parent}</span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                      소분류 {cat.children.length}개
                    </span>
                  </div>
                )}
                {editParent !== cat.parent && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setEditParent(cat.parent); setEditParentValue(cat.parent); }}
                      className="text-xs text-gray-400 hover:text-gray-700"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDeleteParent(cat.parent)}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>

              {/* 소분류 목록 */}
              <div className="px-5 py-3">
                <div className="flex flex-wrap gap-2">
                  {cat.children.map((child) => (
                    <div
                      key={child}
                      className="flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1"
                    >
                      {editChild?.parent === cat.parent && editChild.child === child ? (
                        <>
                          <input
                            autoFocus
                            value={editChildValue}
                            onChange={(e) => setEditChildValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleUpdateChild();
                              if (e.key === "Escape") setEditChild(null);
                            }}
                            className="w-20 border-b border-gray-400 bg-transparent text-xs outline-none"
                          />
                          <button onClick={handleUpdateChild} className="text-brand-blue text-xs">저장</button>
                          <button onClick={() => setEditChild(null)} className="text-xs text-gray-400">취소</button>
                        </>
                      ) : (
                        <>
                          <span className="text-sm text-gray-700">{child}</span>
                          <button
                            onClick={() => { setEditChild({ parent: cat.parent, child }); setEditChildValue(child); }}
                            className="text-xs text-gray-400 hover:text-gray-700"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => handleDeleteChild(cat.parent, child)}
                            className="text-xs text-red-300 hover:text-red-500"
                          >
                            ✕
                          </button>
                        </>
                      )}
                    </div>
                  ))}

                  {/* 소분류 추가 */}
                  {addChildTarget === cat.parent ? (
                    <div className="flex items-center gap-1">
                      <input
                        autoFocus
                        value={newChild}
                        onChange={(e) => setNewChild(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddChild(cat.parent);
                          if (e.key === "Escape") { setAddChildTarget(null); setNewChild(""); }
                        }}
                        placeholder="소분류명"
                        className="focus:border-brand-blue w-24 rounded border border-gray-300 px-2 py-0.5 text-xs outline-none"
                      />
                      <button onClick={() => handleAddChild(cat.parent)} className="text-brand-blue text-xs hover:underline">추가</button>
                      <button onClick={() => { setAddChildTarget(null); setNewChild(""); }} className="text-xs text-gray-400 hover:underline">취소</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddChildTarget(cat.parent)}
                      className="hover:border-brand-blue hover:text-brand-blue rounded-full border border-dashed border-gray-300 px-3 py-1 text-xs text-gray-400"
                    >
                      + 소분류 추가
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 카테고리 추가 모달 */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-lg bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleCreateParent}>
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-base font-bold text-gray-800">카테고리 추가</h2>
              </div>
              <div className="px-6 py-4">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  대분류명 <span className="text-red-500">*</span>
                </label>
                <input
                  autoFocus
                  type="text"
                  value={newParent}
                  onChange={(e) => setNewParent(e.target.value)}
                  placeholder="예: 장류"
                  className="focus:border-brand-blue focus:ring-brand-blue w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-1"
                />
              </div>
              <div className="flex justify-end gap-2 border-t border-gray-200 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="bg-brand-blue hover:bg-brand-blue-dark rounded-md px-4 py-2 text-sm font-medium text-white"
                >
                  추가
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
