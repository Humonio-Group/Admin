<script setup lang="ts">
import PageRoot from "~/components/composing/PageRoot.vue";
import { columns } from "~/components/deployment/journeys";
import type { Listed } from "~/types/primitives/objects";
import type { Journey } from "~/types/entities/journey";
import { computeStatus, parseStatus } from "~/lib/entities/lifecycle/journey";
import { Plus, Search, X } from "lucide-vue-next";

const { t } = useI18n();

const store = useJourneyStore();
const { journeys, hasFirstLoaded, loading: _loading } = storeToRefs(store);

const shouldShowLoader = ref<boolean>(false);
const { status } = useRoute().query;
const statuses = ref<Listed<Journey["status"]>>(status
  ? (status as string).split(",").map((e: string) => parseStatus(e))
  : [-1, 0, 1, 2]);
watch(statuses, async (val) => {
  if (!val || val.length >= 4) navigateTo({
    query: {
      status: undefined,
    },
    replace: true,
  });
  else navigateTo({
    query: {
      status: val.map(e => computeStatus(e)).join(","),
    },
    replace: true,
  });

  shouldShowLoader.value = true;
  await store.loadJourneys(undefined, val);
  shouldShowLoader.value = false;
});

function selectStatus(val?: Journey["status"]) {
  if (val === undefined) statuses.value = [-1, 0, 1, 2];
  else statuses.value = [val];
}

useBreadcrumb([
  { label: t("deployment.journeys.title") },
]);

const { search, clear } = useDebounceSearch(async (val) => {
  shouldShowLoader.value = true;
  await store.loadJourneys(val);
  shouldShowLoader.value = false;
});

store.loadJourneys(undefined, statuses.value);
</script>

<template>
  <PageRoot
    name="deployment.journeys.home"
    class="flex flex-col gap-4"
  >
    <header class="flex items-center justify-between gap-4">
      <div class="min-w-0 flex-1 overflow-x-auto">
        <UiButtonGroup>
          <UiButton
            :variant="statuses.length > 1 ? 'secondary' : 'outline'"
            size="sm"
            class="border"
            @click="selectStatus()"
          >
            {{ $t("labels.all", 2) }}
          </UiButton>
          <UiButton
            :variant="statuses.length === 1 && statuses[0] === 1 ? 'secondary' : 'outline'"
            size="sm"
            class="border"
            @click="selectStatus(1)"
          >
            {{ $t("labels.state.confirmed.f", 2) }}
          </UiButton>
          <UiButton
            :variant="statuses.length === 1 && statuses[0] === 0 ? 'secondary' : 'outline'"
            size="sm"
            class="border"
            @click="selectStatus(0)"
          >
            {{ $t("labels.state.unconfirmed.f", 2) }}
          </UiButton>
          <UiButton
            :variant="statuses.length === 1 && statuses[0] === 2 ? 'secondary' : 'outline'"
            size="sm"
            class="border"
            @click="selectStatus(2)"
          >
            {{ $t("labels.state.closed.f", 2) }}
          </UiButton>
          <UiButton
            :variant="statuses.length === 1 && statuses[0] === -1 ? 'secondary' : 'outline'"
            size="sm"
            class="border"
            @click="selectStatus(-1)"
          >
            {{ $t("labels.state.cancelled.f", 2) }}
          </UiButton>
        </UiButtonGroup>
      </div>

      <div class="flex items-center gap-1">
        <div class="relative">
          <UiInput
            v-model="search"
            class="pl-8"
            :class="{ 'pr-9': search?.length }"
            :placeholder="$t('labels.search')"
          />
          <Search class="absolute top-2.5 left-2.5 text-muted-foreground size-4" />
          <UiButton
            v-if="search?.length"
            class="absolute top-1 right-1"
            variant="ghost"
            size="icon-xs"
            @click="clear"
          >
            <X />
          </UiButton>
        </div>

        <UiButton>
          <Plus />
          {{ $t("btn.add.default") }}
        </UiButton>
      </div>
    </header>

    <main
      v-if="_loading.items && (!hasFirstLoaded || shouldShowLoader)"
      class="h-24 grid place-items-center"
    >
      <UiSpinner />
    </main>
    <main v-else>
      <UiDataTable
        :columns="columns(true)"
        :data="journeys"
      />
    </main>
  </PageRoot>
</template>
