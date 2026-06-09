<script setup lang="ts" generic="TData, TValue">
import { FlexRender, getCoreRowModel, useVueTable } from "@tanstack/vue-table";
import type { DataTableProps } from "~/components/ui/data-table/index";

const props = defineProps<DataTableProps<TData, TValue>>();

const table = useVueTable({
  get data() { return props.data; },
  get columns() { return props.columns; },
  getCoreRowModel: getCoreRowModel(),
});
</script>

<template>
  <div class="border rounded-lg">
    <UiTable>
      <UiTableHeader>
        <UiTableRow
          v-for="headerGroup in table.getHeaderGroups()"
          :key="headerGroup.id"
        >
          <UiTableHead
            v-for="header in headerGroup.headers"
            :key="header.id"
          >
            <FlexRender
              v-if="!header.isPlaceholder"
              :render="header.column.columnDef.header"
              :props="header.getContext()"
            />
          </UiTableHead>
        </UiTableRow>
      </UiTableHeader>
      <UiTableBody>
        <template v-if="table.getRowModel().rows?.length">
          <UiTableRow
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            :data-state="row.getIsSelected() ? 'selected' : undefined"
          >
            <UiTableCell
              v-for="cell in row.getVisibleCells()"
              :key="cell.id"
            >
              <FlexRender
                :render="cell.column.columnDef.cell"
                :props="cell.getContext()"
              />
            </UiTableCell>
          </UiTableRow>
        </template>
        <template v-else>
          <UiTableRow>
            <UiTableCell
              :colspan="columns.length"
              class="h-24 text-center"
            >
              No results. <!-- todo: translate - loic -->
            </UiTableCell>
          </UiTableRow>
        </template>
      </UiTableBody>
    </UiTable>
  </div>
</template>
