<script setup lang="ts">
import { ChevronDown, ChevronUp } from "@lucide/vue";
import type { Program } from "~/types/entities/program";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";
import type { AcceptableValue } from "reka-ui";
import TranslationForm from "~/components/primitives/TranslationForm.vue";

const { locale } = useI18n();

const props = defineProps<{ program?: Program; trigger?: boolean }>();

const store = useProgramStore();
const { languages, loading } = storeToRefs(store);

const open = defineModel<boolean>("open", { default: false });
watch(open, async (val) => {
  if (!val) return;
  if (!languages.value.length) await store.loadLanguages();
  resetForm();
});

const form = useForm({
  validationSchema: toTypedSchema(z.object({
    languages: z.array(z.string()).min(1),
    defaultLanguage: z.string(),
    translations: z.object({
      name: z.record(z.string(), z.string()),
      description: z.record(z.string(), z.string()),
    }),
    defaultFacilitator: z.number().optional(),
    // config
    minFacilitators: z.coerce.number().optional(), // min facilitators count
    minPartPerJourney: z.coerce.number().optional(), // cohorte min size
    minParticipants: z.coerce.number().optional(), // planned participants count
    numParticipants: z.coerce.number().optional(), // cohorte max size
    numTeams: z.coerce.number().optional(), // max teams size
  }).superRefine((data, ctx) => {
    const fields = ["name", "description"] as const;
    const hasTranslation = (field: Record<string, string>) => data.languages.every(lang => !!field[lang]?.trim());

    fields.forEach((field) => {
      if (!hasTranslation(data.translations[field])) ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["translations"],
        message: "Toutes les traductions n'ont pas été renseignées.",
      });
    });

    if (data.defaultLanguage && !data.languages.includes(data.defaultLanguage)) ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["defaultLanguage"],
    });
  })),
  keepValuesOnUnmount: true,
});
watch(() => form.values.languages,
  (newLanguages, oldLanguages) => {
    if (!oldLanguages) return;

    const removed = oldLanguages.filter(lang => !newLanguages?.includes(lang));

    for (const lang of removed) {
      // Nettoyer les données de traduction
      const fields = ["name", "description"] as const;
      for (const field of fields) {
        const current = { ...form.values.translations?.[field] };
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete current[lang];

        form.setFieldValue(`translations.${field}`, current);
        form.setFieldError(`translations.${field}.${lang}`, undefined);
      }
    }
  },
  { deep: true },
);

const submit = form.handleSubmit(async (values) => {
  open.value = !(props.program ? await store.saveProgram(props.program.id, values) : await store.createProgram(values));
});

const translationsError = computed(() => Object.keys(form.errors.value).some(key => key.startsWith("translations."))
  ? "Toutes les traductions n'ont pas été renseignées."
  : undefined);
const selectedLanguages = computed(() => languages.value.filter(lang => form.values.languages?.includes(lang.code)));
provide("languages", selectedLanguages);

function resetForm() {
  const defaultLanguageCode = languages.value.find(c => c.code === locale.value)?.code;

  form.resetForm({
    values: {
      languages: props.program?.languages.map(lang => lang.code) || (defaultLanguageCode ? [defaultLanguageCode] : []),
      defaultLanguage: defaultLanguageCode ?? undefined,
      translations: {
        name: props.program?.name ?? undefined,
        description: props.program?.description ?? undefined,
      },
      defaultFacilitator: props.program?.defaultFacilitator?.id ?? undefined,
      minFacilitators: props.program?.config.minFacilitators ?? undefined,
      minPartPerJourney: props.program?.config.minPartPerJourney ?? undefined,
      minParticipants: props.program?.config.minParticipants ?? undefined,
      numParticipants: props.program?.config.numParticipants ?? undefined,
      numTeams: props.program?.config.numTeams ?? undefined,
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

    <UiDialogContent class="max-w-3xl!">
      <form
        class="grid gap-6"
        @submit="submit"
      >
        <UiDialogHeader>
          <UiDialogTitle>{{ $t(`deployment.programs.dialog.title.${program ? "edit" : "new"}`) }}</UiDialogTitle>
        </UiDialogHeader>

        <div
          v-if="loading.languages"
          class="grid place-items-center h-24"
        >
          <UiSpinner />
        </div>
        <template v-else>
          <UiFormField
            v-slot="{ componentField }"
            name="languages"
          >
            <UiFormItem>
              <UiFormLabel>{{ $t("deployment.programs.dialog.fields.languages") }}</UiFormLabel>
              <UiSelect
                :model-value="componentField.modelValue"
                multiple
                :disabled="loading.languages"
                @update:model-value="(value: AcceptableValue) => {
                  form.setFieldValue('languages', value as string[]);
                  if (!(value as string[]).includes(form.values.defaultLanguage ?? ''))
                    form.setFieldValue('defaultLanguage', (value as string[])[0] ?? undefined);
                }"
              >
                <UiFormControl>
                  <div class="flex items-center gap-2">
                    <UiSelectTrigger class="w-full">
                      <UiSelectValue />
                    </UiSelectTrigger>
                    <UiSpinner v-if="loading.languages" />
                  </div>
                </UiFormControl>

                <UiSelectContent>
                  <UiSelectItem
                    v-for="language in languages"
                    :key="language.id"
                    :value="language.code"
                  >
                    {{ language.nativeName }}
                  </UiSelectItem>
                </UiSelectContent>
              </UiSelect>
            </UiFormItem>
          </UiFormField>

          <UiFormField
            v-if="(form.values.languages?.length ?? 0) > 1"
            v-slot="{ componentField }"
            name="defaultLanguage"
          >
            <UiFormItem>
              <UiFormLabel>{{ $t("deployment.programs.dialog.fields.default-language") }}</UiFormLabel>
              <UiSelect v-bind="componentField">
                <UiFormControl>
                  <UiSelectTrigger class="w-full">
                    <UiSelectValue />
                  </UiSelectTrigger>
                </UiFormControl>

                <UiSelectContent>
                  <UiSelectItem
                    v-for="lang in selectedLanguages"
                    :key="lang.id"
                    :value="lang.code"
                  >
                    {{ lang.nativeName }}
                  </UiSelectItem>
                </UiSelectContent>
              </UiSelect>
            </UiFormItem>
          </UiFormField>

          <UiSeparator />

          <TranslationForm :languages="selectedLanguages">
            <template #default="{ language }">
              <UiFormField
                v-slot="{ componentField }"
                :name="`translations.name.${language}`"
              >
                <UiFormItem>
                  <UiFormLabel>{{ $t("deployment.programs.dialog.fields.name") }}</UiFormLabel>
                  <UiFormControl>
                    <UiInput v-bind="componentField" />
                  </UiFormControl>
                </UiFormItem>
              </UiFormField>

              <UiFormField
                v-slot="{ componentField }"
                :name="`translations.description.${language}`"
              >
                <UiFormItem>
                  <UiFormLabel>{{ $t("deployment.programs.dialog.fields.description") }}</UiFormLabel>
                  <UiFormControl>
                    <UiEditor v-bind="componentField" />
                  </UiFormControl>
                </UiFormItem>
              </UiFormField>

              <p
                v-if="translationsError"
                class="text-sm font-medium text-destructive"
              >
                {{ $t("deployment.programs.dialog.all-translations-required") }}
              </p>
            </template>
          </TranslationForm>

          <UiCollapsible v-slot="{ open: collapsibleOpen }">
            <UiCollapsibleTrigger as-child>
              <div
                class="w-full flex items-center gap-2 text-sm [&_svg]:size-4 text-muted-foreground font-bold cursor-pointer"
                :class="{ 'pb-6 border-b': collapsibleOpen }"
              >
                <ChevronUp v-if="collapsibleOpen" />
                <ChevronDown v-else />

                <p>
                  {{ $t("deployment.programs.dialog.fields.more-options") }}
                </p>
              </div>
            </UiCollapsibleTrigger>

            <UiCollapsibleContent class="pt-6 grid gap-6">
              <UiFormField
                v-slot="{ componentField }"
                name="minParticipants"
              >
                <UiFormItem>
                  <UiFormLabel>{{ $t("deployment.programs.dialog.fields.min-participants") }}</UiFormLabel>
                  <UiNumberField
                    v-bind="componentField"
                    :min="0"
                  >
                    <UiNumberFieldContent>
                      <UiFormControl>
                        <UiNumberFieldInput
                          class="text-start px-3"
                          placeholder="10"
                        />
                      </UiFormControl>
                    </UiNumberFieldContent>
                  </UiNumberField>
                </UiFormItem>
              </UiFormField>

              <UiCard class="relative bg-transprent">
                <p class="absolute top-0 left-4 -translate-y-1/2 whitespace-nowrap bg-background text-xs text-muted-foreground font-medium py-1.5 px-2">
                  {{ $t("deployment.programs.dialog.fields.cohorte.label") }}
                </p>

                <UiCardContent class="grid @lg/dialog:grid-cols-2 gap-6">
                  <UiFormField
                    v-slot="{ componentField }"
                    name="minPartPerJourney"
                  >
                    <UiFormItem>
                      <UiFormLabel>{{ $t("deployment.programs.dialog.fields.cohorte.minimum") }}</UiFormLabel>
                      <UiNumberField
                        v-bind="componentField"
                        :min="0"
                        :max="form.values.numParticipants ?? 1"
                      >
                        <UiNumberFieldContent>
                          <UiFormControl>
                            <UiNumberFieldInput
                              class="text-start px-3"
                              placeholder="1"
                            />
                          </UiFormControl>
                        </UiNumberFieldContent>
                      </UiNumberField>
                    </UiFormItem>
                  </UiFormField>

                  <UiFormField
                    v-slot="{ componentField }"
                    name="numParticipants"
                  >
                    <UiFormItem>
                      <UiFormLabel>{{ $t("deployment.programs.dialog.fields.cohorte.maximum") }}</UiFormLabel>
                      <UiNumberField
                        v-bind="componentField"
                        :min="form.values.minPartPerJourney ?? 1"
                      >
                        <UiNumberFieldContent>
                          <UiFormControl>
                            <UiNumberFieldInput
                              class="text-start px-3"
                              placeholder="10"
                            />
                          </UiFormControl>
                        </UiNumberFieldContent>
                      </UiNumberField>
                    </UiFormItem>
                  </UiFormField>
                </UiCardContent>
              </UiCard>

              <UiFormField
                v-slot="{ componentField }"
                name="minFacilitators"
              >
                <UiFormItem>
                  <UiFormLabel>{{ $t("deployment.programs.dialog.fields.min-facilitators") }}</UiFormLabel>
                  <UiNumberField
                    v-bind="componentField"
                    :min="0"
                  >
                    <UiNumberFieldContent>
                      <UiFormControl>
                        <UiNumberFieldInput
                          class="text-start px-3"
                          placeholder="1"
                        />
                      </UiFormControl>
                    </UiNumberFieldContent>
                  </UiNumberField>
                </UiFormItem>
              </UiFormField>

              <UiFormField
                v-slot="{ componentField }"
                name="numTeams"
              >
                <UiFormItem>
                  <UiFormLabel>{{ $t("deployment.programs.dialog.fields.num-teams") }}</UiFormLabel>
                  <UiNumberField
                    v-bind="componentField"
                    :min="0"
                  >
                    <UiNumberFieldContent>
                      <UiFormControl>
                        <UiNumberFieldInput
                          class="text-start px-3"
                          placeholder="4"
                        />
                      </UiFormControl>
                    </UiNumberFieldContent>
                  </UiNumberField>
                </UiFormItem>
              </UiFormField>
            </UiCollapsibleContent>
          </UiCollapsible>
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
            :disabled="loading.create || loading.save"
          >
            {{ $t("btn.save") }}
            <UiSpinner v-if="loading.create || loading.save" />
          </UiButton>
        </UiDialogFooter>
      </form>
    </UiDialogContent>
  </UiDialog>
</template>
