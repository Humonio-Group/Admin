<script setup lang="ts">
import type { TeamMoveMemberDialogProps } from "~/components/deployment/journeys/teams/index";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import z from "zod";

const props = defineProps<TeamMoveMemberDialogProps>();

const open = defineModel<boolean>("open", { default: false });
watch(open, (val) => {
  if (!val) return;
  form.resetForm({
    values: {
      teamId: props.teams[0]?.id ?? -1,
    },
  });
});

const store = useJourneyStore();
const { loading: _loading } = storeToRefs(store);
const loading = computed(() => _loading.value.team.moving);

const form = useForm({
  validationSchema: toTypedSchema(z.object({
    teamId: z.number(),
  })),
  initialValues: {
    teamId: props.teams[0]?.id ?? -1,
  },
});
const submit = form.handleSubmit(async ({ teamId }) => {
  const team = props.teams.find(t => t.id === teamId);
  if (!team) return;

  open.value = !(await store.moveParticipants(props.team, team, ...props.members));
});
</script>

<template>
  <UiDialog v-model:open="open">
    <UiDialogContent>
      <form
        class="flex flex-col gap-4"
        @submit="submit"
      >
        <UiDialogHeader>
          <UiDialogTitle>
            {{ $t("dialogs.move-participants.title", members.length, { named: { name: `${members[0]!.firstName} ${members[0]!.lastName}`, count: members.length } }) }}
          </UiDialogTitle>
        </UiDialogHeader>

        <UiFormField
          v-slot="{ componentField }"
          name="teamId"
        >
          <UiFormItem>
            <UiFormLabel>
              {{ $t("dialogs.move-participants.field") }}
            </UiFormLabel>
            <UiSelect
              v-bind="componentField"
              :disabled="loading"
            >
              <UiFormControl>
                <UiSelectTrigger class="w-full">
                  <UiSelectValue />
                </UiSelectTrigger>
              </UiFormControl>
              <UiSelectContent>
                <UiSelectItem
                  v-for="team in teams"
                  :key="team.id"
                  :value="team.id"
                >
                  {{ team.name }}
                </UiSelectItem>
              </UiSelectContent>
            </UiSelect>
          </UiFormItem>
        </UiFormField>

        <UiDialogFooter>
          <UiDialogClose as-child>
            <UiButton
              type="button"
              variant="secondary"
            >
              {{ $t("btn.cancel") }}
            </UiButton>
          </UiDialogClose>

          <UiButton :disabled="loading">
            {{ $t("dialogs.move-participants.action") }}
            <UiSpinner v-if="loading" />
          </UiButton>
        </UiDialogFooter>
      </form>
    </UiDialogContent>
  </UiDialog>
</template>
