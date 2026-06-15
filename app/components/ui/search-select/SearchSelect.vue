<script lang="ts" setup>
import type { HTMLAttributes } from "vue";
import { refDebounced } from "@vueuse/core";
import { CheckIcon, ChevronsUpDownIcon, LoaderCircleIcon } from "lucide-vue-next";
import { useField } from "vee-validate";
import { computed, ref, watch } from "vue";
import { cn } from "~/lib/utils";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";

export interface SearchSelectOption {
  value: string | number;
  label: string;
}

interface Props {
  name: string;
  fetchFn: (search: string) => Promise<SearchSelectOption[]>;
  displayValue?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  debounce?: number;
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Sélectionner…",
  searchPlaceholder: "Rechercher…",
  emptyText: "Aucun résultat.",
  debounce: 300,
});

const { value, errorMessage, handleBlur } = useField<string | number | undefined>(() => props.name);

const open = ref(false);
const search = ref("");
const searchDebounced = refDebounced(search, props.debounce);
const options = ref<SearchSelectOption[]>([]);
const loading = ref(false);

// Label displayed in the trigger
const selectedLabel = ref(props.displayValue ?? "");

watch(searchDebounced, async (q) => {
  loading.value = true;
  try {
    options.value = await props.fetchFn(q);
  }
  finally {
    loading.value = false;
  }
}, { immediate: true });

// Reset search et marque le champ comme touché quand le popover se ferme
watch(open, (val) => {
  if (!val) {
    search.value = "";
    handleBlur();
  }
});

const select = (option: SearchSelectOption) => {
  value.value = option.value;
  selectedLabel.value = option.label;
  open.value = false;
};

const triggerLabel = computed(() => {
  if (value.value !== undefined && value.value !== null && value.value !== "") {
    return selectedLabel.value || props.displayValue || String(value.value);
  }
  return null;
});
</script>

<template>
  <div :class="cn('flex flex-col gap-1', props.class)">
    <Popover v-model:open="open">
      <PopoverTrigger as-child>
        <UiButton
          type="button"
          variant="outline"
          role="combobox"
          :aria-expanded="open"
          :class="cn(
            'justify-between font-normal',
            !!errorMessage && 'border-destructive',
            !triggerLabel && 'text-muted-foreground',
          )"
        >
          <span class="truncate">{{ triggerLabel ?? placeholder }}</span>
          <ChevronsUpDownIcon class="size-4 shrink-0 opacity-50" />
        </UiButton>
      </PopoverTrigger>

      <PopoverContent
        class="w-[var(--reka-popover-trigger-width)] p-0"
        align="start"
      >
        <Command :should-filter="false">
          <CommandInput
            :placeholder="searchPlaceholder"
            @update-search="search = $event"
          />
          <CommandList>
            <div v-if="loading || !options.length" class="py-6 text-center text-sm text-muted-foreground">
              <LoaderCircleIcon v-if="loading" class="size-4 animate-spin mx-auto" />
              <span v-else>{{ emptyText }}</span>
            </div>
            <CommandGroup v-else>
              <CommandItem
                v-for="option in options"
                :key="option.value"
                :value="option.value"
                @select="select(option)"
              >
                {{ option.label }}
                <CheckIcon
                  :class="cn('ml-auto size-4', value === option.value ? 'opacity-100' : 'opacity-0')"
                />
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>

    <p
      v-if="errorMessage"
      class="text-xs text-destructive px-1"
    >
      {{ errorMessage }}
    </p>
  </div>
</template>
