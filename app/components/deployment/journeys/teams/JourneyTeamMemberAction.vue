<script setup lang="ts">
import { MoreVertical, UserStar, ArrowRightLeft, ToggleLeft, Trash } from "lucide-vue-next";
import type { JourneyTeamMemberActionsProps } from "~/components/deployment/journeys/teams/index";
import TeamMoveMemberDialog from "~/components/deployment/journeys/teams/TeamMoveMemberDialog.vue";

const props = defineProps<JourneyTeamMemberActionsProps>();

const store = useJourneyStore();
const { teams } = storeToRefs(store);

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
          <UiDropdownMenuItem>
            <UserStar />
            Désigner comme chef d'équipe
          </UiDropdownMenuItem>
          <UiDropdownMenuItem
            :disabled="teams.length < 2"
            @click="moveMemberDialog = true"
          >
            <ArrowRightLeft />
            Déplacer
          </UiDropdownMenuItem>
        </UiDropdownMenuGroup>

        <UiDropdownMenuSeparator />

        <UiDropdownMenuGroup>
          <UiDropdownMenuItem>
            <ToggleLeft />
            Désactiver
          </UiDropdownMenuItem>
          <UiDropdownMenuItem variant="destructive">
            <Trash />
            Supprimer
          </UiDropdownMenuItem>
        </UiDropdownMenuGroup>
      </UiDropdownMenuContent>
    </UiDropdownMenu>

    <TeamMoveMemberDialog
      v-model:open="moveMemberDialog"
      :member="member"
      :team="team"
      :teams="availableTeams"
    />
  </div>
</template>
