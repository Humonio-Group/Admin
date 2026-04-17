import type { Listed, Nullable } from "~/types/primitives/objects";
import type { Program } from "~/types/entities/program";
import type { Group } from "~/types/entities/group";
import type { Action } from "~/types/entities/action";

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
