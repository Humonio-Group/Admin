import type { Translation } from "~/types/primitives/translations";

export interface LibraryCategory {
  id: string;
  name: string;
}

export interface LibraryContent {
  id: string;
  name: Translation;
  icon: string;
  type: string;
  author: {
    name: string;
    picture: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
