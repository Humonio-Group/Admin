<script setup lang="ts">
import PageRoot from "~/components/composing/PageRoot.vue";
import { Plus, Search, X, Archive } from "lucide-vue-next";
import { columns } from "~/components/administration/settings/companies";
import PaginationProvider from "~/components/primitives/PaginationProvider.vue";
import CompanyDialog from "~/components/administration/settings/companies/CompanyDialog.vue";

const store = useCompanyStore();
const { companies: companies, loading, perPage, totalCompanies } = storeToRefs(store);

const { query } = useRoute();
const archived = ref<boolean>(query.acrhived === "true");
watch(archived, (val) => {
  navigateTo({
    query: {
      ...query,
      archived: val.toString(),
    },
    replace: true,
  });
  reload();
});

const { search, results, clear } = useSearch(companies, "name", "alias");

const { activePage, reload } = usePagination(async page => await store.loadCompanies(page, archived.value));
provide("activePage", activePage);
</script>

<template>
  <PageRoot
    name="settings.administration.companies"
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
        <CompanyDialog trigger>
          <UiButton>
            <Plus />
            {{ $t("btn.new.company") }}
          </UiButton>
        </CompanyDialog>
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

    <footer v-if="!loading.settings.companies && totalCompanies >= 0 && totalCompanies > perPage">
      <PaginationProvider
        :total="totalCompanies"
        :per-page="perPage"
      />
    </footer>
  </PageRoot>
</template>
