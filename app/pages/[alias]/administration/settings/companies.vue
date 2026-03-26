<script setup lang="ts">
import PageRoot from "~/components/composing/PageRoot.vue";
import { Plus, Search, X, Archive } from "lucide-vue-next";
import ConditionEditDialog from "~/components/administration/settings/conditions/ConditionEditDialog.vue";
import { columns } from "~/components/administration/settings/companies";

const store = useCompanyStore();
const { companies: _companies, loading } = storeToRefs(store);

const archived = ref<boolean>(false);
const companies = computed(() => _companies.value.filter(c => c.active === !archived.value));

const { search, results, clear } = useSearch(companies, "name", "alias");

store.loadCompanies();
</script>

<template>
  <PageRoot
    name="settings.administration.branding"
    class="grid gap-4"
  >
    <header class="flex items-center justify-between">
      <h1 class="text-xl font-bold">
        {{ $t("settings.companies.title") }}
      </h1>

      <div class="flex items-center gap-2">
        <div class="relative">
          <UiInput
            v-model="search"
            class="pl-8"
            :placeholder="$t('labels.search')"
          />
          <UiButton
            v-if="search.length"
            variant="ghost"
            size="icon-sm"
            class="size-6 rounded-full absolute top-1.5 left-1.5"
            @click="clear"
          >
            <X />
          </UiButton>
          <Search
            v-else
            class="size-4 absolute top-2.5 left-2.5 text-muted-foreground"
          />
        </div>
        <UiTooltip>
          <UiTooltipTrigger as-child>
            <UiButton
              size="icon"
              :variant="archived ? 'secondary' : 'outline'"
              @click="archived = !archived"
            >
              <Archive />
            </UiButton>
          </UiTooltipTrigger>
          <UiTooltipContent>
            <p>{{ $t("labels.archives") }}</p>
          </UiTooltipContent>
        </UiTooltip>
        <ConditionEditDialog trigger>
          <UiButton>
            <Plus />
            {{ $t("btn.new.company") }}
          </UiButton>
        </ConditionEditDialog>
      </div>
    </header>

    <main>
      <div
        v-if="loading.settings.companies"
        class="h-24 grid place-items-center"
      >
        <UiSpinner />
      </div>
      <UiDataTable
        v-else
        :columns="columns()"
        :data="results"
      />
    </main>
  </PageRoot>
</template>
