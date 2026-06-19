<script setup lang="ts">
import PageRoot from "~/components/composing/PageRoot.vue";
import { Plus } from "lucide-vue-next";
import TeamDialog from "~/components/deployment/journeys/teams/TeamDialog.vue";

const store = useJourneyStore();
const { journey, teams, hasTeamsFirstLoaded, loading } = storeToRefs(store);
const { company } = storeToRefs(useCompanyStore());

store.loadTeams();
</script>

<template>
  <PageRoot
    name="journeys.details.people.teams.home"
    class="flex"
  >
    <aside class="flex flex-col w-64 border-r">
      <div
        v-if="loading.teams && !hasTeamsFirstLoaded"
        class="h-20 grid place-items-center"
      >
        <UiSpinner />
      </div>
      <template v-else-if="teams.length">
        <NuxtLinkLocale
          v-for="team in teams"
          :key="team?.id"
          :to="`/${company?.alias}/deployment/journeys/${journey?.id}/people/teams/${team.id}`"
          class="grid gap-0 border-b p-3 border-l-4 border-l-transparent bg-transparent hover:bg-accent/40 transition-colors duration-100"
          active-class=" border-l-primary!"
        >
          <p class="text-sm font-medium">
            {{ team?.name }}
          </p>
          <span class="text-xs text-muted-foreground">
            {{ $t("labels.participants", team.stats.participants, { named: { count: team.stats.participants } }) }}
          </span>
        </NuxtLinkLocale>

        <div class="p-2">
          <TeamDialog trigger>
            <UiButton
              variant="ghost"
              size="sm"
              class="w-full"
            >
              <Plus />
              {{ $t("btn.add.team") }}
            </UiButton>
          </TeamDialog>
        </div>
      </template>
    </aside>

    <main
      v-if="teams.length"
      class="flex-1"
    >
      <NuxtPage />
    </main>
  </PageRoot>
</template>
