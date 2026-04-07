<script setup lang="ts">
import { MoreVertical, Eye, Settings, Users, ChartArea, ChartLine, DoorClosed, Download, MailPlus } from "lucide-vue-next";
import type { JourneyActionsProps } from "~/components/deployment/journeys/index";

defineProps<JourneyActionsProps>();

const { company } = storeToRefs(useCompanyStore());
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
          <NuxtLinkLocale :to="`/${company?.alias}/deployment/journeys/${journey.id}`">
            <UiDropdownMenuItem>
              <Eye />
              {{ $t("deployment.journeys.actions.open") }}
            </UiDropdownMenuItem>
          </NuxtLinkLocale>
          <UiDropdownMenuItem>
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
          <UiDropdownMenuItem>
            <Users />
            {{ $t("deployment.journeys.actions.participants-config") }}
          </UiDropdownMenuItem>
          <UiDropdownMenuItem>
            <ChartLine />
            {{ $t("deployment.journeys.actions.watch-results") }}
          </UiDropdownMenuItem>
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
          <UiDropdownMenuItem variant="destructive">
            <DoorClosed />
            {{ $t("deployment.journeys.actions.cancel") }}
          </UiDropdownMenuItem>
        </UiDropdownMenuGroup>
      </UiDropdownMenuContent>
    </UiDropdownMenu>
  </div>
</template>
