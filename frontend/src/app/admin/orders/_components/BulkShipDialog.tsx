import { useEffect, useState } from "react";
import { Order } from "@/api/orderService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ShipRow {
  orderId: string;
  courier: string;
  tracking: string;
}

interface Props {
  open: boolean;
  orders: Order[];
  isSubmitting: boolean;
  onConfirm: (rows: ShipRow[]) => void;
  onClose: () => void;
}

export default function BulkShipDialog({
  open,
  orders,
  isSubmitting,
  onConfirm,
  onClose,
}: Props) {
  const [rows, setRows] = useState<ShipRow[]>(() =>
    orders.map((o) => ({ orderId: o._id, courier: "", tracking: "" }))
  );

  // 다이얼로그가 열릴 때마다 rows 초기화
  useEffect(() => {
    if (open) setRows(orders.map((o) => ({ orderId: o._id, courier: "", tracking: "" })));
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (index: number, field: "courier" | "tracking", value: string) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  };

  const handleConfirm = () => {
    const filled = rows.filter((r) => r.courier.trim() && r.tracking.trim());
    if (filled.length === 0) return;
    onConfirm(filled);
  };

  const filledCount = rows.filter((r) => r.courier.trim() && r.tracking.trim()).length;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[80vh] w-[90vw] max-w-4xl flex-col overflow-hidden sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>배송 시작 — 송장 입력 ({orders.length}건)</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 py-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-gray-500">
                <th className="pb-2 pr-3 font-medium">주문번호</th>
                <th className="pb-2 pr-3 font-medium">수령인</th>
                <th className="pb-2 pr-3 font-medium w-36">택배사</th>
                <th className="pb-2 font-medium w-44">운송장 번호</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order, i) => (
                <tr key={order._id} className="group">
                  <td className="py-2 pr-3 text-gray-700 whitespace-nowrap">{order.orderNumber}</td>
                  <td className="py-2 pr-3 text-gray-600 whitespace-nowrap">
                    {order.shippingAddress?.recipientName ?? order.user?.nickName ?? "-"}
                  </td>
                  <td className="py-2 pr-3">
                    <Input
                      placeholder="CJ대한통운"
                      value={rows[i]?.courier ?? ""}
                      onChange={(e) => update(i, "courier", e.target.value)}
                      className="h-8 text-sm"
                    />
                  </td>
                  <td className="py-2">
                    <Input
                      placeholder="운송장 번호"
                      value={rows[i]?.tracking ?? ""}
                      onChange={(e) => update(i, "tracking", e.target.value)}
                      className="h-8 text-sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filledCount < orders.length && (
          <p className="text-xs text-gray-400 pt-1">
            * 입력하지 않은 {orders.length - filledCount}건은 건너뜁니다.
          </p>
        )}

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            취소
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting || filledCount === 0}>
            {filledCount > 0 ? `${filledCount}건 배송 시작` : "배송 시작"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
