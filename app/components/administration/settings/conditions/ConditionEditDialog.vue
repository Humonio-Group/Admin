<script setup lang="ts">
import type { ConditionEditDialogProps } from "./";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import z from "zod";

const props = defineProps<ConditionEditDialogProps>();

const store = useCompanyStore();
const { loading: _loading } = storeToRefs(store);

const open = defineModel<boolean>("open", { default: false });
const editMode = computed(() => !!props.term);
const loading = computed(() => _loading.value.creating.terms || _loading.value.saving.terms);

const form = useForm({
  validationSchema: toTypedSchema(z.object({
    name: z.string(),
    description: z.string(),
  })),
  initialValues: {
    name: props.term?.name ?? undefined,
    description: props.term?.description ?? undefined,
  },
});
const submit = form.handleSubmit(async (values) => {
  const state = props.term && editMode.value ? await store.saveTerm(props.term!.id, values) : await store.createTerm(values);
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
        class="grid gap-6"
        @submit="submit"
      >
        <UiDialogHeader>
          <UiDialogTitle>{{ editMode ? 'Edition de la condition' : 'Nouvelle condition' }}</UiDialogTitle>
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
                placeholder="ex. Conditions Générales de Vente (CGV)"
              />
            </UiFormControl>
          </UiFormItem>
        </UiFormField>

        <UiFormField
          v-slot="{ componentField }"
          name="description"
        >
          <UiFormItem>
            <UiFormLabel>Description</UiFormLabel>
            <UiFormControl>
              <UiMarkdownEditor
                v-bind="componentField"
                use-markdown
                :show-menu-bar="false"
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

          <UiButton
            type="submit"
            :disabled="loading"
          >
            {{ $t("btn.save") }}
            <UiSpinner v-if="loading" />
          </UiButton>
        </UiDialogFooter>
      </form>
    </UiDialogContent>
  </UiDialog>
</template>
