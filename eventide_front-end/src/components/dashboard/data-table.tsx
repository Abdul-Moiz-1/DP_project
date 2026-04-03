// src/components/dashboard/DataTable.tsx
"use client";

import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
} from "@heroui/react";

export interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  itemsPerPageOptions?: number[];
  emptyContent?: string;
  onRowClick?: (row: any) => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  itemsPerPageOptions = [5, 10, 20],
  emptyContent = "No data found",
  onRowClick,
}) => {
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[0]);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedData = data.slice(start, end);

  return (
    <div className="space-y-4">
      <Table
        aria-label="Data table"
        classNames={{
          wrapper: "border border-default-200 rounded-lg shadow-sm",
          th: "bg-default-100 text-sm text-default-600 font-semibold",
          td: "text-sm text-default-700 py-3",
        }}
      >
        <TableHeader>
          {columns.map((col) => (
            <TableColumn key={col.key}>{col.label}</TableColumn>
          ))}
        </TableHeader>

        <TableBody emptyContent={emptyContent}>
          {paginatedData.map((row, i) => (
          
            <TableRow
              key={i}
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? "cursor-pointer hover:bg-default-100" : ""}
            >
              {columns.map((col) => (
                <TableCell key={col.key}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            isCompact
            showControls
            page={page}
            total={totalPages}
            onChange={setPage}
            color="secondary"
          />
        </div>
      )}
    </div>
  );
};


