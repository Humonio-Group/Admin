<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";
import { Bold, Italic, Underline, Strikethrough, Code, Quote, List, ListOrdered, Image, Minus } from "lucide-vue-next";
import { cn } from "@/lib/utils";
import EditorTablePopover from "~/components/ui/editor/EditorTablePopover.vue";
import EditorLinkPopover from "~/components/ui/editor/EditorLinkPopover.vue";

const props = defineProps<{
  editor: Editor;
  uploadImage?: (file: File) => Promise<string>;
  floating?: boolean;
}>();

const headingOptions = [
  { value: "p", label: "Paragraphe" },
  { value: "h1", label: "Titre 1" },
  { value: "h2", label: "Titre 2" },
  { value: "h3", label: "Titre 3" },
  { value: "h4", label: "Titre 4" },
  { value: "h5", label: "Titre 5" },
  { value: "h6", label: "Titre 6" },
];

const currentHeading = computed(() => {
  for (let i = 1; i <= 6; i++) {
    if (props.editor.isActive("heading", { level: i })) return `h${i}`;
  }
  return "p";
});

function setHeading(value: string | number) {
  const v = String(value);
  if (v === "p") {
    props.editor.chain().focus().setParagraph().run();
  }
  else {
    const level = parseInt(v.replace("h", "")) as 1 | 2 | 3 | 4 | 5 | 6;
    props.editor.chain().focus().setHeading({ level }).run();
  }
}

const fileInput = ref<HTMLInputElement | null>(null);

async function handleImageUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  try {
    const url = props.uploadImage
      ? await props.uploadImage(file)
      : await toDataUrl(file);
    props.editor.chain().focus().setImage({ src: url }).run();
  }
  finally {
    if (fileInput.value) fileInput.value.value = "";
  }
}

function toDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
</script>

<template>
  <div
    :class="cn(
      'flex flex-wrap items-center gap-0.5 p-1',
      floating
        ? 'rounded-md border border-border bg-background shadow-md'
        : 'border-b border-border rounded-t-md bg-muted/30',
    )"
  >
    <UiSelect
      :model-value="currentHeading"
      @update:model-value="setHeading"
    >
      <UiSelectTrigger class="h-8 w-32 text-xs">
        <UiSelectValue />
      </UiSelectTrigger>
      <UiSelectContent>
        <UiSelectItem
          v-for="opt in headingOptions"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </UiSelectItem>
      </UiSelectContent>
    </UiSelect>

    <UiSeparator
      orientation="vertical"
      class="mx-0.5 h-6"
    />

    <UiToggle
      size="sm"
      :pressed="editor.isActive('bold')"
      @click="editor.chain().focus().toggleBold().run()"
    >
      <Bold />
    </UiToggle>
    <UiToggle
      size="sm"
      :pressed="editor.isActive('italic')"
      @click="editor.chain().focus().toggleItalic().run()"
    >
      <Italic />
    </UiToggle>
    <UiToggle
      size="sm"
      :pressed="editor.isActive('underline')"
      @click="editor.chain().focus().toggleUnderline().run()"
    >
      <Underline />
    </UiToggle>
    <UiToggle
      size="sm"
      :pressed="editor.isActive('strike')"
      @click="editor.chain().focus().toggleStrike().run()"
    >
      <Strikethrough />
    </UiToggle>

    <UiSeparator
      orientation="vertical"
      class="mx-0.5 h-6"
    />

    <UiToggle
      size="sm"
      :pressed="editor.isActive('code')"
      @click="editor.chain().focus().toggleCode().run()"
    >
      <Code />
    </UiToggle>
    <UiToggle
      size="sm"
      :pressed="editor.isActive('blockquote')"
      @click="editor.chain().focus().toggleBlockquote().run()"
    >
      <Quote />
    </UiToggle>

    <template v-if="!floating">
      <UiSeparator
        orientation="vertical"
        class="mx-0.5 h-6"
      />

      <UiToggle
        size="sm"
        :pressed="editor.isActive('bulletList')"
        @click="editor.chain().focus().toggleBulletList().run()"
      >
        <List />
      </UiToggle>
      <UiToggle
        size="sm"
        :pressed="editor.isActive('orderedList')"
        @click="editor.chain().focus().toggleOrderedList().run()"
      >
        <ListOrdered />
      </UiToggle>

      <UiSeparator
        orientation="vertical"
        class="mx-0.5 h-6"
      />

      <EditorLinkPopover :editor="editor" />

      <UiToggle
        size="sm"
        @click="fileInput?.click()"
      >
        <Image />
      </UiToggle>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleImageUpload"
      >

      <EditorTablePopover :editor="editor" />

      <UiToggle
        size="sm"
        @click="editor.chain().focus().setHorizontalRule().run()"
      >
        <Minus />
      </UiToggle>
    </template>
  </div>
</template>
