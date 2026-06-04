import { defaults, PER_PAGE, type ProgramState } from "~/types/states/program";
import {
  buildProgramEntity,
  buildProgramListEntity,
  buildTagEntity,
  extendToSelectedProgram,
} from "~/lib/entities/lifecycle/program";
import { toast } from "vue-sonner";
import { buildJourneyEntity } from "~/lib/entities/lifecycle/journey";

export const useProgramStore = defineStore("programs", {
  state: (): ProgramState => ({ ...defaults }),
  getters: {
    api: () => useApi(),
    translate: () => useNuxtApp().$i18n.t,

    company: () => storeToRefs(useCompanyStore()).company.value,

    hasFirstLoaded: state => state.totalEntities >= 0,
  },
  actions: {
    async loadTags() {
      this.loading.tags = true;

      try {
        const response = await this.api.get("/tags", { version: 2, endpointVersion: 1, vanilla: true }, {
          query: {
            "fields[tags]": "name",
            "limit": -1,
            "offset": 0,
          },
        });

        this.tags = response.data.map((tag: any) => buildTagEntity(tag));
      }
      catch {
        toast.error(this.translate("toasts.error.default"));
      }
      finally {
        this.loading.tags = false;
      }
    },
    async loadPrograms(tagId?: number, keywords?: string, active: boolean = true, page: number = 1, offset: number = 0) {
      if (!this.company) return;
      this.loading.items = true;

      try {
        const response = await this.api.get("/programs", { version: 2, endpointVersion: 1 }, {
          query: {
            "companies": this.company.id,
            "fields[programs]": "default,stats.journeys,stats.participants,stats.facilitators,stats.evaluation",
            "limit": keywords?.length ? -1 : page * PER_PAGE,
            "offset": keywords?.length ? 0 : offset,
            "active": active ? 1 : 0,
            ...(tagId ? { tags: tagId } : {}),
          },
        });
        this.programs = response.data.map((program: any) => buildProgramListEntity(program));
      }
      catch (e) {
        console.error("error", e);
      }
      finally {
        this.loading.items = false;
      }
    },
    async loadProgram(id: number) {
      this.loading.specimen = true;

      try {
        const response = await this.api.get(`/programs/${id}`, { version: 2, endpointVersion: 1, vanilla: true }, {
          query: {
            "fields[programs]": "default,stats.journeys,stats.participants,stats.facilitators,stats.evaluation",
          },
        });

        const program = buildProgramEntity(response.data);
        this.selectedProgram = extendToSelectedProgram(program);
      }
      catch (e) {
        console.error(e);
        toast.error(this.translate("toasts.error.default"));
      }
      finally {
        this.loading.specimen = false;
      }
    },

    async loadJourneys(status: (-1 | 0 | 1 | 2)[] = [-1, 0, 1, 2]) {
      const { company } = storeToRefs(useCompanyStore());
      if (!company.value || !this.selectedProgram) return;

      this.loading.journeys = true;
      try {
        const response = await this.api.get("/journeys", { version: 2, endpointVersion: 1, vanilla: true }, {
          query: {
            "programs": this.selectedProgram.id,
            "include": "facilitators,mainFacilitator,participants",
            "companies": Number(company.value.id),
            "fields[users]": "name,picture",
            "status": status.join(","),
            "fields[journeys]": "default,displayName,stats.participants",
          },
        });

        this.selectedProgram.journeys = {
          totalEntities: response.meta.total,
          list: response.data.map((journey: any) => buildJourneyEntity(journey, response.included)),
        };
      }
      catch {
        toast.error(this.translate("toasts.error.default"));
      }
      finally {
        this.loading.journeys = false;
      }
    },
  },
});
