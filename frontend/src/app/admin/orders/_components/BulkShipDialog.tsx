import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  count: number;
  courier: string;
  tracking: string;
  isSubmitting: boolean;
  onCourierChange: (v: string) => void;
  onTrackingChange: (v: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export default function BulkShipDialog({
  open,
  count,
  courier,
  tracking,
  isSubmitting,
  onCourierChange,
  onTrackingChange,
  onConfirm,
  onClose,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>일괄 배송 시작 ({count}건)</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-gray-500">
            선택한 모든 주문에 동일한 송장 정보가 적용됩니다.
          </p>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">택배사</label>
            <Input
              placeholder="예: CJ대한통운, 우체국택배"
              value={courier}
              onChange={(e) => onCourierChange(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">운송장 번호</label>
            <Input
              placeholder="운송장 번호 입력"
              value={tracking}
              onChange={(e) => onTrackingChange(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={onConfirm} disabled={isSubmitting}>배송 시작</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
