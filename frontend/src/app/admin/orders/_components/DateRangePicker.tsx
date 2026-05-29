"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface Props {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
}

export default function DateRangePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const label = value?.from
    ? value.to
      ? `${format(value.from, "yyyy.MM.dd")} ~ ${format(value.to, "yyyy.MM.dd")}`
      : format(value.from, "yyyy.MM.dd")
    : "기간 선택";

  const hasValue = !!value?.from;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={`inline-flex w-64 items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-normal shadow-xs hover:bg-gray-50 focus-visible:outline-none ${
          hasValue ? "text-foreground" : "text-gray-400"
        }`}
      >
        <CalendarIcon className="h-4 w-4 shrink-0 text-gray-400" />
        <span className="flex-1 text-left">{label}</span>
        {hasValue && (
          <X
            className="h-3.5 w-3.5 shrink-0 text-gray-400 hover:text-gray-600"
            onClick={(e) => {
              e.stopPropagation();
              onChange(undefined);
            }}
          />
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={value}
          onSelect={onChange}
          locale={ko}
          numberOfMonths={2}
        />
        <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2">
          <span className="text-xs text-gray-400">
            {value?.from && value?.to
              ? `${format(value.from, "yyyy.MM.dd")} ~ ${format(value.to, "yyyy.MM.dd")}`
              : value?.from
                ? `${format(value.from, "yyyy.MM.dd")} ~ 종료일 선택`
                : "시작일을 선택하세요"}
          </span>
          <Button
            size="sm"
            disabled={!value?.from || !value?.to}
            onClick={() => setOpen(false)}
          >
            적용
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
