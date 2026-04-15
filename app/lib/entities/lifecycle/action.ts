import type { Action } from "~/types/entities/action";
import { EntityType } from "~/types/entities";

export function buildActionEntity(data: any, included: any): Action {
  const { id, attributes, relationships } = data;
  const author = included.find((e: any) => e.type === EntityType.USER && e.id === relationships.user.data[0].id);

  return {
    id,
    active: attributes.active,
    status: attributes.status.value,
    description: {
      original: attributes.description,
      raw: attributes.rawDescription,
    },
    dates: {
      createdAt: new Date(attributes.dates.creation),
      updatedAt: new Date(attributes.dates.update),
      lastHistory: attributes.dates.lastHistory ? new Date(attributes.dates.lastHistory) : null,
      deadline: new Date(attributes.dates.endAction),
    },
    progress: attributes.progression,
    tasks: attributes.tasklist,
    author: {
      name: {
        first: author?.attributes.firstname,
        last: author?.attributes.lastname,
        full: author?.attributes.name,
      },
    },
    template: null,
  };
}
