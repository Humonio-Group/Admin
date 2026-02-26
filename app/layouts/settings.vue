<script setup lang="ts">
import LayoutRoot from "~/components/composing/LayoutRoot.vue";
import SettingsSidebar from "~/components/navigation/settings/SettingsSidebar.vue";
</script>

<template>
  <LayoutRoot name="settings">
    <UiSidebarProvider>
      <SettingsSidebar />

      <UiSidebarInset class="px-4 pb-2">
        <header class="h-12 flex items-center justify-between gap-2">
          <UiSidebarTrigger />
        </header>

        <main class="px-2">
          <NuxtPage />
        </main>
      </UiSidebarInset>
    </UiSidebarProvider>
  </LayoutRoot>
</template>
