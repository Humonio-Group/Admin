import type { Listed, Nullable } from "~/types/primitives/objects";
import type { ProgramListEntity, ProgramTag, SelectedProgram } from "~/types/entities/program";

export const PER_PAGE = 20 as const;

export interface ProgramState {
  programs: Listed<ProgramListEntity>;
  tags: Listed<ProgramTag>;
  totalEntities: number;
  selectedProgram: Nullable<SelectedProgram>;
  loading: {
    items: boolean;
    tags: boolean;
    specimen: boolean;
    journeys: boolean;
  };
}

export const defaults: ProgramState = {
  programs: [],
  tags: [],
  totalEntities: -1,
  selectedProgram: null,
  loading: {
    items: false,
    tags: false,
    specimen: false,
    journeys: false,
  },
};
