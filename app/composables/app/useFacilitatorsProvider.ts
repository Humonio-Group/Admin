import type { CompanyUser } from "~/types/entities/company";
import type { Listed } from "~/types/primitives/objects";
import { buildCompanyUserEntity } from "~/lib/company";

export function useFacilitatorsProvider() {
  const loadingFacilitators = ref<boolean>(false);

  const facilitators = ref<Listed<CompanyUser>>([]);

  async function list() {
    if (facilitators.value.length) return;
    loadingFacilitators.value = true;

    try {
      const response = await useApi().get("/users", { version: 2, endpointVersion: 1, vanilla: true }, {
        query: {
          company: storeToRefs(useCompanyStore()).company.value?.id,
          limit: -1,
          roles: 5,
        },
      });

      facilitators.value = response.data.map((entity: any) => buildCompanyUserEntity(entity, []));
    }
    catch (e) {
      console.error(e);
    }
    finally {
      loadingFacilitators.value = false;
    }
  }

  provide("facilitators", facilitators);

  return {
    loadingFacilitators,

    facilitators,

    list,
  };
}
