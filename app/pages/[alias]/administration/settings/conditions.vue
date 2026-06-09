<script setup lang="ts">
import { Plus } from "lucide-vue-next";
import PageRoot from "~/components/composing/PageRoot.vue";
import { columns } from "~/components/administration/settings/conditions";
import ConditionEditDialog from "~/components/administration/settings/conditions/ConditionEditDialog.vue";

const store = useCompanyStore();
const { terms, loading } = storeToRefs(store);

store.loadTerms();
</script>

<template>
  <PageRoot
    name="administration.settings.conditions"
    class="grid gap-4"
  >
    <header class="flex items-center justify-between">
      <h1 class="text-xl font-bold">
        {{ $t("settings.conditions.title") }}
      </h1>
      <ConditionEditDialog trigger>
        <UiButton>
          <Plus />
          {{ $t("btn.new.condition") }}
        </UiButton>
      </ConditionEditDialog>
    </header>

    <main>
      <div
        v-if="loading.settings.terms"
        class="w-full h-24 grid place-items-center"
      >
        <UiSpinner />
      </div>
      <UiDataTable
        v-else
        :columns="columns()"
        :data="terms"
      />
    </main>
  </PageRoot>
</template>
