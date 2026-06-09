<script setup lang="ts">
import { ChevronLeft, ChevronRight } from "@lucide/vue";

withDefaults(defineProps<{ total?: number; perPage?: number }>(), {
  total: 0,
  perPage: 25,
});

const activePage = inject<Ref<number>>("activePage")!;
</script>

<template>
  <UiPagination
    v-model:page="activePage"
    :default-page="1"
    :total="total"
    :items-per-page="perPage"
    :sibling-count="2"
  >
    <UiPaginationContent v-slot="{ items }">
      <UiPaginationPrevious>
        <ChevronLeft />
        {{ $t("btn.navigate.previous") }}
      </UiPaginationPrevious>

      <template
        v-for="(item, index) in items"
        :key="item"
      >
        <UiPaginationItem
          v-if="item.type === 'page'"
          :value="index + 1"
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
