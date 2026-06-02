<script setup lang="ts">
import PageRoot from "~/components/composing/PageRoot.vue";
import JourneyStatCard from "~/components/deployment/journeys/JourneyStatCard.vue";
import NextEventCard from "~/components/deployment/journeys/NextEventCard.vue";
import type { JourneyScoreScope } from "~/types/entities/journey";
import JourneyTeamScore from "~/components/deployment/journeys/JourneyTeamScore.vue";
import JourneySimulationCard from "~/components/deployment/journeys/simulations/JourneySimulationCard.vue";

const { t } = useI18n();

const store = useJourneyStore();
const { journey, loading } = storeToRefs(store);

const scope = ref<JourneyScoreScope>("access");

useBreadcrumb([
  { label: t("deployment.journeys.title"), to: "/deployment/journeys" },
  { label: `${journey.value?.name}` },
]);

store.loadNextEvents();
store.loadScores();
store.loadSimulations();
</script>

<template>
  <PageRoot
    name="deployment.journeys.home"
    class="p-4 grid @4xl/layout:grid-cols-3 gap-4 @4xl/layout:items-start"
  >
    <template v-if="journey">
      <div class="@4xl/layout:col-span-2 grid gap-4">
        <UiCard class="gap-3">
          <UiCardHeader>
            <UiCardTitle>
              {{ $t("deployment.journeys.overview.evaluation.title") }}
            </UiCardTitle>
          </UiCardHeader>
          <UiCardContent class="grid @lg/layout:grid-cols-2 divide-y @lg/layout:divide-y-0 @lg/layout:divide-x">
            <JourneyStatCard
              label="Expérience"
              :max="10"
              :value="journey.stats.evaluation.experience"
            />
            <JourneyStatCard
              label="Facilitateurs"
              :max="5"
              :value="journey.stats.evaluation.facilitators"
            />
          </UiCardContent>
        </UiCard>
        <UiCard class="gap-3">
          <UiCardHeader>
            <UiCardTitle>
              {{ $t("deployment.journeys.overview.next-events.title") }}
            </UiCardTitle>
          </UiCardHeader>
          <UiCardContent v-if="journey.nextEvents.totalEntities === -1 || journey.nextEvents.totalEntities > 0 || loading.nextEvents">
            <div
              v-if="loading.nextEvents && journey.nextEvents.totalEntities === -1"
              class="h-16 grid place-items-center"
            >
              <UiSpinner />
            </div>
            <template v-else>
              <NextEventCard
                v-for="event in journey.nextEvents.list"
                :key="event.id"
                :event
              />
            </template>
          </UiCardContent>
        </UiCard>
        <UiCard class="gap-3">
          <UiCardHeader class="flex-row! items-center justify-between">
            <UiCardTitle>
              {{ $t("deployment.journeys.overview.team-progress.title") }}
            </UiCardTitle>

            <UiSelect
              :model-value="scope"
              @update:model-value="val => scope = val as JourneyScoreScope"
            >
              <UiSelectTrigger>
                <UiSelectValue />
              </UiSelectTrigger>
              <UiSelectContent align="end">
                <UiSelectItem value="access">
                  {{ $t("deployment.journeys.overview.team-progress.options.access-rate") }}
                </UiSelectItem>
                <UiSelectItem value="scores-participants">
                  {{ $t("deployment.journeys.overview.team-progress.options.average-scores-participants") }}
                </UiSelectItem>
                <UiSelectItem value="scores-teams">
                  {{ $t("deployment.journeys.overview.team-progress.options.average-scores-team") }}
                </UiSelectItem>
              </UiSelectContent>
            </UiSelect>
          </UiCardHeader>
          <UiCardContent>
            <div
              v-if="loading.scores"
              class="h-16 grid place-items-center"
            >
              <UiSpinner />
            </div>
            <template v-else>
              <div
                v-if="scope === 'access'"
                class="grid gap-4"
              >
                <JourneyTeamScore
                  v-for="score in journey.scores.access"
                  :key="`access-${score.label}`"
                  :score
                />
              </div>
              <div
                v-else-if="scope === 'scores-participants'"
                class="grid gap-4"
              >
                <template v-if="journey.scores.average.participants.length">
                  <JourneyTeamScore
                    v-for="score in journey.scores.average.participants"
                    :key="`participants-${score.label}`"
                    :score
                  />
                </template>
                <p
                  v-else
                  class="text-sm text-muted-foreground"
                >
                  {{ $t("deployment.journeys.overview.team-progress.empty") }}
                </p>
              </div>
              <div
                v-else-if="scope === 'scores-teams'"
                class="grid gap-4"
              >
                <template v-if="journey.scores.average.teams.length">
                  <JourneyTeamScore
                    v-for="score in journey.scores.average.teams"
                    :key="`teams-${score.label}`"
                    :score
                  />
                </template>
                <p
                  v-else
                  class="text-sm text-muted-foreground"
                >
                  {{ $t("deployment.journeys.overview.team-progress.empty") }}
                </p>
              </div>
            </template>
          </UiCardContent>
        </UiCard>
      </div>
      <div class="grid gap-4">
        <UiCard class="gap-3">
          <UiCardHeader>
            <UiCardTitle>
              {{ $t("deployment.journeys.overview.facilitators.title") }}
            </UiCardTitle>
          </UiCardHeader>
          <UiCardContent class="grid gap-2">
            <template v-if="journey.facilitators.length">
              <div
                v-for="facilitator in journey.facilitators"
                :key="`facilitator-${facilitator.id}`"
                class="flex items-center gap-2"
              >
                <UiAvatar>
                  <UiAvatarImage
                    v-if="facilitator.avatar"
                    :src="facilitator.avatar"
                  />
                  <UiAvatarFallback>{{ facilitator.firstName[0] }}{{ facilitator.lastName[0] }}</UiAvatarFallback>
                </UiAvatar>
                <p class="font-medium">
                  {{ facilitator.firstName }} {{ facilitator.lastName }}
                </p>
              </div>
            </template>
            <p
              v-else
              class="text-sm text-muted-foreground"
            >
              {{ $t("deployment.journeys.overview.facilitators.empty") }}
            </p>
          </UiCardContent>
        </UiCard>
        <UiCard class="gap-3">
          <UiCardHeader>
            <UiCardTitle>{{ $t("deployment.journeys.overview.simulations.title") }}</UiCardTitle>
          </UiCardHeader>
          <UiCardContent class="overflow-x-auto flex items-start gap-4">
            <div
              v-if="loading.simulations && journey.simulations.totalEntities === -1"
              class="w-full h-16 grid place-items-center"
            >
              <UiSpinner />
            </div>
            <template v-else-if="journey.simulations.list.length">
              <JourneySimulationCard
                v-for="simulation in journey.simulations.list"
                :key="`simulation-${simulation.id}`"
                :simulation
              />
            </template>
            <p
              v-else
              class="text-sm text-muted-foreground"
            >
              {{ $t("deployment.journeys.overview.simulations.empty") }}
            </p>
          </UiCardContent>
        </UiCard>
      </div>
    </template>
  </PageRoot>
</template>
