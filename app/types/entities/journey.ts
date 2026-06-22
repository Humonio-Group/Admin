import type { Listed, Nullable } from "~/types/primitives/objects";
import type { Program } from "~/types/entities/program";
import type { Group } from "~/types/entities/group";
import type { Action } from "~/types/entities/action";
import type { ChartData, GraphType } from "~/types/entities/graph";
import type { Translation } from "~/types/primitives/translations";

export interface JourneyMember {
  id: number;
  firstName: string;
  lastName: string;
  avatar: string;
}
export interface Journey {
  id: number;
  name: string;
  status: -1 | 0 | 1 | 2;
  picture: Nullable<string>;
  dates: {
    start: Date;
    end: Date;
  };
  stats: {
    evaluation: {
      experience: number;
      facilitators: number;
    };
  };
  facilitators: Listed<JourneyMember>;
  participants: Listed<JourneyMember>;

  relatedProgram?: Program;
}

export interface JourneyEvent {
  id: number;
  duration: number;
  icon: Nullable<string>;
  name: string;
  dates: {
    start: Date;
    end: Date;
  };
  config: {
    calendarLink: string;
    link: Nullable<string>;
    display: Nullable<string>;
    place: Nullable<string>;
  };
  facilitators: Listed<JourneyMember>;
}

export type JourneyScoreScope = "access" | "scores-participants" | "scores-teams";
export interface JourneyScore {
  label: string;
  min: number;
  max: number;
  value: number;
  percent: boolean;
}

export interface JourneySimulation {
  id: number;
  name: string;
  version: {
    key: string;
    value: number;
  };
  token: string;
  icon: Nullable<string>;
  downloadCode: string;
  simKey: string;
  trialKey: string;
}

export interface SelectedJourney extends Journey {
  teams: {
    totalEntities: number;
    list: Listed<any>;
  };
  actions: {
    totalEntities: number;
    list: Listed<Action>;
  };
  nextEvents: {
    totalEntities: number;
    list: Listed<JourneyEvent>;
  };
  scores: {
    access: Listed<JourneyScore>;
    average: {
      participants: Listed<JourneyScore>;
      teams: Listed<JourneyScore>;
    };
  };
  simulations: {
    totalEntities: number;
    list: Listed<JourneySimulation>;
  };
  results: {
    stages: Listed<JourneyStage>;
  };
}

export interface JourneyStage {
  id: number;
  reference: number;
  picture: Nullable<string>;
  name: string;
  modality: string;
  progress: number;
  locked: boolean;
  hidden: boolean;
  conditions: Listed<string>;

  contents: Listed<JourneyStageContent>;
}

export interface JourneyStageContentGraph {
  id: string;
  title: string;
  description: string;
  type: GraphType;
  config: Nullable<ChartData>;
}

export interface JourneyStageContent {
  id: number;
  name: string;
  picture: Nullable<string>;
  duration: number;
  stats: {
    views: number;
    viewsCount: number;
    completion: number;
    completionCount: number;
  };
  access: Listed<JourneyStageContentAccess>;
  graphs: Listed<JourneyStageContentGraph>;
}
export interface JourneyStageContentAccess {
  userId: number;
  participation: {
    id: number;
    team: string;
    name: string;
    picture: Nullable<string>;
  };
  visibility: "accessible" | "hidden" | "locked";
  progress: {
    viewedAt: Nullable<Date>;
    completedAt: Nullable<Date>;
  };
  permissions: {
    pushable: boolean;
    unPushable: boolean;
  };
  result: {
    link: Nullable<string>;
    data: Nullable<any>;
  };
}

export interface JourneyTeam {
  id: number;
  name: string;
  stats: {
    full: boolean;
    maxParticipants: number;
    coaches: number;
    participants: number;
  };
  leader: Nullable<number>;
  coaches: Listed<JourneyTeamMember>;
  participants: Listed<JourneyTeamMember>;
}

export interface JourneyTeamMember {
  id: number;
  reference: number;
  archived: boolean;
  leader?: boolean;
  avatar: Nullable<string>;
  firstName: string;
  lastName: string;
  email: string;
  groups: Listed<Group>;
}

export interface NotificationTemplate {
  id: number;
  name: string;
  title: Translation;
  description: Translation;
  variables: Record<string, string>;
  availableVariables: Listed<keyof NotificationTemplate["variables"]>;
}
