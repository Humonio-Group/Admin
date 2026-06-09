import { defaults, PER_PAGE, type ProgramState } from "~/types/states/program";
import {
  buildProgramEntity,
  buildProgramListEntity,
  buildTagEntity,
  extendToSelectedProgram,
} from "~/lib/entities/lifecycle/program";
import { toast } from "vue-sonner";
import { buildJourneyEntity } from "~/lib/entities/lifecycle/journey";
import { buildQiguLanguageEntity } from "~/lib/entities/lifecycle/language";
import type { Listed } from "~/types/primitives/objects";
import { EntityType } from "~/types/entities";

export const useProgramStore = defineStore("programs", {
  state: (): ProgramState => ({ ...defaults }),
  getters: {
    api: () => useApi(),
    translate: () => useNuxtApp().$i18n.t,

    company: () => storeToRefs(useCompanyStore()).company.value,
    perPage: () => PER_PAGE,

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
    async loadPrograms(tagId?: number, keywords?: string, active: boolean = true, page: number = 1) {
      if (!this.company) return;
      this.loading.items = true;

      try {
        const response = await this.api.get("/programs", { version: 2, endpointVersion: 1 }, {
          query: {
            "companies": this.company.id,
            "fields[programs]": "default,stats.journeys,stats.participants,stats.facilitators,stats.evaluation,translations",
            "include": "defaultLanguage,languages,defaultFacilitator",
            "limit": keywords?.length ? -1 : PER_PAGE,
            "offset": keywords?.length ? 0 : (page - 1) * PER_PAGE,
            "active": active ? 1 : 0,
            ...(tagId ? { tags: tagId } : {}),
            ...(keywords?.length ? { keyword: keywords } : {}),
          },
        });
        this.programs = response.data.map((program: any) => buildProgramListEntity(program, response.included));
        this.totalEntities = response.meta.total;
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
            "fields[programs]": "default,stats.journeys,stats.participants,stats.facilitators,stats.evaluation,translations",
            "include": "defaultLanguage,languages,defaultFacilitator",
          },
        });

        const program = buildProgramEntity(response.data, response.included);
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
    async loadLanguages() {
      this.loading.languages = true;

      try {
        const response = await this.api.get("/languages", { version: 2, endpointVersion: 1, vanilla: true }, {
          query: {
            appLanguages: 1,
          },
        });

        this.languages = response.data.map((lang: any) => buildQiguLanguageEntity(lang));
      }
      catch (e) {
        console.error(e);
      }
      finally {
        this.loading.languages = false;
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

    async createProgram(payload: {
      languages: Listed<string>;
      defaultLanguage: string;
      translations: {
        name: Record<string, string>;
        description: Record<string, string>;
      };
      defaultFacilitator?: number;
      minFacilitators?: number;
      minPartPerJourney?: number;
      minParticipants?: number;
      numParticipants?: number;
      numTeams?: number;
    }): Promise<boolean> {
      if (!this.company) return false;

      this.loading.create = true;
      let state = true;

      const defaultLanguage = this.languages.find(lang => lang.code === payload.defaultLanguage);
      const languages = this.languages.filter(lang => payload.languages.includes(lang.code));

      try {
        const response = await this.api.post("/programs", { version: 2, endpointVersion: 1 }, {
          query: {
            "fields[programs]": "default,stats.journeys,stats.participants,stats.facilitators,stats.evaluation,translations",
            "include": "defaultLanguage,languages,defaultFacilitator",
          },
          body: {
            data: {
              type: EntityType.PROGRAM,
              attributes: {
                config: {
                  minFacilitators: payload.minFacilitators ?? null,
                  minPartPerJourney: payload.minPartPerJourney ?? null,
                  minParticipants: payload.minParticipants ?? null,
                  numParticipants: payload.numParticipants ?? null,
                  numTeams: payload.numTeams ?? null,
                },
                name: payload.translations.name[payload.defaultLanguage],
                description: payload.translations.description[payload.defaultLanguage],
                translations: {
                  name: payload.translations.name,
                  description: payload.translations.description,
                },
                type: {
                  value: 1,
                },
              },
              relationships: {
                copyExistingProgram: null,
                company: {
                  data: {
                    type: EntityType.COMPANY,
                    id: this.company.id,
                  },
                },
                defaultFacilitator: {
                  data: {
                    type: EntityType.USER,
                    id: payload.defaultFacilitator ?? storeToRefs(useUserStore()).user.value?.id,
                  },
                },
                defaultLanguage: {
                  data: {
                    type: EntityType.LANGUAGE,
                    id: defaultLanguage?.id,
                  },
                },
                languages: {
                  data: languages.map(language => ({
                    type: EntityType.LANGUAGE,
                    id: language.id,
                  })),
                },
                tags: {
                  data: [],
                },
              },
            },
          },
        });

        const { data, included } = response;
        const program = buildProgramEntity(data, included);
        navigateTo(`/${this.company.alias}/deployment/programs/${program.id}/journeys`);

        toast.success(this.translate("toasts.programs.create.success", { name: program.name }));
      }
      catch {
        state = false;
        toast.error(this.translate("toasts.programs.create.error"));
      }
      finally {
        this.loading.create = false;
      }

      return state;
    },
    async saveProgram(id: number, payload: {
      languages: Listed<string>;
      defaultLanguage: string;
      translations: {
        name: Record<string, string>;
        description: Record<string, string>;
      };
      defaultFacilitator?: number;
      minFacilitators?: number;
      minPartPerJourney?: number;
      minParticipants?: number;
      numParticipants?: number;
      numTeams?: number;
    }): Promise<boolean> {
      if (!this.company) return false;

      this.loading.save = true;
      let state = true;

      const defaultLanguage = this.languages.find(lang => lang.code === payload.defaultLanguage);
      const languages = this.languages.filter(lang => payload.languages.includes(lang.code));

      try {
        const response = await this.api.put(`/programs/${id}`, { version: 2, endpointVersion: 1 }, {
          query: {
            "fields[programs]": "default,stats.journeys,stats.participants,stats.facilitators,stats.evaluation,translations",
            "include": "defaultLanguage,languages,defaultFacilitator",
          },
          body: {
            data: {
              id,
              type: EntityType.PROGRAM,
              attributes: {
                config: {
                  minFacilitators: payload.minFacilitators ?? null,
                  minPartPerJourney: payload.minPartPerJourney ?? null,
                  minParticipants: payload.minParticipants ?? null,
                  numParticipants: payload.numParticipants ?? null,
                  numTeams: payload.numTeams ?? null,
                },
                name: payload.translations.name[payload.defaultLanguage],
                description: payload.translations.description[payload.defaultLanguage],
                translations: {
                  name: payload.translations.name,
                  description: payload.translations.description,
                },
                type: {
                  value: 1,
                },
              },
              relationships: {
                copyExistingProgram: null,
                company: {
                  data: {
                    type: EntityType.COMPANY,
                    id: this.company.id,
                  },
                },
                defaultFacilitator: {
                  data: {
                    type: EntityType.USER,
                    id: payload.defaultFacilitator ?? storeToRefs(useUserStore()).user.value?.id,
                  },
                },
                defaultLanguage: {
                  data: {
                    type: EntityType.LANGUAGE,
                    id: defaultLanguage?.id,
                  },
                },
                languages: {
                  data: languages.map(language => ({
                    type: EntityType.LANGUAGE,
                    id: language.id,
                  })),
                },
                tags: {
                  data: [],
                },
              },
            },
          },
        });

        const { data, included } = response;
        const program = buildProgramEntity(data, included);

        this.programs = this.programs.map(p => p.id === program.id ? program : p);
        if (this.selectedProgram?.id === program.id) {
          this.selectedProgram = {
            ...this.selectedProgram,
            ...program,
          };
        }
        toast.success(this.translate("toasts.programs.save.success", { name: program.name }));
      }
      catch {
        state = false;
        toast.error(this.translate("toasts.programs.save.error"));
      }
      finally {
        this.loading.save = false;
      }

      return state;
    },
  },
});
