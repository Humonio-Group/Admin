<script setup lang="ts">
import PageRoot from "~/components/composing/PageRoot.vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";

const store = useCompanyStore();
const { companySettings, loading: _loading } = storeToRefs(store);
const loading = computed(() => _loading.value.settings.default);
const saving = computed(() => _loading.value.saving.default);

watch(companySettings, (val) => {
  if (!val) return;
  form.resetForm({
    values: {
      tld: val.tlds,
      mentorInvite: val.permissions.inviteManager,
      forceMentorInvite: val.permissions.forceInvite,
      shareResults: val.permissions.shareResults,
      shareResultsScope: val.permissions.resultsLevels,
      autoAssignAdminToTickets: val.permissions.autoAssignTickets,
      videoconferenceButton: val.permissions.videoConference,
    },
  });
});

const form = useForm({
  validationSchema: toTypedSchema(z.object({
    tld: z.array(z.string()).optional(),
    mentorInvite: z.boolean().default(false),
    forceMentorInvite: z.boolean().default(false),
    shareResults: z.boolean().default(false),
    shareResultsScope: z.number().default(1),
    autoAssignAdminToTickets: z.boolean().default(false),
    videoconferenceButton: z.boolean().default(false),
  })),
  initialValues: {
    tld: [],
    mentorInvite: false,
    forceMentorInvite: false,
    shareResults: false,
    shareResultsScope: 1,
    autoAssignAdminToTickets: false,
    videoconferenceButton: false,
  },
  keepValuesOnUnmount: true,
});
const submit = form.handleSubmit(async (values) => {
  console.log(values);
  await store.saveCompanySettings(values);
});

store.loadCompanySettings();
</script>

<template>
  <PageRoot
    name="administration.settings.home"
    class="pt-2 grid gap-6"
  >
    <header class="grid auto-rows-min gap-1.5">
      <h1 class="text-xl font-bold">
        {{ $t("settings.general.title") }}
      </h1>
    </header>

    <main
      v-if="loading"
      class="h-24 grid place-items-center"
    >
      <UiSpinner />
    </main>
    <form
      v-else-if="companySettings"
      class="flex flex-col gap-4"
      @submit="submit"
    >
      <main class="flex flex-col gap-4">
        <UiFormField
          v-slot="{ componentField }"
          name="tld"
        >
          <UiFormItem class="space-y-0 flex flex-col gap-2">
            <div class="grid gap-1.5">
              <UiFormLabel>
                {{ $t("settings.general.fields.tld.label") }}
              </UiFormLabel>
              <UiFormDescription>
                {{ $t("settings.general.fields.tld.description") }}
              </UiFormDescription>
            </div>

            <UiTagsInput
              :model-value="componentField.modelValue"
              :disabled="saving"
              @update:model-value="componentField['onUpdate:modelValue']"
            >
              <UiFormControl>
                <UiTagsInputInput :placeholder="$t('settings.general.fields.tld.placeholder')" />
              </UiFormControl>

              <UiTagsInputItem
                v-for="item in componentField.modelValue"
                :key="item"
                :value="item"
              >
                <UiTagsInputItemText />
                <UiTagsInputItemDelete />
              </UiTagsInputItem>
            </UiTagsInput>
          </UiFormItem>
        </UiFormField>
        <UiSeparator />
        <UiFormField
          v-slot="{ componentField }"
          name="mentorInvite"
        >
          <UiFormItem class="flex items-center justify-between space-y-0">
            <div class="grid gap-1.5">
              <UiFormLabel>
                {{ $t("settings.general.fields.mentor-invite.label") }}
              </UiFormLabel>
              <UiFormDescription>
                {{ $t("settings.general.fields.mentor-invite.description") }}
              </UiFormDescription>
            </div>

            <UiFormControl>
              <UiSwitch
                :disabled="saving"
                :model-value="componentField.modelValue"
                @update:model-value="componentField['onUpdate:modelValue']"
              />
            </UiFormControl>
          </UiFormItem>
        </UiFormField>
        <UiFormField
          v-slot="{ componentField }"
          name="forceMentorInvite"
        >
          <UiFormItem class="flex items-center justify-between space-y-0">
            <div
              class="grid gap-1.5"
              :class="{ 'opacity-50': !form.values.mentorInvite }"
            >
              <UiFormLabel>
                {{ $t("settings.general.fields.force-mentor-invite.label") }}
              </UiFormLabel>
              <UiFormDescription>
                {{ $t("settings.general.fields.force-mentor-invite.description") }}
              </UiFormDescription>
            </div>

            <UiFormControl>
              <UiSwitch
                :disabled="!form.values.mentorInvite || saving"
                :model-value="componentField.modelValue"
                @update:model-value="componentField['onUpdate:modelValue']"
              />
            </UiFormControl>
          </UiFormItem>
        </UiFormField>
        <UiSeparator />
        <UiFormField
          v-slot="{ componentField }"
          name="shareResults"
        >
          <UiFormItem class="space-y-0 flex items-center justify-between">
            <div class="grid gap-1.5">
              <UiFormLabel>
                {{ $t("settings.general.fields.share-results.label") }}
              </UiFormLabel>
              <UiFormDescription>
                {{ $t("settings.general.fields.share-results.description") }}
              </UiFormDescription>
            </div>

            <UiFormControl>
              <UiSwitch
                :disabled="saving"
                :model-value="componentField.modelValue"
                @update:model-value="componentField['onUpdate:modelValue']"
              />
            </UiFormControl>
          </UiFormItem>
        </UiFormField>
        <UiFormField
          v-slot="{ componentField }"
          name="shareResultsScope"
        >
          <UiFormItem class="space-y-0 flex items-center justify-between">
            <div
              class="grid gap-1.5"
              :class="{ 'opacity-50': !form.values.shareResults }"
            >
              <UiFormLabel>
                {{ $t("settings.general.fields.share-results-scope.label") }}
              </UiFormLabel>
              <UiFormDescription>
                {{ $t("settings.general.fields.share-results-scope.description") }}
              </UiFormDescription>
            </div>

            <UiSelect
              v-bind="componentField"
              :disabled="!form.values.shareResults || saving"
            >
              <UiFormControl>
                <UiSelectTrigger>
                  <UiSelectValue />
                </UiSelectTrigger>
              </UiFormControl>

              <UiSelectContent>
                <UiSelectItem :value="1">
                  {{ $t("settings.general.fields.share-results-scope.options.by-participant") }}
                </UiSelectItem>
                <UiSelectItem :value="2">
                  {{ $t("settings.general.fields.share-results-scope.options.by-workspace") }}
                </UiSelectItem>
              </UiSelectContent>
            </UiSelect>
          </UiFormItem>
        </UiFormField>
        <UiSeparator />
        <UiFormField
          v-slot="{ componentField }"
          name="autoAssignAdminToTickets"
        >
          <UiFormItem class="space-y-0 flex items-center justify-between">
            <div class="grid gap-1.5">
              <UiFormLabel>
                {{ $t("settings.general.fields.auto-assign-admin-to-tickets.label") }}
              </UiFormLabel>
              <UiFormDescription>
                {{ $t("settings.general.fields.auto-assign-admin-to-tickets.description") }}
              </UiFormDescription>
            </div>

            <UiFormControl>
              <UiSwitch
                :disabled="saving"
                :model-value="componentField.modelValue"
                @update:model-value="componentField['onUpdate:modelValue']"
              />
            </UiFormControl>
          </UiFormItem>
        </UiFormField>
        <UiFormField
          v-slot="{ componentField }"
          name="videoconferenceButton"
        >
          <UiFormItem class="space-y-0 flex items-center justify-between">
            <div class="grid gap-1.5">
              <UiFormLabel>
                {{ $t("settings.general.fields.videoconference-button.label") }}
              </UiFormLabel>
              <UiFormDescription>
                {{ $t("settings.general.fields.videoconference-button.description") }}
              </UiFormDescription>
            </div>

            <UiFormControl>
              <UiSwitch
                :disabled="saving"
                :model-value="componentField.modelValue"
                @update:model-value="componentField['onUpdate:modelValue']"
              />
            </UiFormControl>
          </UiFormItem>
        </UiFormField>
      </main>

      <footer class="self-end">
        <UiButton
          size="sm"
          :disabled="saving"
        >
          {{ $t("btn.save") }}
          <UiSpinner v-if="saving" />
        </UiButton>
      </footer>
    </form>
  </PageRoot>
</template>
