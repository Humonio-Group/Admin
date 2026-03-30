<script setup lang="ts">
import PageRoot from "~/components/composing/PageRoot.vue";
import { Save, Eye, EyeOff } from "lucide-vue-next";
import type { CompanyLRSSettings } from "~/types/entities/company";

const store = useCompanyStore();
const { lrsSettings, loading: _loading } = storeToRefs(store);
const loading = computed(() => _loading.value.settings.lrs);
const saving = computed(() => _loading.value.saving.lrs);

const settings = ref<CompanyLRSSettings>({
  active: false,
  url: "",
  mode: 1,
  auth: {
    login: "",
    password: "",
  },
});
watch(lrsSettings, (val) => {
  if (!val) return;
  settings.value = { ...val };
});
const showPassword = ref<boolean>(false);

async function toggleActive(state: boolean) {
  settings.value.active = state;
  await store.saveLRSSettings(settings.value);
}

store.loadLRSSettings();
</script>

<template>
  <PageRoot
    name="settings.administration.data-storage"
    class="pt-2 flex flex-col gap-6 pb-2"
  >
    <header class="flex items-center justify-between gap-4">
      <h1 class="text-xl font-bold">
        {{ $t("settings.sso.title") }}
      </h1>

      <div class="flex items-center gap-1">
        <UiButton
          :disabled="saving"
          variant="outline"
          size="icon"
          @click="store.saveLRSSettings(settings)"
        >
          <UiSpinner v-if="saving" />
          <Save v-else />
        </UiButton>
        <UiButton
          :variant="settings.active ? 'default' : 'secondary'"
          @click="toggleActive(!settings.active)"
        >
          {{ $t(`labels.state.${settings.active ? 'enabled' : 'disabled'}`) }}
        </UiButton>
      </div>
    </header>

    <main
      v-if="loading"
      class="h-24 grid place-items-center"
    >
      <UiSpinner />
    </main>
    <main
      v-else-if="lrsSettings"
      class="grid gap-4 @xl:grid-cols-2"
    >
      <div class="grid gap-2">
        <UiLabel for="url">
          {{ $t("settings.lrs.fields.url.label") }}
        </UiLabel>
        <UiInput
          id="url"
          v-model="settings.url"
          :placeholder="$t('settings.lrs.fields.url.placeholder')"
        />
      </div>

      <div class="grid gap-2">
        <UiLabel for="mode">
          {{ $t("settings.lrs.fields.mode.label") }}
        </UiLabel>
        <UiSelect
          id="mode"
          v-model="settings.mode"
        >
          <UiSelectTrigger class="w-full">
            <UiSelectValue />
          </UiSelectTrigger>
          <UiSelectContent>
            <UiSelectItem :value="3">
              Pas d'authentification
            </UiSelectItem>
            <UiSelectItem :value="1">
              Authentification classique
            </UiSelectItem>
          </UiSelectContent>
        </UiSelect>
      </div>

      <div class="grid gap-2">
        <UiLabel for="login">
          {{ $t("settings.lrs.fields.login.label") }}
        </UiLabel>
        <UiInput
          id="login"
          v-model="settings.auth!.login"
          :disabled="settings.mode !== 1"
          :placeholder="$t('settings.lrs.fields.login.placeholder')"
        />
      </div>

      <div class="grid gap-2">
        <UiLabel for="password">
          {{ $t("settings.lrs.fields.password.label") }}
        </UiLabel>
        <div class="relative">
          <UiInput
            id="password"
            v-model="settings.auth!.password"
            class="pr-9"
            :type="showPassword ? 'text' : 'password'"
            :disabled="settings.mode !== 1"
            :placeholder="$t('settings.lrs.fields.password.placeholder')"
          />
          <UiButton
            v-if="settings.mode === 1"
            variant="ghost"
            size="sm"
            class="absolute top-1.5 right-1.5 size-6 text-muted-foreground"
            @click="showPassword = !showPassword"
          >
            <EyeOff v-if="showPassword" />
            <Eye v-else />
          </UiButton>
        </div>
      </div>
    </main>
  </PageRoot>
</template>
