<script setup lang="ts">
import PageRoot from "~/components/composing/PageRoot.vue";
import { ImageOff } from "lucide-vue-next";

const store = useJourneyStore();
const { journey, loading } = storeToRefs(store);
const { company } = storeToRefs(useCompanyStore());

const roles = ["participant", "facilitator", "coach", "client"] as const;

const selectedRole = computed(() => useRoute().query.role ?? "participant");
const stages = computed(() => journey.value?.results.stages ?? []);

store.loadResults();
</script>

<template>
  <PageRoot
    v-if="journey"
    name="journeys.specimen.results"
    wrapper
    wrapper-class="max-w-auto! flex flex-col @2xl/page:flex-row"
  >
    <aside class="shrink-0 flex-1 flex items-center overflow-x-auto border-b @2xl/page:border-b-0 @2xl/page:border-r @2xl/page:max-w-3xs @2xl/page:flex-col @2xl/page:items-stretch">
      <NuxtLinkLocale
        v-for="role in roles"
        :key="role"
        :to="`/${company?.alias}/deployment/journeys/${journey.id}/results?role=${role}`"
        :replace="true"
        class="capitalize border-transparent flex-1 text-center border-b-3 @2xl/page:border-b-0 @2xl/page:border-l-3 @2xl/page:text-left @2xl/page:flex-0 py-3 px-4 hover:bg-accent/50 transition-colors duration-100"
        :class="{ 'border-primary! text-primary! bg-primary/10! font-medium': selectedRole === role }"
      >
        {{ $t(`deployment.journeys.results.graphs.roles.${role}`) }}
      </NuxtLinkLocale>
    </aside>

    <main class="flex flex-col gap-2 @2xl/page:flex-1 p-4">
      <template v-if="loading.results.stages && !stages.length">
        <UiCard
          v-for="i in 5"
          :key="i"
          class="p-0"
        >
          <UiCardHeader class="p-4 pr-6 flex flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <UiSkeleton class="aspect-video h-16 rounded-md" />

              <div class="grid gap-1">
                <UiCardTitle>
                  <UiSkeleton class="h-[1.8ch] w-[8ch]" />
                </UiCardTitle>
                <UiCardDescription>
                  <UiSkeleton class="h-[1.8ch] w-[18ch]" />
                </UiCardDescription>
              </div>
            </div>

            <UiSkeleton class="size-6 rounded-full" />
          </UiCardHeader>
        </UiCard>
      </template>
      <template v-else>
        <UiCard
          v-for="stage in stages"
          :key="`${stage.id}-${stage.reference}`"
          class="p-0 gap-0"
        >
          <UiCollapsible :default-open="true">
            <UiCollapsibleTrigger as-child>
              <UiCardHeader class="cursor-pointer p-4 pr-6 flex flex-row items-center justify-between gap-4">
                <div class="flex items-center gap-4">
                  <NuxtImg
                    v-if="stage.picture"
                    :src="stage.picture"
                    class="block aspect-video object-cover h-16 rounded-md"
                  />
                  <div
                    v-else
                    class="grid place-items-center aspect-video h-16 bg-muted rounded-md"
                  >
                    <ImageOff class="size-4 text-muted-foreground" />
                  </div>

                  <div class="grid gap-1">
                    <UiCardTitle>{{ stage.name }}</UiCardTitle>
                    <UiCardDescription>{{ $t(`labels.modalities.${stage.modality}`) }}</UiCardDescription>
                  </div>
                </div>

                <UiSkeleton
                  v-if="loading.results.contents.includes(stage.id) && !stage.contents.length"
                  class="size-6 rounded-full"
                />
                <UiCircularProgress
                  v-else
                  :model-value="stage.progress * 100"
                  class="size-6"
                  filled
                />
              </UiCardHeader>
            </UiCollapsibleTrigger>

            <UiCollapsibleContent>
              <UiCardContent class="pb-4 px-4 grid gap-2">
                <template v-if="loading.results.contents.includes(stage.id) && !stage.contents.length">
                  <div
                    v-for="i in 4"
                    :key="i"
                    class="flex items-center justify-between p-2 pr-3 rounded-md border bg-background dark:bg-input/30"
                  >
                    <div class="flex items-center gap-2">
                      <UiSkeleton class="aspect-square size-7 rounded-sm" />

                      <UiSkeleton class="h-[1.8ch] w-[15ch]" />
                    </div>

                    <div class="flex items-center gap-2">
                      <span class="text-sm">
                        <UiSkeleton class="h-[1.8ch] w-[7ch]" />
                      </span>

                      <UiSkeleton class="size-5 rounded-full" />
                    </div>
                  </div>
                </template>
                <template v-else>
                  <UiButton
                    v-for="content in stage.contents"
                    :key="`content-${content.id}`"
                    variant="outline"
                    class="text-base! h-auto justify-between pl-2"
                    as-child
                  >
                    <NuxtLinkLocale :to="`/${company?.alias}/deployment/journeys/${journey.id}/results/${content.id}`">
                      <div class="inline-flex items-center gap-2">
                        <NuxtImg
                          class="size-7 aspect-square object-cover bg-primary rounded-sm"
                          :src="content.picture"
                        />
                        <p>{{ content.name }}</p>
                      </div>

                      <div class="flex items-center gap-4">
                        <span
                          v-if="content.duration"
                          class="text-sm text-muted-foreground font-normal!"
                        >{{ $t("labels.time.minutes", content.duration > 1 ? 2 : 1, {
                          named: {
                            count: content.duration,
                          },
                        }) }}</span>

                        <UiPopover>
                          <UiPopoverTrigger class="grid place-items-center">
                            <UiCircularProgress :model-value="content.stats.completion * 100" />
                          </UiPopoverTrigger>
                          <UiPopoverContent
                            side="top"
                            align="end"
                            class="grid gap-2"
                          >
                            <div class="flex items-center gap-8 justify-between">
                              <p class="text-sm text-muted-foreground font-medium">
                                Ayant vu
                              </p>
                              <p class="font-medium">
                                {{ content.stats.viewsCount }} / {{ content.access.length }}
                              </p>
                            </div>
                            <div class="flex items-center gap-8 justify-between">
                              <p class="text-sm text-muted-foreground font-medium">
                                Ayant complété
                              </p>
                              <p class="font-medium">
                                {{ content.stats.completionCount }} / {{ content.access.length }}
                              </p>
                            </div>
                          </UiPopoverContent>
                        </UiPopover>
                      </div>
                    </NuxtLinkLocale>
                  </UiButton>
                </template>
              </UiCardContent>
            </UiCollapsibleContent>
          </UiCollapsible>
        </UiCard>
      </template>
    </main>
  </PageRoot>
</template>
