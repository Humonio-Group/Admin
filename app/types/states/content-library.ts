import type { Listed } from "~/types/primitives/objects";
import type { LibraryCategory, LibraryContent } from "~/types/entities/content-library";

export interface ContentLibraryState {
  contents: Listed<LibraryContent>;
  tags: Listed<LibraryCategory>;
  totalEntities: number;
  loading: {
    list: boolean;
    tags: boolean;
  };
}

export const defaults: ContentLibraryState = {
  contents: [],
  tags: [],
  totalEntities: -1,
  loading: {
    list: false,
    tags: false,
  },
};
