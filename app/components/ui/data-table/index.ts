import type { ColumnDef } from "@tanstack/vue-table";

export { default as DataTable } from "./DataTable.vue";

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}
