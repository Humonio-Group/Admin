<script setup lang="ts">
import PageRoot from "~/components/composing/PageRoot.vue";
import { columns } from "~/components/deployment/journeys/actions";
import { Search, X } from "lucide-vue-next";

const store = useActionStore();
const { actions, loading, hasLoaded } = storeToRefs(store);

const status = ref<number | undefined>(undefined);
watch(status, (val) => {
  store.load(val);
}, { immediate: true });

const { search, clear } = useDebounceSearch(async (val: string) => await store.load(undefined, val));
</script>

<template>
  <PageRoot
    name="deployment.actions"
    class="grid gap-6"
  >
    <header class="flex flex-col gap-3">
      <h1 class="text-3xl font-bold">
        Actions
      </h1>

      <div class="flex items-center justify-between gap-2">
        <UiButtonGroup>
          <UiButton
            :variant="status === undefined ? 'secondary' : 'outline'"
            @click="status = undefined"
          >
            Toutes
          </UiButton>
          <UiButton
            :variant="status === 1 ? 'secondary' : 'outline'"
            @click="status = 1"
          >
            Terminée
          </UiButton>
          <UiButton
            :variant="status === 0 ? 'secondary' : 'outline'"
            @click="status = 0"
          >
            En cours
          </UiButton>
          <UiButton
            :variant="status === -2 ? 'secondary' : 'outline'"
            @click="status = -2"
          >
            En retard
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
    <UiDataTable
      v-else
      :columns="columns()"
      :data="actions"
    />
  </PageRoot>
</template>
