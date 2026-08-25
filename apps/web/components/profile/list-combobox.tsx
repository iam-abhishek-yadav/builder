"use client";

import { XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

function ListItems() {
  return (
    <ComboboxList>
      {(item) => (
        <ComboboxItem key={String(item)} value={item}>
          {String(item)}
        </ComboboxItem>
      )}
    </ComboboxList>
  );
}

export function SelectedChips({
  items,
  onRemove,
  onSelect,
}: {
  items: { key: string; label: string }[];
  onRemove: (key: string) => void;
  onSelect?: (key: string) => void;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto pt-1">
      {items.map((item) => (
        <Badge key={item.key} variant="secondary" className="h-6 shrink-0 gap-1 pr-1">
          <button
            type="button"
            className="max-w-48 truncate"
            onClick={() => onSelect?.(item.key)}
          >
            {item.label}
          </button>
          <button
            type="button"
            className="rounded-full p-0.5 hover:bg-foreground/10"
            aria-label={`Remove ${item.label}`}
            onClick={() => onRemove(item.key)}
          >
            <XIcon className="size-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
}

export function MultiListCombobox({
  items,
  value,
  onChange,
  placeholder,
}: {
  items: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
}) {
  const available = items.filter((item) => !value.includes(item));

  return (
    <div className="grid gap-1.5">
      <Combobox
        items={available}
        autoHighlight
        value={null}
        onValueChange={(next) => {
          if (next) {
            onChange([...value, next]);
          }
        }}
      >
        <ComboboxInput placeholder={placeholder} className="w-full" />
        <ComboboxContent className="w-full min-w-(--anchor-width)">
          <ComboboxEmpty>No matching options.</ComboboxEmpty>
          <ListItems />
        </ComboboxContent>
      </Combobox>
      <SelectedChips
        items={value.map((item) => ({ key: item, label: item }))}
        onRemove={(item) => onChange(value.filter((skill) => skill !== item))}
      />
    </div>
  );
}

export function SingleListCombobox({
  items,
  value,
  onChange,
  placeholder,
}: {
  items: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <Combobox
      items={items}
      autoHighlight
      value={value || null}
      onValueChange={(next) => onChange(next ?? "")}
    >
      <ComboboxInput
        placeholder={placeholder}
        className="w-full"
        showClear={Boolean(value)}
      />
      <ComboboxContent className="w-full min-w-(--anchor-width)">
        <ComboboxEmpty>No matching options.</ComboboxEmpty>
        <ListItems />
      </ComboboxContent>
    </Combobox>
  );
}
