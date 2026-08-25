"use client";

import { useState } from "react";
import {
  getLocalTimeZone,
  parseDate,
  today,
  type CalendarDate,
} from "@internationalized/date";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const MIN_DATE = parseDate("1970-01-01");

function toCalendarDate(value: string): CalendarDate | undefined {
  if (!value) {
    return undefined;
  }
  try {
    return parseDate(value);
  } catch {
    return undefined;
  }
}

function formatDate(date: CalendarDate) {
  return date.toDate(getLocalTimeZone()).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function DateField({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = toCalendarDate(value);
  const maxDate = today(getLocalTimeZone()).add({ years: 2 });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        render={
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start font-normal",
              !selected && "text-muted-foreground",
            )}
          />
        }
      >
        <CalendarIcon />
        {selected ? formatDate(selected) : placeholder}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          value={selected ?? null}
          onChange={(date) => {
            onChange(date ? date.toString() : "");
            setOpen(false);
          }}
          minValue={MIN_DATE}
          maxValue={maxDate}
          captionLayout="dropdown"
          className="rounded-lg border"
        />
      </PopoverContent>
    </Popover>
  );
}
