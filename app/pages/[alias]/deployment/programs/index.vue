<script setup lang="ts">
import { Search, Plus, X } from "lucide-vue-next";
import PageRoot from "~/components/composing/PageRoot.vue";
import ProgramCard from "~/components/deployment/programs/ProgramCard.vue";
import type { Nullable } from "~/types/primitives/objects";

const store = useProgramStore();
const { programs, tags, hasFirstLoaded, loading: _loading, totalEntities, perPage } = storeToRefs(store);

const { query } = useRoute();

const showArchived = ref<boolean>(query.archived === "true");
watch(showArchived, async (val) => {
  navigateTo({
    query: {
      archived: val ? "true" : undefined,
    },
    replace: true,
  });
  shouldShowLoader.value = true;
  await store.loadPrograms(tagId.value ?? undefined, search.value || undefined, !val);
  shouldShowLoader.value = false;
});

const shouldShowLoader = ref<boolean>(false);
const loading = computed(() => _loading.value.items);

const tagParam = useRoute().query.category as string | undefined;
const tagId = ref<Nullable<number>>(tagParam ? Number(tagParam) : null);
watch(tagId, async (val) => {
  if (!val) navigateTo({
    query: {
      category: undefined,
    },
    replace: true,
  });
  else navigateTo({
    query: {
      category: val,
    },
    replace: true,
  });

  shouldShowLoader.value = true;
  await store.loadPrograms(val ? val : undefined);
  shouldShowLoader.value = false;
});

useBreadcrumb([
  { label: useNuxtApp().$i18n.t("deployment.programs.title") },
]);

const { search, clear } = useDebounceSearch(async (val) => {
  shouldShowLoader.value = true;
  await store.loadPrograms(undefined, val);
  shouldShowLoader.value = false;
});

const { activePage } = usePagination(async (page) => {
  shouldShowLoader.value = true;
  await store.loadPrograms(tagId.value ?? undefined, search.value || undefined, !showArchived.value, page);
  shouldShowLoader.value = false;
});

store.loadTags();
</script>

<template>
  <PageRoot
    name="deployment.programs.home"
    class="flex flex-col gap-4"
  >
    <header class="flex items-center gap-6 justify-between">
      <div class="flex items-center gap-1.5 overflow-hidden">
        <UiButtonGroup>
          <UiButton
            :variant="showArchived ? 'secondary' : 'outline'"
            size="sm"
            @click="showArchived = !showArchived"
          >
            {{ $t("labels.archives") }}
          </UiButton>
        </UiButtonGroup>

        <div class="min-w-0 flex-1 overflow-x-auto">
          <UiButtonGroup>
            <UiButton
              :variant="tagId === null ? 'secondary' : 'outline'"
              size="sm"
              class="border"
              @click="tagId = null"
            >
              {{ $t("labels.all") }}
            </UiButton>
            <UiButton
              v-for="tag in tags"
              :key="tag.id"
              :variant="tagId === tag.id ? 'secondary' : 'outline'"
              size="sm"
              @click="tagId = tag.id"
            >
              {{ tag.name }}
            </UiButton>
            <UiButton
              v-if="_loading.tags"
              disabled
              variant="outline"
              size="icon"
            >
              <UiSpinner />
            </UiButton>
          </UiButtonGroup>
        </div>
      </div>

      <div class="shrink-0 flex items-center gap-1.5">
        <div class="relative">
          <UiInput
            v-model="search"
            class="pl-8"
            :class="{ 'pr-9': search?.length }"
            :placeholder="$t('labels.search')"
          />
          <Search class="absolute size-4 top-2.5 left-2.5 text-muted-foreground pointer-events-none" />
          <UiButton
            v-if="search?.length"
            variant="ghost"
            size="icon-xs"
            class="absolute top-1 right-1"
            @click="clear"
          >
            <X />
          </UiButton>
        </div>

        <UiButton>
          <Plus />
          {{ $t("btn.add.program") }}
        </UiButton>
      </div>
    </header>

    <main
      v-if="loading && (!hasFirstLoaded || shouldShowLoader)"
      class="h-24 grid place-items-center"
    >
      <UiSpinner />
    </main>
    <template v-else-if="programs.length">
      <main class="grid gap-4 grid-cols-[repeat(auto-fill,minmax(320px,1fr))]">
        <ProgramCard
          v-for="program in programs"
          :key="program.key"
          :program
        />
      </main>

      <footer v-if="totalEntities > perPage">
        <UiPagination
          v-model:page="activePage"
          :total="totalEntities"
          :items-per-page="perPage"
          :sibling-count="2"
        >
          <UiPaginationContent v-slot="{ items }">
            <UiPaginationPrevious />

            <template
              v-for="item in items"
              :key="item.type === 'page' ? item.value : item.type"
            >
              <UiPaginationItem
                v-if="item.type === 'page'"
                :value="item.value"
                :is-active="item.value === activePage"
              >
                {{ item.value }}
              </UiPaginationItem>
              <UiPaginationEllipsis v-else />
            </template>

            <UiPaginationNext />
          </UiPaginationContent>
        </UiPagination>
      </footer>
    </template>
    <UiEmpty v-else>
      empty
    </UiEmpty>
  </PageRoot>
</template>
