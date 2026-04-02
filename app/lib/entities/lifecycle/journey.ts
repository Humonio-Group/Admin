import type { Journey } from "~/types/entities/journey";
import { EntityType } from "~/types/entities";

export function buildJourneyEntity(data: any, included: any): Journey {
  const { id, attributes, relationships } = data;

  const facilitatorIds = [
    ...relationships.facilitators.data.map((entity: any) => entity.id),
    ...(relationships.mainFacilitator.data[0] ? [relationships.mainFacilitator.data[0].id] : []),
  ];
  const facilitators = included.filter((entity: any) => entity.type === EntityType.USER && facilitatorIds.includes(entity.id));

  const participantsIds = relationships.participants.data.map((entity: any) => entity.id);
  const participants = included.filter((entity: any) => entity.type === EntityType.USER && participantsIds.includes(entity.id));

  return {
    id,
    name: attributes.displayName,
    status: attributes.status.value,
    picture: attributes.picture?.thumbnail || null,
    dates: {
      start: new Date(attributes.dates.start),
      end: new Date(attributes.dates.end),
    },
    facilitators: facilitators.map((f: any) => ({
      firstName: f.attributes.firstname,
      lastName: f.attributes.lastname,
      avatar: f.attributes.picture.thumbnail,
    })),
    participants: participants.map((f: any) => ({
      firstName: f.attributes.firstname,
      lastName: f.attributes.lastname,
      avatar: f.attributes.picture.thumbnail,
    })),
  };
}

export function computeStatus(status: Journey["status"]) {
  switch (status) {
    case -1: return "cancelled";
    case 1: return "confirmed";
    case 2: return "closed";
    default: return "unconfirmed";
  }
}
export function parseStatus(status: string): Journey["status"] {
  switch (status) {
    case "confirmed": return 1;
    case "cancelled": return -1;
    case "closed": return 2;
    default: return 0;
  }
}
export function computeStatusColors(status: Journey["status"]): { border: string; text: string; background: string } {
  switch (status) {
    case -1: return {
      border: "border-rose-400",
      text: "text-rose-700 dark:text-rose-400",
      background: "bg-rose-400/10 dark:bg-rose-400/20",
    };
    case 1: return {
      border: "border-green-400",
      text: "text-green-700 dark:text-green-400",
      background: "bg-green-400/10 dark:bg-green-400/20",
    };
    case 2: return {
      border: "border-sky-400",
      text: "text-sky-700 dark:text-sky-400",
      background: "bg-sky-400/10 dark:bg-sky-400/20",
    };
    default: return {
      border: "border-amber-400",
      text: "text-amber-700 dark:text-amber-400",
      background: "bg-amber-400/10 dark:bg-amber-400/20",
    };
  }
}
