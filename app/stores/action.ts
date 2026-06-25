import { type ActionState, defaults } from "~/types/states/action";
import { buildActionEntity } from "~/lib/entities/lifecycle/action";

export const useActionStore = defineStore("actions", {
  state: (): ActionState => ({ ...defaults }),
  getters: {
    api: () => useApi(),
    translate: () => useNuxtApp().$i18n.t,
    company: () => storeToRefs(useCompanyStore()).company.value,

    perPage: () => 25,

    hasLoaded: state => state.totalEntities > -1,
  },
  actions: {
    async load(status?: number, keywords?: string, page: number = 1, perPage: number = 25) {
      if (!this.company) return;

      if (page < 1) page = 1;
      if (perPage < this.perPage) perPage = this.perPage;

      this.loading = true;

      try {
        const response = await this.api.get("/actions", { version: 2, endpointVersion: 1, vanilla: true }, {
          query: {
            "include": "user,journey,journey.program,journey.program.company,template",
            "fields[programs]": "name",
            "fields[companies]": "name",
            "fields[actions]": "status,dates,description,rawDescription,tasklist",
            "companies": this.company.id,
            "offset": keywords?.length ? 0 : (page - 1) * perPage,
            "limit": keywords?.length ? -1 : perPage,
            ...(keywords?.length ? { keyword: keywords } : {}),
            status,
          },
        });

        const { data, included } = response;
        this.actions = data.map((a: any) => buildActionEntity(a, included));
      }
      catch {
        console.error("error while loading response");
      }
      finally {
        this.loading = false;
      }
    },
  },
});
