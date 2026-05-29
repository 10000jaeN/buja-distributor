import { Order } from "@/api/orderService";
import { Button } from "@/components/ui/button";
import { STATUS_COLOR, STATUS_LABEL, formatDate } from "../_utils/orderUtils";

interface Props {
  orders: Order[];
  selectedIds: Set<string>;
  onToggleOne: (id: string) => void;
  onDetail: (order: Order) => void;
  onEdit: (order: Order) => void;
}

export default function OrderCardList({ orders, selectedIds, onToggleOne, onDetail, onEdit }: Props) {
  return (
    <div className="flex flex-col gap-3 lg:hidden">
      {orders.map((order) => (
        <div
          key={order._id}
          className={`flex items-center gap-3 rounded-lg border bg-white p-3 shadow-sm ${
            selectedIds.has(order._id)
              ? "border-brand-blue/40 bg-blue-50/30"
              : "border-gray-200"
          }`}
        >
          <input
            type="checkbox"
            checked={selectedIds.has(order._id)}
            onChange={() => onToggleOne(order._id)}
            className="accent-brand-blue mt-0.5 h-10 w-10 shrink-0 cursor-pointer rounded"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-medium text-gray-800">
                {order.orderNumber ?? "Unknown"}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[order.status]}`}
              >
                {STATUS_LABEL[order.status]}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-gray-700">
              {order.user?.nickName ?? "Unknown"}
              <span className="ml-1 text-xs text-gray-400">{order.user?.email ?? ""}</span>
            </p>
            <p className="mt-0.5 truncate text-xs text-gray-500">
              {order.items[0]?.name ?? "-"}
              {order.items.length > 1 && ` 외 ${order.items.length - 1}건`}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm font-medium text-gray-800">
                {order.totalAmount.toLocaleString()}원
              </span>
              <span className="text-xs text-gray-400">{formatDate(order.createdAt)}</span>
            </div>
            {order.trackingNumber && (
              <p className="mt-0.5 text-xs text-gray-400">
                {order.courierName} {order.trackingNumber}
              </p>
            )}
          </div>
          <div className="flex shrink-0 flex-col gap-1.5">
            <Button size="sm" variant="outline" onClick={() => onDetail(order)} className="text-xs">
              상세
            </Button>
            {!["delivered", "cancelled"].includes(order.status) && (
              <Button size="sm" variant="outline" onClick={() => onEdit(order)} className="text-xs">
                수정
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
