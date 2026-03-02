<script setup lang="ts">
import { Edit, Save } from "lucide-vue-next";
import PageRoot from "~/components/composing/PageRoot.vue";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { z } from "zod";
import { type Theme, themeOptions } from "~/types/misc/theme";
import { type AvailableLocale, availableLocales } from "~/types/misc/language";
import FlagIcon from "~/components/icons/FlagIcon.vue";
import TermCard from "~/components/user/settings/terms/TermCard.vue";
import ImageCropDialog from "~/components/primitives/ImageCropDialog.vue";

const { t } = useI18n();

const store = useUserStore();
const { user, terms, loading } = storeToRefs(store);
const { company } = storeToRefs(useCompanyStore());

useHead({
  title: `${t("profile.settings.title")} - ${company.value!.name}`,
});

const form = useForm({
  validationSchema: toTypedSchema(z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    linkedIn: z.string().optional(),
  })),
  initialValues: {
    firstName: user.value!.name.first,
    lastName: user.value!.name.last,
    email: user.value!.contact.email,
    phone: user.value!.contact.phone ?? undefined,
    linkedIn: user.value!.social.linkedin ?? undefined,
  },
});
const submit = form.handleSubmit(store.patchUserAccount);

const activeLanguageCode = ref<AvailableLocale>(user.value!.settings.language as AvailableLocale);
const activeLanguage = computed(() => availableLocales.find(l => l.code === activeLanguageCode.value));
const isLanguageLoading = computed(() => loading.value.uiLanguage);
watch(activeLanguage, (val) => {
  if (!val || isLanguageLoading.value) return;
  store.patchUiLanguage(val);
});

const activeThemeKey = ref<Theme>(user.value!.settings.theme as Theme);
const activeTheme = computed(() => themeOptions.find(t => t.value === activeThemeKey.value));
const isThemeLoading = computed(() => loading.value.uiTheme);
watch(activeTheme, (val) => {
  if (!val || isThemeLoading.value) return;
  store.patchUiTheme(val);
});

const avatarCrop = useImageCrop("userAvatarInput", blob => store.uploadAvatar(blob));

store.fetchTerms();
</script>

<template>
  <PageRoot
    name="profile.settings"
    class="@container/profile-settings grid gap-8"
  >
    <header class="flex items-center justify-between gap-4">
      <h1 class="text-3xl font-bold">
        {{ $t("profile.settings.title") }}
      </h1>
    </header>

    <section
      id="account"
      class="grid grid-cols-1 @lg/profile-settings:grid-cols-2 @2xl/profile-settings:grid-cols-3 gap-4"
    >
      <form
        class="flex flex-col gap-4 @2xl/profile-settings:col-span-2 @2xl/profile-settings:row-start-1"
        @submit.prevent.stop="submit"
      >
        <UiFormField
          v-slot="{ componentField }"
          name="firstName"
        >
          <UiFormItem>
            <UiFormLabel>
              {{ $t("profile.settings.account.fields.first-name") }}
            </UiFormLabel>
            <UiFormControl v-bind="componentField">
              <UiInput :disabled="loading.userAccount" />
            </UiFormControl>
          </UiFormItem>
        </UiFormField>
        <UiFormField
          v-slot="{ componentField }"
          name="lastName"
        >
          <UiFormItem>
            <UiFormLabel>
              {{ $t("profile.settings.account.fields.last-name") }}
            </UiFormLabel>
            <UiFormControl v-bind="componentField">
              <UiInput :disabled="loading.userAccount" />
            </UiFormControl>
          </UiFormItem>
        </UiFormField>
        <UiFormField
          v-slot="{ componentField }"
          name="email"
        >
          <UiFormItem>
            <UiFormLabel>
              {{ $t("profile.settings.account.fields.email") }}
            </UiFormLabel>
            <UiFormControl v-bind="componentField">
              <UiInput
                type="email"
                disabled
              />
            </UiFormControl>
          </UiFormItem>
        </UiFormField>
        <UiFormField
          v-slot="{ componentField }"
          name="phone"
        >
          <UiFormItem>
            <UiFormLabel>
              {{ $t("profile.settings.account.fields.phone") }}
            </UiFormLabel>
            <UiFormControl v-bind="componentField">
              <UiInput
                type="phone"
                :disabled="loading.userAccount"
              />
            </UiFormControl>
          </UiFormItem>
        </UiFormField>
        <UiFormField
          v-slot="{ componentField }"
          name="linkedIn"
        >
          <UiFormItem>
            <UiFormLabel>
              {{ $t("profile.settings.account.fields.linked-in") }}
            </UiFormLabel>
            <UiFormControl v-bind="componentField">
              <UiInput :disabled="loading.userAccount" />
            </UiFormControl>
          </UiFormItem>
        </UiFormField>

        <UiButton
          variant="secondary"
          class="self-start"
          :disabled="loading.userAccount"
        >
          <UiSpinner v-if="loading.userAccount" />
          <Save v-else />

          {{ $t("btn.save") }}
        </UiButton>
      </form>

      <div class="row-start-1 @lg/profile-settings:col-start-2 @2xl/profile-settings:col-start-3 flex flex-col items-start @lg/profile-settings:items-center gap-2">
        <div class="grid gap-2">
          <UiLabel>{{ $t("profile.settings.account.fields.avatar") }}</UiLabel>
          <UiAvatar class="size-48 rounded-3xl">
            <UiAvatarImage
              v-if="user!.avatar"
              :src="user!.avatar"
            />
            <UiAvatarFallback>{{ user!.name.first[0] }}{{ user!.name.last[0] }}</UiAvatarFallback>
          </UiAvatar>
        </div>

        <input
          ref="userAvatarInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="avatarCrop.onFileChange"
        >

        <UiButton
          variant="outline"
          @click="avatarCrop.inputRef.value?.click()"
        >
          <Edit />
          {{ $t("profile.settings.account.avatar.change") }}
        </UiButton>

        <ImageCropDialog
          v-if="avatarCrop.src.value"
          v-model:open="avatarCrop.open.value"
          :src="avatarCrop.src.value"
          :mime-type="avatarCrop.mimeType.value"
          :aspect-ratio="1"
          @crop="avatarCrop.onConfirm"
          @update:open="avatarCrop.onOpenChange"
        />
      </div>
    </section>

    <UiSeparator />

    <section
      id="interface"
      class="grid gap-4"
    >
      <header>
        <h2 class="text-lg font-bold">
          {{ $t("profile.settings.interface.title") }}
        </h2>
      </header>

      <UiCard class="p-6 flex @lg/profile-settings:flex-row @lg/profile-settings:items-center">
        <UiCardHeader class="px-0 flex-1">
          <UiCardTitle class="inline-flex gap-2">
            {{ $t("profile.settings.interface.main-language.name") }}
            <UiSpinner v-if="loading.uiLanguage" />
          </UiCardTitle>
          <UiCardDescription>
            {{ $t("profile.settings.interface.main-language.description") }}
          </UiCardDescription>
        </UiCardHeader>

        <UiCardContent class="px-0">
          <UiSelect
            v-model="activeLanguageCode"
            :disabled="isLanguageLoading"
          >
            <UiSelectTrigger class="w-full @lg/profile-settings:w-auto">
              <FlagIcon :country-code="activeLanguage!.flag" />
              <span class="flex-1 text-start">
                {{ $t(`labels.languages.${activeLanguage!.name}`) }}
              </span>
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem
                v-for="locale in availableLocales"
                :key="locale.code"
                :value="locale.code"
              >
                <FlagIcon :country-code="locale.flag" />
                {{ $t(`labels.languages.${locale.name}`) }}
              </UiSelectItem>
            </UiSelectContent>
          </UiSelect>
        </UiCardContent>
      </UiCard>
      <UiCard class="p-6 flex @lg/profile-settings:flex-row @lg/profile-settings:items-center">
        <UiCardHeader class="px-0 flex-1">
          <UiCardTitle class="inline-flex gap-2">
            {{ $t("profile.settings.interface.theme.name") }}
            <UiSpinner v-if="loading.uiTheme" />
          </UiCardTitle>
          <UiCardDescription>
            {{ $t("profile.settings.interface.theme.description") }}
          </UiCardDescription>
        </UiCardHeader>

        <UiCardContent class="px-0">
          <UiSelect
            v-model="activeThemeKey"
            :disabled="isThemeLoading"
          >
            <UiSelectTrigger class="w-full @lg/profile-settings:w-auto">
              <component :is="activeTheme?.icon" />
              <span class="text-start flex-1">{{ $t(`profile.settings.interface.theme.options.${activeTheme?.value}`) }}</span>
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem
                v-for="theme in themeOptions"
                :key="theme.value"
                :value="theme.value"
              >
                <component :is="theme.icon" />
                {{ $t(`profile.settings.interface.theme.options.${theme.value}`) }}
              </UiSelectItem>
            </UiSelectContent>
          </UiSelect>
        </UiCardContent>
      </UiCard>
    </section>

    <UiSeparator />

    <section
      id="terms"
      class="grid gap-4"
    >
      <header>
        <h2 class="text-lg font-bold">
          {{ $t("profile.settings.terms.title") }}
        </h2>
      </header>

      <main class="grid gap-2">
        <UiTooltipProvider>
          <TermCard
            v-for="term in terms"
            :key="`term#${term.id}`"
            :term="term"
            :loading="loading.terms.revoking === term.id"
          />
        </UiTooltipProvider>

        <div
          v-if="loading.terms.fetching"
          class="grid place-items-center w-full"
        >
          <UiSpinner />
        </div>
      </main>
    </section>
  </PageRoot>
</template>
