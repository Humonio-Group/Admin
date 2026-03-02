<script setup lang="ts">
import PageRoot from "~/components/composing/PageRoot.vue";
import { Plus } from "lucide-vue-next";
import ConditionEditDialog from "~/components/administration/settings/conditions/ConditionEditDialog.vue";
import { columns } from "~/components/administration/settings/locations";

const store = useCompanyStore();
const { locations, loading } = storeToRefs(store);

store.loadLocations();
</script>

<template>
  <PageRoot
    name="administration.settings.locations"
    class="grid gap-4"
  >
    <header class="flex items-center justify-between">
      <h1 class="text-xl font-bold">
        {{ $t("settings.locations.title") }}
      </h1>
      <ConditionEditDialog trigger>
        <UiButton>
          <Plus />
          {{ $t("btn.new.location") }}
        </UiButton>
      </ConditionEditDialog>
    </header>

    <main>
      <div
        v-if="loading.settings.locations"
        class="h-24 grid place-items-center"
      >
        <UiSpinner />
      </div>
      <UiDataTable
        v-else
        :columns="columns()"
        :data="locations"
      />
    </main>
  </PageRoot>
</template>
