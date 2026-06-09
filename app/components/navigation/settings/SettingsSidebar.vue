<script setup lang="ts">
import { ArrowLeft } from "lucide-vue-next";
import { sidebarContent } from "~/components/navigation/settings/index";
import GlobalSidebarLink from "~/components/navigation/default/composed/GlobalSidebarLink.vue";
import UserMenu from "~/components/navigation/default/elements/UserMenu.vue";
import { useSidebar } from "~/components/ui/sidebar";

const { company } = storeToRefs(useCompanyStore());
const alias = computed(() => company.value?.alias || "");

const { open } = useSidebar();

const groups = sidebarContent;
</script>

<template>
  <UiSidebar collapsible="icon">
    <UiSidebarHeader class="gap-0">
      <UiButton
        variant="ghost"
        :size="open ? 'sm' : 'icon-sm'"
        :class="{ 'w-min': open }"
        as-child
      >
        <NuxtLinkLocale :to="`/${alias}`">
          <ArrowLeft />
          <template v-if="open">
            {{ $t("btn.back") }}
          </template>
        </NuxtLinkLocale>
      </UiButton>
      <h1
        v-if="open"
        class="text-xl font-bold"
      >
        {{ $t("settings.title") }}
      </h1>
    </UiSidebarHeader>

    <UiSidebarContent>
      <UiSidebarGroup
        v-for="group in groups"
        :key="group.label"
      >
        <UiSidebarGroupLabel v-if="group.label">
          {{ group.label }}
        </UiSidebarGroupLabel>
        <UiSidebarMenu>
          <GlobalSidebarLink
            v-for="(item, index) in group.children"
            :key="item.label"
            :index
            :item
          />
        </UiSidebarMenu>
      </UiSidebarGroup>
    </UiSidebarContent>

    <UiSidebarFooter>
      <UserMenu />
    </UiSidebarFooter>
  </UiSidebar>
</template>

<style scoped>

</style>
