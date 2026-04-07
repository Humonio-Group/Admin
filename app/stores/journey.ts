import { defaults, type JourneyState, PER_PAGE } from "~/types/states/journey";
import type { Journey } from "~/types/entities/journey";
import type { Listed } from "~/types/primitives/objects";
import { toast } from "vue-sonner";
import { buildJourneyEntity } from "~/lib/entities/lifecycle/journey";

export const useJourneyStore = defineStore("journeys", {
  state: (): JourneyState => ({ ...defaults }),
  getters: {
    api: () => useApi(),
    translate: () => useNuxtApp().$i18n.t,

    company: () => {
      const { company } = storeToRefs(useCompanyStore());
      return company.value;
    },

    hasFirstLoaded: state => state.totalEntities >= 0,
    journey: state => state.selectedJourney,
  },
  actions: {
    async loadJourneys(status: Listed<Journey["status"]> = [-1, 0, 1, 2], page: number = 1, take: number = PER_PAGE) {
      if (!this.company) return;

      if (page < 1) page = 1;

      const limit = take;
      const offset = take === -1 ? 0 : (page - 1) * take;

      this.loading.items = true;

      try {
        const response = await this.api.get("/journeys", { version: 2, endpointVersion: 1, vanilla: true }, {
          query: {
            limit,
            offset,
            "include": "facilitators,mainFacilitator,participants,program",
            "companies": Number(this.company.id),
            "fields[users]": "name,picture",
            "status": status.join(","),
            "fields[journeys]": "default,displayName,stats.participants",
            "fields[programs]": "default,stats.journeys,stats.participants,stats.facilitators,stats.evaluation",
          },
        });

        const { data, included, meta } = response;
        this.journeys = data.map((journey: any) => buildJourneyEntity(journey, included));
        this.totalEntities = meta.total;
      }
      catch (e) {
        console.error(e);
        toast.error(this.translate("toasts.error.default", { code: 500 }));
      }
      finally {
        this.loading.items = false;
      }
    },
    async loadJourney(id: number) {
      if (!this.company) return;

      this.loading.specimen = true;

      try {
        const response = await this.api.get(`/journeys/${id}`, { version: 2, endpointVersion: 1, vanilla: true }, {
          query: {
            "include": "facilitators,mainFacilitator,participants,program",
            "companies": Number(this.company.id),
            "fields[users]": "name,picture",
            "fields[journeys]": "default,displayName,stats.participants",
            "fields[programs]": "default,stats.journeys,stats.participants,stats.facilitators,stats.evaluation",
          },
        });

        const { data, included } = response;
        this.selectedJourney = buildJourneyEntity(data, included);
      }
      catch {
        toast.error(this.translate("toasts.error.default", { code: 500 }));
      }
      finally {
        this.loading.specimen = false;
      }
    },
  },
});
