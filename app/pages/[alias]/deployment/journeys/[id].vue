<script setup lang="ts">
import PageRoot from "~/components/composing/PageRoot.vue";
import { ArrowRight } from "lucide-vue-next";
import MarkdownRenderer from "~/components/primitives/MarkdownRenderer.vue";
import JourneyActions from "~/components/deployment/journeys/JourneyActions.vue";
import { formatDate } from "date-fns";
import * as locales from "date-fns/locale";

const { t, locale } = useI18n();

const store = useJourneyStore();
const { journey, loading } = storeToRefs(store);
const { company } = storeToRefs(useCompanyStore());

const { isStuck, observed } = useSticky();

const route = useRoute();
const journeyId = computed<number>(() => Number(route.params.id as string));
watch(journeyId, async (val) => {
  if (!val) return;
  await store.loadJourney(val);

  useBreadcrumb([
    { label: t("deployment.journeys.title"), to: "/deployment/journeys" },
    { label: `${journey.value?.name}` },
  ]);
}, { immediate: true });
</script>

<template>
  <PageRoot name="journeys.specimen">
    <main
      v-if="loading.specimen && journey?.id !== journeyId"
      class="h-24 grid place-items-center"
    >
      <UiSpinner />
    </main>
    <template v-else-if="journey">
      <header class="flex gap-4 mb-6">
        <div class="aspect-4/2.5 shrink-0 max-w-sm overflow-hidden rounded-xl">
          <NuxtImg
            v-if="journey.relatedProgram?.picture"
            :src="journey.relatedProgram?.picture"
            class="block size-full object-cover"
          />
          <span
            v-else
            class="block size-full bg-accent"
          />
        </div>

        <div class="flex-1 flex flex-col gap-1.5 py-4">
          <UiButton
            v-if="journey.relatedProgram"
            variant="link"
            size="sm"
            class="p-0! self-start h-auto!"
            as-child
          >
            <NuxtLinkLocale :to="`/${company?.alias}/deployment/programs/${journey.relatedProgram.id}`">
              {{ journey.relatedProgram.name }}
            </NuxtLinkLocale>
          </UiButton>
          <h1 class="text-3xl font-bold">
            {{ journey.name }}
          </h1>
          <MarkdownRenderer
            v-if="journey.relatedProgram?.description?.length"
            :content="journey.relatedProgram.description"
            class="*:text-base! line-clamp-4"
          />

          <div class="mt-auto flex items-start gap-6">
            <div
              v-if="journey.facilitators.length"
              class="grid gap-1.5"
            >
              <p class="text-xs font-medium text-muted-foreground">
                Facilitateurs
              </p>
              <div class="flex items-center">
                <UiTooltip
                  v-for="(user, index) in journey.facilitators.slice(0, 3)"
                  :key="`${user.firstName}-${index}`"
                >
                  <UiTooltipTrigger as-child>
                    <UiAvatar
                      class="outline-3 outline-background"
                      :class="{ '-ml-2': index > 0 }"
                    >
                      <UiAvatarImage
                        v-if="user.avatar"
                        :src="user.avatar"
                      />
                      <UiAvatarFallback>{{ user.firstName[0] }}{{ user.lastName[0] }}</UiAvatarFallback>
                    </UiAvatar>
                  </UiTooltipTrigger>
                  <UiTooltipContent>
                    <p>{{ user.firstName }} {{ user.lastName }}</p>
                  </UiTooltipContent>
                </UiTooltip>
                <UiAvatar
                  v-if="journey.facilitators.length > 3"
                  class="-ml-2 outline-3 outline-background"
                >
                  <UiAvatarFallback class="text-xs text-muted-foreground">
                    +{{ journey.facilitators.length - 3 }}
                  </UiAvatarFallback>
                </UiAvatar>
              </div>
            </div>

            <div
              v-if="journey.participants.length"
              class="grid gap-1.5"
            >
              <p class="text-xs font-medium text-muted-foreground">
                Participants
              </p>
              <div class="flex items-center">
                <UiTooltip
                  v-for="(user, index) in journey.participants.slice(0, 3)"
                  :key="`${user.firstName}-${index}`"
                >
                  <UiTooltipTrigger as-child>
                    <UiAvatar
                      class="outline-3 outline-background"
                      :class="{ '-ml-2': index > 0 }"
                    >
                      <UiAvatarImage
                        v-if="user.avatar"
                        :src="user.avatar"
                      />
                      <UiAvatarFallback>{{ user.firstName[0] }}{{ user.lastName[0] }}</UiAvatarFallback>
                    </UiAvatar>
                  </UiTooltipTrigger>
                  <UiTooltipContent>
                    <p>{{ user.firstName }} {{ user.lastName }}</p>
                  </UiTooltipContent>
                </UiTooltip>
                <UiAvatar
                  v-if="journey.participants.length > 3"
                  class="-ml-2 outline-3 outline-background"
                >
                  <UiAvatarFallback class="text-xs text-muted-foreground">
                    +{{ journey.participants.length - 3 }}
                  </UiAvatarFallback>
                </UiAvatar>
              </div>
            </div>

            <div class="grid gap-1.5">
              <p class="text-xs text-muted-foreground font-medium">
                Période
              </p>

              <div class="flex items-center gap-1 text-sm">
                <p>{{ formatDate(journey.dates.start, "d MMMM yyyy, HH:mm", { locale: locales[locale] }) }}</p>
                <ArrowRight class="size-3.5" />
                <p>{{ formatDate(journey.dates.end, "d MMMM yyyy, HH:mm", { locale: locales[locale] }) }}</p>
              </div>
            </div>
          </div>
        </div>

        <JourneyActions
          class="self-start"
          :journey
          :show-journey-shortcuts="false"
        />
      </header>

      <div class="rounded-3xl border isolate">
        <nav
          ref="observed"
          class="sticky z-10 top-12 flex items-center gap-1.5 p-2 bg-background border-b overflow-x-auto"
          :class="{ 'rounded-t-3xl': !isStuck }"
        >
          <UiButton
            variant="outline"
            class="rounded-full"
            as-child
          >
            <NuxtLinkLocale
              :to="`/${company?.alias}/deployment/journeys/${journey.id}/`"
              exact-active-class="bg-accent! hover:bg-accent/85!"
            >
              {{ $t("deployment.journeys.navigation.overview") }}
            </NuxtLinkLocale>
          </UiButton>
          <UiButton
            variant="outline"
            class="rounded-full"
            as-child
          >
            <NuxtLinkLocale
              :to="`/${company?.alias}/deployment/journeys/${journey.id}/participants`"
              active-class="bg-accent! hover:bg-accent/85!"
            >
              {{ $t("deployment.journeys.navigation.participants") }}
            </NuxtLinkLocale>
          </UiButton>
          <UiButton
            variant="outline"
            class="rounded-full"
            as-child
          >
            <NuxtLinkLocale
              :to="`/${company?.alias}/deployment/journeys/${journey.id}/actions`"
              active-class="bg-accent! hover:bg-accent/85!"
            >
              {{ $t("deployment.journeys.navigation.actions") }}
            </NuxtLinkLocale>
          </UiButton>
          <UiButton
            variant="outline"
            class="rounded-full"
            as-child
          >
            <NuxtLinkLocale
              :to="`/${company?.alias}/deployment/journeys/${journey.id}/results`"
              active-class="bg-accent! hover:bg-accent/85!"
            >
              {{ $t("deployment.journeys.navigation.results") }}
            </NuxtLinkLocale>
          </UiButton>
        </nav>

        <main class="p-4">
          <NuxtPage />
        </main>
      </div>
    </template>
  </PageRoot>
</template>
