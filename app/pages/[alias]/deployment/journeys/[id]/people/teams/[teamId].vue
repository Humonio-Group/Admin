<script setup lang="ts">
import PageRoot from "~/components/composing/PageRoot.vue";
import type { JourneyTeam } from "~/types/entities/journey";
import { Edit2, Plus, Trash } from "lucide-vue-next";
import { columns } from "~/components/deployment/journeys/teams";
import TeamDialog from "~/components/deployment/journeys/teams/TeamDialog.vue";
import ConfirmDialog from "~/components/primitives/ConfirmDialog.vue";
import TeamAddMemberDialog from "~/components/deployment/journeys/teams/TeamAddMemberDialog.vue";

const store = useJourneyStore();
const { teams, loading: _loading } = storeToRefs(store);

const teamId = Number(useRoute().params.teamId as string);
const team = computed<JourneyTeam | undefined>(() => teams.value.find(t => t.id === teamId));
const loading = computed<boolean>(() => _loading.value.teamMembers.includes(teamId));
const removing = computed<boolean>(() => _loading.value.team.removing === team.value?.id);

const addParticipant = ref<boolean>(false);
</script>

<template>
  <PageRoot :name="`journey.details.people.teams.${teamId}`">
    <main
      v-if="loading"
      class="h-24 grid place-items-center"
    >
      <UiSpinner />
    </main>
    <template v-else-if="team">
      <header class="flex items-center justify-between px-4 h-12 border-b">
        <div class="flex items-center gap-1.5">
          <p class="text-sm font-semibold">
            {{ team.name }}
          </p>

          <TeamDialog
            :team
            trigger
          >
            <UiButton
              variant="ghost"
              size="icon-sm"
              class="size-6.5"
            >
              <Edit2 class="size-3.5" />
            </UiButton>
          </TeamDialog>
        </div>

        <div class="flex items-center gap-1.5">
          <ConfirmDialog
            trigger
            :title-key="$t('dialogs.delete-team.title')"
            :description-key="$t('dialogs.delete-team.description', { name: team.name })"
            :action-key="$t('dialogs.delete-team.action')"
            @confirm="store.deleteTeam(team)"
          >
            <UiButton
              variant="ghost"
              size="icon-sm"
              class="text-destructive!"
              :disabled="teams.length < 2 || team.stats.participants > 0 || team.stats.coaches > 0 || removing"
            >
              <UiSpinner v-if="removing" />
              <Trash v-else />
            </UiButton>
          </ConfirmDialog>

          <UiDropdownMenu>
            <UiDropdownMenuTrigger as-child>
              <UiButton size="sm">
                <Plus />
                {{ $t("btn.add.default") }}
              </UiButton>
            </UiDropdownMenuTrigger>
            <UiDropdownMenuContent align="end">
              <UiDropdownMenuItem @click="addParticipant = true">
                {{ $t("btn.add.participant") }}
              </UiDropdownMenuItem>
              <UiDropdownMenuItem disabled>
                {{ $t("btn.import.participants") }}
              </UiDropdownMenuItem>
            </UiDropdownMenuContent>
          </UiDropdownMenu>

          <TeamAddMemberDialog
            v-model:open="addParticipant"
            :team
          />
        </div>
      </header>

      <main class="grid gap-8 p-4">
        <section>
          <UiDataTable
            :columns="columns(team)"
            :data="team.participants"
          />
        </section>
        <section v-if="false">
          coachs
        </section>
      </main>
    </template>
  </PageRoot>
</template>
