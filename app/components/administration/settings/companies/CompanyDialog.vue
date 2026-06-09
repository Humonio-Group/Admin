<script setup lang="ts">
import type { Company } from "~/types/entities/company";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";

const props = defineProps<{ company?: Company; trigger?: boolean }>();

const store = useCompanyStore();
const { loading } = storeToRefs(store);

const open = defineModel<boolean>("open", { default: false });
watch(open, (val) => {
  if (!val) return;
  resetForm();
});

const form = useForm({
  validationSchema: toTypedSchema(z.object({
    name: z.string(),
    contactFirstName: z.string(),
    contactLastName: z.string(),
    contactEmail: z.string(),
    sendNewPassword: z.boolean().default(true),
  })),
  initialValues: {
    name: props.company?.name ?? undefined,
    contactFirstName: props.company?.mainContact?.name.first ?? undefined,
    contactLastName: props.company?.mainContact?.name.last ?? undefined,
    contactEmail: props.company?.mainContact?.email ?? undefined,
    sendNewPassword: !props.company,
  },
  keepValuesOnUnmount: true,
});
const submit = form.handleSubmit(async (values) => {
  open.value = !(props.company ? await store.saveCompany(props.company.id, values) : await store.createCompany(values));
});

function resetForm() {
  form.resetForm({
    values: {
      name: props.company?.name ?? undefined,
      contactFirstName: props.company?.mainContact?.name.first ?? undefined,
      contactLastName: props.company?.mainContact?.name.last ?? undefined,
      contactEmail: props.company?.mainContact?.email ?? undefined,
      sendNewPassword: !props.company,
    },
  });
}
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
          <UiDialogTitle>{{ $t(`settings.companies.dialog.title.${company ? 'edit' : 'new'}`) }}</UiDialogTitle>
        </UiDialogHeader>

        <UiFormField
          v-slot="{ componentField }"
          name="name"
        >
          <UiFormItem>
            <UiFormLabel>{{ $t("settings.companies.dialog.fields.name") }}</UiFormLabel>
            <UiFormControl>
              <UiInput v-bind="componentField" />
            </UiFormControl>
          </UiFormItem>
        </UiFormField>

        <template v-if="!company">
          <div class="grid @md/dialog:grid-cols-2 gap-6">
            <UiFormField
              v-slot="{ componentField }"
              name="contactFirstName"
            >
              <UiFormItem>
                <UiFormLabel>{{ $t("settings.companies.dialog.fields.contact.first-name") }}</UiFormLabel>
                <UiFormControl>
                  <UiInput v-bind="componentField" />
                </UiFormControl>
              </UiFormItem>
            </UiFormField>

            <UiFormField
              v-slot="{ componentField }"
              name="contactLastName"
            >
              <UiFormItem>
                <UiFormLabel>{{ $t("settings.companies.dialog.fields.contact.last-name") }}</UiFormLabel>
                <UiFormControl>
                  <UiInput v-bind="componentField" />
                </UiFormControl>
              </UiFormItem>
            </UiFormField>
          </div>

          <UiFormField
            v-slot="{ componentField }"
            name="contactEmail"
          >
            <UiFormItem>
              <UiFormLabel>{{ $t("settings.companies.dialog.fields.contact.email") }}</UiFormLabel>
              <UiFormControl>
                <UiInput v-bind="componentField" />
              </UiFormControl>
            </UiFormItem>
          </UiFormField>

          <UiSeparator />

          <UiFormField
            v-slot="{ componentField }"
            name="sendNewPassword"
          >
            <UiFormItem class="flex items-center gap-2">
              <UiFormControl>
                <UiSwitch
                  :model-value="componentField.modelValue"
                  @update:model-value="componentField['onUpdate:modelValue']"
                />
              </UiFormControl>
              <UiFormLabel>{{ $t("settings.companies.dialog.fields.send-new-password") }}</UiFormLabel>
            </UiFormItem>
          </UiFormField>
        </template>

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
            :disabled="loading.creating.company || loading.saving.company"
          >
            {{ $t("btn.save") }}
            <UiSpinner v-if="loading.creating.company || loading.saving.company" />
          </UiButton>
        </UiDialogFooter>
      </form>
    </UiDialogContent>
  </UiDialog>
</template>

<style scoped>

</style>
