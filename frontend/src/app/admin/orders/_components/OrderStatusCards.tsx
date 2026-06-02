import { OrderStatus } from "@/api/orderService";
import { ALL_STATUSES, STATUS_LABEL } from "../_utils/orderUtils";

interface Props {
  statusCounts: Record<OrderStatus, number>;
  filterStatus: string;
  onFilter: (status: string) => void;
}

export default function OrderStatusCards({ statusCounts, filterStatus, onFilter }: Props) {
  return (
    <div className="mb-6 grid grid-cols-3 gap-3 lg:grid-cols-6">
      {ALL_STATUSES.map((s) => (
        <button
          key={s}
          onClick={() => onFilter(filterStatus === s ? "all" : s)}
          className={`hover:border-brand-blue rounded-lg border bg-white px-4 py-3 text-left shadow-sm transition-colors ${
            filterStatus === s ? "border-brand-blue" : "border-gray-200"
          }`}
        >
          <p className="text-xs font-medium text-gray-500">{STATUS_LABEL[s]}</p>
          <p
            className={`mt-1 text-2xl font-bold ${
              filterStatus === s ? "text-brand-blue" : "text-foreground"
            }`}
          >
            {statusCounts[s]}
          </p>
        </button>
      ))}
    </div>
  );
}
