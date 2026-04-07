import type { Listed, Nullable } from "~/types/primitives/objects";
import type { Program } from "~/types/entities/program";

export interface JourneyMember {
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
