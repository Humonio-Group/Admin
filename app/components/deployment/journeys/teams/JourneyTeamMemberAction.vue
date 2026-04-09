<script setup lang="ts">
import { MoreVertical, UserStar, ArrowRightLeft, ToggleLeft, ToggleRight, Trash } from "lucide-vue-next";
import type { JourneyTeamMemberActionsProps } from "~/components/deployment/journeys/teams/index";
import TeamMoveMemberDialog from "~/components/deployment/journeys/teams/TeamMoveMemberDialog.vue";

const props = defineProps<JourneyTeamMemberActionsProps>();

const store = useJourneyStore();
const { teams, loading } = storeToRefs(store);

const availableTeams = computed(() => teams.value.filter(team => team.id !== props.team.id));

const moveMemberDialog = ref<boolean>(false);
</script>

<template>
  <div>
    <UiDropdownMenu>
      <UiDropdownMenuTrigger>
        <UiButton
          variant="ghost"
          size="icon-sm"
        >
          <MoreVertical />
        </UiButton>
      </UiDropdownMenuTrigger>
      <UiDropdownMenuContent align="end">
        <UiDropdownMenuGroup>
          <UiDropdownMenuItem :disabled="member.archived">
            <UserStar />
            {{ $t("deployment.journeys.teams.actions.set-as-team-leader") }}
          </UiDropdownMenuItem>
          <UiDropdownMenuItem
            :disabled="teams.length < 2"
            @click="moveMemberDialog = true"
          >
            <ArrowRightLeft />
            {{ $t("deployment.journeys.teams.actions.move") }}
          </UiDropdownMenuItem>
        </UiDropdownMenuGroup>

        <UiDropdownMenuSeparator />

        <UiDropdownMenuGroup>
          <UiDropdownMenuItem
            v-if="member.archived"
            :disabled="loading.team.restoring.includes(member.id)"
            @click="store.restoreParticipants(member)"
          >
            <ToggleRight />
            {{ $t("deployment.journeys.teams.actions.enable") }}
          </UiDropdownMenuItem>
          <UiDropdownMenuItem
            v-else
            :disabled="loading.team.archiving.includes(member.id)"
            @click="store.archiveParticipants(member)"
          >
            <ToggleLeft />
            {{ $t("deployment.journeys.teams.actions.disable") }}
          </UiDropdownMenuItem>

          <UiDropdownMenuItem variant="destructive">
            <Trash />
            {{ $t("deployment.journeys.teams.actions.delete") }}
          </UiDropdownMenuItem>
        </UiDropdownMenuGroup>
      </UiDropdownMenuContent>
    </UiDropdownMenu>

    <TeamMoveMemberDialog
      v-model:open="moveMemberDialog"
      :members="[member]"
      :team="team"
      :teams="availableTeams"
    />
  </div>
</template>
