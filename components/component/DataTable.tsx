"use client";

// Componente que gera as tabelas

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTablePagination } from "./TablePagination";
import { Input } from "@/components/ui/input";
import React from "react";
import RFMBadge, { RFMSegmento } from "./RFMBadge";

export const rfmSegmentos: RFMSegmento[] = [
  "Campeões",
  "Leais",
  "Potenciais Leais",
  "Recém-Chegados",
  "Promissores",
  "Precisam de Atenção",
  "À Beira de Dormir",
  "Em Risco",
  "Não Podem Perder",
  "Hibernando",
  "Perdidos",
];

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  hasRFMFilter?: boolean; // para a tabela da página clientes, filtra por tag RFM
  hasFilter?: boolean; // props que coloca o filtro por alguma coluna
  filterColumn?: string; // props que você passa o nome da coluna que será filtrada
  filterPlaceholder?: string; // o que aparece dentro do input
}

export function DataTable<TData, TValue>({
  columns,
  data,
  hasRFMFilter = false,
  hasFilter = false,
  filterColumn,
  filterPlaceholder,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [selectInstanceKey, setSelectInstanceKey] = React.useState(0);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      columnFilters,
    },
  });

  return (
    <div>
      {hasFilter && filterColumn && (
        <div className="flex items-center gap-3 py-4">
          <Input
            placeholder={filterPlaceholder}
            value={
              (table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn(filterColumn)?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          {hasRFMFilter && (
            <Select
              key={selectInstanceKey}
              value={
                (table.getColumn("segmento")?.getFilterValue() as string) ??
                "Todos os segmentos"
              }
              onOpenChange={(open) => {
                if (!open) {
                  setSelectInstanceKey((key) => key + 1);
                }
              }}
              onValueChange={(value) =>
                table
                  .getColumn("segmento")
                  ?.setFilterValue(value === "todos" ? undefined : value)
              }
            >
              <SelectTrigger className="w-45">
                <SelectValue placeholder="Segmento RFM" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="todos">Todos os segmentos</SelectItem>
                  {rfmSegmentos.map((segmento) => (
                    <SelectItem key={segmento} value={segmento}>
                      <RFMBadge segmento={segmento} />
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        </div>
      )}
      <div className="overflow-hidden rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
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
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nenhum resultado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
