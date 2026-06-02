<script setup lang="ts">
import PageRoot from "~/components/composing/PageRoot.vue";
import type { JourneyStageContent } from "~/types/entities/journey";
import { formatDate } from "date-fns";
import * as locales from "date-fns/locale";

const { locale } = useI18n();
const content = inject<JourneyStageContent>("content");
</script>

<template>
  <PageRoot
    v-if="content"
    name="deployment.results.content.completion"
    class="grid gap-4"
  >
    <div class="grid @xl/page:grid-cols-2 gap-4">
      <UiCard>
        <UiCardHeader class="flex flex-row items-center justify-between">
          <UiCardTitle>Participants ayant ouvert</UiCardTitle>

          <p class="text-primary font-semibold">
            {{ content.stats.viewsCount }} / {{ content.access.length }}
          </p>
        </UiCardHeader>

        <UiCardContent>
          <UiProgress :model-value="content.stats.views * 100" />
        </UiCardContent>
      </UiCard>
      <UiCard>
        <UiCardHeader class="flex flex-row items-center justify-between">
          <UiCardTitle>Participants ayant complété</UiCardTitle>

          <p class="text-primary font-semibold">
            {{ content.stats.completionCount }} / {{ content.access.length }}
          </p>
        </UiCardHeader>

        <UiCardContent>
          <UiProgress :model-value="content.stats.completion * 100" />
        </UiCardContent>
      </UiCard>
    </div>

    <main>
      <UiCard class="py-4">
        <UiCardContent class="px-0 grid *:py-4 divide-y">
          <div
            v-for="(line, index) in content.access"
            :key="line.userId"
            class="flex items-center justify-between px-4"
            :class="{ 'pt-0!': index === 0, 'pb-0!': index === content.access.length - 1 }"
          >
            <div class="flex items-center gap-3">
              <UiAvatar>
                <UiAvatarImage
                  v-if="line.participation.picture"
                  :src="line.participation.picture"
                />
                <UiAvatarFallback cless="text-muted-foreground text-sm">
                  {{ line.participation.name.split(" ")[0]![0] }}{{ line.participation.name.split(" ")[1]![0] }}
                </UiAvatarFallback>
              </UiAvatar>

              <div class="grid">
                <p>{{ line.participation.name }}</p>
                <div class="flex items-center gap-2.5">
                  <span class="text-sm text-muted-foreground">{{ line.participation.team }}</span>

                  <UiBadge
                    v-if="line.visibility === 'hidden'"
                    variant="secondary"
                  >
                    {{ $t("labels.content-state.locked") }}
                  </UiBadge>
                  <UiBadge
                    v-else-if="line.visibility === 'locked'"
                    variant="dashed"
                  >
                    {{ $t("labels.content-state.hidden") }}
                  </UiBadge>
                  <UiBadge
                    v-else
                    variant="softDefault"
                  >
                    {{ $t("labels.content-state.accessible") }}
                  </UiBadge>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <UiPopover>
                <UiPopoverTrigger as-child>
                  <UiBadge
                    v-if="line.progress.completedAt"
                    variant="softDefault"
                  >
                    {{ $t("labels.content-progress.completed") }}
                  </UiBadge>
                  <UiBadge
                    v-else-if="line.progress.viewedAt"
                    variant="secondary"
                  >
                    {{ $t("labels.content-progress.viewed") }}
                  </UiBadge>
                  <UiBadge
                    v-else
                    variant="outline"
                  >
                    {{ $t("labels.content-progress.not-started") }}
                  </UiBadge>
                </UiPopoverTrigger>

                <UiPopoverContent
                  side="top"
                  class="grid gap-4 px-0"
                >
                  <header class="px-4">
                    <p class="text-sm font-bold text-muted-foreground">
                      Historique de l'activité
                    </p>
                  </header>

                  <UiSeparator />

                  <main class="text-sm grid gap-2 px-4">
                    <div class="flex items-center gap-8 justify-between">
                      <p class="font-medium">
                        Ouverture
                      </p>
                      <p class="text-muted-foreground">
                        {{ line.progress.viewedAt ? formatDate(line.progress.viewedAt, "d MMMM yyyy, HH:mm", { locale: locales[locale] }) : "-" }}
                      </p>
                    </div>
                    <div class="flex items-center gap-8 justify-between">
                      <p class="font-medium">
                        Complétion
                      </p>
                      <p class="text-muted-foreground">
                        {{ line.progress.completedAt ? formatDate(line.progress.completedAt, "d MMMM yyyy, HH:mm", { locale: locales[locale] }) : "-" }}
                      </p>
                    </div>
                  </main>
                </UiPopoverContent>
              </UiPopover>

              <UiButton
                v-if="line.permissions.pushable"
                variant="outline"
              >
                {{ $t("btn.push") }}
              </UiButton>
              <UiButton
                v-else-if="line.permissions.unPushable"
                variant="outline"
              >
                {{ $t("btn.un-push") }}
              </UiButton>

              <UiButton
                v-if="line.result.link"
                as-child
              >
                <NuxtLink
                  :to="line.result.link"
                  target="_blank"
                  external
                >
                  {{ $t("btn.see-results") }}
                </NuxtLink>
              </UiButton>
            </div>
          </div>
        </UiCardContent>
      </UiCard>
    </main>
  </PageRoot>
</template>
