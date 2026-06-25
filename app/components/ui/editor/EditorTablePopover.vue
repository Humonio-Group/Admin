<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";
import { Table } from "lucide-vue-next";

const props = defineProps<{ editor: Editor }>();

const open = ref(false);
const rows = ref(3);
const cols = ref(3);

function insertTable() {
  props.editor.chain().focus().insertTable({
    rows: rows.value,
    cols: cols.value,
    withHeaderRow: true,
  }).run();
  open.value = false;
}
</script>

<template>
  <UiPopover v-model:open="open">
    <UiPopoverTrigger as-child>
      <UiToggle
        size="sm"
        :pressed="editor.isActive('table')"
        @click="open = true"
      >
        <Table />
      </UiToggle>
    </UiPopoverTrigger>

    <UiPopoverContent
      class="w-44 p-3"
      @open-auto-focus.prevent
    >
      <div class="flex flex-col gap-3">
        <div class="grid grid-cols-2 gap-2">
          <div class="flex flex-col gap-1">
            <label class="text-xs text-muted-foreground">Lignes</label>
            <UiInput
              v-model="rows"
              type="number"
              min="1"
              max="20"
              class="h-7 text-xs"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs text-muted-foreground">Colonnes</label>
            <UiInput
              v-model="cols"
              type="number"
              min="1"
              max="10"
              class="h-7 text-xs"
            />
          </div>
        </div>
        <UiButton
          size="sm"
          @click="insertTable"
        >
          Insérer
        </UiButton>
      </div>
    </UiPopoverContent>
  </UiPopover>
</template>
