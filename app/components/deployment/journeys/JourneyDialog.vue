<script setup lang="ts">
import type { Journey } from "~/types/entities/journey";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";
import type { Program, SelectedProgram } from "~/types/entities/program";
import FlagIcon from "~/components/icons/FlagIcon.vue";
import StageConfig from "~/components/deployment/journeys/journey-dialog/fields/StageConfig.vue";
import { stageSchema, type Stage, type Content } from "~/types/entities/config/journey";

const { t, locale } = useI18n();

const props = defineProps<{ selectedProgram?: Program | SelectedProgram; journey?: Journey; trigger?: boolean }>();

const { loadingPrograms, loadingProgram, programs, program, hasEditableStages, list: loadPrograms, entity: loadProgram } = useProgramProvider();
const { loadingFacilitators, facilitators, list: loadFacilitators } = useFacilitatorsProvider();
const { list: loadLocations } = useLocationsProvider();
const { loadingTimeZones, timeZones, localTimeZone, references, list: loadTimeZones } = useTimeZonesProvider();

watch(program, (val) => {
  if (!val) return;
  resetForm();
});

const store = useJourneyStore();
const { loading } = storeToRefs(store);

const open = defineModel<boolean>("open", { default: false });
const availableTabs = computed(() => [
  "info",
  ...(hasEditableStages.value ? ["stages"] : []),
  "settings",
]);
const tab = ref<"info" | "stages" | "settings">("info");

const form = useForm({
  validationSchema: toTypedSchema(z.object({
    program: z.coerce.number(),

    // info
    name: z.string().min(1),
    mainFacilitator: z.coerce.number().optional(),
    startDate: z.date({ message: t("deployment.journeys.dialog.fields.time-lapse.error") }),
    endDate: z.date({ message: t("deployment.journeys.dialog.fields.time-lapse.error") }),

    // stages
    stages: z.array(stageSchema),

    // settings
    confirmed: z.boolean().default(false),
    test: z.boolean().default(false),
    hide: z.boolean().default(false),
    language: z.coerce.number(),
    timezone: z.coerce.number(),
    timezoneReference: z.coerce.number(),
  })),
  keepValuesOnUnmount: true,
});
const submit = form.handleSubmit(async (values) => {
  open.value = !(props.journey ? await store.save(props.journey.id, values) : await store.create(values));
});

const selectedLanguage = computed(() => {
  if (!program.value) return "";
  const language = program.value.languages.find(lang => lang.id === form.values.language)!;
  return language.code === "en" ? "gb" : language.code;
});

watch(open, async (val) => {
  if (!val) {
    program.value = null;
    form.resetField("program", { value: undefined });
    return;
  }
  if (!props.selectedProgram && !programs.value.length) await loadPrograms();
  if (props.selectedProgram) await loadProgram(props.selectedProgram.id);
  await Promise.all([
    await loadTimeZones(),
    await loadFacilitators(),
    await loadLocations(),
  ]);
});
watch(() => form.values.program, async (val) => {
  if (!val) return;
  await loadProgram(val);
}, { immediate: true });

function resetForm() {
  if (!program.value) {
    open.value = false;
    return;
  }

  const now = new Date();
  const programStart = new Date(now.getTime());
  const programEnd = new Date(now.getTime());
  programEnd.setDate(programEnd.getDate() + program.value.duration);

  form.resetForm({
    values: {
      program: program.value?.id ?? undefined,

      name: props.journey?.name ?? undefined,
      mainFacilitator: undefined,
      startDate: new Date(props.journey?.dates.start ?? programStart),
      endDate: new Date(props.journey?.dates.end ?? programEnd),

      stages: program.value.stages.reduce<Stage[]>((acc, stage) => {
        const now = new Date();

        function bindDate(days: number, hours: number, minutes: number): Date {
          const date = new Date(now.getTime());
          date.setDate(date.getDate() + days);
          date.setHours(hours, minutes, 0, 0);

          return date;
        }

        const stageObject = {
          id: stage.id,
          date: stage.condition ? bindDate(stage.condition.days, stage.condition.hours, stage.condition.minutes) : undefined,
          contents: stage.contents.reduce<Content[]>((acc, content) => {
            const contentObject = {
              id: content.id,
              date: content.condition ? bindDate(content.condition.days, content.condition.hours, content.condition.minutes) : undefined,
              startDate: content.workshop?.start ? bindDate(content.workshop.start.days, content.workshop.start.hours, content.workshop.start.minutes) : undefined,
              endDate: content.workshop?.end ? bindDate(content.workshop.end.days, content.workshop.end.hours, content.workshop.end.minutes) : undefined,
              location: content.workshop?.defaultLocation ? content.workshop?.defaultLocation : undefined,
              facilitators: content.workshop ? (content.workshop?.defaultFacilitators ?? []) : undefined,
            };

            acc = [...acc, contentObject];
            return acc;
          }, []),
        };

        acc = [...acc, stageObject];
        return acc;
      }, []),

      confirmed: props.journey?.status === 1,
      test: false,
      hide: false,
      language: program.value?.defaultLanguage.id ?? undefined,
      timezone: localTimeZone.value?.id ?? undefined,
      timezoneReference: references[0].id,
    },
  });
}
function rebaseTimings(reference: Date) {
  if (!program.value) return;

  const startDate = new Date(reference); // start date

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + program.value.duration);

  form.setFieldValue("startDate", startDate);
  form.setFieldValue("endDate", endDate);

  program.value.stages.forEach((stage) => {
    const formStage = form.values.stages?.find(s => s.id === stage.id);
    const stageIndex = form.values.stages?.findIndex(s => s.id === stage.id);

    if (!formStage || stageIndex === undefined || stageIndex < 0) return;

    const stageKey = `stages[${stageIndex}]` as const;

    if (stage.condition) {
      const stageDate = new Date(startDate);
      stageDate.setDate(stageDate.getDate() + stage.condition.days);
      stageDate.setHours(stage.condition.hours, stage.condition.minutes, 0, 0);

      form.setFieldValue(`${stageKey}.date`, stageDate);
    }

    if (stage.contents.length && formStage.contents?.length) {
      stage.contents.forEach((content) => {
        const formContent = formStage.contents.find(c => c.id === content.id);
        const contentIndex = formStage.contents.findIndex(c => c.id === content.id);

        if (!formContent || contentIndex < 0) return;

        const contentKey = `${stageKey}.contents[${contentIndex}]` as const;

        if (content.condition) {
          const contentDate = new Date(startDate);
          contentDate.setDate(contentDate.getDate() + content.condition.days);
          contentDate.setHours(content.condition.hours, content.condition.minutes, 0, 0);

          form.setFieldValue(`${contentKey}.date`, contentDate);
        }
        if (content.workshop) {
          const contentStartDate = new Date(startDate);
          contentStartDate.setDate(contentStartDate.getDate() + content.workshop.start.days);
          contentStartDate.setHours(content.workshop.start.hours, content.workshop.start.minutes, 0, 0);

          const contentEndDate = new Date(startDate);
          contentEndDate.setDate(contentEndDate.getDate() + content.workshop.end.days);
          contentEndDate.setHours(content.workshop.end.hours, content.workshop.end.minutes, 0, 0);

          form.setFieldValue(`${contentKey}.startDate`, contentStartDate);
          form.setFieldValue(`${contentKey}.endDate`, contentEndDate);
        }
      });
    }
  });
}
function navigateToNextTab() {
  const currentIndex = availableTabs.value.indexOf(tab.value);
  if (currentIndex === availableTabs.value.length - 1) return;

  tab.value = availableTabs.value[currentIndex + 1];
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
        class="grid gap-6 auto-rows-min"
        @submit="submit"
      >
        <UiDialogHeader>
          <UiDialogTitle>
            {{ $t(`deployment.journeys.dialog.title.${journey ? "edit" : "new"}`) }}
          </UiDialogTitle>
        </UiDialogHeader>

        <UiFormField
          v-if="!selectedProgram"
          v-slot="{ componentField }"
          name="program"
        >
          <UiFormItem>
            <UiFormLabel>{{ $t("deployment.journeys.dialog.fields.program") }}</UiFormLabel>
            <div class="flex items-center gap-2">
              <UiSelect
                v-bind="componentField"
                :disabled="loadingPrograms || loadingProgram"
              >
                <UiFormControl>
                  <UiSelectTrigger class="w-full">
                    <UiSelectValue />
                  </UiSelectTrigger>
                </UiFormControl>

                <UiSelectContent class="max-w-(--reka-select-trigger-width)">
                  <UiSelectItem
                    v-for="p in programs"
                    :key="p.id"
                    :value="p.id"
                  >
                    {{ p.name }}
                  </UiSelectItem>
                </UiSelectContent>
              </UiSelect>
              <UiSpinner v-if="loadingPrograms" />
            </div>
          </UiFormItem>
        </UiFormField>

        <div
          v-if="loadingProgram"
          class="h-16 grid place-items-center"
        >
          <UiSpinner />
        </div>
        <template v-else-if="program">
          <UiSeparator />

          <UiTabs v-model="tab">
            <UiTabsList>
              <UiTabsTrigger
                v-for="_tab in availableTabs"
                :key="_tab"
                :value="_tab"
              >
                {{ $t(`deployment.journeys.dialog.navigation.${_tab}`) }}
              </UiTabsTrigger>
            </UiTabsList>

            <UiTabsContent
              value="info"
              class="grid gap-6 auto-rows-min pt-4"
            >
              <UiFormField
                v-slot="{ componentField }"
                name="name"
              >
                <UiFormItem>
                  <UiFormLabel>{{ $t("deployment.journeys.dialog.fields.name") }}</UiFormLabel>
                  <UiFormControl>
                    <UiInput v-bind="componentField" />
                  </UiFormControl>
                </UiFormItem>
              </UiFormField>

              <UiFormField
                v-slot="{ componentField }"
                name="mainFacilitator"
              >
                <UiFormItem>
                  <UiFormLabel>{{ $t("deployment.journeys.dialog.fields.main-facilitator") }}</UiFormLabel>
                  <div class="flex items-center gap-2">
                    <UiSelect
                      v-bind="componentField"
                      :disabled="loadingFacilitators"
                    >
                      <UiFormControl>
                        <UiSelectTrigger class="w-full">
                          <UiSelectValue :placeholder="$t('deployment.journeys.dialog.fields.no-main-facilitator')" />
                        </UiSelectTrigger>
                      </UiFormControl>

                      <UiSelectContent>
                        <UiSelectItem :value="null">
                          {{ $t("deployment.journeys.dialog.fields.no-main-facilitator") }}
                        </UiSelectItem>
                        <UiSelectItem
                          v-for="facilitator in facilitators"
                          :key="facilitator.id"
                          :value="facilitator.id"
                        >
                          {{ facilitator.name.full }}
                        </UiSelectItem>
                      </UiSelectContent>
                    </UiSelect>
                    <UiSpinner
                      v-if="loadingFacilitators"
                      class="shrink-0"
                    />
                  </div>
                </UiFormItem>
              </UiFormField>

              <UiFormField name="startDate">
                <UiFormField name="endDate">
                  <UiFormItem>
                    <UiFormLabel>{{ $t("deployment.journeys.dialog.fields.time-lapse.label") }}</UiFormLabel>
                    <UiFormControl>
                      <UiTimeLapsePicker
                        start-name="startDate"
                        end-name="endDate"
                        with-time
                        :with-recalculation="{ start: 0, end: program.duration }"
                        :locale
                        @recalculate="rebaseTimings($event.value)"
                      />
                    </UiFormControl>
                    <UiFormMessage />
                  </UiFormItem>
                </UiFormField>
              </UiFormField>
            </UiTabsContent>
            <UiTabsContent
              v-if="availableTabs.includes('stages')"
              value="stages"
              class="grid gap-3 auto-rows-min pt-4"
            >
              <StageConfig
                v-for="stage in program.stages"
                :key="stage.id"
                :stage
                :program
                @recalculate="rebaseTimings"
              />
            </UiTabsContent>
            <UiTabsContent
              value="settings"
              class="grid gap-6 auto-rows-min pt-4"
            >
              <div class="flex flex-col *:py-3 divide-y">
                <UiFormField
                  v-slot="{ componentField }"
                  name="confirmed"
                >
                  <UiFormItem class="flex items-center justify-between gap-6">
                    <UiFormLabel class="flex-1 cursor-pointer grid gap-1">
                      <p>{{ $t("deployment.journeys.dialog.fields.confirmed.label") }}</p>
                      <UiFormDescription>
                        {{ $t("deployment.journeys.dialog.fields.confirmed.description") }}
                      </UiFormDescription>
                    </UiFormLabel>
                    <UiFormControl>
                      <UiSwitch
                        :model-value="componentField.modelValue"
                        @update:model-value="componentField['onUpdate:modelValue']"
                      />
                    </UiFormControl>
                  </UiFormItem>
                </UiFormField>

                <UiFormField
                  v-slot="{ componentField }"
                  name="test"
                >
                  <UiFormItem class="flex items-center justify-between gap-6">
                    <UiFormLabel class="flex-1 cursor-pointer grid gap-1">
                      <p>{{ $t("deployment.journeys.dialog.fields.test.label") }}</p>
                      <UiFormDescription>
                        {{ $t("deployment.journeys.dialog.fields.test.description") }}
                      </UiFormDescription>
                    </UiFormLabel>
                    <UiFormControl>
                      <UiSwitch
                        :model-value="componentField.modelValue"
                        @update:model-value="componentField['onUpdate:modelValue']"
                      />
                    </UiFormControl>
                  </UiFormItem>
                </UiFormField>

                <UiFormField
                  v-slot="{ componentField }"
                  name="hide"
                >
                  <UiFormItem class="flex items-center justify-between gap-6">
                    <UiFormLabel class="flex-1 cursor-pointer grid gap-1">
                      <p>{{ $t("deployment.journeys.dialog.fields.hide.label") }}</p>
                      <UiFormDescription>
                        {{ $t("deployment.journeys.dialog.fields.hide.description") }}
                      </UiFormDescription>
                    </UiFormLabel>
                    <UiFormControl>
                      <UiSwitch
                        :model-value="componentField.modelValue"
                        @update:model-value="componentField['onUpdate:modelValue']"
                      />
                    </UiFormControl>
                  </UiFormItem>
                </UiFormField>
              </div>

              <UiSeparator />

              <UiFormField
                v-slot="{ componentField }"
                name="language"
              >
                <UiFormItem>
                  <UiFormLabel>{{ $t("deployment.journeys.dialog.fields.language") }}</UiFormLabel>
                  <UiSelect v-bind="componentField">
                    <UiFormControl>
                      <UiSelectTrigger class="w-full text-start">
                        <FlagIcon
                          class="shrink-0"
                          :country-code="selectedLanguage"
                        />
                        <span class="flex-1">
                          <UiSelectValue />
                        </span>
                      </UiSelectTrigger>
                    </UiFormControl>

                    <UiSelectContent>
                      <UiSelectItem
                        v-for="language in program.languages"
                        :key="language.id"
                        :value="language.id"
                      >
                        {{ language.nativeName }}
                      </UiSelectItem>
                    </UiSelectContent>
                  </UiSelect>
                </UiFormItem>
              </UiFormField>

              <UiFormField
                v-slot="{ componentField }"
                name="timezone"
              >
                <UiFormItem>
                  <UiFormLabel>{{ $t("deployment.journeys.dialog.fields.timezone") }}</UiFormLabel>
                  <div class="flex items-center gap-2">
                    <UiSelect
                      v-bind="componentField"
                      :disabled="loadingTimeZones"
                    >
                      <UiFormControl>
                        <UiSelectTrigger class="w-full">
                          <UiSelectValue />
                        </UiSelectTrigger>
                      </UiFormControl>

                      <UiSelectContent>
                        <UiSelectItem
                          v-for="tz in timeZones"
                          :key="tz.id"
                          :value="tz.id"
                        >
                          {{ tz.name }}
                        </UiSelectItem>
                      </UiSelectContent>
                    </UiSelect>
                    <UiSpinner v-if="loadingTimeZones" />
                  </div>
                </UiFormItem>
              </UiFormField>

              <UiFormField
                v-slot="{ componentField }"
                name="timezoneReference"
              >
                <UiFormItem>
                  <UiFormLabel>{{ $t("deployment.journeys.dialog.fields.timezone-reference.label") }}</UiFormLabel>
                  <UiSelect v-bind="componentField">
                    <UiFormControl>
                      <UiSelectTrigger class="w-full">
                        <UiSelectValue />
                      </UiSelectTrigger>
                    </UiFormControl>

                    <UiSelectContent>
                      <UiSelectItem
                        v-for="reference in references"
                        :key="reference.id"
                        :value="reference.id"
                      >
                        {{ reference.name }}
                      </UiSelectItem>
                    </UiSelectContent>
                  </UiSelect>
                </UiFormItem>
              </UiFormField>
            </UiTabsContent>
          </UiTabs>
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
            v-if="tab === 'settings'"
            type="submit"
            :disabled="loading.create || loading.save"
          >
            {{ $t("btn.save") }}
            <UiSpinner v-if="loading.create || loading.save" />
          </UiButton>
          <UiButton
            v-else
            type="button"
            @click="navigateToNextTab"
          >
            {{ $t("btn.navigate.next") }}
          </UiButton>
        </UiDialogFooter>
      </form>
    </UiDialogContent>
  </UiDialog>
</template>
