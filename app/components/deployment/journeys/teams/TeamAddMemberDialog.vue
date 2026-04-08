<script setup lang="ts">
import type { TeamAddMemberDialogProps } from "~/components/deployment/journeys/teams/index";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";

const props = withDefaults(defineProps<TeamAddMemberDialogProps>(), {
  trigger: false,
});

const store = useJourneyStore();
const { loading } = storeToRefs(store);

const open = defineModel<boolean>("open", { default: false });

const form = useForm({
  validationSchema: toTypedSchema(z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
  })),
});
const submit = form.handleSubmit(async (values) => {
  open.value = !(await store.addParticipant(props.team, values.firstName, values.lastName, values.email));
});
</script>

<template>
  <UiDialog v-model:open="open">
    <UiDialogTrigger
      v-if="trigger"
      as-child
    >
      <slot />
    </UiDialogTrigger>
    <UiDialogContent class="@container/dialog">
      <form
        class="flex flex-col gap-4"
        @submit="submit"
      >
        <UiDialogHeader>
          <UiDialogTitle>Nouveau participant</UiDialogTitle>
        </UiDialogHeader>

        <div class="grid gap-4 @md/dialog:grid-cols-2">
          <UiFormField
            v-slot="{ componentField }"
            name="firstName"
          >
            <UiFormItem>
              <UiFormLabel>{{ $t("labels.fields.first-name") }}</UiFormLabel>
              <UiFormControl>
                <UiInput
                  v-bind="componentField"
                  placeholder="John"
                  :disabled="loading.team.addingParticipant"
                />
              </UiFormControl>
            </UiFormItem>
          </UiFormField>

          <UiFormField
            v-slot="{ componentField }"
            name="lastName"
          >
            <UiFormItem>
              <UiFormLabel>{{ $t("labels.fields.last-name") }}</UiFormLabel>
              <UiFormControl>
                <UiInput
                  v-bind="componentField"
                  placeholder="DOE"
                  :disabled="loading.team.addingParticipant"
                />
              </UiFormControl>
            </UiFormItem>
          </UiFormField>
        </div>

        <UiFormField
          v-slot="{ componentField }"
          name="email"
        >
          <UiFormItem>
            <UiFormLabel>{{ $t("labels.fields.email") }}</UiFormLabel>
            <UiFormControl>
              <UiInput
                v-bind="componentField"
                type="email"
                placeholder="john.doe@example.xyz"
                :disabled="loading.team.addingParticipant"
              />
            </UiFormControl>
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

          <UiButton :disabled="loading.team.addingParticipant">
            {{ $t("btn.add.default") }}
            <UiSpinner v-if="loading.team.addingParticipant" />
          </UiButton>
        </UiDialogFooter>
      </form>
    </UiDialogContent>
  </UiDialog>
</template>
