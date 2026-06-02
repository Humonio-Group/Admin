<script setup lang="ts">
import type { JourneySimulationExportDialogProps } from "~/components/deployment/journeys/simulations/index";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";
import { toast } from "vue-sonner";
import type { Listed } from "~/types/primitives/objects";

const { t } = useI18n();

const props = defineProps<JourneySimulationExportDialogProps>();

const store = useJourneyStore();
const { loading } = storeToRefs(store);

const open = defineModel<boolean>("open", { default: false });
const loadingScores = ref<boolean>(false);
const scores = ref<Listed<{
  id: number;
  name: string;
  description: string;
  color: string;
  isFavorite: boolean;
  min: number;
  max: number;
  start: number;
}>>([]);

watch(open, (value) => {
  if (!value) return;
  loadScores();
  form.resetForm();
});

const form = useForm({
  validationSchema: toTypedSchema(z.object({
    format: z.enum(["scorm-1_2", "scorm-2004"]),
    mainScore: z.number().optional().default(0),
  })),
  initialValues: {
    format: "scorm-1_2",
    mainScore: 0,
  },
});
const submit = form.handleSubmit(async (values) => {
  open.value = !(await store.exportSimulation(props.simulation, values.format, values.mainScore));
});

async function loadScores() {
  loadingScores.value = true;

  try {
    const { included } = await useApi().get(`/contents/${props.simulation.id}`, { version: 2, endpointVersion: 1, vanilla: true }, {
      query: {
        include: "embedContent",
      },
    });

    const embedContent = included[0];
    if (!embedContent) return;

    scores.value = embedContent.attributes.specific.variables;
  }
  catch {
    toast.error(t("toasts.error.default", { code: 500 }));
  }
  finally {
    loadingScores.value = false;
  }
}
</script>

<template>
  <UiDialog v-model:open="open">
    <UiDialogContent>
      <form
        class="grid gap-4"
        @submit="submit"
      >
        <UiDialogHeader>
          <UiDialogTitle>
            {{ $t("dialogs.export-simulation.title") }}
          </UiDialogTitle>
        </UiDialogHeader>

        <UiFormField
          v-slot="{ componentField }"
          name="format"
        >
          <UiFormItem>
            <UiFormLabel>
              {{ $t("dialogs.export-simulation.fields.scorm-version.label") }}
            </UiFormLabel>
            <UiSelect
              v-bind="componentField"
              :disabled="loading.exportSimulation"
            >
              <UiFormControl>
                <UiSelectTrigger class="w-full">
                  <UiSelectValue />
                </UiSelectTrigger>
              </UiFormControl>

              <UiSelectContent>
                <UiSelectItem value="scorm-1_2">
                  {{ $t("dialogs.export-simulation.fields.scorm-version.options.scorm-1_2") }}
                </UiSelectItem>
                <UiSelectItem value="scorm-2004">
                  {{ $t("dialogs.export-simulation.fields.scorm-version.options.scorm-2004") }}
                </UiSelectItem>
              </UiSelectContent>
            </UiSelect>
          </UiFormItem>
        </UiFormField>

        <UiFormField
          v-slot="{ componentField }"
          name="mainScore"
        >
          <UiFormItem>
            <UiFormLabel>
              {{ $t("dialogs.export-simulation.fields.main-score.label") }} <span class="font-normal text-muted-foreground">({{ $t("labels.optional").toLowerCase() }})</span>
            </UiFormLabel>
            <UiFormDescription>
              {{ $t("dialogs.export-simulation.fields.main-score.description") }}
            </UiFormDescription>

            <div class="w-full flex items-center gap-2">
              <UiSelect
                v-bind="componentField"
                :disabled="loadingScores || loading.exportSimulation"
              >
                <UiFormControl>
                  <UiSelectTrigger class="w-full">
                    <UiSelectValue />
                  </UiSelectTrigger>
                </UiFormControl>

                <UiSelectContent>
                  <UiSelectItem :value="0">
                    {{ $t("dialogs.export-simulation.fields.main-score.default-option") }}
                  </UiSelectItem>
                  <UiSelectItem
                    v-for="score in scores"
                    :key="score.id"
                    :value="score.id"
                  >
                    {{ score.name }}
                  </UiSelectItem>
                </UiSelectContent>
              </UiSelect>
              <UiSpinner v-if="loadingScores" />
            </div>
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
            :disabled="loadingScores || loading.exportSimulation"
          >
            {{ $t("btn.export.default") }}
            <UiSpinner v-if="loading.exportSimulation" />
          </UiButton>
        </UiDialogFooter>
      </form>
    </UiDialogContent>
  </UiDialog>
</template>
