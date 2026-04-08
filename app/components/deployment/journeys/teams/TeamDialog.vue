<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import type { TeamDialog } from "~/components/deployment/journeys/teams/index";
import { z } from "zod";

const props = withDefaults(defineProps<TeamDialog>(), {
  trigger: false,
});

const store = useJourneyStore();
const { loading: _loading } = storeToRefs(store);

const open = defineModel<boolean>("open", { default: false });
const editMode = computed(() => !!props.team);
const loading = computed(() => _loading.value.team.adding || _loading.value.team.updating === props.team?.id);

watch(open, (val) => {
  if (!val) return;

  if (props.team) form.resetForm({
    values: {
      name: props.team.name,
    },
  });
  else form.resetForm();
});

const form = useForm({
  validationSchema: toTypedSchema(z.object({
    name: z.string(),
  })),
});
const submit = form.handleSubmit(async ({ name }) => {
  const state = editMode.value ? await store.updateTeam(props.team!, name) : await store.addTeam(name);
  open.value = !state;
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

    <UiDialogContent>
      <form
        class="flex flex-col gap-4"
        @submit="submit"
      >
        <UiDialogHeader>
          <UiDialogTitle>{{ editMode ? "Modifier l'équipe" : "Nouvelle équipe" }}</UiDialogTitle>
        </UiDialogHeader>

        <UiFormField
          v-slot="{ componentField }"
          name="name"
        >
          <UiFormItem>
            <UiFormLabel>Nom</UiFormLabel>
            <UiFormControl>
              <UiInput
                v-bind="componentField"
                :disabled="loading"
              />
            </UiFormControl>
          </UiFormItem>
        </UiFormField>

        <UiDialogFooter>
          <UiDialogClose as-child>
            <UiButton
              variant="secondary"
              type="button"
            >
              {{ $t("btn.cancel") }}
            </UiButton>
          </UiDialogClose>

          <UiButton :disabled="loading">
            {{ $t(`btn.${editMode ? "save" : "add.default"}`) }}
            <UiSpinner v-if="loading" />
          </UiButton>
        </UiDialogFooter>
      </form>
    </UiDialogContent>
  </UiDialog>
</template>
