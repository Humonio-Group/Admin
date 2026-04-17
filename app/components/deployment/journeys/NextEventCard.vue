<script setup lang="ts">
import { Clock, Map, MapPin, Video, Calendar } from "lucide-vue-next";
import type { NextEventCardProps } from "~/components/deployment/journeys/index";
import { formatDate } from "date-fns";
import * as locales from "date-fns/locale";

const { locale } = useI18n();
const { sameDate } = useDateUtils();

const props = defineProps<NextEventCardProps>();

const store = useJourneyStore();
const { loading } = storeToRefs(store);
const requestingCalendarDownload = computed(() => loading.value.requestingEventCalendarIcs.includes(props.event.id));

const periodDisplay = computed(() => {
  const { start, end } = props.event.dates;
  const opts = { locale: locales[locale.value] };

  if (sameDate(start, end)) return `${formatDate(start, "d MMMM yyyy, HH:mm", opts)} - ${formatDate(end, "HH:mm", opts)}`;
  return `${formatDate(start, "d MMMM yyyy, HH:mm", opts)} - ${formatDate(end, "d MMMM yyyy, HH:mm", opts)}`;
});
</script>

<template>
  <UiCard class="p-2 pr-4 gap-2.5 flex flex-row items-center">
    <NuxtImg
      :src="event.icon"
      class="shrink-0 aspect-square w-10 rounded-lg bg-primary object-cover"
    />

    <div class="flex flex-col flex-1">
      <p class="font-semibold">
        {{ event.name }}
      </p>
      <div class="flex flex-wrap items-center gap-x-4 gap-y-1">
        <div class="flex items-center gap-1.5">
          <UiTooltip>
            <UiTooltipTrigger>
              <Clock class="size-3.5 text-muted-foreground" />
            </UiTooltipTrigger>
            <UiTooltipContent>
              <p>{{ $t("deployment.journeys.overview.next-events.tooltips.period") }}</p>
            </UiTooltipContent>
          </UiTooltip>

          <p class="text-sm text-muted-foreground">
            {{ periodDisplay }}
          </p>
        </div>
        <div
          v-if="event.config.place"
          class="flex items-center gap-1.5"
        >
          <UiTooltip>
            <UiTooltipTrigger>
              <Map class="size-3.5 text-muted-foreground" />
            </UiTooltipTrigger>
            <UiTooltipContent>
              <p>{{ $t("deployment.journeys.overview.next-events.tooltips.location") }}</p>
            </UiTooltipContent>
          </UiTooltip>

          <p class="text-sm text-muted-foreground">
            {{ event.config.place }}
          </p>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-1">
      <UiTooltip>
        <UiTooltipTrigger as-child>
          <UiButton
            v-if="event.config.place && event.config.link"
            variant="outline"
            size="icon"
            as-child
          >
            <NuxtLink
              :to="event.config.link!"
              target="_blank"
              external
            >
              <MapPin />
            </NuxtLink>
          </UiButton>
        </UiTooltipTrigger>
        <UiTooltipContent>
          <p>{{ $t("deployment.journeys.overview.next-events.links.open-map") }}</p>
        </UiTooltipContent>
      </UiTooltip>
      <UiTooltip>
        <UiTooltipTrigger as-child>
          <UiButton
            v-if="event.config.display && event.config.link"
            variant="outline"
            size="icon"
            as-child
          >
            <NuxtLink
              :to="event.config.link"
              target="_blank"
              external
            >
              <Video />
            </NuxtLink>
          </UiButton>
        </UiTooltipTrigger>
        <UiTooltipContent>
          <p>{{ $t("deployment.journeys.overview.next-events.links.open-video") }}</p>
        </UiTooltipContent>
      </UiTooltip>
      <UiTooltip>
        <UiTooltipTrigger as-child>
          <UiButton
            variant="outline"
            size="icon"
            :disabled="requestingCalendarDownload"
            @click="store.downloadEventCalendarIcs(event)"
          >
            <UiSpinner v-if="requestingCalendarDownload" />
            <Calendar v-else />
          </UiButton>
        </UiTooltipTrigger>
        <UiTooltipContent>
          <p>{{ $t("deployment.journeys.overview.next-events.links.add-to-calendar") }}</p>
        </UiTooltipContent>
      </UiTooltip>
    </div>
  </UiCard>
</template>
