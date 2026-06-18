<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { useVModel } from "@vueuse/core";
import { useEditor, EditorContent } from "@tiptap/vue-3";
import { StarterKit } from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { marked } from "marked";
import TurndownService from "turndown";
import { cn } from "@/lib/utils";
import EditorToolbar from "~/components/ui/editor/EditorToolbar.vue";

function markdownToHtml(markdown: string): string {
  const images: string[] = [];
  const withPlaceholders = markdown.replace(
    /!\[([^\]]*)\]\((data:[^)]+)\)/g,
    (_, alt, href) => {
      const idx = images.length;
      images.push(`<img src="${href}" alt="${alt}">`);
      return `DATAIMG${idx}PLACEHOLDER`;
    },
  );
  let html = marked.parse(withPlaceholders) as string;
  images.forEach((img, idx) => {
    html = html.replace(`DATAIMG${idx}PLACEHOLDER`, img);
  });
  return html;
}

const turndown = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" });

const props = withDefaults(defineProps<{
  modelValue?: string;
  variant?: "fixed" | "simplified" | "floating";
  uploadImage?: (file: File) => Promise<string>;
  class?: HTMLAttributes["class"];
}>(), {
  variant: "fixed",
  modelValue: "",
});

const emits = defineEmits<{
  (e: "update:modelValue", payload: string): void;
}>();

const modelValue = useVModel(props, "modelValue", emits, {
  passive: true,
  defaultValue: "",
});

const floatingVisible = ref(false);
const floatingPos = ref({ x: 0, y: 0 });

function updateFloating(e: { editor: { state: { selection: { from: number; to: number } }; view: { coordsAtPos: (pos: number) => { left: number; right: number; top: number } } } }) {
  if (props.variant !== "floating") return;
  const { from, to } = e.editor.state.selection;
  if (from === to) {
    floatingVisible.value = false;
    return;
  }
  const start = e.editor.view.coordsAtPos(from);
  const end = e.editor.view.coordsAtPos(to);
  floatingPos.value = {
    x: (start.left + end.right) / 2 - 150,
    y: start.top - 52,
  };
  floatingVisible.value = true;
}

const fromEditor = ref(false);

const editor = useEditor({
  content: modelValue.value ? markdownToHtml(modelValue.value) : "",
  extensions: [
    StarterKit,
    Underline,
    Link.configure({ openOnClick: false }),
    Image.configure({ allowBase64: true }),
    Table.configure({ resizable: true }),
    TableRow,
    TableCell,
    TableHeader,
  ],
  editorProps: {
    handlePaste(view, event) {
      const items = Array.from(event.clipboardData?.items ?? []);
      const imageItem = items.find(item => item.type.startsWith("image/"));
      if (!imageItem) return false;

      event.preventDefault();
      const file = imageItem.getAsFile();
      if (!file) return true;

      const insert = (url: string) => {
        const { schema } = view.state;
        const node = schema.nodes.image.create({ src: url });
        const transaction = view.state.tr.replaceSelectionWith(node);
        view.dispatch(transaction);
      };

      if (props.uploadImage) {
        props.uploadImage(file).then(insert);
      }
      else {
        const reader = new FileReader();
        reader.onload = () => insert(reader.result as string);
        reader.readAsDataURL(file);
      }

      return true;
    },
  },
  onUpdate: ({ editor }) => {
    fromEditor.value = true;
    modelValue.value = turndown.turndown(editor.getHTML());
    nextTick(() => {
      fromEditor.value = false;
    });
  },
  onSelectionUpdate: updateFloating,
  onBlur: () => { floatingVisible.value = false; },
});

watch(() => props.modelValue, (newVal) => {
  if (fromEditor.value) return;
  editor.value?.commands.setContent(newVal ? markdownToHtml(newVal) : "");
}, { immediate: true });

onBeforeUnmount(() => editor.value?.destroy());
</script>

<template>
  <div
    data-slot="editor"
    :class="cn('rounded-md border border-input bg-background', props.class)"
  >
    <EditorToolbar
      v-if="variant === 'fixed' && editor"
      :editor="editor"
      :upload-image="uploadImage"
    />

    <Teleport
      v-if="variant === 'floating' && editor"
      to="body"
    >
      <div
        v-show="floatingVisible"
        :style="{ position: 'fixed', left: `${floatingPos.x}px`, top: `${floatingPos.y}px`, zIndex: 50 }"
      >
        <EditorToolbar
          :editor="editor"
          :upload-image="uploadImage"
          floating
        />
      </div>
    </Teleport>

    <EditorContent
      :editor="editor"
      class="editor-content"
    />
  </div>
</template>

<style>
.editor-content .tiptap {
  outline: none;
  padding: 0.75rem;
  min-height: 12rem;
}

.editor-content .tiptap h1 { font-size: 1.875rem; font-weight: 700; margin: 1rem 0 0.5rem; }
.editor-content .tiptap h2 { font-size: 1.5rem; font-weight: 700; margin: 1rem 0 0.5rem; }
.editor-content .tiptap h3 { font-size: 1.25rem; font-weight: 600; margin: 0.75rem 0 0.5rem; }
.editor-content .tiptap h4 { font-size: 1.125rem; font-weight: 600; margin: 0.75rem 0 0.25rem; }
.editor-content .tiptap h5 { font-size: 1rem; font-weight: 600; margin: 0.5rem 0 0.25rem; }
.editor-content .tiptap h6 { font-size: 0.875rem; font-weight: 600; margin: 0.5rem 0 0.25rem; }

.editor-content .tiptap p { margin-bottom: 0.5rem; }
.editor-content .tiptap p:last-child { margin-bottom: 0; }

.editor-content .tiptap ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 0.5rem; }
.editor-content .tiptap ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 0.5rem; }
.editor-content .tiptap li { margin-bottom: 0.25rem; }

.editor-content .tiptap blockquote {
  border-left: 3px solid var(--border);
  padding-left: 1rem;
  margin: 0.75rem 0;
  color: var(--muted-foreground);
  font-style: italic;
}

.editor-content .tiptap code {
  background: var(--muted);
  border-radius: 0.25rem;
  padding: 0.125rem 0.375rem;
  font-size: 0.875em;
  font-family: monospace;
}

.editor-content .tiptap pre {
  background: var(--muted);
  border-radius: 0.375rem;
  padding: 0.75rem 1rem;
  margin: 0.75rem 0;
  overflow-x: auto;
}
.editor-content .tiptap pre code {
  background: none;
  padding: 0;
  font-size: 0.875rem;
}

.editor-content .tiptap hr {
  border: none;
  border-top: 1px solid var(--border);
  margin: 1rem 0;
}

.editor-content .tiptap a {
  color: var(--primary);
  text-decoration: underline;
  cursor: pointer;
}

.editor-content .tiptap img {
  max-width: 100%;
  height: auto;
  border-radius: 0.375rem;
  margin: 0.5rem 0;
}

.editor-content .tiptap table {
  border-collapse: collapse;
  width: 100%;
  margin: 0.75rem 0;
}
.editor-content .tiptap td,
.editor-content .tiptap th {
  border: 1px solid var(--border);
  padding: 0.5rem 0.75rem;
  text-align: left;
  position: relative;
}
.editor-content .tiptap th {
  background: var(--muted);
  font-weight: 600;
}
.editor-content .tiptap .selectedCell::after {
  background: color-mix(in oklch, var(--primary) 10%, transparent);
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
}
</style>
