<script setup lang="ts" generic="TData, TValue">
import { FlexRender, getCoreRowModel, useVueTable } from "@tanstack/vue-table";
import type { DataTableProps } from "~/components/ui/data-table/index";

const props = withDefaults(defineProps<DataTableProps<TData, TValue>>(), {
  loading: false,
});

const table = useVueTable({
  get data() { return props.data; },
  get columns() { return props.columns; },
  getCoreRowModel: getCoreRowModel(),
});

async function handleClick() {
  if (props.rowAction?.type !== "click") return;

  await props.rowAction.callback();
}

function serialize(row: TData, template: string) {
  template = template.replaceAll("{alias}", storeToRefs(useCompanyStore()).company.value?.alias ?? "");

  Object.keys(row).forEach(key => template = template.replaceAll(`{${key}}`, row[key]!));

  return template;
}
</script>

<template>
  <div class="border rounded-lg">
    <UiTable>
      <UiTableHeader>
        <UiTableRow
          v-for="headerGroup in table.getHeaderGroups()"
          :key="headerGroup.id"
          class="bg-accent! text-accent-foreground!"
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
        <template v-if="loading">
          <UiTableRow>
            <UiTableCell
              :colspan="columns.length"
              class="h-24"
            >
              <div class="grid size-full place-items-center">
                <UiSpinner />
              </div>
            </UiTableCell>
          </UiTableRow>
        </template>
        <template v-else-if="table.getRowModel().rows?.length">
          <UiTableRow
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            :data-state="row.getIsSelected() ? 'selected' : undefined"
            class="relative isolate"
            @click="handleClick"
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

            <NuxtLinkLocale
              v-if="rowAction?.type === 'link'"
              :to="serialize(row.original, rowAction.template)"
              class="absolute inset-0 size-full z-0"
            />
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
