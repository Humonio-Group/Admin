<script setup lang="ts">
import type { Listed } from "~/types/primitives/objects";
import type { JourneyStageContent } from "~/types/entities/journey";

const store = useJourneyStore();
const { journey, loading } = storeToRefs(store);
const { company } = storeToRefs(useCompanyStore());

const content = computed(() => {
  const stages = journey.value?.results.stages ?? [];
  if (!stages.length) return null;

  const contents = stages.reduce((acc, curr) => {
    acc = [...acc, ...curr.contents];
    return acc;
  }, [] as Listed<JourneyStageContent>);
  return contents.find(c => c.id === Number(useRoute().params.contentId as string));
});

if (!content.value) store.loadResults();

provide("content", content);
</script>

<template>
  <div class="p-4">
    <div
      v-if="!content && (loading.results.stages || loading.results.contents.length)"
      class="h-24 grid place-items-center"
    >
      <UiSpinner />
    </div>
    <div
      v-else-if="content"
      class="flex flex-col gap-4"
    >
      <header class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <NuxtImg
              :src="content.picture ?? ''"
              class="size-12 aspect-square object-cover rounded-md bg-primary"
            />

            <div class="grid gap-1">
              <p class="text-lg font-semibold">
                {{ content.name }}
              </p>
              <span
                v-if="content.duration"
                class="text-sm text-muted-foreground"
              >{{ $t("labels.time.minutes", content.duration > 1 ? 2 : 1, {
                named: {
                  count: content.duration,
                },
              }) }}</span>
            </div>
          </div>
        </div>

        <nav class="flex items-center gap-2">
          <UiButton
            variant="outline"
            class="flex-1"
            as-child
          >
            <NuxtLinkLocale
              :to="`/${company?.alias}/deployment/journeys/${journey?.id}/results/${content.id}`"
              exact-active-class="border-primary! bg-primary/20! text-primary!"
            >
              Complétion
            </NuxtLinkLocale>
          </UiButton>
          <UiButton
            variant="outline"
            class="flex-1"
            as-child
          >
            <NuxtLinkLocale
              :to="`/${company?.alias}/deployment/journeys/${journey?.id}/results/${content.id}/graphs`"
              active-class="border-primary! bg-primary/20! text-primary!"
            >
              Graphiques
            </NuxtLinkLocale>
          </UiButton>
        </nav>
      </header>

      <main>
        <NuxtPage />
      </main>
    </div>
  </div>
</template>
