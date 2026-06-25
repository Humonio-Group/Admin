<script setup lang="ts">
import PageRoot from "~/components/composing/PageRoot.vue";
import { Search, Plus, Flag } from "lucide-vue-next";
import { columns } from "~/components/deployment/journeys";
import type { Listed } from "~/types/primitives/objects";
import type { Journey } from "~/types/entities/journey";
import { computeStatus, parseStatus } from "~/lib/entities/lifecycle/journey";
import JourneyDialog from "~/components/deployment/journeys/JourneyDialog.vue";

const { t, locale } = useI18n();

const store = useProgramStore();
const { selectedProgram: program, loading: _loading } = storeToRefs(store);
const loading = computed(() => _loading.value.journeys);

const journeys = computed(() => program.value?.journeys.list ?? []);

const { status } = useRoute().query;
const statuses = ref<Listed<Journey["status"]>>(status
  ? (status as string).split(",").map((e: string) => parseStatus(e))
  : [-1, 0, 1, 2]);
watch(statuses, async (val) => {
  navigateTo({
    query: {
      status: (val ?? [-1, 0, 1, 2]).map(e => computeStatus(e)).join(","),
    }, replace: true });
  await store.loadJourneys(val);
});

watch(program, () => {
  useBreadcrumb([
    { label: t("deployment.programs.title"), to: "/deployment/programs" },
    { label: `${program.value?.name[locale.value] || program.value?.name[program.value?.defaultLanguage.code]}`, to: `/deployment/programs/${useRoute().params.id}` },
    { label: t("deployment.programs.navigation.journeys") },
  ]);
}, { deep: true });

function selectStatus(val?: Journey["status"]) {
  if (val === undefined) statuses.value = [-1, 0, 1, 2];
  else statuses.value = [val];
}

store.loadJourneys(statuses.value);
</script>

<template>
  <PageRoot
    name="deployment.programs.details.journeys"
    class="flex flex-col gap-4"
  >
    <header class="flex items-center justify-between gap-6">
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
            class="pl-8"
            :placeholder="$t('labels.search')"
          />
          <Search class="absolute top-2.5 left-2.5 text-muted-foreground size-4" />
        </div>

        <JourneyDialog
          v-if="program"
          :selected-program="program"
          trigger
        >
          <UiButton :disabled="!program.active">
            <Plus />
            {{ $t("btn.add.default") }}
          </UiButton>
        </JourneyDialog>
      </div>
    </header>

    <main
      v-if="loading"
      class="h-24 grid place-items-center"
    >
      <UiSpinner />
    </main>
    <main v-else-if="program && journeys.length">
      <UiDataTable
        :columns="columns()"
        :data="journeys"
      />
    </main>
    <main v-else>
      <UiEmpty>
        <UiEmptyHeader>
          <UiEmptyMedia variant="icon">
            <Flag />
          </UiEmptyMedia>
          <UiEmptyTitle>
            {{ $t("deployment.programs.journeys.empty.title") }}
          </UiEmptyTitle>
          <UiEmptyDescription>
            {{ $t("deployment.programs.journeys.empty.description") }}
          </UiEmptyDescription>
        </UiEmptyHeader>

        <UiEmptyContent>
          <JourneyDialog
            v-if="program"
            :selected-program="program"
            trigger
          >
            <UiButton :disabled="!program.active">
              <Plus />
              {{ $t("deployment.programs.journeys.empty.action") }}
            </UiButton>
          </JourneyDialog>
        </UiEmptyContent>
      </UiEmpty>
    </main>
  </PageRoot>
</template>
