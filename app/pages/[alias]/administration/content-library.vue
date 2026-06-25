<script setup lang="ts">
import { Search, Plus } from "@lucide/vue";
import PageRoot from "~/components/composing/PageRoot.vue";
import ContentLibraryTable from "~/components/administration/content-library/ContentLibraryTable.vue";
import PaginationProvider from "~/components/primitives/PaginationProvider.vue";

const { t } = useI18n();

const store = useContentLibraryStore();
const { tags, totalEntities, perPage, loading } = storeToRefs(store);

const tag = ref<string | undefined>((useRoute().query.tag as string) || undefined);
watch(tag, (val) => {
  navigateTo({
    query: {
      tag: val,
    },
    replace: true,
  });
  store.load(val || undefined);
}, { immediate: true });

useBreadcrumb([
  {
    label: t("content-library.title"),
  },
]);

const { activePage } = usePagination(async page => await store.load(tag.value || undefined, page));
provide("activePage", activePage);

store.loadTags();
</script>

<template>
  <PageRoot
    name="administration.content-library"
    class="grid gap-2"
  >
    <header class="flex items-center justify-between gap-8 overflow-hidden">
      <UiButtonGroup class="flex-1 overflow-x-auto">
        <UiButton
          :variant="!tag ? 'secondary' : 'outline'"
          size="sm"
          @click="tag = undefined"
        >
          {{ $t("labels.all") }}
        </UiButton>
        <UiButton
          v-for="_tag in tags"
          :key="`tag-${_tag.id}`"
          :variant="_tag.id === tag ? 'secondary' : 'outline'"
          size="sm"
          @click="tag = _tag.id"
        >
          {{ _tag.name }}
        </UiButton>
      </UiButtonGroup>

      <div class="flex items-center gap-2">
        <div class="relative">
          <UiInput
            :placeholder="$t('labels.search')"
            class="pl-8"
            disabled
          />
          <Search class="text-muted-foreground size-4 absolute top-2.5 left-2.5 opacity-50" />
        </div>

        <UiTooltip>
          <UiTooltipTrigger>
            <UiButton disabled>
              <Plus />
              Nouveau contenu
            </UiButton>
          </UiTooltipTrigger>
          <UiTooltipContent class="flex items-center gap-2">
            <p>{{ $t("labels.wip") }}</p>
            <UiSpinner class="size-3" />
          </UiTooltipContent>
        </UiTooltip>
      </div>
    </header>

    <main class="overflow-hidden">
      <ContentLibraryTable />
    </main>

    <footer v-if="!loading.list && totalEntities > perPage">
      <PaginationProvider
        :total="totalEntities"
        :per-page="perPage"
      />
    </footer>
  </PageRoot>
</template>
