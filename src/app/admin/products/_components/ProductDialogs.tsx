"use client";

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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Product } from "@/types/product";
import { Category } from "@/types/product";
import { ContentBlock, ProductForm, ProductFormData } from "./ProductForm";

type Props = {
  // 추가 다이얼로그
  showCreateModal: boolean;
  setShowCreateModal: (open: boolean) => void;
  handleCreate: (e: React.FormEvent) => void;

  // 수정 다이얼로그
  editTarget: Product | null;
  setEditTarget: (target: Product | null) => void;
  handleUpdate: (e: React.FormEvent) => void;

  // 삭제 다이얼로그
  deleteTarget: Product | null;
  setDeleteTarget: (target: Product | null) => void;
  handleDelete: () => void;

  // 공통
  form: ProductFormData;
  onChange: (field: keyof ProductFormData, value: string | boolean) => void;
  onBlockChange: (
    index: number,
    field: keyof ContentBlock,
    value: string,
  ) => void;
  onAddBlock: () => void;
  onRemoveBlock: (index: number) => void;
  categories: Category[];
  isSubmitting: boolean;
};

export function ProductDialogs({
  showCreateModal,
  setShowCreateModal,
  handleCreate,
  editTarget,
  setEditTarget,
  handleUpdate,
  deleteTarget,
  setDeleteTarget,
  handleDelete,
  form,
  onChange,
  onBlockChange,
  onAddBlock,
  onRemoveBlock,
  categories,
  isSubmitting,
}: Props) {
  return (
    <>
      {/* 상품 추가 Dialog */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-2xl">
          <form onSubmit={handleCreate}>
            <DialogHeader className="border-b border-gray-100 pb-5">
              <div className="flex items-center gap-2.5">
                <span className="bg-brand-blue h-5 w-1 rounded-full" />
                <DialogTitle className="text-brand-blue text-lg font-bold">
                  상품 추가
                </DialogTitle>
              </div>
            </DialogHeader>
            <div className="max-h-[65vh] overflow-y-auto px-1 py-6">
              <ProductForm
                form={form}
                onChange={onChange}
                onBlockChange={onBlockChange}
                onAddBlock={onAddBlock}
                onRemoveBlock={onRemoveBlock}
                categories={categories}
              />
            </div>
            <DialogFooter className="border-t border-gray-100 pt-5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "추가 중..." : "추가"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 상품 수정 Dialog */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <form onSubmit={handleUpdate}>
            <DialogHeader className="border-b border-gray-100 pb-5">
              <div className="flex items-center gap-2.5">
                <span className="bg-brand-blue h-5 w-1 rounded-full" />
                <div>
                  <DialogTitle className="text-brand-blue text-lg font-bold">
                    상품 수정
                  </DialogTitle>
                  {editTarget && (
                    <p className="mt-0.5 truncate text-sm text-gray-500">
                      {editTarget.name}
                    </p>
                  )}
                </div>
              </div>
            </DialogHeader>
            <div className="max-h-[65vh] overflow-y-auto px-1 py-6">
              <ProductForm
                form={form}
                onChange={onChange}
                onBlockChange={onBlockChange}
                onAddBlock={onAddBlock}
                onRemoveBlock={onRemoveBlock}
                categories={categories}
              />
            </div>
            <DialogFooter className="border-t border-gray-100 pt-5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditTarget(null)}
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "수정 중..." : "수정"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 AlertDialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>상품 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="text-foreground font-medium">
                {deleteTarget?.name}
              </span>
              을(를) 삭제할까요?
              <br />이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isSubmitting ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
