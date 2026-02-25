<script setup lang="ts">
import LayoutRoot from "~/components/composing/LayoutRoot.vue";
import GlobalSidebar from "~/components/navigation/default/GlobalSidebar.vue";
import GettingHelp from "~/components/support/GettingHelp.vue";
</script>

<template>
  <LayoutRoot>
    <UiSidebarProvider>
      <GlobalSidebar show-search />

      <UiSidebarInset class="px-4 md:pl-2 flex flex-col max-h-dvh! overflow-y-auto">
        <header class="shrink-0 sticky top-0 py-4 flex items-center gap-2 bg-background z-50">
          <UiSidebarTrigger />

          <!-- todo: breadcrumbs - loic -->

          <div class="ml-auto flex items-center">
            <GettingHelp />
          </div>
        </header>

        <main class="p-2 pt-0 flex-1 flex flex-col min-h-0">
          <NuxtPage />
        </main>
      </UiSidebarInset>
    </UiSidebarProvider>
  </LayoutRoot>
</template>
