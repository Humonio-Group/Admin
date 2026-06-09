<script setup lang="ts">
import type { Listed } from "~/types/primitives/objects";
import type { QiguLanguage } from "~/types/entities/language";
import FlagIcon from "~/components/icons/FlagIcon.vue";

const { locale } = useI18n();

const languages = inject<Ref<Listed<QiguLanguage>>>("languages")!;

const language = ref<string>(languages.value?.[0]?.code || locale.value);
watch(languages, (val) => {
  if (!val) return;
  if (val.find(lang => lang.code === language.value)) return;
  language.value = val[0]?.code || locale.value;
});
</script>

<template>
  <UiCard class="bg-transparent!">
    <UiCardHeader class="flex flex-row items-center justify-between gap-4">
      <UiCardTitle>{{ $t("labels.translations") }}</UiCardTitle>

      <UiSelect
        v-if="languages.length > 1"
        v-model="language"
      >
        <UiSelectTrigger>
          <FlagIcon :country-code="language === 'en' ? 'gb' : language" />
          <UiSelectValue />
        </UiSelectTrigger>

        <UiSelectContent>
          <UiSelectItem
            v-for="lang in languages"
            :key="lang.id"
            :value="lang.code"
          >
            {{ lang.nativeName }}
          </UiSelectItem>
        </UiSelectContent>
      </UiSelect>
      <div
        v-else
        class="h-9 px-3 flex items-center gap-2 rounded-md border text-sm font-medium"
      >
        <FlagIcon :country-code="language === 'en' ? 'gb' : language" />
        {{ languages.find(lang => lang.code === language)?.nativeName }}
      </div>
    </UiCardHeader>

    <UiCardContent class="grid gap-6">
      <slot :language="language" />
    </UiCardContent>
  </UiCard>
</template>
