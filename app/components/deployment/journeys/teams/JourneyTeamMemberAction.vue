<script setup lang="ts">
import { MoreVertical, UserX, UserStar, ArrowRightLeft, ToggleLeft, ToggleRight, Trash } from "lucide-vue-next";
import type { JourneyTeamMemberActionsProps } from "~/components/deployment/journeys/teams/index";
import TeamMoveMemberDialog from "~/components/deployment/journeys/teams/TeamMoveMemberDialog.vue";
import ConfirmDialog from "~/components/primitives/ConfirmDialog.vue";

const props = defineProps<JourneyTeamMemberActionsProps>();

const store = useJourneyStore();
const { teams, loading } = storeToRefs(store);

const leader = computed(() => props.team.participants.find(p => p.reference === props.team.leader));
const availableTeams = computed(() => teams.value.filter(team => team.id !== props.team.id));

const moveMemberDialog = ref<boolean>(false);
const confirmDeleteDialog = ref<boolean>(false);
const confirmLeaderUpdate = ref<boolean>(false);

async function triggerLeaderUpdate() {
  if (props.team.leader && props.team.leader !== props.member.reference) confirmLeaderUpdate.value = true;
  else await store.setLeader(props.team, props.member);
}
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
          <UiDropdownMenuItem
            v-if="member.id === leader?.id"
            @click="store.removeLeader(team, member)"
          >
            <UserX />
            {{ $t("deployment.journeys.teams.actions.remove-team-leader") }}
          </UiDropdownMenuItem>
          <UiDropdownMenuItem
            v-else
            :disabled="member.archived"
            @click="triggerLeaderUpdate"
          >
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

          <UiDropdownMenuItem
            variant="destructive"
            @click="confirmDeleteDialog = true"
          >
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
    <ConfirmDialog
      v-model:open="confirmDeleteDialog"
      :title-key="$t('dialogs.delete-participants.title', 1, { named: { name: `${member.firstName} ${member.lastName}` } })"
      :description-key="$t('dialogs.delete-participants.description', 1, { named: { name: `${member.firstName} ${member.lastName}` } })"
      action-key="dialogs.delete-participants.action"
      @confirm="store.deleteParticipants(team, member)"
    />
    <ConfirmDialog
      v-model:open="confirmLeaderUpdate"
      :title-key="$t('dialogs.update-team-leader.title')"
      :description-key="$t('dialogs.update-team-leader.description', {
        teamName: team.name,
        name: `${leader?.firstName} ${leader?.lastName}`,
        newName: `${member.firstName} ${member.lastName}`,
      })"
      action-key="dialogs.update-team-leader.action"
      @confirm="store.setLeader(team, member)"
    />
  </div>
</template>
