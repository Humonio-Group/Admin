<script setup lang="ts">
import { Plus } from "lucide-vue-next";
import PageRoot from "~/components/composing/PageRoot.vue";

const store = useCompanyStore();
const { terms, loading } = storeToRefs(store);

store.loadTerms();
</script>

<template>
  <PageRoot name="administration.settings.conditions">
    <header class="flex items-center justify-between">
      <h1 class="text-xl font-bold">
        {{ $t("settings.conditions.title") }}
      </h1>
      <UiButton v-if="terms.length">
        <Plus />
        {{ $t("btn.new.condition") }}
      </UiButton>
    </header>

    <main>
      <div
        v-if="loading.settings.terms"
        class="w-full h-24 grid place-items-center"
      >
        <UiSpinner />
      </div>
      <template v-else-if="terms.length">
        terms display
      </template>
      <UiEmpty v-else>
        <UiEmptyHeader>
          <UiEmptyTitle>{{ $t("settings.conditions.empty.title") }}</UiEmptyTitle>
          <UiEmptyDescription>{{ $t("settings.conditions.empty.description") }}</UiEmptyDescription>
          <UiButton>
            <Plus />
            {{ $t("btn.new.condition") }}
          </UiButton>
        </UiEmptyHeader>
      </UiEmpty>
    </main>
  </PageRoot>
</template>
