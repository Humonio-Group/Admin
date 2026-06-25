import type { LibraryCategory, LibraryContent } from "~/types/entities/content-library";
import { EntityType } from "~/types/entities";

export function buildLibraryCategoryEntity(data: any): LibraryCategory {
  const { id, attributes } = data;

  return {
    id,
    name: attributes.name,
  };
}

export function buildLibraryContentEntity(data: any, included: any): LibraryContent {
  const { id, attributes, relationships } = data;
  const author = included.find((entity: any) => entity.type === EntityType.USER && entity.id === relationships.creator.data[0]!.id);

  return {
    id,
    name: attributes.translations.displayName,
    icon: attributes.design.picture.thumbnail,
    author: {
      name: author.attributes.name,
      picture: author.attributes.picture.thumbnail,
    },
    type: attributes.type,
    createdAt: new Date(attributes.dates.creation),
    updatedAt: new Date(attributes.dates.update),
  };
}
