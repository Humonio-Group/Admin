import type { Listed } from "~/types/primitives/objects";
import type { Action } from "~/types/entities/action";

export interface ActionState {
  actions: Listed<Action>;
  totalEntities: number;
  loading: boolean;
}

export const defaults: ActionState = {
  actions: [],
  totalEntities: -1,
  loading: false,
};
