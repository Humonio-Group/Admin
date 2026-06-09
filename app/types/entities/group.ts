export interface Group {
  id: number;
  name: string;
}

export enum GroupAction {
  ADD = "add",
  REMOVE = "remove",
}
