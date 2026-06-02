<script setup lang="ts">
import type { LineChartData } from "~/types/entities/graph";
import { computed, ref, onMounted, onBeforeUnmount, watch } from "vue";
import type { Options as HighchartsOptions, Chart as HighchartsChart } from "highcharts";

const props = defineProps<{
  data: LineChartData;
}>();

const chartRef = ref<{ chart: HighchartsChart } | null>(null);
const wrapperRef = ref<HTMLElement | null>(null);
const resolvedColors = ref<string[]>([]);
let resizeObserver: ResizeObserver | null = null;

function resolveChartColors(count: number): string[] {
  const style = getComputedStyle(document.documentElement);
  return Array.from({ length: count }, (_, i) =>
    style.getPropertyValue(`--chart-${(i % 5) + 1}`).trim(),
  );
}

onMounted(() => {
  resolvedColors.value = resolveChartColors(props.data.series.length);
  resizeObserver = new ResizeObserver((entries) => {
    const { width } = entries[0].contentRect;
    chartRef.value?.chart?.setSize(width, undefined, false);
  });
  if (wrapperRef.value) resizeObserver.observe(wrapperRef.value);
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
});

watch(() => props.data.series.length, (len) => {
  resolvedColors.value = resolveChartColors(len);
});

const chartOptions = computed<HighchartsOptions>(() => ({
  chart: {
    type: "line",
    backgroundColor: "transparent",
    style: {
      fontFamily: "inherit",
    },
  },
  title: {
    text: undefined,
  },
  xAxis: {
    categories: props.data.categories,
    lineColor: "var(--border)",
    tickLength: 0,
    labels: {
      style: {
        color: "var(--muted-foreground)",
        fontSize: "12px",
      },
    },
  },
  yAxis: {
    title: {
      text: undefined,
    },
    allowDecimals: false,
    gridLineColor: "var(--border)",
    gridLineDashStyle: "Dash",
    labels: {
      style: {
        color: "var(--muted-foreground)",
        fontSize: "12px",
      },
    },
  },
  legend: {
    enabled: props.data.series.length > 1,
    itemStyle: {
      color: "var(--foreground)",
      fontWeight: "normal",
      fontSize: "12px",
    },
    itemHoverStyle: {
      color: "var(--foreground)",
    },
  },
  tooltip: {
    shared: true,
    useHTML: true,
    backgroundColor: "transparent",
    borderWidth: 0,
    shadow: false,
    padding: 0,
    headerFormat: `<div style="background:var(--popover);border:1px solid var(--border);border-radius:8px;padding:8px 12px;box-shadow:0 4px 12px rgba(0,0,0,.15);font-size:12px;color:var(--popover-foreground)">
      <div style="font-weight:600;margin-bottom:4px">{point.key}</div>`,
    pointFormat: `<div style="display:flex;align-items:center;gap:8px;padding:2px 0">
        <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:{series.color}"></span>
        <span style="flex:1">{series.name}</span>
        <span style="font-weight:600;margin-left:12px">{point.y}</span>
      </div>`,
    footerFormat: "</div>",
  },
  plotOptions: {
    line: {
      marker: {
        enabled: true,
        radius: 4,
        symbol: "circle",
      },
    },
  },
  credits: {
    enabled: false,
  },
  series: props.data.series.map((s, i) => ({
    type: "line" as const,
    name: s.name,
    data: s.data,
    color: resolvedColors.value[i] ?? `var(--chart-${(i % 5) + 1})`,
  })),
}));
</script>

<template>
  <div ref="wrapperRef" class="line-chart-wrapper h-full w-full">
    <highcharts ref="chartRef" :options="chartOptions" />
  </div>
</template>

<style scoped>
.line-chart-wrapper {
  overflow: hidden;
  min-width: 0;
}
.line-chart-wrapper :deep(div) {
  height: 100%;
}
</style>
