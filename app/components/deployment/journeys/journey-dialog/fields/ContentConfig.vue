<script setup lang="ts">
import type {
  JourneyConfigProgram,
  JourneyConfigProgramContent,
} from "~/types/entities/config/journey";
import { useFormContext } from "vee-validate";
import type { Listed } from "~/types/primitives/objects";
import type { CompanyUser } from "~/types/entities/company";
import type { Location } from "~/types/entities/location";

const { locale } = useI18n();

const props = defineProps<{ content: JourneyConfigProgramContent; program: JourneyConfigProgram }>();
defineEmits<{
  recalculate: [Date];
}>();

const { values } = useFormContext();
const formStage = computed(() => values.stages.find((stage: any) => stage.contents.find((content: any) => content.id === props.content.id)));
const formContent = computed(() => formStage.value.contents.find((content: any) => content.id === props.content.id));

const stageIndex = computed(() => values.stages.findIndex((stage: any) => stage.id === formStage.value.id));
const contentIndex = computed(() => formStage.value.contents.findIndex((content: any) => content.id === formContent.value.id));

const facilitators = inject<Ref<Listed<CompanyUser>>>("facilitators")!;
const locations = inject<Ref<Listed<Location>>>("locations")!;
</script>

<template>
  <UiCard class="bg-transparent">
    <UiCardHeader class="flex flex-row gap-2 items-center">
      <NuxtImg
        v-if="content.picture"
        :src="content.picture"
        class="aspect-square shrink-0 size-8 object-cover object-center bg-primary rounded-sm"
      />
      <UiCardTitle class="text-base">
        {{ content.name[locale] || content.name[program.defaultLanguage.code] }}
      </UiCardTitle>
    </UiCardHeader>
    <UiCardContent class="grid gap-3">
      <UiFormField
        v-if="formContent.date && content.condition"
        :name="`stages.[${stageIndex}].contents.[${contentIndex}].date`"
      >
        <UiFormItem class="space-0 flex items-center justify-between gap-6">
          <UiFormLabel>
            {{ $t("deployment.journeys.dialog.fields.stages.contents.unlock-date") }}
          </UiFormLabel>

          <UiFormControl>
            <UiDateTimePicker
              :name="`stages.[${stageIndex}].contents.[${contentIndex}].date`"
              with-time
              :with-recalculation="content.condition.days"
              :locale
              @recalculate="$emit('recalculate', $event.value)"
            />
          </UiFormControl>
        </UiFormItem>
      </UiFormField>

      <template v-if="content.workshop">
        <UiFormField :name="`stages.[${stageIndex}].contents.[${contentIndex}].startDate`">
          <UiFormField :name="`stages.[${stageIndex}].contents.[${contentIndex}].endDate`">
            <UiFormItem class="space-0 flex items-center justify-between gap-6">
              <UiFormLabel>
                {{ $t("deployment.journeys.dialog.fields.stages.contents.workshop-time-lapse") }}
              </UiFormLabel>
              <UiFormControl>
                <UiTimeLapsePicker
                  :start-name="`stages.[${stageIndex}].contents.[${contentIndex}].startDate`"
                  :end-name="`stages.[${stageIndex}].contents.[${contentIndex}].endDate`"
                  with-time
                  :with-recalculation="{ start: content.workshop.start.days, end: content.workshop.end.days }"
                  :locale
                  @recalculate="$emit('recalculate', $event.value)"
                />
              </UiFormControl>
            </UiFormItem>
          </UiFormField>
        </UiFormField>

        <UiFormField
          v-slot="{ componentField }"
          :name="`stages.[${stageIndex}].contents.[${contentIndex}].facilitators`"
        >
          <UiFormItem class="flex items-center space-0 justify-between gap-6">
            <UiFormLabel>{{ $t("deployment.journeys.dialog.fields.stages.contents.facilitators") }}</UiFormLabel>
            <div class="flex items-center gap-2">
              <UiSelect
                v-bind="componentField"
                :disabled="!facilitators.length"
                multiple
              >
                <UiFormControl>
                  <UiSelectTrigger class="max-w-sm">
                    <UiSelectValue :placeholder="$t('deployment.journeys.dialog.fields.stages.contents.facilitators')" />
                  </UiSelectTrigger>
                </UiFormControl>

                <UiSelectContent>
                  <UiSelectItem
                    v-for="facilitator in facilitators"
                    :key="facilitator.id"
                    :value="facilitator.id"
                  >
                    {{ facilitator.name.full }}
                  </UiSelectItem>
                </UiSelectContent>
              </UiSelect>
              <UiSpinner v-if="!facilitators.length" />
            </div>
          </UiFormItem>
        </UiFormField>

        <UiFormField
          v-if="content.workshop.defaultLocation"
          v-slot="{ componentField }"
          :name="`stages.[${stageIndex}].contents.[${contentIndex}].location`"
        >
          <UiFormItem class="flex items-center space-0 justify-between gap-6">
            <UiFormLabel>{{ $t("deployment.journeys.dialog.fields.stages.contents.location") }}</UiFormLabel>
            <div class="flex items-center gap-2">
              <UiSelect
                v-bind="componentField"
                :disabled="!locations.length"
                multiple
              >
                <UiFormControl>
                  <UiSelectTrigger class="max-w-sm">
                    <UiSelectValue :placeholder="$t('deployment.journeys.dialog.fields.stages.contents.location')" />
                  </UiSelectTrigger>
                </UiFormControl>

                <UiSelectContent>
                  <UiSelectItem
                    v-for="location in locations"
                    :key="location.id"
                    :value="location.id"
                  >
                    {{ location.name }}
                  </UiSelectItem>
                </UiSelectContent>
              </UiSelect>
              <UiSpinner v-if="!locations.length" />
            </div>
          </UiFormItem>
        </UiFormField>
      </template>
    </UiCardContent>
  </UiCard>
</template>
