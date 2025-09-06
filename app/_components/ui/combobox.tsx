import * as React from "react";
import { Check, ChevronDown, ChevronsUpDown, Search} from "lucide-react";

import { cn } from "@/_lib/utils";
import { Button } from "@/_components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/_components/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/_components/ui/popover";
import { FieldError } from "./form-fields";

interface ComboboxProps {
  label?: string;
  showLabel? : boolean;
  value: string;
  setValue: (value: string) => void;
  hasIcon?: boolean;
  Icon?: React.ElementType;
  options: { value: string; label: string }[];
  btnClassName?: string;
  popoverClassName?: string;
  className?: string;
  error?: string;
}

export function Combobox({
  label,
  showLabel=true,
  value,
  setValue,
  options,
  btnClassName,
  popoverClassName,
  className,
  error,
  Icon,
  hasIcon = false
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className={className}>
      {showLabel && <span className="font-bold block text-sm mb-2">{label}</span> }

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className={cn("w-full border border-gray-300 rounded-full h-full text-sm text-gray-600 font-medium flex items-center justify-between hover:bg-gray-50 cursor-pointer", error && "border-red-500", btnClassName)}>
            <span className="flex items-center h-full">
              {hasIcon && Icon && <Icon className="mr-2 h-4 w-4" />}
              {value ? options.find((option) => option.value === value)?.label : label}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </PopoverTrigger>
        <PopoverContent className={cn("!bg-white p-0 w-[--radix-popover-trigger-width] rounded-lg shadow-lg border", popoverClassName)}>
          <Command>
            <div className="flex items-center px-3 py-2 border-b border-gray-200">
              <Search className="mr-2 h-4 w-4 text-gray-400" />
              <CommandPrimitive.Input
                placeholder="Search..."
                className="flex h-8 w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </div>
            <CommandList className="max-h-[200px] overflow-y-auto">
              <CommandEmpty className="py-4 text-center text-sm text-gray-500">No options found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                    className="flex items-center px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className={cn(
                      "font-medium",
                      value === option.value ? "text-gray-900" : "text-gray-700"
                    )}>
                      {option.label}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {error && <FieldError size="lg" error={error} />}
    </div>
  );
}
