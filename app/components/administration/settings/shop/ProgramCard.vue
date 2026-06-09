<script setup lang="ts">
import { X } from "lucide-vue-next";
import type { CompanyStoreProgram } from "~/types/entities/company";
import { useDebounceFn } from "@vueuse/core";

const store = useCompanyStore();
const { loading: _loading } = storeToRefs(store);
const loading = computed(() => _loading.value.saving.price.includes(program.value.id));

const program = defineModel<CompanyStoreProgram>("program", { required: true });
const price = computed(() => program.value.catalogue.price);

watch(price, useDebounceFn(() => {
  store.saveProgramPrice(program.value);
}, 300));

async function removeProgram() {
  program.value.catalogue.active = false;
  program.value.catalogue.price = 0;

  await store.saveProgramPrice(program.value);
}
</script>

<template>
  <UiCard class="group/card pt-0 overflow-hidden relative">
    <NuxtImg
      :src="program.picture"
      class="aspect-video object-cover"
    />

    <UiCardHeader>
      <UiCardTitle class="line-clamp-2">
        {{ program.name }}
      </UiCardTitle>
    </UiCardHeader>

    <UiCardFooter class="mt-auto">
      <UiNumberField
        :id="`price-${program.id}`"
        v-model="program.catalogue.price"
        class="w-full"
        :default-value="0"
        :min="0"
        :step="0.01"
        :format-options="{
          style: 'currency',
          currency: 'EUR',
          currencyDisplay: 'code',
          currencySign: 'accounting',
          minimumFractionDigits: 2,
        }"
        :disabled="loading"
      >
        <UiNumberFieldContent>
          <UiNumberFieldInput />
        </UiNumberFieldContent>
      </UiNumberField>
    </UiCardFooter>

    <UiTooltip>
      <UiTooltipTrigger as-child>
        <UiButton
          class="absolute top-3 right-3 opacity-0 group-hover/card:opacity-100"
          size="icon-sm"
          variant="outline"
          @click="removeProgram"
        >
          <X />
        </UiButton>
      </UiTooltipTrigger>
      <UiTooltipContent side="left">
        <p>{{ $t("settings.invitation.remove-program") }}</p>
      </UiTooltipContent>
    </UiTooltip>
  </UiCard>
</template>

<style scoped>

</style>
