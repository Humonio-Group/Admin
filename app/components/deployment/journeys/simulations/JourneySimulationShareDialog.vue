<script setup lang="ts">
import type { JourneySimulationShareDialogProps } from "~/components/deployment/journeys/simulations/index";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";
import { ChevronsUpDown, ChevronsDownUp } from "lucide-vue-next";
import type { JourneyTeam, JourneyTeamMember } from "~/types/entities/journey";
import type { Listed } from "~/types/primitives/objects";

const { t } = useI18n();

const props = withDefaults(defineProps<JourneySimulationShareDialogProps>(), {
  trigger: false,
});

const store = useJourneyStore();
const { selectedJourney: journey, loading } = storeToRefs(store);
const { user } = storeToRefs(useUserStore());

const open = defineModel<boolean>("open", { default: false });
watch(open, (value) => {
  if (!value) return;
  store.loadTeams();
  form.resetForm();
});

const form = useForm({
  validationSchema: toTypedSchema(z.object({
    to: z.array(z.number().min(0)).min(1, t("dialogs.share-simulation.errors.at-least-one-to")),
    subject: z.string(),
    body: z.string(),
  })),
  initialValues: {
    subject: t("dialogs.share-simulation.defaults.subject"),
    body: t("dialogs.share-simulation.defaults.body", {
      name: user.value?.name.full,
      simName: props.simulation.name,
      journeyName: journey.value?.name,
      simKey: props.simulation.simKey,
      trialKey: props.simulation.trialKey,
    }),
  },
  keepValuesOnUnmount: true,
});
const submit = form.handleSubmit(async ({ to, subject, body }) => {
  open.value = !(await store.shareSimulation(to, subject, body));
});

const allFacilitators = computed(() => {
  if (!journey.value) return false;
  return journey.value.facilitators.every(facilitator => form.values.to?.includes(facilitator.id));
});
const teams = computed(() => {
  if (!journey.value) return {
    coaches: [],
    participants: [],
  };
  return {
    coaches: journey.value.teams.list.filter(team => team.coaches.length && team.coaches.every((coach: JourneyTeamMember) => form.values.to?.includes(coach.reference))).reduce((acc, curr) => {
      acc = [...acc, curr.id];
      return acc;
    }, [] as Listed<number>),
    participants: journey.value.teams.list.filter(team => team.participants.length && team.participants.every((participant: JourneyTeamMember) => form.values.to?.includes(participant.reference))).reduce((acc, curr) => {
      acc = [...acc, curr.id];
      return acc;
    }, [] as Listed<number>),
  };
});
const allCoaches = computed(() => {
  if (!journey.value) return false;
  return teams.value.coaches.length === journey.value.teams.list.length;
});
const allParticipants = computed(() => {
  if (!journey.value) return false;
  return teams.value.participants.length === journey.value.teams.list.length;
});

function toggleValue(value: number) {
  if (form.values.to?.includes(value)) form.setFieldValue("to", form.values.to?.filter(val => val !== value) ?? []);
  else form.setFieldValue("to", [...(form.values.to ?? []), value]);
}
function toggleAllFacilitators() {
  if (allFacilitators.value) form.setFieldValue("to", form.values.to?.filter(fac => !journey.value?.facilitators.find(facilitator => facilitator.id === fac)));
  else form.setFieldValue("to", [...(form.values.to ?? []), ...(journey.value?.facilitators.reduce((acc, curr) => {
    acc = [...acc, curr.id];
    return acc;
  }, [] as Listed<number>) ?? [])]);
}
function toggleAllCoaches() {
  if (!journey.value) return;

  const coachesIds = journey.value.teams.list.reduce((acc, curr) => {
    acc = [...acc, ...curr.coaches.reduce((acc2: Listed<number>, curr2: JourneyTeamMember) => {
      acc2 = [...acc2, curr2.reference];
      return acc2;
    }, [] as Listed<number>)];
    return acc;
  }, [] as Listed<number>);
  if (allCoaches.value) form.setFieldValue("to", form.values.to?.filter(part => !coachesIds.includes(part)));
  else form.setFieldValue("to", [...(form.values.to ?? []), ...coachesIds]);
}
function toggleAllParticipants() {
  if (!journey.value) return;

  const participantsIds = journey.value.teams.list.reduce((acc, curr) => {
    acc = [...acc, ...curr.participants.reduce((acc2: Listed<number>, curr2: JourneyTeamMember) => {
      acc2 = [...acc2, curr2.reference];
      return acc2;
    }, [] as Listed<number>)];
    return acc;
  }, [] as Listed<number>);
  if (allParticipants.value) form.setFieldValue("to", form.values.to?.filter(part => !participantsIds.includes(part)));
  else form.setFieldValue("to", [...(form.values.to ?? []), ...participantsIds]);
}
function toggleTeamParticipants(team: JourneyTeam) {
  if (teams.value.participants.includes(team.id)) form.setFieldValue("to", form.values.to?.filter(participant => !team.participants.find(part => part.reference === participant)));
  else form.setFieldValue("to", [...(form.values.to ?? []), ...team.participants.reduce((acc, curr) => {
    acc = [...acc, curr.reference];
    return acc;
  }, [] as Listed<number>)]);
}
function toggleTeamCoaches(team: JourneyTeam) {
  if (teams.value.coaches.includes(team.id)) form.setFieldValue("to", form.values.to?.filter(coach => !team.coaches.find(part => part.reference === coach)));
  else form.setFieldValue("to", [...(form.values.to ?? []), ...team.coaches.reduce((acc, curr) => {
    acc = [...acc, curr.reference];
    return acc;
  }, [] as Listed<number>)]);
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
        class="grid gap-4"
        @submit="submit"
      >
        <UiDialogHeader>
          <UiDialogTitle>
            {{ $t("dialogs.share-simulation.title") }}
          </UiDialogTitle>
          <UiDialogDescription>
            {{ $t("dialogs.share-simulation.description") }}
          </UiDialogDescription>
        </UiDialogHeader>

        <UiFormField
          v-slot="{ componentField }"
          name="to"
        >
          <UiFormItem>
            <UiCollapsible
              v-slot="{ open: toOpen }"
              :default-open="true"
              class="flex flex-col gap-2"
            >
              <UiCollapsibleTrigger as-child>
                <div class="cursor-pointer flex items-center justify-between w-full">
                  <UiFormLabel>
                    {{ $t("dialogs.share-simulation.fields.to.label") }} <span class="text-xs text-muted-foreground font-base text-align-center">({{ form.values.to?.length ?? 0 }})</span>
                  </UiFormLabel>

                  <ChevronsDownUp
                    v-if="toOpen"
                    class="size-4 text-muted-foreground"
                  />
                  <ChevronsUpDown
                    v-else
                    class="size-4 text-muted-foreground"
                  />
                </div>
              </UiCollapsibleTrigger>
              <UiCollapsibleContent v-if="journey">
                <UiCard class="py-2 gap-2">
                  <UiCardContent
                    v-if="loading.teams"
                    class="grid place-items-center"
                  >
                    <UiSpinner />
                  </UiCardContent>
                  <UiCardContent
                    v-else
                    class="px-2 flex flex-col gap-2"
                  >
                    <div>
                      <UiLabel class="p-3 cursor-pointer rounded-sm hover:bg-accent/60 transition-colors duration-100">
                        <UiCheckbox
                          :model-value="allFacilitators"
                          @update:model-value="toggleAllFacilitators()"
                        />
                        {{ $t("dialogs.share-simulation.fields.to.facilitators") }}
                      </UiLabel>

                      <div v-if="journey.facilitators.length">
                        <UiLabel
                          v-for="facilitator in journey.facilitators"
                          :key="`fac-${facilitator.id}`"
                          class="p-3 pl-7 cursor-pointer rounded-sm hover:bg-accent/60 transition-colors duration-100"
                        >
                          <UiCheckbox
                            :model-value="componentField.modelValue?.includes(facilitator.id)"
                            @update:model-value="toggleValue(facilitator.id)"
                          />
                          {{ facilitator.firstName }} {{ facilitator.lastName }}
                        </UiLabel>
                      </div>
                    </div>

                    <div>
                      <UiLabel class="p-3 cursor-pointer rounded-sm hover:bg-accent/60 transition-colors duration-100">
                        <UiCheckbox
                          :model-value="allParticipants"
                          @update:model-value="toggleAllParticipants()"
                        />
                        {{ $t("dialogs.share-simulation.fields.to.participants") }}
                      </UiLabel>

                      <div
                        v-for="team in journey.teams.list"
                        :key="`part-team-${team.id}`"
                      >
                        <UiLabel class="p-3 pl-7 cursor-pointer rounded-sm hover:bg-accent/60 transition-colors duration-100">
                          <UiCheckbox
                            :model-value="teams.participants.includes(team.id)"
                            @update:model-value="toggleTeamParticipants(team)"
                          />
                          {{ team.name }}
                        </UiLabel>

                        <div v-if="team.participants.length">
                          <UiLabel
                            v-for="participant in team.participants"
                            :key="`team-${team.id}-part-${participant.id}`"
                            class="p-3 pl-12 cursor-pointer rounded-sm hover:bg-accent/60 transition-colors duration-100"
                          >
                            <UiCheckbox
                              :model-value="componentField.modelValue?.includes(participant.reference)"
                              @update:model-value="toggleValue(participant.reference)"
                            />
                            {{ participant.firstName }} {{ participant.lastName }}
                          </UiLabel>
                        </div>
                      </div>
                    </div>

                    <div>
                      <UiLabel class="p-3 cursor-pointer rounded-sm hover:bg-accent/60 transition-colors duration-100">
                        <UiCheckbox
                          :model-value="allCoaches"
                          @update:model-value="toggleAllCoaches()"
                        />
                        {{ $t("dialogs.share-simulation.fields.to.coaches") }}
                      </UiLabel>

                      <div
                        v-for="team in journey.teams.list"
                        :key="`coaches-team-${team.id}`"
                      >
                        <UiLabel class="p-3 pl-7 cursor-pointer rounded-sm hover:bg-accent/60 transition-colors duration-100">
                          <UiCheckbox
                            :model-value="teams.coaches.includes(team.id)"
                            @update:model-value="toggleTeamCoaches(team)"
                          />
                          {{ team.name }}
                        </UiLabel>

                        <div v-if="team.coaches.length">
                          <UiLabel
                            v-for="coach in team.coaches"
                            :key="`team-${team.id}-part-${coach.id}`"
                            class="p-3 pl-12 cursor-pointer rounded-sm hover:bg-accent/60 transition-colors duration-100"
                          >
                            <UiCheckbox
                              :model-value="componentField.modelValue?.includes(coach.reference)"
                              @update:model-value="toggleValue(coach.reference)"
                            />
                            {{ coach.firstName }} {{ coach.lastName }}
                          </UiLabel>
                        </div>
                      </div>
                    </div>
                  </UiCardContent>
                </UiCard>
              </UiCollapsibleContent>
            </UiCollapsible>
            <UiFormMessage />
          </UiFormItem>
        </UiFormField>
        <UiFormField
          v-slot="{ componentField }"
          name="subject"
        >
          <UiFormItem>
            <UiFormLabel>
              {{ $t("dialogs.share-simulation.fields.subject") }}
            </UiFormLabel>
            <UiFormControl>
              <UiInput
                type="text"
                v-bind="componentField"
                :disabled="loading.shareSimulation"
              />
            </UiFormControl>
          </UiFormItem>
        </UiFormField>
        <UiFormField
          v-slot="{ componentField }"
          name="body"
        >
          <UiFormItem>
            <UiFormLabel>{{ $t("dialogs.share-simulation.fields.body") }}</UiFormLabel>
            <UiFormControl>
              <UiTextarea
                v-bind="componentField"
                class="min-h-28 resize-none"
                :disabled="loading.shareSimulation"
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
            :disabled="loading.shareSimulation"
          >
            {{ $t("btn.send.by-mail") }}
            <UiSpinner v-if="loading.shareSimulation" />
          </UiButton>
        </UiDialogFooter>
      </form>
    </UiDialogContent>
  </UiDialog>
</template>
