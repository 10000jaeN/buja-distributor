import { Order } from "@/api/orderService";
import { Button } from "@/components/ui/button";
import { STATUS_COLOR, STATUS_LABEL, formatDate } from "../_utils/orderUtils";

interface Props {
  orders: Order[];
  selectedIds: Set<string>;
  allChecked: boolean;
  someChecked: boolean;
  onToggleAll: () => void;
  onToggleOne: (id: string) => void;
  onDetail: (order: Order) => void;
  onEdit: (order: Order) => void;
}

const TABLE_COLS = ["주문번호", "주문자", "상품", "금액", "상태", "주문일", "관리"];

export default function OrderTable({
  orders,
  selectedIds,
  allChecked,
  someChecked,
  onToggleAll,
  onToggleOne,
  onDetail,
  onEdit,
}: Props) {
  return (
    <div className="hidden overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm lg:block">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-10 px-4 py-3">
              <input
                type="checkbox"
                checked={allChecked}
                ref={(el) => {
                  if (el) el.indeterminate = someChecked && !allChecked;
                }}
                onChange={onToggleAll}
                className="accent-brand-blue h-4 w-4 cursor-pointer rounded"
              />
            </th>
            {TABLE_COLS.map((col) => (
              <th
                key={col}
                className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.map((order) => (
            <tr
              key={order._id}
              className={`transition-colors hover:bg-gray-50 ${
                selectedIds.has(order._id) ? "bg-blue-50/40" : ""
              }`}
            >
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.has(order._id)}
                  onChange={() => onToggleOne(order._id)}
                  className="accent-brand-blue h-4 w-4 cursor-pointer rounded"
                />
              </td>
              <td className="px-4 py-3 font-mono text-sm font-medium text-gray-800">
                {order.orderNumber ?? "Unknown"}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">
                <div>{order.user?.nickName ?? "Unknown"}</div>
                <div className="text-xs text-gray-400">{order.user?.email ?? ""}</div>
              </td>
              <td className="max-w-48 px-4 py-3 text-sm text-gray-700">
                <div className="truncate">{order.items[0]?.name ?? "-"}</div>
                {order.items.length > 1 && (
                  <div className="text-xs text-gray-400">외 {order.items.length - 1}건</div>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">
                {order.totalAmount.toLocaleString()}원
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[order.status]}`}
                >
                  {STATUS_LABEL[order.status]}
                </span>
                {order.trackingNumber && (
                  <div className="mt-1 text-xs text-gray-400">
                    {order.courierName} {order.trackingNumber}
                  </div>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {formatDate(order.createdAt)}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-1.5">
                  <Button size="sm" variant="outline" onClick={() => onDetail(order)} className="text-xs">
                    상세
                  </Button>
                  {!["delivered", "cancelled"].includes(order.status) && (
                    <Button size="sm" variant="outline" onClick={() => onEdit(order)} className="text-xs">
                      수정
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
