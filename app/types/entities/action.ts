import type { Listed, Nullable } from "~/types/primitives/objects";

export interface Action {
  id: number;
  active: boolean;
  status: -2 | 0 | 1;
  description: {
    original: string;
    raw: string;
  };
  dates: {
    createdAt: Date;
    updatedAt: Date;
    lastHistory: Nullable<Date>;
    deadline: Date;
  };
  progress: number;
  tasks: Listed<{
    done: boolean;
    name: string;
  }>;
  author: {
    avatar: Nullable<string>;
    name: {
      first: string;
      last: string;
      full: string;
    };
  };
  template: Nullable<string>;
}
