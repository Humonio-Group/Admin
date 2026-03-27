<script setup lang="ts">
import PageRoot from "~/components/composing/PageRoot.vue";
import { Plus, Save } from "lucide-vue-next";
import { watchOnce } from "@vueuse/core";
import { type CompanySSOSettings, SSOAlgorithms, SSOUserFields } from "~/types/entities/company";
import { columns } from "~/components/administration/settings/sso";
import DataSection from "~/components/administration/settings/sso/DataSection.vue";

const store = useCompanyStore();
const { ssoSettings, loading: _loading } = storeToRefs(store);
const loading = computed(() => _loading.value.settings.sso);
const saving = computed(() => _loading.value.saving.sso);

const ssoUrl = (path: string) => `${useRuntimeConfig().public.urls.sso.replace(/https?:\/\//g, "").replaceAll("{alias}", settings.value!.alias)}/${path.startsWith("/") ? path.substring(1) : path}`;

const settings = ref<CompanySSOSettings>({
  active: false,
  certificate: "",
  alias: "",
  issuer: "",
  slo: {
    endpoint: "",
  },
  saml: {
    endpoint: "",
    signatureAlgorithm: "SHA-256",
  },
  mapping: [],
});

watchOnce(ssoSettings, (val) => {
  if (!val) return;
  settings.value = { ...val };
});

function deleteMappingEntry(key: string) {
  settings.value = {
    ...settings.value,
    mapping: settings.value.mapping.filter(e => e.key !== key),
  };
}
async function toggleActive(state: boolean) {
  settings.value = {
    ...settings.value,
    active: state,
  };
  await nextTick();
  await store.saveSSOSettings(settings.value);
}

store.loadSSOSettings();
</script>

<template>
  <PageRoot
    name="settings.administration.developer"
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
          @click="store.saveSSOSettings(settings)"
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
      v-else-if="ssoSettings"
      class="flex flex-col gap-8"
    >
      <section class="flex flex-col gap-4">
        <div class="grid gap-2">
          <UiLabel for="alias">
            {{ $t("settings.sso.labels.alias") }}
          </UiLabel>
          <UiInput
            id="alias"
            v-model="settings.alias"
          />
        </div>

        <div class="grid gap-1 text-sm text-muted-foreground">
          <DataSection
            :alias="settings.alias"
            label="ID de l’entité/Audience SAML :"
            path="/metadata"
          />
          <DataSection
            :alias="settings.alias"
            label="URL du consommateur d’assertions :"
            path="/acs"
          />
          <DataSection
            :alias="settings.alias"
            label="URL de déconnexion unique (SLO) :"
            path="/sls"
          />
          <DataSection
            :alias="settings.alias"
            label="URL de connexion unique (SSO) :"
            path="/auth"
          />
        </div>
      </section>
      <section class="flex flex-col gap-4">
        <div class="grid gap-2">
          <UiLabel for="issuer">
            {{ $t("settings.sso.labels.issuer") }}
          </UiLabel>
          <UiInput
            id="issuer"
            v-model="settings.issuer"
          />
        </div>

        <div class="grid @2xl:grid-cols-2 gap-4">
          <div class="grid gap-2">
            <UiLabel for="saml-endpoint">
              {{ $t("settings.sso.labels.saml.endpoint") }}
            </UiLabel>
            <UiInput
              id="saml-endpoint"
              v-model="settings.saml.endpoint"
            />
          </div>
          <div class="grid gap-2">
            <UiLabel for="slo-endpoint">
              {{ $t("settings.sso.labels.slo-endpoint") }}
            </UiLabel>
            <UiInput
              id="slo-endpoint"
              v-model="settings.slo.endpoint"
            />
          </div>
        </div>

        <div class="grid gap-2">
          <UiLabel for="algo">
            {{ $t("settings.sso.labels.saml.signature-algorithm") }}
          </UiLabel>
          <UiSelect
            id="algo"
            v-model="settings.saml.signatureAlgorithm"
          >
            <UiSelectTrigger class="w-full">
              <UiSelectValue />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem
                v-for="algo in SSOAlgorithms"
                :key="algo"
                :value="algo"
              >
                {{ algo }}
              </UiSelectItem>
            </UiSelectContent>
          </UiSelect>
        </div>

        <div class="grid gap-2">
          <div class="flex items-center justify-between">
            <UiLabel>
              {{ $t("settings.sso.labels.mapping.label") }}
            </UiLabel>

            <UiButton size="sm">
              <Plus />
              {{ $t("btn.add.entry") }}
            </UiButton>
          </div>

          <UiDataTable
            :columns="columns(deleteMappingEntry)"
            :data="settings.mapping"
          />
        </div>
      </section>
    </main>
  </PageRoot>
</template>
