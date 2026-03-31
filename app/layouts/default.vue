<script setup lang="ts">
import LayoutRoot from "~/components/composing/LayoutRoot.vue";
import GlobalSidebar from "~/components/navigation/default/GlobalSidebar.vue";
import AppBreadcrumb from "~/components/navigation/AppBreadcrumb.vue";

const { breadcrumb } = storeToRefs(useNavigationStore());
</script>

<template>
  <LayoutRoot>
    <UiSidebarProvider>
      <GlobalSidebar show-search />

      <UiSidebarInset class="flex flex-col max-h-dvh! overflow-y-auto">
        <header class="shrink-0 sticky top-0 h-12 pl-2 pr-4 border-b flex items-center gap-2 bg-background z-50">
          <UiSidebarTrigger />

          <AppBreadcrumb
            v-if="breadcrumb.length"
            :items="breadcrumb"
          />
        </header>

        <main class="p-4 flex-1 flex flex-col min-h-0 *:pb-4">
          <NuxtPage />
        </main>
      </UiSidebarInset>
    </UiSidebarProvider>
  </LayoutRoot>
</template>
