<script setup lang="ts">
import { Plus } from "lucide-vue-next";
import type { Nullable } from "~/types/primitives/objects";

const store = useCompanyStore();
const { storeSettings, storeAvailablePrograms, loading: _loading } = storeToRefs(store);
const loading = computed(() => _loading.value.saving.price.includes(selectedProgram.value?.id ?? -1));

const open = ref<boolean>(false);
const selectedProgramId = ref<Nullable<number>>(storeAvailablePrograms.value[0]?.id ?? null);
const selectedProgram = computed(() => selectedProgramId.value ? (storeSettings.value?.programs.find(p => p.id === selectedProgramId.value) ?? null) : null);

async function updateProgram() {
  if (!selectedProgramId.value || !selectedProgram.value) return;

  selectedProgram.value.catalogue.active = true;
  await nextTick();
  await store.saveProgramPrice(selectedProgram.value);
  open.value = false;
}
</script>

<template>
  <UiDialog v-model:open="open">
    <UiDialogTrigger as-child>
      <UiButton size="sm">
        <Plus />
        {{ $t("settings.shop.labels.add-program") }}
      </UiButton>
    </UiDialogTrigger>
    <UiDialogContent class="overflow-hidden">
      <UiDialogHeader>
        <UiDialogTitle>{{ $t("settings.shop.dialogs.new-program.title") }}</UiDialogTitle>
        <UiDialogDescription>{{ $t("settings.shop.dialogs.new-program.description") }}</UiDialogDescription>
      </UiDialogHeader>

      <div class="grid gap-2 overflow-hidden">
        <UiSelect
          v-model="selectedProgramId"
          :disabled="loading"
        >
          <UiSelectTrigger class="min-w-0! w-full!">
            <UiSelectValue :placeholder="$t('settings.shop.dialogs.new-program.placeholder')" />
          </UiSelectTrigger>
          <UiSelectContent class="max-w-(--reka-select-trigger-width)">
            <UiSelectItem
              v-for="program in storeAvailablePrograms"
              :key="`option-${program.id}`"
              :value="program.id"
              class="line-clamp-2!"
            >
              {{ program.name }}
            </UiSelectItem>
          </UiSelectContent>
        </UiSelect>
      </div>

      <UiDialogFooter>
        <UiDialogClose as-child>
          <UiButton
            variant="secondary"
            :disabled="loading"
          >
            {{ $t("btn.close") }}
          </UiButton>
        </UiDialogClose>
        <UiButton
          :disabled="!selectedProgramId || loading"
          @click="updateProgram"
        >
          {{ $t("btn.add.default") }}
          <UiSpinner v-if="loading" />
        </UiButton>
      </UiDialogFooter>
    </UiDialogContent>
  </UiDialog>
</template>
