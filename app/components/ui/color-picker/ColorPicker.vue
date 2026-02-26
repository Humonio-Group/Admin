<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { useVModel } from "@vueuse/core";
import { cn } from "@/lib/utils";

const props = defineProps<{
  defaultValue?: string;
  modelValue?: string;
  class?: HTMLAttributes["class"];
}>();

const emits = defineEmits<{
  (e: "update:modelValue", payload: string): void;
}>();

const modelValue = useVModel(props, "modelValue", emits, {
  passive: true,
  defaultValue: props.defaultValue,
});

// --- HSV ↔ HEX utilities ---

function hsvToHex(h: number, s: number, v: number): string {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;

  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  if (d !== 0) {
    if (max === r) h = 60 * (((g - b) / d) % 6);
    else if (max === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
  }
  if (h < 0) h += 360;

  const s = max === 0 ? 0 : d / max;
  return { h, s, v: max };
}

// --- Reactive state ---

const hue = ref(0);
const saturation = ref(1);
const brightness = ref(1);

// Sync HSV from modelValue on init and external changes
function syncFromHex(hex: string | undefined) {
  if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return;
  const hsv = hexToHsv(hex);
  hue.value = hsv.h;
  saturation.value = hsv.s;
  brightness.value = hsv.v;
}

syncFromHex(modelValue.value);

// Watch for external modelValue changes
let internalUpdate = false;
watch(modelValue, (val) => {
  if (internalUpdate) {
    internalUpdate = false;
    return;
  }
  syncFromHex(val);
});

function emitColor() {
  const hex = hsvToHex(hue.value, saturation.value, brightness.value);
  internalUpdate = true;
  modelValue.value = hex;
}

// --- Hex input ---

const hexInput = ref(modelValue.value ?? "#000000");

watch(modelValue, (val) => {
  if (val) hexInput.value = val;
});

function onHexInput(value: string | number) {
  const str = String(value);
  if (/^#[0-9a-fA-F]{6}$/.test(str)) {
    modelValue.value = str.toLowerCase();
    syncFromHex(str);
  }
}

// --- Canvas ---

const canvasRef = ref<HTMLCanvasElement | null>(null);
const canvasWidth = 256;
const canvasHeight = 160;

function drawCanvas() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // White-to-hue horizontal gradient
  const hueColor = hsvToHex(hue.value, 1, 1);
  const gradH = ctx.createLinearGradient(0, 0, canvasWidth, 0);
  gradH.addColorStop(0, "#ffffff");
  gradH.addColorStop(1, hueColor);
  ctx.fillStyle = gradH;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Transparent-to-black vertical gradient
  const gradV = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  gradV.addColorStop(0, "rgba(0,0,0,0)");
  gradV.addColorStop(1, "rgba(0,0,0,1)");
  ctx.fillStyle = gradV;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
}

watch(hue, () => drawCanvas());

// Draw canvas when it enters the DOM (popover open) — not onMounted since it lives in a portal
watch(canvasRef, (canvas) => {
  if (canvas) nextTick(() => drawCanvas());
});

// Canvas cursor position (derived from saturation/brightness)
const cursorX = computed(() => saturation.value * canvasWidth);
const cursorY = computed(() => (1 - brightness.value) * canvasHeight);

function updateFromCanvas(e: MouseEvent) {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const x = Math.max(0, Math.min(canvasWidth, (e.clientX - rect.left) * (canvasWidth / rect.width)));
  const y = Math.max(0, Math.min(canvasHeight, (e.clientY - rect.top) * (canvasHeight / rect.height)));
  saturation.value = x / canvasWidth;
  brightness.value = 1 - y / canvasHeight;
  emitColor();
}

const isDraggingCanvas = ref(false);

function onCanvasDown(e: MouseEvent) {
  isDraggingCanvas.value = true;
  updateFromCanvas(e);
  window.addEventListener("mousemove", onCanvasMove);
  window.addEventListener("mouseup", onCanvasUp);
}

function onCanvasMove(e: MouseEvent) {
  if (!isDraggingCanvas.value) return;
  updateFromCanvas(e);
}

function onCanvasUp() {
  isDraggingCanvas.value = false;
  window.removeEventListener("mousemove", onCanvasMove);
  window.removeEventListener("mouseup", onCanvasUp);
}

// --- Hue slider ---

function onHueChange(e: Event) {
  hue.value = Number((e.target as HTMLInputElement).value);
  emitColor();
}
</script>

<template>
  <UiPopover>
    <UiPopoverTrigger as-child>
      <button
        type="button"
        :class="cn(
          'inline-flex items-center gap-2 border-input h-9 rounded-md border bg-transparent px-2 shadow-xs cursor-pointer transition-[color,box-shadow]',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          'dark:bg-input/30',
          props.class,
        )"
      >
        <span
          class="size-5 shrink-0 rounded-sm border border-border"
          :style="{ backgroundColor: modelValue }"
        />
        <span class="text-sm font-mono text-foreground uppercase">{{ modelValue }}</span>
      </button>
    </UiPopoverTrigger>

    <UiPopoverContent
      class="w-auto p-3"
      :side-offset="8"
    >
      <div class="flex flex-col gap-3">
        <!-- Saturation / Brightness canvas -->
        <div class="relative select-none" :style="{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }">
          <canvas
            ref="canvasRef"
            :width="canvasWidth"
            :height="canvasHeight"
            class="block w-full h-full rounded-md cursor-crosshair"
            @mousedown="onCanvasDown"
          />
          <!-- Cursor -->
          <div
            class="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 size-4 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.3)]"
            :style="{ left: `${cursorX}px`, top: `${cursorY}px` }"
          />
        </div>

        <!-- Hue slider -->
        <input
          type="range"
          min="0"
          max="360"
          :value="hue"
          class="color-picker-hue-slider w-full cursor-pointer"
          @input="onHueChange"
        >

        <!-- Hex input -->
        <div class="flex items-center gap-2">
          <UiInput
            :model-value="hexInput"
            class="font-mono uppercase text-xs h-8"
            @update:model-value="onHexInput"
          />
        </div>
      </div>
    </UiPopoverContent>
  </UiPopover>
</template>

<style scoped>
.color-picker-hue-slider {
  -webkit-appearance: none;
  appearance: none;
  height: 12px;
  border-radius: 6px;
  outline: none;
  background: linear-gradient(
    to right,
    hsl(0, 100%, 50%),
    hsl(60, 100%, 50%),
    hsl(120, 100%, 50%),
    hsl(180, 100%, 50%),
    hsl(240, 100%, 50%),
    hsl(300, 100%, 50%),
    hsl(360, 100%, 50%)
  );
}

.color-picker-hue-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  border: 2px solid white;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

.color-picker-hue-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  border: 2px solid white;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

.color-picker-hue-slider::-moz-range-track {
  height: 12px;
  border-radius: 6px;
  background: transparent;
}
</style>
