import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RotateCcw } from "lucide-react";
import { OrderStatus } from "@/api/orderService";
import { DateRange } from "react-day-picker";
import { ALL_STATUSES, STATUS_LABEL } from "../_utils/orderUtils";
import DateRangePicker from "./DateRangePicker";

interface Props {
  searchQuery: string;
  filterStatus: string;
  dateRange: DateRange | undefined;
  resultCount: number;
  onSearchChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onReset: () => void;
}

export default function OrderSearchBar({
  searchQuery,
  filterStatus,
  dateRange,
  resultCount,
  onSearchChange,
  onStatusChange,
  onDateRangeChange,
  onReset,
}: Props) {
  return (
    <div className="mb-4 space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="주문번호 / 주문자 검색..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 bg-white"
        />
        <button
          onClick={onReset}
          className="flex shrink-0 items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-400 hover:text-gray-600"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">초기화</span>
        </button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm text-gray-500">
          검색결과 <span className="font-medium text-foreground">{resultCount.toLocaleString()}</span>개
        </span>
        <div className="flex flex-wrap gap-2">
        <DateRangePicker value={dateRange} onChange={onDateRangeChange} />
        <Select value={filterStatus} onValueChange={(v) => v && onStatusChange(v)}>
          <SelectTrigger className="w-44 bg-white">
            <SelectValue>
              {filterStatus === "all"
                ? "전체 상태"
                : STATUS_LABEL[filterStatus as OrderStatus]}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 상태</SelectItem>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        </div>
      </div>
    </div>
  );
}
