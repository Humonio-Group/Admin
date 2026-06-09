<script setup lang="ts">
import { Edit2 } from "lucide-vue-next";
import type { JourneyTeamMemberGroupMenuProps } from "~/components/deployment/journeys/teams/index";
import type { Listed } from "~/types/primitives/objects";
import { GroupAction } from "~/types/entities/group";

const props = defineProps<JourneyTeamMemberGroupMenuProps>();

const store = useJourneyStore();
const { groups, loading: _loading } = storeToRefs(store);

const loading = computed(() => _loading.value.updatingTeamMembers.includes(props.member.id));
const ownedGroups = computed(() => {
  const memberGroups = props.member.groups.reduce((acc, curr) => {
    acc = [...acc, curr.id];
    return acc;
  }, [] as Listed<number>);
  return groups.value.filter(group => memberGroups.includes(group.id));
});

function owns(id: number) {
  return !!ownedGroups.value.find(group => group.id === id);
}
</script>

<template>
  <UiDropdownMenu>
    <UiDropdownMenuTrigger as-child>
      <UiButton
        variant="outline"
        size="icon-sm"
        class="border-dashed size-5.5 rounded-full"
        :disabled="loading"
      >
        <Edit2 class="size-3" />
      </UiButton>
    </UiDropdownMenuTrigger>
    <UiDropdownMenuContent>
      <UiDropdownMenuCheckboxItem
        v-for="group in groups"
        :key="group.id"
        :model-value="owns(group.id)"
        @click="store.updateGroup(props.team, props.member, group.id, owns(group.id) ? GroupAction.REMOVE : GroupAction.ADD)"
      >
        {{ group.name }}
      </UiDropdownMenuCheckboxItem>
    </UiDropdownMenuContent>
  </UiDropdownMenu>
</template>
