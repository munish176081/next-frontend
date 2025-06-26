import {
  Table as ReactTableType,
  RowData,
  flexRender,
} from "@tanstack/react-table";

import {
  Table as ReactTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/_components/ui/table";
import { cn } from "@/_lib/utils";

interface TableProps<TData> {
  table: ReactTableType<TData>;
  noResultsMsg?: string;
  isLoading?: boolean;
  className?: string;
  onRowClick?: (row: TData) => void;
}

export function Table<TData extends RowData>({
  table,
  noResultsMsg,
  isLoading = false,
  className,
  onRowClick,
}: TableProps<TData>) {
  return (
    <div className={cn("rounded-md border bg-white", className)}>
      <ReactTable>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                onClick={() => {
                  onRowClick?.(row.original);
                }}
                className={cn(onRowClick && "cursor-pointer")}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    align={
                      (
                        cell.column.columnDef.meta as Record<
                          string,
                          "left" | "center" | "right" | "justify" | "char"
                        >
                      )?.align
                    }
                    style={{
                      width: cell.column.getSize(),
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={table.getAllColumns().length}
                className="h-24 text-center"
              >
                {isLoading ? "Loading..." : (noResultsMsg ?? "No results.")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </ReactTable>
    </div>
  );
}
