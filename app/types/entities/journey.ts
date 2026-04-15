import type { Listed, Nullable } from "~/types/primitives/objects";
import type { Program } from "~/types/entities/program";
import type { Group } from "~/types/entities/group";

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
  facilitators: Listed<JourneyMember>;
  participants: Listed<JourneyMember>;

  relatedProgram?: Program;
}

export interface SelectedJourney extends Journey {
  teams: {
    totalEntities: number;
    list: Listed<any>;
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
