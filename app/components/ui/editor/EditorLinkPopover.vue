<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";
import { Link, Unlink } from "lucide-vue-next";

const props = defineProps<{ editor: Editor }>();

const open = ref(false);
const url = ref("");

function openPopover() {
  url.value = props.editor.getAttributes("link").href ?? "";
  open.value = true;
}

function applyLink() {
  if (!url.value.trim()) {
    props.editor.chain().focus().unsetLink().run();
  }
  else {
    props.editor.chain().focus().setLink({ href: url.value.trim(), target: "_blank" }).run();
  }
  open.value = false;
}

function removeLink() {
  props.editor.chain().focus().unsetLink().run();
  open.value = false;
}
</script>

<template>
  <UiPopover v-model:open="open">
    <UiPopoverTrigger as-child>
      <UiToggle
        size="sm"
        :pressed="editor.isActive('link')"
        @click="openPopover"
      >
        <Link />
      </UiToggle>
    </UiPopoverTrigger>

    <UiPopoverContent
      class="w-80 p-3"
      @open-auto-focus.prevent
    >
      <div class="flex flex-col gap-2">
        <UiInput
          v-model="url"
          placeholder="https://..."
          @keydown.enter="applyLink"
        />
        <div class="flex gap-2">
          <UiButton
            size="sm"
            class="flex-1"
            @click="applyLink"
          >
            Appliquer
          </UiButton>
          <UiButton
            size="sm"
            variant="ghost"
            :disabled="!editor.isActive('link')"
            @click="removeLink"
          >
            <Unlink class="size-4" />
          </UiButton>
        </div>
      </div>
    </UiPopoverContent>
  </UiPopover>
</template>
