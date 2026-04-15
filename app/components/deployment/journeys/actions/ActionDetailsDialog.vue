<script setup lang="ts">
import { Eye, Calendar } from "lucide-vue-next";
import type { ActionDetailsDialogProps } from "~/components/deployment/journeys/actions/index";
import ActionBadgeStatus from "~/components/deployment/journeys/actions/ActionBadgeStatus.vue";
import { formatDate } from "date-fns";
import * as locales from "date-fns/locale";
import MarkdownRenderer from "~/components/primitives/MarkdownRenderer.vue";

const { locale } = useI18n();

defineProps<ActionDetailsDialogProps>();

const { isMarkdown } = useContentDetector();

const open = defineModel<boolean>("open", { default: false });
</script>

<template>
  <UiDialog v-model:open="open">
    <UiDialogTrigger as-child>
      <UiButton
        size="icon-sm"
        variant="ghost"
      >
        <Eye />
      </UiButton>
    </UiDialogTrigger>
    <UiDialogContent>
      <UiDialogHeader class="flex flex-row items-center gap-4">
        <UiAvatar class="size-14">
          <UiAvatarFallback class="text-sm text-muted-foreground">
            {{ action.author.name.first[0] }}{{ action.author.name.last[0] }}
          </UiAvatarFallback>
        </UiAvatar>

        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <UiTooltip>
              <UiTooltipTrigger>
                <Calendar class="size-3.5 text-muted-foreground" />
              </UiTooltipTrigger>
              <UiTooltipContent>
                <p>{{ $t("deployment.journeys.actions.details-dialog.deadline") }}</p>
              </UiTooltipContent>
            </UiTooltip>
            {{ formatDate(action.dates.deadline, $t("deployment.journeys.actions.table.date-format"), { locale: locales[locale] }) }}
          </div>

          <ActionBadgeStatus :action />
        </div>
      </UiDialogHeader>

      <div class="grid gap-4">
        <MarkdownRenderer
          :content="action.description.original"
          :use-markdown="isMarkdown(action.description.original)"
        />

        <UiSeparator />

        <div class="grid gap-2">
          <p class="text-sm font-medium text-muted-foreground">
            {{ $t("deployment.journeys.actions.details-dialog.task-list") }}
          </p>

          <div
            v-for="task in action.tasks"
            :key="task.name"
            class="flex items-center gap-2"
          >
            <UiCheckbox
              :model-value="task.done"
              disabled
            />
            <p>{{ task.name }}</p>
          </div>
        </div>
      </div>
    </UiDialogContent>
  </UiDialog>
</template>
