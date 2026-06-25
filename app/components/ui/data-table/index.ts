import type { ColumnDef } from "@tanstack/vue-table";

export { default as DataTable } from "./DataTable.vue";

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  rowAction?: { type: "link"; template: string } | { type: "click"; callback: () => unknown | Promise<unknown> };
  loading?: boolean;
}
