<script setup lang="ts">
import PageRoot from "~/components/composing/PageRoot.vue";
import { Save, Eye, EyeOff, MailWarning } from "lucide-vue-next";
import { type CompanySMTPSettings, SMTPProtocols } from "~/types/entities/company";

const store = useCompanyStore();
const { smtpSettings, loading: _loading } = storeToRefs(store);
const loading = computed(() => _loading.value.settings.smtp);
const saving = computed(() => _loading.value.saving.smtp);

const settings = ref<CompanySMTPSettings>({
  active: false,
  valid: false,
  encryption: "SSL",
  auth: {
    username: "",
    password: "",
  },
  from: {
    name: "",
    address: "",
  },
  host: "",
  port: 0,
});
watch(smtpSettings, (val) => {
  if (!val) return;
  settings.value = { ...val };
});
const showPassword = ref<boolean>(false);

async function toggleActive(state: boolean) {
  settings.value.active = state;
  await store.saveSMTPSettings(settings.value);
}

store.loadSMTPSettings();
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
          @click="store.saveSMTPSettings(settings)"
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
      v-else-if="smtpSettings"
      class="grid gap-8"
    >
      <UiAlert
        v-if="!settings.valid"
        variant="destructive"
      >
        <MailWarning />
        <UiAlertTitle>{{ $t("settings.smtp.invalid-configuration.title") }}</UiAlertTitle>
        <UiAlertDescription>{{ $t("settings.smtp.invalid-configuration.description") }}</UiAlertDescription>
      </UiAlert>

      <section class="grid gap-4">
        <h2 class="text-lg font-bold">
          {{ $t("settings.smtp.sections.server") }}
        </h2>

        <div class="grid @xl:grid-cols-3 gap-4">
          <div class="grid gap-2 @xl:col-span-2">
            <UiLabel for="smtp-host">
              {{ $t("settings.smtp.fields.host.label") }}
            </UiLabel>
            <UiInput
              id="smtp-host"
              v-model="settings.host"
              :placeholder="$t('settings.smtp.fields.host.placeholder')"
            />
          </div>
          <div class="grid gap-2">
            <UiLabel for="smtp-host">
              {{ $t("settings.smtp.fields.port.label") }}
            </UiLabel>
            <UiNumberField v-model="settings.port">
              <UiNumberFieldContent>
                <UiNumberFieldInput
                  class="px-3 text-left"
                  :placeholder="$t('settings.smtp.fields.port.placeholder')"
                />
              </UiNumberFieldContent>
            </UiNumberField>
          </div>
        </div>

        <div class="grid gap-2">
          <UiLabel for="username">
            {{ $t("settings.smtp.fields.username.label") }}
          </UiLabel>
          <UiInput
            id="username"
            v-model="settings.auth.username"
            :placeholder="$t('settings.smtp.fields.username.placeholder')"
          />
        </div>
        <div class="grid gap-2">
          <UiLabel for="password">
            {{ $t("settings.smtp.fields.password.label") }}
          </UiLabel>
          <div class="relative">
            <UiInput
              id="password"
              v-model="settings.auth.password"
              class="pr-9"
              :type="showPassword ? 'text' : 'password'"
              :placeholder="$t('settings.smtp.fields.password.placeholder')"
            />
            <UiButton
              type="button"
              variant="ghost"
              size="sm"
              class="absolute top-1.5 right-1.5 size-6 text-muted-foreground"
              @click="showPassword = !showPassword"
            >
              <Eye v-if="showPassword" />
              <EyeOff v-else />
            </UiButton>
          </div>
        </div>
      </section>

      <section class="grid gap-4">
        <h2 class="text-lg font-bold">
          {{ $t("settings.smtp.sections.encryption") }}
        </h2>

        <div class="grid gap-2">
          <UiLabel>{{ $t("settings.smtp.fields.encryption") }}</UiLabel>
          <UiSelect v-model="settings.encryption">
            <UiSelectTrigger class="w-full">
              <UiSelectValue />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem
                v-for="method in SMTPProtocols"
                :key="method"
                :value="method"
              >
                {{ method }}
              </UiSelectItem>
            </UiSelectContent>
          </UiSelect>
        </div>
      </section>

      <section class="grid gap-4">
        <h2 class="text-lg font-bold">
          {{ $t("settings.smtp.sections.sender") }}
        </h2>

        <div class="grid gap-2">
          <UiLabel for="from-name">
            {{ $t("settings.smtp.fields.from.name.label") }}
          </UiLabel>
          <UiInput
            id="from-name"
            v-model="settings.from.name"
            :placeholder="$t('settings.smtp.fields.from.name.placeholder')"
          />
        </div>
        <div class="grid gap-2">
          <UiLabel for="from-address">
            {{ $t("settings.smtp.fields.from.address.label") }}
          </UiLabel>
          <UiInput
            id="from-address"
            v-model="settings.from.address"
            :placeholder="$t('settings.smtp.fields.from.address.placeholder')"
          />
        </div>
      </section>
    </main>
  </PageRoot>
</template>
