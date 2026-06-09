import type { Listed, Nullable } from "~/types/primitives/objects";
import type { Journey } from "~/types/entities/journey";
import type { Translation } from "~/types/primitives/translations";
import type { QiguLanguage } from "~/types/entities/language";
import type { CompanyUser } from "~/types/entities/company";

export interface ProgramStats {
  journeys: number;
  participants: number;
  facilitators: number;
  rate: number;
}

export interface Program {
  id: number;
  key: string;
  duration: number;
  active: boolean;
  default: boolean;
  name: Translation;
  description: Translation;
  picture: Nullable<string>;
  config: {
    minFacilitators: Nullable<number>;
    minPartPerJourney: Nullable<number>;
    minParticipants: Nullable<number>;
    numParticipants: Nullable<number>;
    numTeams: Nullable<number>;
  };
  stats: ProgramStats;
  defaultLanguage: QiguLanguage;
  languages: Listed<QiguLanguage>;
  defaultFacilitator: Nullable<CompanyUser>;
}
export type ProgramListEntity = Pick<Program, "id" | "key" | "active" | "duration" | "default" | "name" | "description" | "picture" | "stats" | "defaultLanguage" | "defaultFacilitator" | "languages" | "config">;

export interface ProgramTag {
  id: number;
  name: string;
}

export interface SelectedProgram extends Program {
  journeys: {
    totalEntities: number;
    list: Listed<Journey>;
  };
}
