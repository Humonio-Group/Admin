<script setup lang="ts">
import { ChevronDown, ChevronUp } from "@lucide/vue";
import type { JourneyConfigProgram, JourneyConfigProgramStage } from "~/types/entities/config/journey";
import { useFormContext } from "vee-validate";
import ContentConfig from "~/components/deployment/journeys/journey-dialog/fields/ContentConfig.vue";

const { locale } = useI18n();

const props = defineProps<{ stage: JourneyConfigProgramStage; program: JourneyConfigProgram }>();
defineEmits<{
  recalculate: [Date];
}>();

const { values } = useFormContext();
const formStage = computed(() => values.stages.find((stage: any) => stage.id === props.stage.id));

const stageIndex = computed(() => values.stages.findIndex((stage: any) => stage.id === formStage.value.id));
</script>

<template>
  <UiCollapsible
    v-if="formStage"
    v-slot="{ open }"
  >
    <UiCard class="bg-transparent p-0 gap-0">
      <UiCollapsibleTrigger as-child>
        <UiCardHeader
          class="flex flex-row items-center justify-between gap-6 p-6"
          :class="{ 'cursor-pointer': formStage.contents.length }"
        >
          <div class="flex flex-col gap-1 text-start">
            <UiCardTitle>{{ stage.name[locale] || stage.name[program.defaultLanguage.code] }}</UiCardTitle>
            <UiCardDescription>
              {{ stage.type[locale] || stage.type[program.defaultLanguage.code] }}
            </UiCardDescription>
          </div>

          <div class="flex items-center gap-2">
            <UiFormField
              v-if="formStage.date && stage.condition"
              :name="`stages.[${stageIndex}].date`"
            >
              <UiFormItem>
                <UiFormControl>
                  <UiDateTimePicker
                    :name="`stages.[${stageIndex}].date`"
                    with-time
                    :with-recalculation="stage.condition.days"
                    :locale
                    @recalculate="$emit('recalculate', $event.value)"
                  />
                </UiFormControl>
              </UiFormItem>
            </UiFormField>

            <component
              :is="open ? ChevronUp : ChevronDown"
              v-if="formStage.contents.length"
              class="size-4 shrink-0 text-muted-foreground"
            />
          </div>
        </UiCardHeader>
      </UiCollapsibleTrigger>

      <UiCollapsibleContent v-if="stage.contents.length">
        <UiCardContent class="pb-6 grid gap-3 auto-rows-min">
          <ContentConfig
            v-for="content in stage.contents"
            :key="content.id"
            :content
            :program
            @recalculate="$emit('recalculate', $event)"
          />
        </UiCardContent>
      </UiCollapsibleContent>
    </UiCard>
  </UiCollapsible>
</template>
