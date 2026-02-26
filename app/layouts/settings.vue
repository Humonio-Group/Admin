<script setup lang="ts">
import LayoutRoot from "~/components/composing/LayoutRoot.vue";
import SettingsSidebar from "~/components/navigation/settings/SettingsSidebar.vue";
</script>

<template>
  <LayoutRoot name="settings">
    <UiSidebarProvider>
      <SettingsSidebar />

      <UiSidebarInset>
        <main>
          <NuxtPage />
        </main>
      </UiSidebarInset>
    </UiSidebarProvider>
  </LayoutRoot>
</template>
