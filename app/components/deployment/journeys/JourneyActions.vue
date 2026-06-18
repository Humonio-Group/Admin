<script setup lang="ts">
import { MoreVertical, Eye, Settings, Users, ChartArea, ChartLine, DoorClosed, Download, MailPlus } from "lucide-vue-next";
import type { JourneyActionsProps } from "~/components/deployment/journeys/index";
import JourneyDialog from "~/components/deployment/journeys/JourneyDialog.vue";

withDefaults(defineProps<JourneyActionsProps>(), {
  showJourneyShortcuts: true,
});

const { company } = storeToRefs(useCompanyStore());

const edit = ref<boolean>(false);
</script>

<template>
  <div>
    <UiDropdownMenu>
      <UiDropdownMenuTrigger as-child>
        <UiButton
          variant="ghost"
          size="icon-sm"
        >
          <MoreVertical />
        </UiButton>
      </UiDropdownMenuTrigger>
      <UiDropdownMenuContent align="end">
        <UiDropdownMenuGroup>
          <NuxtLinkLocale
            v-if="showJourneyShortcuts"
            :to="`/${company?.alias}/deployment/journeys/${journey.id}`"
          >
            <UiDropdownMenuItem>
              <Eye />
              {{ $t("deployment.journeys.actions.open") }}
            </UiDropdownMenuItem>
          </NuxtLinkLocale>
          <UiDropdownMenuItem @click="edit = true">
            <Settings />
            {{ $t("deployment.journeys.actions.config") }}
          </UiDropdownMenuItem>
        </UiDropdownMenuGroup>

        <UiDropdownMenuSeparator />

        <UiDropdownMenuGroup>
          <UiDropdownMenuItem>
            <MailPlus />
            {{ $t("deployment.journeys.actions.send-emails") }}
          </UiDropdownMenuItem>
          <NuxtLinkLocale :to="`/${company?.alias}/deployment/journeys/${journey.id}/people/teams`">
            <UiDropdownMenuItem v-if="showJourneyShortcuts">
              <Users />
              {{ $t("deployment.journeys.actions.participants-config") }}
            </UiDropdownMenuItem>
          </NuxtLinkLocale>
          <NuxtLinkLocale :to="`/${company?.alias}/deployment/journeys/${journey.id}/results?role=participant`">
            <UiDropdownMenuItem v-if="showJourneyShortcuts">
              <ChartLine />
              {{ $t("deployment.journeys.actions.watch-results") }}
            </UiDropdownMenuItem>
          </NuxtLinkLocale>
          <UiDropdownMenuSub>
            <UiDropdownMenuSubTrigger>
              <Download />
              {{ $t("deployment.journeys.actions.download.label") }}
            </UiDropdownMenuSubTrigger>
            <UiDropdownMenuPortal>
              <UiDropdownMenuSubContent>
                <UiDropdownMenuItem>
                  <ChartArea />
                  {{ $t("deployment.journeys.actions.download.progress-report") }}
                </UiDropdownMenuItem>
              </UiDropdownMenuSubContent>
            </UiDropdownMenuPortal>
          </UiDropdownMenuSub>
        </UiDropdownMenuGroup>

        <UiDropdownMenuSeparator />

        <UiDropdownMenuGroup>
          <UiDropdownMenuItem
            variant="destructive"
            disabled
          >
            <DoorClosed />
            {{ $t("deployment.journeys.actions.cancel") }}
          </UiDropdownMenuItem>
        </UiDropdownMenuGroup>
      </UiDropdownMenuContent>
    </UiDropdownMenu>

    <JourneyDialog
      v-model:open="edit"
      :journey
      :selected-program="journey.relatedProgram"
    />
  </div>
</template>
