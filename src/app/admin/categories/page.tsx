"use client";

import { categoryService } from "@/api/categoryService";
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
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Category } from "@/types/product";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useEffect, useState } from "react";

function SortableCategoryCard({
  cat,
  editParent,
  editParentValue,
  setEditParentValue,
  setEditParent,
  handleUpdateParent,
  setDeleteTarget,
  editChild,
  editChildValue,
  setEditChildValue,
  setEditChild,
  handleUpdateChild,
  addChildTarget,
  setAddChildTarget,
  newChild,
  setNewChild,
  handleAddChild,
}: {
  cat: Category;
  editParent: string | null;
  editParentValue: string;
  setEditParentValue: (v: string) => void;
  setEditParent: (v: string | null) => void;
  handleUpdateParent: (parent: string) => void;
  setDeleteTarget: (v: { type: "parent"; parent: string } | { type: "child"; parent: string; child: string } | null) => void;
  editChild: { parent: string; child: string } | null;
  editChildValue: string;
  setEditChildValue: (v: string) => void;
  setEditChild: (v: { parent: string; child: string } | null) => void;
  handleUpdateChild: () => void;
  addChildTarget: string | null;
  setAddChildTarget: (v: string | null) => void;
  newChild: string;
  setNewChild: (v: string) => void;
  handleAddChild: (parent: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.parent });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border border-gray-200 bg-white shadow-sm ${isDragging ? "opacity-50 shadow-xl" : ""}`}
    >
      {/* 카드 헤더 */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
        <div className="flex flex-1 items-center gap-2">
          {/* 드래그 핸들 */}
          <button {...attributes} {...listeners} className="cursor-grab touch-none text-gray-300 hover:text-gray-500 active:cursor-grabbing">
            <GripVertical className="h-4 w-4" />
          </button>

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
        </div>

        {editParent !== cat.parent && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setEditParent(cat.parent); setEditParentValue(cat.parent); }}
              className="text-xs text-gray-400 hover:text-gray-700"
            >
              수정
            </button>
            <button
              onClick={() => setDeleteTarget({ type: "parent", parent: cat.parent })}
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
                    onClick={() => setDeleteTarget({ type: "child", parent: cat.parent, child })}
                    className="text-xs text-red-300 hover:text-red-500"
                  >
                    ✕
                  </button>
                </>
              )}
            </div>
          ))}

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
  );
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

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

  // 삭제 확인
  const [deleteTarget, setDeleteTarget] = useState<
    | { type: "parent"; parent: string }
    | { type: "child"; parent: string; child: string }
    | null
  >(null);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = categories.findIndex((c) => c.parent === active.id);
    const newIndex = categories.findIndex((c) => c.parent === over.id);
    const reordered = arrayMove(categories, oldIndex, newIndex);
    setCategories(reordered);
    await categoryService.reorderCategories(reordered.map((c) => c.parent));
  };

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

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "parent") {
      await categoryService.deleteCategory(deleteTarget.parent);
    } else {
      await categoryService.removeChild(deleteTarget.parent, deleteTarget.child);
    }
    setDeleteTarget(null);
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

  if (loading) return <p className="text-sm text-gray-500">불러오는 중...</p>;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-800">카테고리 관리</h1>
        <Button
          onClick={() => { setNewParent(""); setShowCreateModal(true); }}
        >
          + 카테고리 추가
        </Button>
      </div>

      {/* 카테고리 카드 그리드 */}
      {categories.length === 0 ? (
        <p className="text-sm text-gray-400">카테고리가 없습니다.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={categories.map((c) => c.parent)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {categories.map((cat) => (
                <SortableCategoryCard
                  key={cat.parent}
                  cat={cat}
                  editParent={editParent}
                  editParentValue={editParentValue}
                  setEditParentValue={setEditParentValue}
                  setEditParent={setEditParent}
                  handleUpdateParent={handleUpdateParent}
                  setDeleteTarget={setDeleteTarget}
                  editChild={editChild}
                  editChildValue={editChildValue}
                  setEditChildValue={setEditChildValue}
                  setEditChild={setEditChild}
                  handleUpdateChild={handleUpdateChild}
                  addChildTarget={addChildTarget}
                  setAddChildTarget={setAddChildTarget}
                  newChild={newChild}
                  setNewChild={setNewChild}
                  handleAddChild={handleAddChild}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* 카테고리 추가 Dialog */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-sm">
          <form onSubmit={handleCreateParent}>
            <DialogHeader>
              <DialogTitle>카테고리 추가</DialogTitle>
            </DialogHeader>
            <div className="py-4">
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
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                취소
              </Button>
              <Button type="submit">
                추가
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 AlertDialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteTarget?.type === "parent" ? "카테고리 삭제" : "소분류 삭제"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === "parent"
                ? `'${deleteTarget.parent}' 카테고리를 삭제할까요?`
                : `'${deleteTarget?.child}' 소분류를 삭제할까요?`}
              <br />
              이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
