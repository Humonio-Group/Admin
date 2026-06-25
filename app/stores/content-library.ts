import { type ContentLibraryState, defaults } from "~/types/states/content-library";
import { buildLibraryCategoryEntity, buildLibraryContentEntity } from "~/lib/entities/lifecycle/content-library";

export const useContentLibraryStore = defineStore("content-library", {
  state: (): ContentLibraryState => ({ ...defaults }),
  getters: {
    api: () => useApi(),
    translate: () => useNuxtApp().$i18n.t,
    locale: () => useNuxtApp().$i18n.locale.value,

    company: () => storeToRefs(useCompanyStore()).company.value,

    perPage: () => 25,

    hasLoaded: state => state.totalEntities >= 0,
  },
  actions: {
    async loadTags() {
      this.loading.tags = true;

      try {
        const response = await this.api.get("/library_categories", { version: 2, endpointVersion: 1, vanilla: true }, {
          query: {
            limit: -1,
            entity: "contents",
            permissionCreate: 1,
            lang: this.locale,
          },
        });

        this.tags = response.data.map(buildLibraryCategoryEntity);
      }
      catch {
        console.error("error");
      }
      finally {
        this.loading.tags = false;
      }
    },
    async load(tag?: string, page: number = 1) {
      if (page < 1) page = 1;

      this.loading.list = true;

      let type: undefined | null | number = undefined;
      if (tag) type = tag.includes("_") ? Number(tag.split("_")[1]!) : null;

      try {
        const response = await this.api.get("/contents", { version: 2, endpointVersion: 1, vanilla: true }, {
          query: {
            "offset": (page - 1) * this.perPage,
            "limit": this.perPage,
            "include": "creator",
            "fields[contents]": "name,type,dates,design,translations",
            "fields[users]": "name,picture",
            "sort": "name",
            "library": 1,
            "companies": this.company?.id,
            "types": type === null ? "null" : type,
          },
        });

        const { data, included, meta } = response;
        this.contents = data.map((content: any) => buildLibraryContentEntity(content, included));
        this.totalEntities = meta.total;
      }
      catch {
        console.error("error");
      }
      finally {
        this.loading.list = false;
      }
    },
  },
});
