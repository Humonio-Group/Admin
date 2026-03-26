<script setup lang="ts">
import { Plus, Settings, X } from "lucide-vue-next";
import PageRoot from "~/components/composing/PageRoot.vue";
import ImageDropzone from "~/components/primitives/ImageDropzone.vue";
import { watchOnce } from "@vueuse/core";

const preview = ref<string>();

const store = useCompanyStore();
const { invitationPageSettings, invpAvailablePrograms, invpSelectedPrograms, loading: _loading } = storeToRefs(store);
const loading = computed(() => _loading.value.settings.invitation);
watchOnce(invitationPageSettings, val => preview.value = val?.banner ?? "");

async function onCrop(blob: Blob) {
  // Upload ou traitement du blob
  const { upload } = useFileUpload();
  const response = await upload(blob, 1);

  if (!invitationPageSettings.value) return;
  invitationPageSettings.value.banner = response.data.attributes.file.thumbnail;
}

store.loadInvitationPageSettings();
</script>

<template>
  <PageRoot
    name="settings.administration.invitation"
    class="pt-2 flex flex-col gap-6 pb-2"
  >
    <header class="flex items-center justify-between gap-4">
      <h1 class="text-xl font-bold">
        {{ $t("settings.invitation.title") }}
      </h1>

      <div
        v-if="invitationPageSettings"
        class="flex items-center gap-1"
      >
        <UiDialog>
          <UiTooltip>
            <UiTooltipTrigger>
              <UiDialogTrigger as-child>
                <UiButton
                  variant="outline"
                  size="icon"
                >
                  <Settings />
                </UiButton>
              </UiDialogTrigger>
            </UiTooltipTrigger>
            <UiTooltipContent side="bottom">
              <p>{{ $t("settings.invitation.advanced-settings") }}</p>
            </UiTooltipContent>
          </UiTooltip>
          <UiDialogContent class="max-w-xl! gap-8">
            <UiDialogHeader>
              <UiDialogTitle>{{ $t("settings.invitation.dialog.title") }}</UiDialogTitle>
              <UiDialogDescription>{{ $t("settings.invitation.dialog.description") }}</UiDialogDescription>
            </UiDialogHeader>

            <section class="grid gap-4">
              <div class="grid gap-2">
                <UiLabel for="title">
                  {{ $t("settings.invitation.labels.title") }}
                </UiLabel>
                <UiInput
                  id="title"
                  v-model="invitationPageSettings.title"
                />
              </div>
              <div class="grid gap-2">
                <UiLabel for="description">
                  {{ $t("settings.invitation.labels.description") }}
                </UiLabel>
                <UiTextarea
                  id="description"
                  v-model="invitationPageSettings.description"
                  class="min-h-24 resize-none"
                />
              </div>
            </section>

            <UiSeparator />

            <section class="flex flex-col gap-4">
              <div class="flex items-center justify-between gap-8">
                <div class="flex flex-col">
                  <p>{{ $t("settings.invitation.labels.date.label") }}</p>
                  <span class="text-xs text-muted-foreground max-w-[30ch]">{{ $t("settings.invitation.labels.date.description") }}</span>
                </div>

                <UiSelect v-model="invitationPageSettings.dateMode">
                  <UiSelectTrigger>
                    <UiSelectValue />
                  </UiSelectTrigger>
                  <UiSelectContent>
                    <UiSelectItem :value="3">
                      {{ $t("settings.invitation.labels.date.options.no") }}
                    </UiSelectItem>
                    <UiSelectItem :value="1">
                      {{ $t("settings.invitation.labels.date.options.event") }}
                    </UiSelectItem>
                    <UiSelectItem :value="2">
                      {{ $t("settings.invitation.labels.date.options.workshop") }}
                    </UiSelectItem>
                  </UiSelectContent>
                </UiSelect>
              </div>

              <UiSeparator />

              <UiLabel
                for="display-journeys"
                class="flex items-center justify-between"
              >
                <p>{{ $t("settings.invitation.labels.show-journeys") }}</p>

                <UiSwitch
                  id="display-journeys"
                  :model-value="invitationPageSettings.display.journeys"
                  @update:model-value="invitationPageSettings.display.journeys = $event"
                />
              </UiLabel>
              <UiLabel
                for="display-teams"
                class="flex items-center justify-between"
              >
                <p>{{ $t("settings.invitation.labels.show-teams") }}</p>

                <UiSwitch
                  id="display-teams"
                  :model-value="invitationPageSettings.display.teams"
                  @update:model-value="invitationPageSettings.display.teams = $event"
                />
              </UiLabel>
            </section>

            <UiDialogFooter class="justify-center!">
              <UiDialogClose as-child>
                <UiButton variant="secondary">
                  {{ $t("btn.close") }}
                </UiButton>
              </UiDialogClose>
            </UiDialogFooter>
          </UiDialogContent>
        </UiDialog>

        <UiTooltip v-if="invitationPageSettings.active">
          <UiTooltipTrigger as-child>
            <UiButton @click="invitationPageSettings.active = false">
              {{ $t("labels.state.enabled", 2) }}
            </UiButton>
          </UiTooltipTrigger>
          <UiTooltipContent side="bottom">
            <p>{{ $t("settings.invitation.state.disable") }}</p>
          </UiTooltipContent>
        </UiTooltip>
        <UiTooltip v-else>
          <UiTooltipTrigger as-child>
            <UiButton
              variant="secondary"
              @click="invitationPageSettings.active = true"
            >
              {{ $t("labels.state.disabled", 2) }}
            </UiButton>
          </UiTooltipTrigger>
          <UiTooltipContent side="bottom">
            <p>{{ $t("settings.invitation.state.enable") }}</p>
          </UiTooltipContent>
        </UiTooltip>
      </div>
    </header>

    <main
      v-if="loading"
      class="h-24 grid place-items-center"
    >
      <UiSpinner />
    </main>
    <main
      v-else
      class="flex flex-col gap-8"
    >
      <section class="grid gap-2">
        <p class="text-sm font-medium">
          {{ $t("settings.invitation.labels.banner") }}
        </p>
        <ImageDropzone
          v-model:preview="preview"
          class="h-64"
          :aspect-ratio="16/9"
          @crop="onCrop"
        />
      </section>

      <section class="flex flex-col gap-4">
        <header class="flex items-center justify-between gap-4">
          <h2 class="text-lg font-semibold">
            {{ $t("settings.invitation.labels.programs") }}
          </h2>

          <UiDialog>
            <UiDialogTrigger as-child>
              <UiButton size="sm">
                <Plus />
                {{ $t("settings.invitation.labels.add-program") }}
              </UiButton>
            </UiDialogTrigger>
            <UiDialogContent>
              <UiDialogHeader>
                <UiDialogTitle>{{ $t("settings.invitation.new-program.title") }}</UiDialogTitle>
                <UiDialogDescription>{{ $t("settings.invitation.new-program.description") }}</UiDialogDescription>
              </UiDialogHeader>

              <div class="grid gap-2">
                <UiSelect>
                  <UiSelectTrigger class="w-full">
                    <UiSelectValue :placeholder="$t('settings.invitation.new-program.placeholder')" />
                  </UiSelectTrigger>
                  <UiSelectContent class="max-w-(--reka-select-trigger-width)">
                    <UiSelectItem
                      v-for="program in invpAvailablePrograms"
                      :key="`option-${program.id}`"
                      :value="program.id"
                    >
                      {{ program.name }}
                    </UiSelectItem>
                  </UiSelectContent>
                </UiSelect>
              </div>

              <UiDialogFooter>
                <UiDialogClose as-child>
                  <UiButton variant="secondary">
                    {{ $t("btn.close") }}
                  </UiButton>
                </UiDialogClose>
                <UiButton>
                  {{ $t("btn.add.default") }}
                </UiButton>
              </UiDialogFooter>
            </UiDialogContent>
          </UiDialog>
        </header>

        <div class="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
          <UiCard
            v-for="program in invpSelectedPrograms"
            :key="`selected-${program.id}`"
            class="group/card pt-0 overflow-hidden relative"
          >
            <NuxtImg :src="program.picture" />

            <UiCardHeader>
              <UiCardTitle>{{ program.name }}</UiCardTitle>
            </UiCardHeader>

            <UiTooltip>
              <UiTooltipTrigger as-child>
                <UiButton
                  class="absolute top-3 right-3 opacity-0 group-hover/card:opacity-100"
                  size="icon-sm"
                  variant="outline"
                >
                  <X />
                </UiButton>
              </UiTooltipTrigger>
              <UiTooltipContent side="left">
                <p>{{ $t("settings.invitation.remove-program") }}</p>
              </UiTooltipContent>
            </UiTooltip>
          </UiCard>
        </div>
      </section>
    </main>
  </PageRoot>
</template>
