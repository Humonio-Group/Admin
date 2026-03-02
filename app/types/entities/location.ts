export interface LocationCountry {
  id: number;
  europa: boolean;
  code: string;
  name: string;
  position: {
    lat: number;
    long: number;
  };
}

export interface Location {
  id: number;
  name: string;
  city: string;
  country: LocationCountry;
}
export type Locations = Location[];
