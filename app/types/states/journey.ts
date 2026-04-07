import type { Listed, Nullable } from "~/types/primitives/objects";
import type { Journey } from "~/types/entities/journey";

export const PER_PAGE = 20;

export interface JourneyState {
  journeys: Listed<Journey>;
  totalEntities: number;
  selectedJourney: Nullable<Journey>;
  loading: {
    items: boolean;
    specimen: boolean;
  };
}

export const defaults: JourneyState = {
  journeys: [],
  totalEntities: -1,
  selectedJourney: null,
  loading: {
    items: false,
    specimen: false,
  },
};
