<script setup lang="ts">
import PageRoot from "~/components/composing/PageRoot.vue";
import { columns } from "~/components/deployment/journeys/actions";
import { Search, X } from "lucide-vue-next";
import PaginationProvider from "~/components/primitives/PaginationProvider.vue";

const { t } = useI18n();

const store = useActionStore();
const { actions, totalEntities, perPage, loading, hasLoaded } = storeToRefs(store);

const status = ref<number | undefined>(undefined);
watch(status, (val) => {
  store.load(val);
}, { immediate: true });

const { search, clear } = useDebounceSearch(async (val: string) => await store.load(undefined, val));

useBreadcrumb([
  { label: t("deployment.actions.title") },
]);

const { activePage } = usePagination(async page => await store.load(status.value, undefined, page));
provide("activePage", activePage);
</script>

<template>
  <PageRoot
    name="deployment.actions"
    class="grid gap-6"
  >
    <header class="flex flex-col gap-3">
      <div class="flex items-center justify-between gap-2">
        <UiButtonGroup>
          <UiButton
            size="sm"
            :variant="status === undefined ? 'secondary' : 'outline'"
            @click="status = undefined"
          >
            {{ $t("deployment.actions.filters.all") }}
          </UiButton>
          <UiButton
            size="sm"
            :variant="status === 1 ? 'secondary' : 'outline'"
            @click="status = 1"
          >
            {{ $t("deployment.actions.filters.done") }}
          </UiButton>
          <UiButton
            size="sm"
            :variant="status === 0 ? 'secondary' : 'outline'"
            @click="status = 0"
          >
            {{ $t("deployment.actions.filters.in-progress") }}
          </UiButton>
          <UiButton
            size="sm"
            :variant="status === -2 ? 'secondary' : 'outline'"
            @click="status = -2"
          >
            {{ $t("deployment.actions.filters.late") }}
          </UiButton>
        </UiButtonGroup>

        <div class="relative">
          <UiInput
            v-model="search"
            class="pl-9"
            :class="{ 'pr-9': search?.length }"
            :placeholder="$t('labels.search')"
          />
          <Search class="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
          <UiButton
            v-if="search?.length"
            size="icon-xs"
            variant="ghost"
            class="absolute top-1 right-1"
            @click="clear"
          >
            <X />
          </UiButton>
        </div>
      </div>
    </header>

    <div
      v-if="loading && !hasLoaded"
      class="h-24 grid place-items-center"
    >
      <UiSpinner />
    </div>
    <template v-else>
      <UiDataTable
        :columns="columns()"
        :data="actions"
      />
      <footer v-if="totalEntities > perPage">
        <PaginationProvider
          :total="totalEntities"
          :per-page="perPage"
        />
      </footer>
    </template>
  </PageRoot>
</template>
