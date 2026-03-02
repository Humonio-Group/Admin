import type { Location, LocationCountry } from "~/types/entities/location";
import { EntityType } from "~/types/entities";

export function buildCountryEntity(data: any): LocationCountry {
  return {
    id: data.id,
    code: data.attributes.code.toLowerCase(),
    name: data.attributes.name,
    europa: data.attributes.isInEuropa,
    position: {
      lat: data.attributes.lattitude,
      long: data.attributes.longitude,
    },
  };
}

export function buildLocationEntity(data: any, included: any): Location {
  const country = included.find((country: any) => country.type === EntityType.COUNTRY && country.id === data.relationships.country.data[0]!.id);

  return {
    id: data.id,
    name: data.attributes.name,
    city: data.attributes.city,
    country: buildCountryEntity(country),
  };
}
