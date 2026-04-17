<script setup lang="ts">
import { cn } from "~/lib/utils";
import type { PageRootProps } from "~/components/composing/index";

const props = defineProps<PageRootProps>();
</script>

<template>
  <main
    :data-page-name="name || 'home'"
    :class="cn('@container/page', props.class)"
  >
    <div
      v-if="wrapper"
      :class="cn('', wrapperClass)"
    >
      <slot />
    </div>
    <slot v-else />
  </main>
</template>
