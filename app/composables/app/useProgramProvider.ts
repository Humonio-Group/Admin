import type { Program } from "~/types/entities/program";
import type { Listed, Nullable } from "~/types/primitives/objects";
import type { JourneyConfigProgram } from "~/types/entities/config/journey";
import { buildJourneyConfiguration } from "~/lib/entities/lifecycle/journey-config";

export function useProgramProvider() {
  const loadingPrograms = ref<boolean>(false);
  const programs = ref<Listed<Program>>([]);

  const loadingProgram = ref<boolean>(false);
  const program = ref<Nullable<JourneyConfigProgram>>(null);
  const hasEditableStages = computed(() => program.value?.stages.some(stage => stage.contents.length));

  async function list() {
    if (programs.value.length) return;
    loadingPrograms.value = true;

    try {
      const response = await useApi().get("/programs", { version: 2, endpointVersion: 1, vanilla: true }, {
        query: {
          limit: -1,
          offset: 0,
        },
      });

      programs.value = response.data.map((entity: any) => ({ id: entity.id, name: entity.attributes.name }));
    }
    catch {
      console.error("error");
    }
    finally {
      loadingPrograms.value = false;
    }
  }
  async function entity(id: number) {
    loadingProgram.value = true;

    try {
      const response = await useApi().get(`/programs/${id}`, { version: 2, endpointVersion: 1, vanilla: true }, {
        query: {
          "include": "languages,programStages,programStages.timebasedContents,programStages.timebasedContents.defaultFacilitators,programStages.timebasedContents.defaultLocations",
          "fields[contents]": "displayName,design,type,blended,activation,translations",
          "fields[programs]": "name,default,programGoInformations,translations,stats.all,duration",
          "fields[languages]": "code,nativeName",
          "fields[programStages]": "default,name,translations",
        },
      });

      const { data, included } = response;
      program.value = buildJourneyConfiguration(data, included);
    }
    catch (e) {
      console.error(e);
    }
    finally {
      loadingProgram.value = false;
    }
  }

  return {
    loadingPrograms,
    loadingProgram,
    hasEditableStages,

    programs,
    program,

    list,
    entity,
  };
}
