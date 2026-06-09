import type { Listed, Nullable } from "~/types/primitives/objects";
import type { ProgramListEntity, ProgramTag, SelectedProgram } from "~/types/entities/program";
import type { QiguLanguage } from "~/types/entities/language";

export const PER_PAGE = 20 as const;

export interface ProgramState {
  programs: Listed<ProgramListEntity>;
  tags: Listed<ProgramTag>;
  languages: Listed<QiguLanguage>;
  totalEntities: number;
  selectedProgram: Nullable<SelectedProgram>;
  loading: {
    items: boolean;
    tags: boolean;
    specimen: boolean;
    journeys: boolean;
    languages: boolean;

    create: boolean;
    save: boolean;
  };
}

export const defaults: ProgramState = {
  programs: [],
  tags: [],
  languages: [],
  totalEntities: -1,
  selectedProgram: null,
  loading: {
    items: false,
    tags: false,
    specimen: false,
    journeys: false,
    languages: false,

    create: false,
    save: false,
  },
};
