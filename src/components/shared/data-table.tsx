import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

// 1. Define what a Column looks like
export interface ColumnConfig<T> {
  header: string;
  /** The key in your data object to display (e.g., 'revenue') */
  accessorKey?: keyof T;
  /** Optional custom renderer if you need complex HTML in the cell */
  cell?: (item: T) => ReactNode;
  /** Alignment and width classes */
  className?: string;
}

interface DataTableProps<T> {
  columns: ColumnConfig<T>[];
  data: T[];
  className?: string;
}

export function DataTable<T>({ columns, data, className }: DataTableProps<T>) {
  return (
    <div className={cn("rounded-lg border overflow-hidden", className)}>
      <Table>
        {/* Blue Header to match screenshot */}
        <TableHeader className="bg-primary">
          <TableRow className="hover:bg-primary border-none">
            {columns.map((col, index) => (
              <TableHead
                key={index}
                className={cn(
                  "text-primary-foreground font-medium",
                  col.className
                )}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        {/* Table Body */}
        <TableBody className="bg-white">
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-muted/50">
                {columns.map((col, colIndex) => (
                  <TableCell
                    key={colIndex}
                    className={cn("py-3", col.className)}
                  >
                    {/* Render cell: Use custom function if provided, else use the accessor key */}
                    {col.cell
                      ? col.cell(row)
                      : (row[col.accessorKey as keyof T] as ReactNode)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}