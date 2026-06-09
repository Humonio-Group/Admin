<script setup lang="ts">
import { Users, UserStar, Star, Flag, Clock } from "lucide-vue-next";
import type { ProgramCardProps } from "~/components/deployment/programs/index";
import MarkdownRenderer from "~/components/primitives/MarkdownRenderer.vue";
import ProgramActions from "~/components/deployment/programs/ProgramActions.vue";

const { locale } = useI18n();

const props = defineProps<ProgramCardProps>();

const { company } = storeToRefs(useCompanyStore());

const duration = computed(() => props.program.duration ?? 0);

const rating = computed(() => props.program.stats.rate ?? 0);
const journeys = computed(() => props.program.stats.journeys ?? 0);
const facilitators = computed(() => props.program.stats.facilitators ?? 0);
const participants = computed(() => props.program.stats.participants ?? 0);
</script>

<template>
  <UiCard class="group overflow-hidden pt-0 pb-4 relative transition-all hover:border-primary hover:scale-103 isolate">
    <div class="aspect-video rounded-t-lg overflow-hidden">
      <NuxtImg
        v-if="program.picture"
        :src="program.picture"
        class="size-full object-cover"
      />
      <span class="block size-full bg-secondary" />
    </div>

    <div class="absolute top-3 left-3 flex items-center gap-1">
      <span class="text-xs rounded-md py-1 px-1.5 bg-foreground/20 backdrop-blur-lg text-background">#{{ program.id }}</span>
      <span
        v-if="program.default"
        class="text-xs rounded-md py-1 px-1.5 bg-foreground/20 backdrop-blur-lg text-background"
      >{{ $t("labels.default") }}</span>
    </div>
    <ProgramActions
      class="z-10 absolute top-3 right-3 @lg:opacity-0 @lg:group-hover:opacity-100"
      :program
    />

    <UiCardHeader>
      <UiCardTitle class="line-clamp-2">
        {{ program.name[locale] || program.name[program.defaultLanguage.code]! }}
      </UiCardTitle>
      <UiCardDescription>
        <MarkdownRenderer
          class="line-clamp-1 overflow-hidden"
          :content="program.description[locale] || program.name[program.defaultLanguage.code]!"
        />
      </UiCardDescription>

      <div class="flex items-center gap-2.5">
        <UiBadge v-if="program.active">
          {{ $t("labels.state.active.m") }}
        </UiBadge>
        <UiBadge
          v-else
          variant="secondary"
        >
          {{ $t("labels.state.inactive.m") }}
        </UiBadge>

        <UiTooltip>
          <UiTooltipTrigger class="z-10">
            <div class="flex items-center gap-1 text-xs text-muted-foreground">
              <Star class="size-3.5" />
              {{ rating }}
            </div>
          </UiTooltipTrigger>
          <UiTooltipContent>
            <p>{{ $t("deployment.programs.card.tooltips.average-rating") }}</p>
          </UiTooltipContent>
        </UiTooltip>
        <UiTooltip>
          <UiTooltipTrigger class="z-10">
            <div class="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock class="size-3.5" />
              {{ $t("labels.time.days", duration, { named: { count: duration } }) }}
            </div>
          </UiTooltipTrigger>
          <UiTooltipContent>
            <p>{{ $t("deployment.programs.card.tooltips.total-duration") }}</p>
          </UiTooltipContent>
        </UiTooltip>
      </div>
    </UiCardHeader>

    <UiCardFooter class="mt-auto flex items-center justify-between">
      <div class="flex items-center gap-1 text-xs text-muted-foreground">
        <Flag class="size-3.5" />
        {{ $t("labels.sessions", journeys, { named: { count: journeys } }) }}
      </div>

      <div class="flex items-center gap-2.5">
        <UiTooltip>
          <UiTooltipTrigger class="z-10">
            <div class="flex items-center gap-1 text-xs text-muted-foreground">
              <UserStar class="size-3.5" />
              {{ facilitators }}
            </div>
          </UiTooltipTrigger>
          <UiTooltipContent>
            <p>{{ $t("labels.facilitators", facilitators, { named: { count: facilitators } }) }}</p>
          </UiTooltipContent>
        </UiTooltip>
        <UiTooltip>
          <UiTooltipTrigger class="z-10">
            <div class="flex items-center gap-1 text-xs text-muted-foreground">
              <Users class="size-3.5" />
              {{ participants }}
            </div>
          </UiTooltipTrigger>
          <UiTooltipContent>
            <p>{{ $t("labels.participants", participants, { named: { count: participants } }) }}</p>
          </UiTooltipContent>
        </UiTooltip>
      </div>
    </UiCardFooter>

    <NuxtLinkLocale
      :to="`/${company!.alias}/deployment/programs/${program.id}/journeys`"
      class="absolute z-1 inset-0 size-full"
    />
  </UiCard>
</template>
