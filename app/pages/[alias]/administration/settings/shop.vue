<script setup lang="ts">
import PageRoot from "~/components/composing/PageRoot.vue";
import ProgramCard from "~/components/administration/settings/shop/ProgramCard.vue";
import AddProgramDialog from "~/components/administration/settings/shop/AddProgramDialog.vue";
import AdvancedSettingsDialog from "~/components/administration/settings/shop/AdvancedSettingsDialog.vue";

const store = useCompanyStore();
const { storeSettings, storeActivePrograms, loading: _loading } = storeToRefs(store);
const loading = computed(() => _loading.value.settings.shop);

store.loadShopSettings();

async function toggleState(state: boolean) {
  if (!storeSettings.value) return;

  await store.saveShopSettings({
    ...storeSettings.value,
    active: state,
  });
}
</script>

<template>
  <PageRoot
    name="settings.administration.shop"
    class="pt-2 flex flex-col gap-6 pb-2"
  >
    <header class="flex items-center justify-between gap-4">
      <h1 class="text-xl font-bold">
        {{ $t("settings.shop.title") }}
      </h1>

      <div
        v-if="storeSettings"
        class="flex items-center gap-1"
      >
        <AdvancedSettingsDialog />

        <UiTooltip v-if="storeSettings.active">
          <UiTooltipTrigger as-child>
            <UiButton @click="toggleState(false)">
              {{ $t("labels.state.enabled", 2) }}
            </UiButton>
          </UiTooltipTrigger>
          <UiTooltipContent side="bottom">
            <p>{{ $t("settings.shop.state.disable") }}</p>
          </UiTooltipContent>
        </UiTooltip>
        <UiTooltip v-else>
          <UiTooltipTrigger as-child>
            <UiButton
              variant="secondary"
              @click="toggleState(true)"
            >
              {{ $t("labels.state.disabled", 2) }}
            </UiButton>
          </UiTooltipTrigger>
          <UiTooltipContent side="bottom">
            <p>{{ $t("settings.shop.state.enable") }}</p>
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
      <section class="flex flex-col gap-4">
        <header class="flex items-center justify-between gap-4">
          <h2 class="text-lg font-semibold">
            {{ $t("settings.shop.labels.catalogue") }}
          </h2>

          <div class="flex items-center gap-1">
            <AddProgramDialog />
          </div>
        </header>

        <div class="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
          <ProgramCard
            v-for="program in storeActivePrograms"
            :key="`selected-${program.id}`"
            :program
          />
        </div>
      </section>
    </main>
  </PageRoot>
</template>
