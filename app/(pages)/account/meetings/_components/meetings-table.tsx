"use client";

import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Table } from "@/_components/common/table";
import { Meeting } from "../../../../_types/meeting";

interface MeetingsTableProps {
  meetings: Meeting[];
  isLoading: boolean;
}

const columns: ColumnDef<Partial<Meeting>>[] = [
  {
    header: "Listing",
    accessorKey: "listing",
  },
  {
    header: "Type",
    accessorKey: "type",
  },
  {
    header: "Date",
    accessorKey: "date",
  },
  {
    header: "Time",
    accessorKey: "time",
  },
  {
    header: "Meeting With",
    accessorKey: "meetingWith",
  },
  {
    header: "Status",
    accessorKey: "status",
  },
  {
    header: "Action",
    accessorKey: "action",
  },
];

export const MeetingsTable = ({
  meetings = [],
  isLoading,
}: MeetingsTableProps) => {
  const table = useReactTable({
    data: meetings,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table
      className="mt-5"
      table={table}
      noResultsMsg="No Meetings Found"
      isLoading={isLoading}
    />
  );
};
