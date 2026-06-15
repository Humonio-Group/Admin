<script lang="ts" setup>
import type { DateValue } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { fromDate, getLocalTimeZone } from "@internationalized/date";
import { CalendarIcon, ClockIcon, Calculator } from "lucide-vue-next";
import { useDateFormatter } from "reka-ui";
import { toDate } from "reka-ui/date";
import { useField } from "vee-validate";
import { computed, ref } from "vue";
import { cn } from "~/lib/utils";
import { Calendar } from "~/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";

interface Props {
  name: string;
  locale?: string;
  withTime?: boolean;
  withRecalculation?: number;
  placeholder?: string;
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<Props>(), {
  locale: "fr",
  withTime: false,
  placeholder: "Sélectionner une date",
});
const emit = defineEmits<{
  recalculate: [{ offset: number; value: Date; reference: Date }];
}>();

const { value, errorMessage } = useField<Date | undefined>(() => props.name);

const formatter = useDateFormatter(props.locale);

const dateValue = computed<DateValue | undefined>(() =>
  value.value ? fromDate(value.value, getLocalTimeZone()) : undefined,
);

const extractTime = (date: Date | undefined): string => {
  if (!date) return "00:00";
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

const applyTime = (date: Date, timeStr: string): Date => {
  const [h, m] = timeStr.split(":").map(Number);
  const result = new Date(date);
  result.setHours(h!, m!, 0, 0);
  return result;
};

const time = ref(extractTime(value.value));

const handleDateUpdate = (val: DateValue) => {
  const d = toDate(val, getLocalTimeZone());
  value.value = props.withTime ? applyTime(d, time.value) : d;
};

const handleTimeChange = (e: Event) => {
  time.value = (e.target as HTMLInputElement).value;
  if (value.value) value.value = applyTime(value.value, time.value);
};

const label = computed(() => {
  if (!value.value) return null;
  const dateStr = formatter.custom(value.value, { day: "2-digit", month: "short", year: "numeric" });
  return props.withTime ? `${dateStr} ${extractTime(value.value)}` : dateStr;
});

function emitRecalculation() {
  if (props.withRecalculation === undefined || !value.value) return;

  const date = new Date(value.value!);
  date.setDate(date.getDate() - props.withRecalculation);

  emit("recalculate", {
    offset: props.withRecalculation,
    value: date,
    reference: value.value!,
  });
}
</script>

<template>
  <div :class="cn('flex flex-col gap-1', props.class)">
    <Popover>
      <PopoverTrigger as-child>
        <UiButton
          type="button"
          variant="outline"
          :class="cn(
            'justify-start',
            !!errorMessage && 'border-destructive',
            !label && 'text-muted-foreground',
          )"
          @click.stop.prevent
        >
          <CalendarIcon class="size-4 shrink-0 text-muted-foreground" />
          <span>{{ label ?? placeholder }}</span>
        </UiButton>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        class="w-auto p-3"
      >
        <Calendar
          layout="month-and-year"
          :model-value="dateValue"
          @update:model-value="handleDateUpdate($event as DateValue)"
        />

        <div
          v-if="withTime"
          class="flex items-center gap-2 border-t pt-3 mt-1 px-1"
        >
          <ClockIcon class="size-4 text-muted-foreground shrink-0" />
          <input
            type="time"
            :value="time"
            :class="cn(
              'flex-1 rounded-md border border-input bg-background px-2 py-1 text-sm',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )"
            @change="handleTimeChange"
          >
        </div>

        <footer
          v-if="withRecalculation !== undefined"
          class="mt-3 w-full"
        >
          <UiButton
            type="button"
            size="sm"
            variant="outline"
            class="w-full"
            @click="emitRecalculation"
          >
            <Calculator />
            Recalculer à partir d'ici
          </UiButton>
        </footer>
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
