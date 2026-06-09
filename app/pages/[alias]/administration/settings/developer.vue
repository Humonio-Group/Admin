<script setup lang="ts">
import PageRoot from "~/components/composing/PageRoot.vue";
import { watchOnce, useClipboard } from "@vueuse/core";
import { Copy, Check, RefreshCw } from "lucide-vue-next";

const store = useCompanyStore();
const { developerSettings, loading: _loading } = storeToRefs(store);
const loading = computed(() => _loading.value.settings.developer);
const refreshing = computed(() => _loading.value.settings.refreshApiToken);
const saving = computed(() => _loading.value.saving.developer);

const { copy, copied } = useClipboard();

const webhook = ref<string>("");

watchOnce(developerSettings, (val) => {
  if (!val) return;

  webhook.value = val.webhook ?? "";
});

store.loadDeveloperSettings();
</script>

<template>
  <PageRoot
    name="settings.administration.developer"
    class="pt-2 flex flex-col gap-6 pb-2"
  >
    <header class="flex items-center justify-between gap-4">
      <h1 class="text-xl font-bold">
        {{ $t("settings.developer.title") }}
      </h1>

      <UiButton
        :disabled="saving"
        @click="store.saveDeveloperSettings(webhook)"
      >
        {{ $t("btn.save") }}
        <UiSpinner v-if="saving" />
      </UiButton>
    </header>

    <main
      v-if="loading"
      class="h-24 grid place-items-center"
    >
      <UiSpinner />
    </main>
    <main
      v-else-if="developerSettings"
      class="flex flex-col gap-8"
    >
      <section class="flex flex-col gap-4">
        <div class="flex items-center justify-between gap-6">
          <UiLabel>{{ $t("settings.developer.labels.id") }}</UiLabel>
          <p class="text-sm font-medium">
            {{ developerSettings.id }}
          </p>
        </div>

        <div class="grid gap-2">
          <UiLabel>
            {{ $t("settings.developer.labels.auth-token") }}
          </UiLabel>
          <div class="flex items-center gap-1">
            <UiInput
              :model-value="developerSettings.token"
              type="password"
              disabled
            />
            <UiButton
              variant="outline"
              size="icon"
              @click="copy(developerSettings.token)"
            >
              <Check v-if="copied" />
              <Copy v-else />
            </UiButton>
            <UiButton
              variant="outline"
              size="icon"
              :disabled="refreshing"
              @click="store.refreshToken"
            >
              <RefreshCw :class="{ 'animate-spin': refreshing }" />
            </UiButton>
          </div>
        </div>

        <div class="grid gap-2">
          <UiLabel>
            {{ $t("settings.developer.labels.webhook") }}
          </UiLabel>
          <UiInput
            v-model="webhook"
            :placeholder="$t('settings.developer.placeholders.webhook')"
          />
        </div>

        <p class="text-sm text-muted-foreground">
          <i18n-t keypath="settings.developer.warning">
            <template #documentation>
              <NuxtLink
                to="https://staging-api2.qigu.app/api/documentation"
                target="_blank"
                class="underline-offset-4 text-primary hover:underline"
                external
              >
                {{ $t("settings.developer.documentation") }}
              </NuxtLink>
            </template>
          </i18n-t>
        </p>
      </section>
    </main>
  </PageRoot>
</template>
