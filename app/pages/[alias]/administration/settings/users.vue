<script setup lang="ts">
import PageRoot from "~/components/composing/PageRoot.vue";
import { Plus, X, Search } from "lucide-vue-next";
import { columns } from "~/components/administration/settings/users";
import UserDialog from "~/components/administration/settings/users/UserDialog.vue";
import UsersPagination from "~/components/administration/settings/users/UsersPagination.vue";

const store = useCompanyStore();
const { users, loading, perPage, totalUsers } = storeToRefs(store);

const { search, results, clear } = useSearch(users, "name.full", "email");

const { activePage } = usePagination(async page => await store.loadUsers(page));
provide("activePage", activePage);
</script>

<template>
  <PageRoot
    name="administration.settings.users"
    class="grid gap-4"
  >
    <header class="flex items-center justify-between">
      <h1 class="text-xl font-bold">
        {{ $t("settings.users.title") }}
      </h1>
      <div class="flex items-center gap-1">
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
        <UserDialog trigger>
          <UiButton>
            <Plus />
            {{ $t("btn.new.user") }}
          </UiButton>
        </UserDialog>
      </div>
    </header>

    <main>
      <div
        v-if="loading.settings.users"
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

    <footer v-if="!loading.settings.users || (totalUsers >= 0 && totalUsers > perPage)">
      <UsersPagination :active-page="activePage" />
    </footer>
  </PageRoot>
</template>
