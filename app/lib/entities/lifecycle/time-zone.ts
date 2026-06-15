import type { TimeZone } from "~/types/entities/time-zone";

export function buildTimeZoneEntity(data: any): TimeZone {
  const { id, attributes } = data;

  return {
    id,
    name: attributes.name,
  };
}
