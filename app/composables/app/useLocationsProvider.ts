import type { Listed } from "~/types/primitives/objects";
import { buildLocationEntity } from "~/lib/location";

export function useLocationsProvider() {
  const loadingLocations = ref<boolean>(false);

  const locations = ref<Listed<Location>>([]);

  async function list() {
    if (locations.value.length) return;
    loadingLocations.value = true;

    try {
      const response = await useApi().get("/locations", { version: 2, endpointVersion: 1, vanilla: true }, {
        query: {
          "companies": storeToRefs(useCompanyStore()).company.value?.id,
          "limit": -1,
          "include": "country",
          "fields[locations]": "name,city",
          "fields[counries]": "name",
        },
      });

      locations.value = response.data.map((location: any) => buildLocationEntity(location, response.included));
    }
    catch (e) {
      console.error(e);
    }
    finally {
      loadingLocations.value = false;
    }
  }

  provide("locations", locations);

  return {
    loadingLocations,

    locations,

    list,
  };
}
