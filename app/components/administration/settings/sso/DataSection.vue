<script setup lang="ts">
import { useClipboard } from "@vueuse/core";
import { Copy, Check } from "lucide-vue-next";

const props = defineProps<{
  alias: string;
  label: string;
  path: string;
}>();

const ssoUrl = (path: string) => {
  const base = useRuntimeConfig().public.urls.sso
    .replace(/https?:\/\//g, "")
    .replaceAll("{alias}", props.alias);

  if (path.startsWith("/")) path = path.substring(1);
  return `${base}/${path}`;
};
const { copy, copied } = useClipboard();
</script>

<template>
  <div class="flex items-center gap-2">
    <p>{{ label }}</p>
    <UiButton
      variant="link"
      class="p-0! h-auto!"
      @click="copy(ssoUrl(path))"
    >
      {{ ssoUrl(path) }}
    </UiButton>
    <UiButton
      variant="ghost"
      size="icon-sm"
      class="size-6 [&_>svg]:size-3.5!"
      @click="copy(ssoUrl(path))"
    >
      <Check v-if="copied" />
      <Copy v-else />
    </UiButton>
  </div>
</template>
