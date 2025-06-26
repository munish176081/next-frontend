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
  date: Date;
  setDate: (date: Date | undefined) => void;
};

export function DatePicker({
  date,
  setDate,
  error,
  ...calendarProps
}: DatePickerProps) {
  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="lg"
            className={cn(
              "w-full justify-start text-left font-normal px-4",
              !date && "text-muted-foreground",
              error && "border border-red-500"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            {...calendarProps}
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {error && <FieldError size="lg" error={error} />}
    </>
  );
}
