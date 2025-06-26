import * as React from "react";
import { Check, ChevronDown, ChevronsUpDown} from "lucide-react";

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
        <PopoverTrigger asChild className="hover:bg-none">
          <Button variant="outline" role="combobox" aria-expanded={open} className={cn("h-10 lg:h-11 2xl:h-12 justify-start hover:bg-none", error && "border-red-500", btnClassName)}>
            <span className={`${value ? 'bg-white h-full text-[#736E6E] -ml-2 font-medium flex items-center justify-center px-4 rounded-full' : ''}`}>{hasIcon && Icon && <Icon />} {value ? options.find((option) => option.value === value)?.label : label}</span>
            <svg width="11" height="8" viewBox="0 0 11 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0.0942383H10.7737L5.38687 7.27674L0 0.0942383Z" fill="black"/></svg>
          </Button>
        </PopoverTrigger>
        <PopoverContent className={cn("!bg-white p-0", popoverClassName)}>
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandList>
              <CommandEmpty>No options found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
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
