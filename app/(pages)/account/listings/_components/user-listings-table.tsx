"use client";

import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Table } from "@/_components/common/table";
import { Badge } from "@/_components/ui/badge";
import { UserListingType } from "@/_types/listing";
import { formatDate } from "@/_utils/date";
import { useRouter } from "next/navigation";
import { formatListingType } from "@/_utils/listing";

interface UserListingsTableProps {
  listings: UserListingType[];
}

const columns: ColumnDef<Partial<UserListingType>>[] = [
  {
    header: "Title",
    accessorKey: "title",
    cell: ({ row }) => {
      return <span>{row.original.fields?.title}</span>;
    },
  },
  {
    header: "Type",
    accessorKey: "type",
    cell: ({ row }) => {
      return <span>{formatListingType(row.original.type!)}</span>;
    },
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => {
      return (
        <Badge
          variant={
            row.original.status === "active"
              ? "success"
              : row.original.status === "expired"
                ? "destructive"
                : "default"
          }
        >
          {row.original.status}
        </Badge>
      );
    },
  },
  {
    header: "Started / Renewed At",
    accessorKey: "startedOrRenewedAt",
    cell: ({ row }) => {
      const { startedOrRenewedAt } = row.original;
      if (!startedOrRenewedAt) return "-";

      return <span>{formatDate(new Date(startedOrRenewedAt))}</span>;
    },
  },
  {
    header: "Expires At",
    accessorKey: "expiresAt",
    cell: ({ row }) => {
      const { expiresAt } = row.original;
      if (!expiresAt) return "-";

      return <span>{formatDate(new Date(expiresAt))}</span>;
    },
  },
];

export const UserListingsTable = ({ listings }: UserListingsTableProps) => {
  const router = useRouter();

  const table = useReactTable({
    data: listings,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table
      className="mt-5"
      table={table}
      noResultsMsg="No Listings found."
      isLoading={false}
      onRowClick={(row) => {
        router.push(`/account/listings/${row.id}`);
      }}
    />
  );
};
