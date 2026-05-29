import { Button } from "@/components/ui/button";

interface Props {
  count: number;
  allPaid: boolean;
  allProcessing: boolean;
  allShipped: boolean;
  allCancellable: boolean;
  isSubmitting: boolean;
  onPrepare: () => void;
  onShipOpen: () => void;
  onComplete: () => void;
  onCancelOpen: () => void;
  onDeselect: () => void;
}

export default function OrderBulkActionBar({
  count,
  allPaid,
  allProcessing,
  allShipped,
  allCancellable,
  isSubmitting,
  onPrepare,
  onShipOpen,
  onComplete,
  onCancelOpen,
  onDeselect,
}: Props) {
  return (
    <div className="border-brand-blue/30 mb-3 flex items-center gap-2 rounded-lg border bg-blue-50 px-4 py-2.5">
      <span className="text-brand-blue text-sm font-medium">{count}건 선택됨</span>
      <div className="ml-auto flex flex-wrap gap-2">
        {allPaid && (
          <Button size="sm" variant="outline" disabled={isSubmitting} onClick={onPrepare} className="text-xs">
            준비 시작
          </Button>
        )}
        {allProcessing && (
          <Button size="sm" variant="outline" disabled={isSubmitting} onClick={onShipOpen} className="text-xs">
            배송 시작
          </Button>
        )}
        {allShipped && (
          <Button size="sm" variant="outline" disabled={isSubmitting} onClick={onComplete} className="text-xs">
            배송 완료
          </Button>
        )}
        {allCancellable && (
          <Button
            size="sm"
            variant="outline"
            disabled={isSubmitting}
            onClick={onCancelOpen}
            className="border-red-200 text-xs text-red-500 hover:bg-red-50"
          >
            취소
          </Button>
        )}
        <button onClick={onDeselect} className="text-xs text-gray-400 hover:text-gray-600">
          선택 해제
        </button>
      </div>
    </div>
  );
}
