<script setup lang="ts">
import type { ProgramActionsProps } from "~/components/deployment/programs/index";
import { MoreVertical, Download, Copy, Settings, Wrench, X, Power, ChartArea, Map, Eye } from "lucide-vue-next";
import { cn } from "~/lib/utils";

const props = defineProps<ProgramActionsProps>();
const { company } = storeToRefs(useCompanyStore());
const builderPath = () => useRuntimeConfig().public.urls.builder
  .replaceAll("{alias}", company.value?.alias ?? "")
  .replaceAll("{programId}", `${props.program.id}`)
  .replaceAll("{key}", company.value?.key ?? "")
;
</script>

<template>
  <UiDropdownMenu>
    <UiDropdownMenuTrigger as-child>
      <UiButton
        variant="outline"
        size="icon-sm"
        :class="cn('', props.class)"
      >
        <MoreVertical />
      </UiButton>
    </UiDropdownMenuTrigger>
    <UiDropdownMenuContent align="end">
      <UiDropdownMenuGroup>
        <NuxtLinkLocale :to="`/${company?.alias}/deployment/programs/${program.id}`">
          <UiDropdownMenuItem>
            <Eye />
            {{ $t("deployment.programs.card.actions.go-to") }}
          </UiDropdownMenuItem>
        </NuxtLinkLocale>
        <UiDropdownMenuItem>
          <Copy />
          {{ $t("deployment.programs.card.actions.duplicate") }}
        </UiDropdownMenuItem>
      </UiDropdownMenuGroup>

      <UiDropdownMenuSeparator />

      <UiDropdownMenuGroup>
        <UiDropdownMenuItem>
          <Settings />
          {{ $t("deployment.programs.card.actions.config") }}
        </UiDropdownMenuItem>
        <NuxtLink
          :to="builderPath()"
          target="_blank"
          external
        >
          <UiDropdownMenuItem>
            <Wrench />
            {{ $t("deployment.programs.card.actions.build") }}
          </UiDropdownMenuItem>
        </NuxtLink>
        <UiDropdownMenuSub>
          <UiDropdownMenuSubTrigger>
            <Download />
            {{ $t("deployment.programs.card.actions.download.label") }}
          </UiDropdownMenuSubTrigger>
          <UiDropdownMenuPortal>
            <UiDropdownMenuSubContent>
              <UiDropdownMenuItem>
                <Map />
                {{ $t("deployment.programs.card.actions.download.formation-plan") }}
              </UiDropdownMenuItem>
              <UiDropdownMenuItem>
                <ChartArea />
                {{ $t("deployment.programs.card.actions.download.progress-report") }}
              </UiDropdownMenuItem>
            </UiDropdownMenuSubContent>
          </UiDropdownMenuPortal>
        </UiDropdownMenuSub>
      </UiDropdownMenuGroup>

      <UiDropdownMenuSeparator />

      <UiDropdownMenuGroup>
        <UiDropdownMenuItem v-if="program.active">
          <X />
          {{ $t("deployment.programs.card.actions.deactivate") }}
        </UiDropdownMenuItem>
        <UiDropdownMenuItem v-else>
          <Power />
          {{ $t("deployment.programs.card.actions.activate") }}
        </UiDropdownMenuItem>
      </UiDropdownMenuGroup>
    </UiDropdownMenuContent>
  </UiDropdownMenu>
</template>
