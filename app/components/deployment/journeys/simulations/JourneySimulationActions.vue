<script setup lang="ts">
import { Check, Copy, User, Users, Import, MoreHorizontal, Share, SquareArrowOutUpRight } from "lucide-vue-next";
import type { JourneySimulationActionsProps } from "~/components/deployment/journeys/simulations/index";
import { useClipboard } from "@vueuse/core";
import { toast } from "vue-sonner";
import JourneySimulationExportDialog
  from "~/components/deployment/journeys/simulations/JourneySimulationExportDialog.vue";
import JourneySimulationShareDialog
  from "~/components/deployment/journeys/simulations/JourneySimulationShareDialog.vue";

const { t } = useI18n();

const props = defineProps<JourneySimulationActionsProps>();

const importForParticipantDialog = ref<boolean>(false);
const importForTeamDialog = ref<boolean>(false);
const exportDialog = ref<boolean>(false);
const shareDialog = ref<boolean>(false);

const { copy: simKeyCopy, copied: simKeyCopied } = useClipboard();
const { copy: trialKeyCopy, copied: trialKeyCopied } = useClipboard();

async function copySimulationKey() {
  await simKeyCopy(props.simulation.simKey);
  toast.success(t("toasts.journeys.simulations.key-copied"));
}
async function copyTrialKey() {
  await trialKeyCopy(props.simulation.trialKey);
  toast.success(t("toasts.journeys.simulations.trial-copied"));
}
</script>

<template>
  <div>
    <UiDropdownMenu>
      <UiDropdownMenuTrigger as-child>
        <UiButton
          variant="outline"
          size="icon-sm"
        >
          <MoreHorizontal />
        </UiButton>
      </UiDropdownMenuTrigger>
      <UiDropdownMenuContent align="end">
        <UiDropdownMenuGroup>
          <UiDropdownMenuSub>
            <UiDropdownMenuSubTrigger>
              <Import />
              {{ $t("deployment.journeys.overview.simulations.actions.import.default") }}
            </UiDropdownMenuSubTrigger>
            <UiDropdownMenuPortal>
              <UiDropdownMenuSubContent>
                <UiDropdownMenuItem @click="importForParticipantDialog = true">
                  <User />
                  {{ $t("deployment.journeys.overview.simulations.actions.import.for-participant") }}
                </UiDropdownMenuItem>
                <UiDropdownMenuItem @click="importForTeamDialog = true">
                  <Users />
                  {{ $t("deployment.journeys.overview.simulations.actions.import.for-team") }}
                </UiDropdownMenuItem>
              </UiDropdownMenuSubContent>
            </UiDropdownMenuPortal>
          </UiDropdownMenuSub>
          <UiDropdownMenuItem @click="exportDialog = true">
            <SquareArrowOutUpRight />
            {{ $t("deployment.journeys.overview.simulations.actions.export") }}
          </UiDropdownMenuItem>
          <UiDropdownMenuItem @click="shareDialog = true">
            <Share />
            {{ $t("deployment.journeys.overview.simulations.actions.share") }}
          </UiDropdownMenuItem>
        </UiDropdownMenuGroup>

        <UiDropdownMenuSeparator />

        <UiDropdownMenuGroup>
          <UiDropdownMenuItem @click="copySimulationKey">
            <Check v-if="simKeyCopied" />
            <Copy v-else />
            {{ $t("deployment.journeys.overview.simulations.actions.copy-key") }}
          </UiDropdownMenuItem>
          <UiDropdownMenuItem @click="copyTrialKey">
            <Check v-if="trialKeyCopied" />
            <Copy v-else />
            {{ $t("deployment.journeys.overview.simulations.actions.copy-trial") }}
          </UiDropdownMenuItem>
        </UiDropdownMenuGroup>
      </UiDropdownMenuContent>
    </UiDropdownMenu>

    <JourneySimulationExportDialog
      v-model:open="exportDialog"
      :simulation
    />
    <JourneySimulationShareDialog
      v-model:open="shareDialog"
      :simulation
    />
  </div>
</template>
