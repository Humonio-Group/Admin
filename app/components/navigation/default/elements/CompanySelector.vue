<script setup lang="ts">
import { ChevronsUpDown, User, Play, ListChecks, Form, Airplay } from "lucide-vue-next";
import { useSidebar } from "~/components/ui/sidebar";
import { UserRole } from "~/types/entities/user";

const { isMobile } = useSidebar();
const { company } = storeToRefs(useCompanyStore());
const { availableCompanies } = storeToRefs(useUserStore());

const { public: config } = useRuntimeConfig();
const alias = computed(() => company.value?.alias || "");

const companies = computed(() => availableCompanies.value.filter(c => c.alias !== company.value?.alias));
</script>

<template>
  <UiSidebarMenu>
    <UiDropdownMenu>
      <UiSidebarMenuItem>
        <UiDropdownMenuTrigger as-child>
          <UiSidebarMenuButton size="lg">
            <UiAvatar class="rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
              <UiAvatarImage
                v-if="company!.icon"
                :src="company!.icon"
              />
              <UiAvatarFallback class="text-xs font-medium">
                {{ company!.name.substring(0, 2) }}
              </UiAvatarFallback>
            </UiAvatar>

            <div class="flex flex-col truncate">
              <p class="font-semibold">
                {{ company!.name }}
              </p>
              <span class="text-xs text-muted-foreground leading-none">
                {{ $t("labels.plan.free") }} <!-- todo: workspace plan - loic -->
              </span>
            </div>

            <ChevronsUpDown class="ml-auto" />
          </UiSidebarMenuButton>
        </UiDropdownMenuTrigger>
      </UiSidebarMenuItem>

      <UiDropdownMenuContent
        class="overflow-y-auto"
        :side="isMobile ? 'bottom' : 'right'"
        :align="isMobile ? 'center' : 'start'"
      >
        <UiDropdownMenuGroup class="flex items-center gap-2 p-1">
          <UiAvatar class="rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <UiAvatarImage
              v-if="company!.icon"
              :src="company!.icon"
            />
            <UiAvatarFallback>{{ company!.name.substring(0, 2) }}</UiAvatarFallback>
          </UiAvatar>

          <div class="grid">
            <p class="text-sm font-semibold">
              {{ company!.name }}
            </p>
            <span class="text-xs text-muted-foreground">{{ $t("labels.plan.free") }}</span> <!-- todo: bind plan - loic -->
          </div>
        </UiDropdownMenuGroup>

        <UiDropdownMenuGroup v-if="useGrantAccess([UserRole.PARTICIPANT])">
          <NuxtLink
            :to="`${config.urls.gps.replaceAll('{alias}', alias)}`"
            external
          >
            <UiDropdownMenuItem>
              <User />
              Accéder à l'interface participant
            </UiDropdownMenuItem>
          </NuxtLink>
        </UiDropdownMenuGroup>

        <template v-if="company!.drive">
          <UiDropdownMenuSeparator />

          <UiDropdownMenuGroup>
            <UiDropdownMenuLabel>
              {{ $t("labels.other-products") }}
            </UiDropdownMenuLabel>

            <UiDropdownMenuItem>
              <Play />
              Qigu Play
            </UiDropdownMenuItem>
            <UiDropdownMenuItem>
              <ListChecks />
              Qigu Check
            </UiDropdownMenuItem>
            <UiDropdownMenuItem>
              <Form />
              Qigu Rate
            </UiDropdownMenuItem>
            <UiDropdownMenuItem>
              <Airplay />
              Qigu Meet
            </UiDropdownMenuItem>
          </UiDropdownMenuGroup>
        </template>

        <template v-if="companies.length">
          <UiDropdownMenuSeparator />

          <UiDropdownMenuGroup>
            <UiDropdownMenuLabel>
              {{ $t("labels.other-workspaces") }}
            </UiDropdownMenuLabel>

            <NuxtLink
              v-for="comp in companies"
              :key="comp.alias"
              :to="config.urls.product.replaceAll('{alias}', comp.alias)"
              external
            >
              <UiDropdownMenuItem>
                <UiAvatar class="size-6 rounded-sm">
                  <UiAvatarImage
                    v-if="comp.icon"
                    :src="comp.icon"
                  />
                  <UiAvatarFallback class="text-xs bg-sidebar-accent text-sidebar-accent-foreground">
                    {{ comp.name.substring(0, 2) }}
                  </UiAvatarFallback>
                </UiAvatar>
                {{ comp.name }}
              </UiDropdownMenuItem>
            </NuxtLink>
          </UiDropdownMenuGroup>
        </template>
      </UiDropdownMenuContent>
    </UiDropdownMenu>
  </UiSidebarMenu>
</template>
