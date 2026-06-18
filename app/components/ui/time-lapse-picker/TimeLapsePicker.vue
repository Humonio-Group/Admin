<script lang="ts" setup>
import type { DateRange, DateValue } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { fromDate, getLocalTimeZone, today } from "@internationalized/date";
import { Calculator, CalendarIcon, ClockIcon } from "lucide-vue-next";
import { RangeCalendarRoot, useDateFormatter } from "reka-ui";
import { createYear, createYearRange, toDate } from "reka-ui/date";
import { useField } from "vee-validate";
import { computed, ref } from "vue";
import { cn } from "~/lib/utils";
import {
  RangeCalendarCell,
  RangeCalendarCellTrigger,
  RangeCalendarGrid,
  RangeCalendarGridBody,
  RangeCalendarGridHead,
  RangeCalendarGridRow,
  RangeCalendarHeadCell,
  RangeCalendarHeader,
  RangeCalendarNextButton,
  RangeCalendarPrevButton,
} from "~/components/ui/range-calendar";
import { NativeSelect, NativeSelectOption } from "~/components/ui/native-select";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Separator } from "~/components/ui/separator";

const { locale } = useI18n();

interface Props {
  startName: string;
  endName: string;
  withTime?: boolean;
  withRecalculation?: { start: number; end: number };
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<Props>(), {
  withTime: false,
});
const emit = defineEmits<{
  recalculate: [{ offset: number; value: Date; reference: Date }];
}>();

const { value: startValue, errorMessage: startError } = useField<Date | undefined>(() => props.startName);
const { value: endValue, errorMessage: endError } = useField<Date | undefined>(() => props.endName);

const formatter = useDateFormatter(props.locale);

const startPlaceholder = ref<DateValue>(
  startValue.value ? fromDate(startValue.value, getLocalTimeZone()) : today(getLocalTimeZone()),
);
const endPlaceholder = ref<DateValue>(
  endValue.value ? fromDate(endValue.value, getLocalTimeZone()) : today(getLocalTimeZone()),
);

const rangeValue = computed<DateRange>(() => ({
  start: startValue.value ? fromDate(startValue.value, getLocalTimeZone()) : undefined,
  end: endValue.value ? fromDate(endValue.value, getLocalTimeZone()) : undefined,
}));

const extractTime = (date: Date | undefined): string => {
  if (!date) return "00:00";
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

const applyTime = (date: Date, timeStr: string): Date => {
  const [h, m] = timeStr.split(":").map(Number);
  const result = new Date(date);
  result.setHours(h, m, 0, 0);
  return result;
};

const startTime = ref(extractTime(startValue.value));
const endTime = ref(extractTime(endValue.value));

const handleRangeUpdate = (range: DateRange | null) => {
  if (!range) return;
  if (range.start) {
    const d = toDate(range.start, getLocalTimeZone());
    startValue.value = props.withTime ? applyTime(d, startTime.value) : d;
  }
  else {
    startValue.value = undefined;
  }
  if (range.end) {
    const d = toDate(range.end, getLocalTimeZone());
    endValue.value = props.withTime ? applyTime(d, endTime.value) : d;
  }
  else {
    endValue.value = undefined;
  }
};

const handleStartTimeChange = (e: Event) => {
  startTime.value = (e.target as HTMLInputElement).value;
  if (startValue.value) startValue.value = applyTime(startValue.value, startTime.value);
};

const handleEndTimeChange = (e: Event) => {
  endTime.value = (e.target as HTMLInputElement).value;
  if (endValue.value) endValue.value = applyTime(endValue.value, endTime.value);
};

const startYearRange = computed(() =>
  createYearRange({
    start: startPlaceholder.value.cycle("year", -100),
    end: startPlaceholder.value.cycle("year", 10),
  }),
);
const endYearRange = computed(() =>
  createYearRange({
    start: endPlaceholder.value.cycle("year", -100),
    end: endPlaceholder.value.cycle("year", 10),
  }),
);

const formatDate = (date: Date | undefined) => {
  if (!date) return null;
  const dateStr = formatter.custom(date, { day: "2-digit", month: "short", year: "numeric" });
  if (!props.withTime) return dateStr;
  return `${dateStr} ${extractTime(date)}`;
};

const label = computed(() => {
  const start = formatDate(startValue.value);
  const end = formatDate(endValue.value);
  if (!start && !end) return null;
  return `${start ?? "…"} → ${end ?? "…"}`;
});

const hasError = computed(() => !!startError.value || !!endError.value);

function emitRecalculation(type: "start" | "end") {
  if (props.withRecalculation === undefined || (type === "start" && !startValue.value) || (type === "end" && !endValue.value)) return;

  const date = new Date(type === "start" ? startValue.value! : endValue.value!);
  date.setDate(date.getDate() - props.withRecalculation[type]);

  emit("recalculate", {
    offset: props.withRecalculation[type],
    value: date,
    reference: type === "start" ? startValue.value! : endValue.value!,
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
            hasError && 'border-destructive',
            !label && 'text-muted-foreground',
          )"
        >
          <CalendarIcon class="h-4 w-4 shrink-0 text-muted-foreground" />
          <span>{{ label ?? 'Sélectionner une période' }}</span>
        </UiButton>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        class="w-auto p-0"
      >
        <div class="flex flex-col lg:flex-row">
          <!-- Panneau Début -->
          <div class="flex flex-col gap-1 p-3">
            <RangeCalendarRoot
              v-slot="{ grid, weekDays }"
              v-model:placeholder="startPlaceholder"
              :locale="locale"
              :model-value="rangeValue"
              @update:model-value="handleRangeUpdate"
            >
              <RangeCalendarHeader class="pt-0 px-8">
                <RangeCalendarPrevButton />
                <RangeCalendarNextButton />
                <div class="flex items-center justify-center gap-1">
                  <div class="**:data-[slot=native-select-icon]:right-1">
                    <div class="relative">
                      <div class="absolute inset-0 flex h-full items-center text-sm pl-2 pointer-events-none">
                        {{ formatter.custom(toDate(startPlaceholder), { month: 'short' }) }}
                      </div>
                      <NativeSelect
                        class="text-xs h-8 pr-6 pl-2 text-transparent relative"
                        @change="(e: Event) => startPlaceholder = startPlaceholder.set({ month: Number((e?.target as any)?.value) })"
                      >
                        <NativeSelectOption
                          v-for="month in createYear({ dateObj: startPlaceholder })"
                          :key="month.toString()"
                          :value="month.month"
                          :selected="startPlaceholder.month === month.month"
                        >
                          {{ formatter.custom(toDate(month), { month: 'short' }) }}
                        </NativeSelectOption>
                      </NativeSelect>
                    </div>
                  </div>
                  <div class="**:data-[slot=native-select-icon]:right-1">
                    <div class="relative">
                      <div class="absolute inset-0 flex h-full items-center text-sm pl-2 pointer-events-none">
                        {{ formatter.custom(toDate(startPlaceholder), { year: 'numeric' }) }}
                      </div>
                      <NativeSelect
                        class="text-xs h-8 pr-6 pl-2 text-transparent relative"
                        @change="(e: Event) => startPlaceholder = startPlaceholder.set({ year: Number((e?.target as any)?.value) })"
                      >
                        <NativeSelectOption
                          v-for="year in startYearRange"
                          :key="year.toString()"
                          :value="year.year"
                          :selected="startPlaceholder.year === year.year"
                        >
                          {{ formatter.custom(toDate(year), { year: 'numeric' }) }}
                        </NativeSelectOption>
                      </NativeSelect>
                    </div>
                  </div>
                </div>
              </RangeCalendarHeader>

              <div class="mt-4">
                <RangeCalendarGrid
                  v-for="month in grid"
                  :key="month.value.toString()"
                >
                  <RangeCalendarGridHead>
                    <RangeCalendarGridRow>
                      <RangeCalendarHeadCell
                        v-for="day in weekDays"
                        :key="day"
                      >
                        {{ day }}
                      </RangeCalendarHeadCell>
                    </RangeCalendarGridRow>
                  </RangeCalendarGridHead>
                  <RangeCalendarGridBody>
                    <RangeCalendarGridRow
                      v-for="(weekDates, index) in month.rows"
                      :key="`weekDate-${index}`"
                      class="mt-2 w-full"
                    >
                      <RangeCalendarCell
                        v-for="weekDate in weekDates"
                        :key="weekDate.toString()"
                        :date="weekDate"
                      >
                        <RangeCalendarCellTrigger
                          :day="weekDate"
                          :month="month.value"
                        />
                      </RangeCalendarCell>
                    </RangeCalendarGridRow>
                  </RangeCalendarGridBody>
                </RangeCalendarGrid>
              </div>
            </RangeCalendarRoot>

            <div
              v-if="withTime"
              class="flex items-center gap-2 border-t pt-3 mt-1 px-1"
            >
              <ClockIcon class="size-4 text-muted-foreground shrink-0" />
              <input
                type="time"
                :value="startTime"
                :class="cn(
                  'flex-1 rounded-md border border-input bg-background px-2 py-1 text-sm',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                )"
                @change="handleStartTimeChange"
              >
            </div>

            <p
              v-if="startError"
              class="text-xs text-destructive px-1 mt-1"
            >
              {{ startError }}
            </p>

            <footer
              v-if="withRecalculation !== undefined"
              class="mt-2 flex"
            >
              <UiButton
                type="button"
                size="sm"
                variant="outline"
                class="w-full"
                @click="emitRecalculation('start')"
              >
                <Calculator />
                Recalculer à partir d'ici
              </UiButton>
            </footer>
          </div>

          <Separator
            orientation="vertical"
            class="hidden lg:block h-full"
          />
          <Separator class="lg:hidden" />

          <!-- Panneau Fin -->
          <div class="flex flex-col gap-1 p-3">
            <RangeCalendarRoot
              v-slot="{ grid, weekDays }"
              v-model:placeholder="endPlaceholder"
              :locale="locale"
              :model-value="rangeValue"
              @update:model-value="handleRangeUpdate"
            >
              <RangeCalendarHeader class="pt-0 px-8">
                <RangeCalendarPrevButton />
                <RangeCalendarNextButton />
                <div class="flex items-center justify-center gap-1">
                  <div class="**:data-[slot=native-select-icon]:right-1">
                    <div class="relative">
                      <div class="absolute inset-0 flex h-full items-center text-sm pl-2 pointer-events-none">
                        {{ formatter.custom(toDate(endPlaceholder), { month: 'short' }) }}
                      </div>
                      <NativeSelect
                        class="text-xs h-8 pr-6 pl-2 text-transparent relative"
                        @change="(e: Event) => endPlaceholder = endPlaceholder.set({ month: Number((e?.target as any)?.value) })"
                      >
                        <NativeSelectOption
                          v-for="month in createYear({ dateObj: endPlaceholder })"
                          :key="month.toString()"
                          :value="month.month"
                          :selected="endPlaceholder.month === month.month"
                        >
                          {{ formatter.custom(toDate(month), { month: 'short' }) }}
                        </NativeSelectOption>
                      </NativeSelect>
                    </div>
                  </div>
                  <div class="**:data-[slot=native-select-icon]:right-1">
                    <div class="relative">
                      <div class="absolute inset-0 flex h-full items-center text-sm pl-2 pointer-events-none">
                        {{ formatter.custom(toDate(endPlaceholder), { year: 'numeric' }) }}
                      </div>
                      <NativeSelect
                        class="text-xs h-8 pr-6 pl-2 text-transparent relative"
                        @change="(e: Event) => endPlaceholder = endPlaceholder.set({ year: Number((e?.target as any)?.value) })"
                      >
                        <NativeSelectOption
                          v-for="year in endYearRange"
                          :key="year.toString()"
                          :value="year.year"
                          :selected="endPlaceholder.year === year.year"
                        >
                          {{ formatter.custom(toDate(year), { year: 'numeric' }) }}
                        </NativeSelectOption>
                      </NativeSelect>
                    </div>
                  </div>
                </div>
              </RangeCalendarHeader>

              <div class="mt-4">
                <RangeCalendarGrid
                  v-for="month in grid"
                  :key="month.value.toString()"
                >
                  <RangeCalendarGridHead>
                    <RangeCalendarGridRow>
                      <RangeCalendarHeadCell
                        v-for="day in weekDays"
                        :key="day"
                      >
                        {{ day }}
                      </RangeCalendarHeadCell>
                    </RangeCalendarGridRow>
                  </RangeCalendarGridHead>
                  <RangeCalendarGridBody>
                    <RangeCalendarGridRow
                      v-for="(weekDates, index) in month.rows"
                      :key="`weekDate-${index}`"
                      class="mt-2 w-full"
                    >
                      <RangeCalendarCell
                        v-for="weekDate in weekDates"
                        :key="weekDate.toString()"
                        :date="weekDate"
                      >
                        <RangeCalendarCellTrigger
                          :day="weekDate"
                          :month="month.value"
                        />
                      </RangeCalendarCell>
                    </RangeCalendarGridRow>
                  </RangeCalendarGridBody>
                </RangeCalendarGrid>
              </div>
            </RangeCalendarRoot>

            <div
              v-if="withTime"
              class="flex items-center gap-2 border-t pt-3 mt-1 px-1"
            >
              <ClockIcon class="size-4 text-muted-foreground shrink-0" />
              <input
                type="time"
                :value="endTime"
                :class="cn(
                  'flex-1 rounded-md border border-input bg-background px-2 py-1 text-sm',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                )"
                @change="handleEndTimeChange"
              >
            </div>

            <p
              v-if="endError"
              class="text-xs text-destructive px-1 mt-1"
            >
              {{ endError }}
            </p>

            <footer
              v-if="withRecalculation !== undefined"
              class="mt-2"
            >
              <UiButton
                type="button"
                size="sm"
                variant="outline"
                class="w-full"
                @click="emitRecalculation('end')"
              >
                <Calculator />
                Recalculer à partir d'ici
              </UiButton>
            </footer>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  </div>
</template>
