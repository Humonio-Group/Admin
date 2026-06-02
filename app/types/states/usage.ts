import type { Listed, Nullable } from "~/types/primitives/objects";
import type { AreaChartData } from "~/types/entities/graph";

export interface AiUsageEntity {
  simulations: number;
  remaining: {
    tokens?: number;
    minutesIn?: number;
    minutesOut?: number;
    minutes?: number;
  };
  available: {
    tokens?: number;
    minutesIn?: number;
    minutesOut?: number;
    minutes?: number;
  };
  graph: AreaChartData;
}

export interface UsageState {
  years: Listed<number>;
  platform: Nullable<AreaChartData>;
  ai: Nullable<AiUsageEntity>;
  loading: {
    platform: boolean;
    ai: boolean;
  };
}

export const defaults: UsageState = {
  years: [],
  platform: null,
  ai: null,
  loading: {
    platform: false,
    ai: false,
  },
};
