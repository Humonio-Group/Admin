<script setup lang="ts">
import { ChevronLeft, ChevronRight } from "@lucide/vue";

const store = useCompanyStore();
const { perPage, totalUsers } = storeToRefs(store);

const activePage = inject<Ref<number>>("activePage")!;
</script>

<template>
  <UiPagination
    v-model:page="activePage"
    :default-page="1"
    :items-per-page="perPage"
    :sibling-count="2"
    :total="totalUsers"
  >
    <UiPaginationContent v-slot="{ items }">
      <UiPaginationPrevious>
        <ChevronLeft />
        {{ $t("btn.navigate.previous") }}
      </UiPaginationPrevious>

      <template
        v-for="(item, index) in items"
        :key="index"
      >
        <UiPaginationItem
          v-if="item.type === 'page'"
          :value="index + 1"
          :is-active="activePage === index + 1"
        >
          {{ index + 1 }}
        </UiPaginationItem>
        <UiPaginationEllipsis v-if="item.type === 'ellipsis'" />
      </template>

      <UiPaginationNext>
        {{ $t("btn.navigate.next") }}
        <ChevronRight />
      </UiPaginationNext>
    </UiPaginationContent>
  </UiPagination>
</template>
