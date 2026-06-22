<script setup lang="ts">
import { ChevronDown, ChevronUp } from "@lucide/vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";
import type { SelectedJourney } from "~/types/entities/journey";
import type { Listed, Nullable } from "~/types/primitives/objects";
import { useClipboard } from "@vueuse/core";
import type { ColumnDef } from "@tanstack/vue-table";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";

const { locale, t } = useI18n();

const columns = [
  {
    accessorKey: "variable",
    header: () => "Variable",
    cell: ({ row }) => {
      const tooltipContent = h(TooltipContent, h("p", "Cliquer pour copier"));
      const tooltipTrigger = h(TooltipTrigger, { asChild: true }, h("p", { class: "font-semibold", onClick: copy(row.original.variable) }, row.original.variable));
      const tooltip = h(Tooltip, [tooltipContent, tooltipTrigger]);

      return h("div", { class: "inline-flex justify-start" }, tooltip);
    },
  },
  {
    accessorKey: "description",
    header: () => "Description",
    cell: ({ row }) => h("p", row.original.description),
  },
] as Listed<ColumnDef<{ variable: string; description: string }>>;

const props = defineProps<{ journey: SelectedJourney }>();

const store = useJourneyStore();
const { templates, loading } = storeToRefs(store);

const { load, teams, loading: teamLoading } = useTeamProvider(props.journey.id);
const allFacilitatorsSelected = computed(() => {
  const facilitators = props.journey.facilitators.reduce<number[]>((acc, curr) => {
    acc = [...acc, curr.id];
    return acc;
  }, []);

  return facilitators.every(f => form.values.targets!.includes(f));
});
const allParticipantsSelected = computed(() => {
  const participants = teams.value.map(team => team.participants).reduce<number[]>((acc, curr) => {
    acc = [...acc, ...curr.reduce<number[]>((acc2, curr2) => {
      acc2 = [...acc2, curr2.reference];
      return acc2;
    }, [])];
    return acc;
  }, []);

  return participants.every(participant => form.values.targets?.includes(participant));
});
const teamsSelected = computed(() => {
  const included: number[] = [];

  teams.value.forEach((team) => {
    const participants = team.participants.reduce<number[]>((acc, curr) => {
      acc = [...acc, curr.reference];
      return acc;
    }, []);
    if (participants.every(p => form.values.targets!.includes(p))) included.push(team.id);
  });

  return included;
});

const open = defineModel<boolean>("open", { default: false });
watch(open, (val) => {
  if (!val) return;
  form.resetForm({
    values: {
      subject: "",
      body: "",
      targets: [],
    },
  });
  selectedNotificationTemplate.value = null;

  store.loadNotificationsTemplates(props.journey);
  load();
});

const selectedNotificationTemplate = ref<Nullable<number>>(null);
const selectedTemplate = computed(() => {
  return templates.value.find(template => template.id === selectedNotificationTemplate.value);
});
const availableVariables = computed(() => {
  if (!selectedTemplate.value) return [];
  return Object.entries(selectedTemplate.value.variables).map(([k, v]) => ({
    variable: k,
    description: v,
  }));
});
watch(selectedTemplate, (val) => {
  if (val) form.resetForm({
    values: {
      subject: val.title[locale.value] || val.title[Object.keys(val.title)[0]!],
      body: val.description[locale.value] || val.description[Object.keys(val.description)[0]!],
      targets: [],
    },
  });
  else form.resetForm({
    values: {
      subject: "",
      body: "",
      targets: [],
    },
  });
});

const { copy } = useClipboard();

const form = useForm({
  validationSchema: toTypedSchema(z.object({
    subject: z.string().min(1),
    body: z.string().min(1),
    targets: z.array(z.coerce.number()).min(1, t("dialogs.send-journey-mails.errors.targets")),
  })),
  initialValues: {
    subject: "",
    body: "",
    targets: [],
  },
});
const submit = form.handleSubmit(async (values) => {
  const state = await store.sendEmails(props.journey, values, selectedNotificationTemplate.value ?? undefined);
  if (state) open.value = false;
});

function bindTargetToField(distinct: boolean, ...ids: number[]) {
  if (!form.values.targets) return;

  if (distinct) {
    const toRemove = ids.filter(id => form.values.targets!.includes(id));
    const toAdd = ids.filter(id => !form.values.targets!.includes(id));

    form.setFieldValue("targets", [...form.values.targets.filter(id => !toRemove.includes(id)), ...toAdd]);
  }
  else {
    if (ids.every(id => form.values.targets!.includes(id))) form.setFieldValue("targets", form.values.targets.filter(id => !ids.includes(id)));
    else form.setFieldValue("targets", [...form.values.targets.filter(id => !ids.includes(id)), ...ids]);
  }
}
</script>

<template>
  <UiDialog v-model:open="open">
    <UiDialogContent class="max-w-3xl!">
      <form
        class="grid gap-6"
        @submit="submit"
      >
        <UiDialogHeader>
          <UiDialogTitle>Envoyer des emails</UiDialogTitle>
        </UiDialogHeader>

        <UiFormField name="targets">
          <UiFormItem>
            <UiCard class="bg-transparent">
              <UiCardHeader>
                <UiCardTitle>
                  Destinataires
                </UiCardTitle>
              </UiCardHeader>

              <UiCardContent class="flex flex-col px-4 gap-4">
                <div
                  v-if="teamLoading"
                  class="h-16 grid place-items-center"
                >
                  <UiSpinner />
                </div>
                <template v-else>
                  <div
                    v-if="journey.facilitators.length"
                    class="flex flex-col"
                  >
                    <UiLabel class="p-3 font-medium cursor-pointer rounded-sm transition-colors duration-100 hover:bg-accent/60 flex items-center gap-3">
                      <UiCheckbox
                        :model-value="allFacilitatorsSelected"
                        @update:model-value="bindTargetToField(false, ...journey.facilitators.reduce<number[]>((acc, curr) => {
                          acc = [...acc, curr.id];
                          return acc;
                        }, []))"
                      />
                      <p>Facilitateurs</p>
                    </UiLabel>
                    <template v-if="!allFacilitatorsSelected">
                      <UiLabel
                        v-for="facilitator in journey.facilitators"
                        :key="`fac-${facilitator.id}`"
                        class="p-3 pl-8 cursor-pointer transition-colors duration-100 hover:bg-accent/60 rounded-sm flex items-center gap-3 font-medium"
                      >
                        <UiCheckbox
                          :model-value="form.values.targets!.includes(facilitator.id)"
                          @update:model-value="bindTargetToField(true, facilitator.id)"
                        />
                        <p>{{ facilitator.firstName }} {{ facilitator.lastName }}</p>
                      </UiLabel>
                    </template>
                  </div>

                  <div class="flex flex-col">
                    <UiLabel class="p-3 font-medium cursor-pointer rounded-sm transition-colors duration-100 hover:bg-accent/60 flex items-center gap-3">
                      <UiCheckbox
                        :model-value="allParticipantsSelected"
                        @update:model-value="bindTargetToField(false, ...teams.map(team => team.participants.reduce<number[]>((acc, curr) => {
                          acc = [...acc, curr.reference];
                          return acc;
                        }, [])).reduce<number[]>((acc, curr) => {
                          acc = [...acc, ...curr];
                          return acc;
                        }, []))"
                      />
                      <p>Participants</p>
                    </UiLabel>
                    <template v-if="!allParticipantsSelected">
                      <template
                        v-for="team in teams"
                        :key="team.id"
                      >
                        <UiLabel class="p-3 pl-8 font-medium cursor-pointer rounded-sm transition-colors duration-100 hover:bg-accent/60 flex items-center gap-3">
                          <UiCheckbox
                            :model-value="teamsSelected.includes(team.id)"
                            @update:model-value="bindTargetToField(false, ...team.participants.reduce<number[]>((acc, curr) => {
                              acc = [...acc, curr.reference];
                              return acc;
                            }, []))"
                          />
                          <p>{{ team.name }}</p>
                        </UiLabel>
                        <template v-if="!teamsSelected.includes(team.id)">
                          <UiLabel
                            v-for="participant in team.participants"
                            :key="participant.reference"
                            class="p-3 pl-13 font-medium cursor-pointer rounded-sm transition-colors duration-100 hover:bg-accent/60 flex items-center gap-3"
                          >
                            <UiCheckbox
                              :model-value="form.values.targets?.includes(participant.reference)"
                              @update:model-value="bindTargetToField(true, participant.reference)"
                            />
                            <p>{{ participant.firstName }} {{ participant.lastName }}</p>
                          </UiLabel>
                        </template>
                      </template>
                    </template>
                  </div>
                </template>
              </UiCardContent>
            </UiCard>

            <UiFormMessage />
          </UiFormItem>
        </UiFormField>

        <UiSeparator />

        <div class="grid gap-2 auto-rows-min">
          <UiLabel for="template">
            Modèle
          </UiLabel>
          <div class="flex items-center gap-2">
            <UiSelect
              v-model="selectedNotificationTemplate"
              :disabled="loading.templates"
            >
              <UiSelectTrigger
                id="template"
                class="w-full"
              >
                <UiSelectValue />
              </UiSelectTrigger>

              <UiSelectContent>
                <UiSelectItem :value="null">
                  Texte libre
                </UiSelectItem>
                <UiSelectItem
                  v-for="template in templates"
                  :key="template.id"
                  :value="template.id"
                >
                  {{ template.name }}
                </UiSelectItem>
              </UiSelectContent>
            </UiSelect>
            <UiSpinner v-if="loading.templates" />
          </div>
        </div>

        <UiFormField
          v-slot="{ componentField }"
          name="subject"
        >
          <UiFormItem>
            <UiFormLabel>Sujet</UiFormLabel>
            <UiFormControl>
              <UiInput v-bind="componentField" />
            </UiFormControl>
          </UiFormItem>
        </UiFormField>

        <UiFormField
          v-slot="{ componentField }"
          name="body"
        >
          <UiFormItem>
            <UiFormLabel>Corps</UiFormLabel>
            <UiFormControl>
              <UiEditor v-bind="componentField" />
            </UiFormControl>
          </UiFormItem>
        </UiFormField>

        <UiCollapsible
          v-if="availableVariables.length"
          v-slot="{ open: cardOpen }"
        >
          <UiCard class="py-0 gap-0">
            <UiCollapsibleTrigger as-child>
              <UiCardHeader class="p-6 flex-row items-center justify-between cursor-pointer">
                <div class="flex flex-col items-start gap-1.5">
                  <UiCardTitle>Variables disponibles</UiCardTitle>
                  <UiCardDescription>Personnalisez votre message à l'aide de ces variables.</UiCardDescription>
                </div>

                <component
                  :is="cardOpen ? ChevronUp : ChevronDown"
                  class="size-4.5 text-muted-foreground"
                />
              </UiCardHeader>
            </UiCollapsibleTrigger>

            <UiCollapsibleContent>
              <UiCardContent class="pb-6">
                <UiDataTable
                  :columns="columns"
                  :data="availableVariables"
                />
              </UiCardContent>
            </UiCollapsibleContent>
          </UiCard>
        </UiCollapsible>

        <UiDialogFooter>
          <UiDialogClose as-child>
            <UiButton
              type="button"
              variant="secondary"
            >
              {{ $t("btn.cancel") }}
            </UiButton>
          </UiDialogClose>

          <UiButton :disabled="loading.sendEmails">
            {{ $t("btn.send.default") }}
            <UiSpinner v-if="loading.sendEmails" />
          </UiButton>
        </UiDialogFooter>
      </form>
    </UiDialogContent>
  </UiDialog>
</template>
