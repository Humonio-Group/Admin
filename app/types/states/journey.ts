import type { Listed, Nullable } from "~/types/primitives/objects";
import type { Journey, NotificationTemplate, SelectedJourney } from "~/types/entities/journey";
import type { Group } from "~/types/entities/group";

export const PER_PAGE = 20;

export interface JourneyState {
  journeys: Listed<Journey>;
  totalEntities: number;
  selectedJourney: Nullable<SelectedJourney>;
  templates: Listed<NotificationTemplate>;
  groups: Listed<Group>;
  loading: {
    items: boolean;
    specimen: boolean;
    groups: boolean;
    updatingTeamMembers: Listed<number>;

    sendEmails: boolean;

    templates: boolean;

    create: boolean;
    save: boolean;

    team: {
      adding: boolean;
      updating: number;
      removing: number;

      addingParticipant: boolean;
      moving: boolean;
      archiving: Listed<number>;
      restoring: Listed<number>;
      deleting: Listed<number>;
    };
    teams: boolean;
    teamMembers: Listed<number>;

    actions: boolean;

    nextEvents: boolean;
    requestingEventCalendarIcs: Listed<number>;

    scores: boolean;

    simulations: boolean;
    exportSimulation: boolean;
    shareSimulation: boolean;

    results: {
      stages: boolean;
      contents: Listed<number>;
      graphs: boolean;
    };
  };
}

export const defaults: JourneyState = {
  journeys: [],
  totalEntities: -1,
  selectedJourney: null,
  templates: [],
  groups: [],
  loading: {
    items: false,
    specimen: false,
    groups: false,
    updatingTeamMembers: [],

    sendEmails: false,

    templates: false,

    create: false,
    save: false,

    team: {
      adding: false,
      updating: -1,
      removing: -1,

      addingParticipant: false,
      moving: false,
      archiving: [],
      restoring: [],
      deleting: [],
    },
    teams: false,
    teamMembers: [],

    actions: false,

    nextEvents: false,
    requestingEventCalendarIcs: [],

    scores: false,

    simulations: false,
    exportSimulation: false,
    shareSimulation: false,

    results: {
      stages: false,
      contents: [],
      graphs: false,
    },
  },
};
