import type { Nullable } from "~/types/primitives/objects";

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
  name: string;
  description: string;
  picture: Nullable<string>;
  stats: ProgramStats;
}
export type ProgramListEntity = Pick<Program, "id" | "key" | "active" | "duration" | "default" | "name" | "description" | "picture" | "stats">;

export interface ProgramTag {
  id: number;
  name: string;
}
