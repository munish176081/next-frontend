import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/_lib/utils";
import { Button } from "@/_components/ui/button";
import { Calendar, CalendarProps } from "@/_components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/_components/ui/popover";
import { FieldError } from "./form-fields";

type DatePickerProps = CalendarProps & {
  error?: string;
  date?: Date | null;
  setDate: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  variant?: "default" | "rounded-full";
  min?: Date;
  max?: Date;
  // Support for string values (for form compatibility)
  value?: string;
  onChange?: (value: string) => void;
};

export function DatePicker({
  date: dateProp,
  setDate: setDateProp,
  error,
  placeholder = "Pick a date",
  className,
  variant = "default",
  min,
  max,
  value,
  onChange,
  ...calendarProps
}: DatePickerProps) {
  // Handle both Date and string value formats
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(
    dateProp || (value ? new Date(value) : undefined)
  );

  React.useEffect(() => {
    if (dateProp !== undefined) {
      setInternalDate(dateProp || undefined);
    } else if (value) {
      setInternalDate(new Date(value));
    }
  }, [dateProp, value]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setInternalDate(selectedDate);
    if (setDateProp) {
      setDateProp(selectedDate);
    }
    if (onChange) {
      // Convert to YYYY-MM-DD format for form compatibility
      if (selectedDate) {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        onChange(`${year}-${month}-${day}`);
      } else {
        onChange('');
      }
    }
  };

  const displayValue = internalDate ? format(internalDate, "PPP") : placeholder;

  const triggerClasses = variant === "rounded-full"
    ? cn(
        "w-full justify-start text-left font-normal text-base max-md:text-xs max-md:px-4 px-6 h-[70px] max-md:h-12 rounded-full border border-[#B5B5B5] bg-white hover:border-black/40 focus:border-black focus:ring-2 focus:ring-black/10",
        !internalDate && "text-[#4B4A4A8C]",
        error && "border-red-500"
      )
    : cn(
        "w-full justify-start text-left font-normal px-4",
        !internalDate && "text-muted-foreground",
        error && "border border-red-500"
      );

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={variant === "rounded-full" ? "outline" : "outline"}
            size={variant === "rounded-full" ? "lg" : "lg"}
            className={cn(triggerClasses, className)}
          >
            <CalendarIcon className={cn(
              variant === "rounded-full" ? "mr-2 h-5 w-5 max-md:h-4 max-md:w-4" : "mr-2 h-4 w-4"
            )} />
            <span>{displayValue}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            {...calendarProps}
            mode="single"
            selected={internalDate}
            onSelect={handleDateSelect}
            initialFocus
            captionLayout="dropdown"
            fromYear={min ? min.getFullYear() : 1900}
            toYear={max ? max.getFullYear() : new Date().getFullYear() + 10}
            disabled={(date) => {
              if (min && date < min) return true;
              if (max && date > max) return true;
              return false;
            }}
          />
        </PopoverContent>
      </Popover>

      {error && <FieldError size="lg" error={error} />}
    </>
  );
}
