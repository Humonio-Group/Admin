import { defaults, PER_PAGE, type ProgramState } from "~/types/states/program";
import { buildProgramListEntity, buildTagEntity } from "~/lib/entities/lifecycle/program";
import { toast } from "vue-sonner";

export const useProgramStore = defineStore("programs", {
  state: (): ProgramState => ({ ...defaults }),
  getters: {
    api: () => useApi(),
    translate: () => useNuxtApp().$i18n.t,

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
    async loadPrograms(active: boolean = true, page: number = 1, offset: number = 0) {
      this.loading.items = true;

      try {
        const response = await this.api.get("/programs", { version: 2, endpointVersion: 1 }, {
          query: {
            "fields[programs]": "default,stats.journeys,stats.participants,stats.facilitators,stats.evaluation",
            "limit": page * PER_PAGE,
            offset,
            "active": active ? 1 : 0,
          },
        });
        this.programs = response.data.map((program: any) => buildProgramListEntity(program));
      }
      catch {
        console.error("error");
      }
      finally {
        this.loading.items = false;
      }
    },
    async loadProgram(_id: string) {},
  },
});
