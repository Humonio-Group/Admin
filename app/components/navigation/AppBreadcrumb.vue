<script setup lang="ts">
import { ChevronDown } from "lucide-vue-next";

export interface BreadcrumbLink {
  label: string;
  to: string;
}

export interface BreadcrumbItem {
  label: string;
  to?: string;
  links?: BreadcrumbLink[];
}

defineProps<{
  items: BreadcrumbItem[];
}>();

const { company } = useCompanyStore();
const parsePath = (path: string) => path.startsWith("/") ? path.substring(1) : path;
</script>

<template>
  <UiBreadcrumb>
    <UiBreadcrumbList>
      <template
        v-for="(item, index) in items"
        :key="index"
      >
        <UiBreadcrumbItem>
          <!-- Last item: plain text, no link -->
          <UiBreadcrumbPage v-if="index === items.length - 1">
            {{ item.label }}
          </UiBreadcrumbPage>

          <!-- Multiple links: dropdown -->
          <template v-else-if="item.links?.length">
            <UiDropdownMenu>
              <UiDropdownMenuTrigger class="flex items-center gap-1 hover:text-foreground transition-colors">
                {{ item.label }}
                <ChevronDown class="size-3.5" />
              </UiDropdownMenuTrigger>
              <UiDropdownMenuContent align="start">
                <UiDropdownMenuItem
                  v-for="link in item.links"
                  :key="link.to"
                  as-child
                >
                  <NuxtLinkLocale :to="`/${company?.alias}/${parsePath(link.to)}`">
                    {{ link.label }}
                  </NuxtLinkLocale>
                </UiDropdownMenuItem>
              </UiDropdownMenuContent>
            </UiDropdownMenu>
          </template>

          <!-- Single link -->
          <UiBreadcrumbLink
            v-else
            as-child
          >
            <NuxtLinkLocale :to="`/${company?.alias}/${parsePath(item.to!)}`">
              {{ item.label }}
            </NuxtLinkLocale>
          </UiBreadcrumbLink>
        </UiBreadcrumbItem>

        <UiBreadcrumbSeparator v-if="index < items.length - 1" />
      </template>
    </UiBreadcrumbList>
  </UiBreadcrumb>
</template>
