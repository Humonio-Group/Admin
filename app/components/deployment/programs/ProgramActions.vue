<script setup lang="ts">
import type { ProgramActionsProps } from "~/components/deployment/programs/index";
import { MoreVertical, Download, Copy, Settings, Wrench, X, Power, ChartArea, Map, Eye } from "lucide-vue-next";
import { cn } from "~/lib/utils";
import ProgramDialog from "~/components/deployment/programs/ProgramDialog.vue";

const { locale } = useI18n();

const props = withDefaults(defineProps<ProgramActionsProps>(), {
  showProgramShortcuts: true,
});
const { company } = storeToRefs(useCompanyStore());
const builderPath = () => useRuntimeConfig().public.urls.builder
  .replaceAll("{alias}", company.value?.alias ?? "")
  .replaceAll("{programId}", `${props.program.id}`)
  .replaceAll("{key}", company.value?.key ?? "")
;

const store = useProgramStore();

const edit = ref<boolean>(false);
</script>

<template>
  <div>
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
          <NuxtLinkLocale
            v-if="showProgramShortcuts"
            :to="`/${company?.alias}/deployment/programs/${program.id}`"
          >
            <UiDropdownMenuItem>
              <Eye />
              {{ $t("deployment.programs.card.actions.go-to") }}
            </UiDropdownMenuItem>
          </NuxtLinkLocale>
          <UiDropdownMenuItem @click="store.duplicateProgram(program)">
            <Copy />
            {{ $t("deployment.programs.card.actions.duplicate") }}
          </UiDropdownMenuItem>
        </UiDropdownMenuGroup>

        <UiDropdownMenuSeparator />

        <UiDropdownMenuGroup>
          <UiDropdownMenuItem @click="edit = true">
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
                <NuxtLink
                  :to="`${useRuntimeConfig().public.api['2']}/v1/export?type=2&format=pdf&program=${program.id}&lang=${locale}&platform=25&key=${useRuntimeConfig().public.api.key}`"
                  external
                  :download="`${program.name[locale] || program.name[program.defaultLanguage.code]}.formation-plan.pdf`"
                >
                  <UiDropdownMenuItem>
                    <Map />
                    {{ $t("deployment.programs.card.actions.download.formation-plan") }}
                  </UiDropdownMenuItem>
                </NuxtLink>
                <NuxtLink
                  :to="`${useRuntimeConfig().public.api['2']}/v2/programs/${program.id}/completion-export?key=${useRuntimeConfig().public.api.key}&platform=${useRuntimeConfig().public.platform}&xcompany=${company?.key}`"
                  external
                  :download="`${program.name[locale] || program.name[program.defaultLanguage.code]}.completion-report.xlsx`"
                >
                  <UiDropdownMenuItem>
                    <ChartArea />
                    {{ $t("deployment.programs.card.actions.download.progress-report") }}
                  </UiDropdownMenuItem>
                </NuxtLink>
              </UiDropdownMenuSubContent>
            </UiDropdownMenuPortal>
          </UiDropdownMenuSub>
        </UiDropdownMenuGroup>

        <UiDropdownMenuSeparator />

        <UiDropdownMenuGroup>
          <UiDropdownMenuItem
            v-if="program.active"
            @click="store.disableProgram(program)"
          >
            <X />
            {{ $t("deployment.programs.card.actions.deactivate") }}
          </UiDropdownMenuItem>
          <UiDropdownMenuItem
            v-else
            @click="store.enableProgram(program)"
          >
            <Power />
            {{ $t("deployment.programs.card.actions.activate") }}
          </UiDropdownMenuItem>
        </UiDropdownMenuGroup>
      </UiDropdownMenuContent>
    </UiDropdownMenu>

    <ProgramDialog
      v-model:open="edit"
      :program
    />
  </div>
</template>
