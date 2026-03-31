<script setup lang="ts">
import { Search, Plus } from "lucide-vue-next";
import PageRoot from "~/components/composing/PageRoot.vue";
import ProgramCard from "~/components/deployment/programs/ProgramCard.vue";

const store = useProgramStore();
const { programs, loading: _loading } = storeToRefs(store);

const loading = computed(() => _loading.value.items);

useBreadcrumb([
  { label: useNuxtApp().$i18n.t("deployment.programs.title") },
]);

store.loadPrograms();
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
            variant="outline"
            size="sm"
          >
            {{ $t("labels.archives") }}
          </UiButton>
        </UiButtonGroup>

        <div class="min-w-0 flex-1 overflow-x-auto">
          <UiButtonGroup>
            <UiButton
              variant="secondary"
              size="sm"
              class="border"
            >
              Tous
            </UiButton>
            <UiButton
              variant="outline"
              size="sm"
            >
              Développement
            </UiButton>
            <UiButton
              variant="outline"
              size="sm"
            >
              Production
            </UiButton>
            <UiButton
              variant="outline"
              size="sm"
            >
              Support
            </UiButton>
          </UiButtonGroup>
        </div>
      </div>

      <div class="shrink-0 flex items-center gap-1.5">
        <div class="relative">
          <UiInput
            class="pl-8"
            :placeholder="$t('labels.search')"
          />
          <Search class="absolute size-4 top-2.5 left-2.5 text-muted-foreground pointer-events-none" />
        </div>

        <UiButton>
          <Plus />
          {{ $t("btn.add.program") }}
        </UiButton>
      </div>
    </header>

    <main
      v-if="loading"
      class="h-24 grid place-items-center"
    >
      <UiSpinner />
    </main>
    <main
      v-else-if="programs.length"
      class="grid gap-4 grid-cols-[repeat(auto-fill,minmax(320px,1fr))]"
    >
      <ProgramCard
        v-for="program in programs"
        :key="program.key"
        :program
      />
    </main>
    <UiEmpty v-else>
      empty
    </UiEmpty>
  </PageRoot>
</template>
