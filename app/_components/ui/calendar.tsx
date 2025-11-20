"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/_lib/utils";
import { buttonVariants } from "@/_components/ui/button";

import "react-day-picker/dist/style.css";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("rdp daypicker p-4", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "space-y-4",
        caption: "flex justify-center items-center pb-3 relative",
        caption_label: "hidden",
        caption_dropdowns: "flex justify-center gap-2 items-center",
        dropdown: "px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-colors cursor-pointer appearance-none text-gray-900",
        dropdown_month: "px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-colors cursor-pointer appearance-none text-gray-900",
        dropdown_year: "px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-colors cursor-pointer appearance-none text-gray-900",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 rounded-lg hover:bg-gray-100 text-gray-900 [&_svg]:text-gray-900"
        ),
        nav_button_previous: "absolute left-0",
        nav_button_next: "absolute right-0",
        table: "w-full border-collapse",
        head_row: "flex mb-2",
        head_cell: "text-gray-500 w-10 text-xs font-medium",
        row: "flex w-full mt-1",
        cell: "h-10 w-10 text-center p-0 relative",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 rounded-lg hover:bg-gray-100 font-normal text-gray-900"
        ),
        day_selected:
          "bg-black text-white hover:bg-black rounded-lg font-semibold",
        day_today: "bg-gray-100 font-semibold text-gray-900",
        ...classNames,
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
