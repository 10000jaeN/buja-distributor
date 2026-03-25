"use client";

import { categoryService } from "@/api/categoryService";
import { Category } from "@/types/product";
import { useEffect, useState } from "react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // 대분류 생성
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

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateParent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParent.trim()) return;
    await categoryService.createCategory({ parent: newParent.trim() });
    setNewParent("");
    fetchCategories();
  };

  const handleDeleteParent = async (parent: string) => {
    if (!confirm(`'${parent}' 카테고리를 삭제할까요?`)) return;
    await categoryService.deleteCategory(parent);
    fetchCategories();
  };

  const handleUpdateParent = async (parent: string) => {
    if (!editParentValue.trim() || editParentValue === parent) {
      setEditParent(null);
      return;
    }
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
    if (!editChild || !editChildValue.trim() || editChildValue === editChild.child) {
      setEditChild(null);
      return;
    }
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
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-800">카테고리 관리</h1>
      </div>

      {/* 대분류 추가 */}
      <form onSubmit={handleCreateParent} className="flex gap-2">
        <input
          type="text"
          value={newParent}
          onChange={(e) => setNewParent(e.target.value)}
          placeholder="새 대분류명"
          className="rounded border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-brand-blue"
        />
        <button
          type="submit"
          className="rounded bg-brand-blue px-4 py-1.5 text-sm text-white hover:bg-brand-blue-dark"
        >
          대분류 추가
        </button>
      </form>

      {/* 카테고리 목록 */}
      {categories.length === 0 ? (
        <p className="text-sm text-gray-400">카테고리가 없습니다.</p>
      ) : (
        <div className="space-y-4">
          {categories.map((cat) => (
            <div key={cat.parent} className="rounded-lg border border-gray-200 bg-white p-4">
              {/* 대분류 헤더 */}
              <div className="flex items-center gap-2">
                {editParent === cat.parent ? (
                  <>
                    <input
                      autoFocus
                      value={editParentValue}
                      onChange={(e) => setEditParentValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUpdateParent(cat.parent);
                        if (e.key === "Escape") setEditParent(null);
                      }}
                      className="rounded border border-gray-300 px-2 py-0.5 text-sm font-semibold outline-none focus:border-brand-blue"
                    />
                    <button
                      onClick={() => handleUpdateParent(cat.parent)}
                      className="text-xs text-brand-blue hover:underline"
                    >
                      저장
                    </button>
                    <button
                      onClick={() => setEditParent(null)}
                      className="text-xs text-gray-400 hover:underline"
                    >
                      취소
                    </button>
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-gray-800">{cat.parent}</span>
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
                  </>
                )}
              </div>

              {/* 소분류 목록 */}
              <div className="mt-3 flex flex-wrap gap-2">
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
                        <button onClick={handleUpdateChild} className="text-xs text-brand-blue">저장</button>
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
                      className="w-24 rounded border border-gray-300 px-2 py-0.5 text-xs outline-none focus:border-brand-blue"
                    />
                    <button
                      onClick={() => handleAddChild(cat.parent)}
                      className="text-xs text-brand-blue hover:underline"
                    >
                      추가
                    </button>
                    <button
                      onClick={() => { setAddChildTarget(null); setNewChild(""); }}
                      className="text-xs text-gray-400 hover:underline"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddChildTarget(cat.parent)}
                    className="rounded-full border border-dashed border-gray-300 px-3 py-1 text-xs text-gray-400 hover:border-brand-blue hover:text-brand-blue"
                  >
                    + 소분류 추가
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
