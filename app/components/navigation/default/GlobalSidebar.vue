<script setup lang="ts">
import { Search } from "lucide-vue-next";
import GlobalSidebarLink from "./composed/GlobalSidebarLink.vue";
import UserMenu from "./elements/UserMenu.vue";
import CompanySelector from "./elements/CompanySelector.vue";
import { type DefaultSidebarProps, sidebarContent } from "~/components/navigation/default/index";

defineProps<DefaultSidebarProps>();

const groups = sidebarContent;
</script>

<template>
  <div>
    <UiSidebar
      variant="floating"
      collapsible="icon"
    >
      <UiSidebarHeader>
        <CompanySelector />
      </UiSidebarHeader>
      <UiSidebarContent>
        <UiSidebarGroup v-if="showSearch">
          <UiSidebarMenu>
            <UiSidebarMenuItem>
              <UiSidebarMenuButton disabled>
                <Search />
                {{ $t("labels.search") }}

                <UiKbd class="ml-auto">
                  ⌘k
                </UiKbd>
              </UiSidebarMenuButton>
            </UiSidebarMenuItem>
          </UiSidebarMenu>
        </UiSidebarGroup>

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
  </div>
</template>
