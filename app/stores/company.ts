import type { Listed, Nullable } from "~/types/primitives/objects";
import type {
  CompanyInvitationPageSettings, CompanyLRSSettings, CompanySMTPSettings, CompanySSOSettings, CompanyStoreProgram,
  CompanyStoreSettings,
} from "~/types/entities/company";
import { EntityType } from "~/types/entities";
import { buildTermEntity } from "~/lib/terms";
import { buildLocationEntity } from "~/lib/location";
import {
  buildCompanyEntity,
  bindCompanyColors,
  bindCompanyLogo,
  buildCompanyUserEntity,
  buildCompanySettings,
} from "~/lib/company";
import { buildInvitationPageSettings } from "~/lib/invitiation";
import { buildStoreSettings } from "~/lib/store";
import { buildDeveloperSettings } from "~/lib/developer";
import { toast } from "vue-sonner";
import { buildSSOSettings } from "~/lib/entities/settings/sso";
import { buildSMTPSettings } from "~/lib/entities/settings/smtp";
import { buildLRSSettings } from "~/lib/entities/settings/lrs";
import { type CompanyState, defaults } from "~/types/states/company";

export const useCompanyStore = defineStore("company", {
  state: (): CompanyState => ({ ...defaults }),
  getters: {
    api: () => useApi(),
    logger: () => useLogger("[COMPANY]"),
    translate: () => useNuxtApp().$i18n.t,

    isLoaded: state => !!state.company,

    invpSelectedPrograms: state => state.invitationPageSettings?.availablePrograms.filter(p => state.invitationPageSettings?.programs.includes(p.id)) ?? [],
    invpAvailablePrograms: state => state.invitationPageSettings?.availablePrograms.filter(p => !state.invitationPageSettings?.programs.includes(p.id)) ?? [],

    storeActivePrograms: state => state.storeSettings?.programs.filter(p => p.catalogue.active) ?? [],
    storeAvailablePrograms: state => state.storeSettings?.programs.filter(p => !p.catalogue.active) ?? [],
  },
  actions: {
    async fetchCompany(alias: string) {
      useStoreClearing(false);

      try {
        const response = await this.api.get("/companies", { version: 2, endpointVersion: 3 }, {
          query: {
            alias,
          },
        });

        const company = response.data[0];
        if (!company) return;

        this.company = buildCompanyEntity(company);
        bindCompanyColors(this.company);
        bindCompanyLogo(this.company);
      }
      catch (e) {
        useLogger().error(e);
      }
    },
    async saveCompanyInfo(settings: {
      name: string;
      alias: string;
      logo: string;
      icon: string;
      colors: {
        primary: string;
        secondary: string;
      };
    }) {
      if (!this.company) return;
      this.loading.saving.company = true;

      try {
        const response = await this.api.put(`/companies/${this.company.id}`, { version: 2, endpointVersion: 1 }, {
          body: {
            data: {
              id: Number(this.company.id),
              type: EntityType.COMPANY,
              attributes: {
                name: settings.name,
                invitationPage: {
                  alias: settings.alias,
                },
                logo: {
                  filename: settings.logo.split("/").slice(-1)[0],
                },
                icon: {
                  filename: settings.icon.split("/").slice(-1)[0],
                },
                colors: {
                  firstGradient: settings.colors.primary.replaceAll("#", ""),
                  secondGradient: settings.colors.secondary.replaceAll("#", ""),
                },
              },
            },
          },
        });

        this.company = buildCompanyEntity(response.data);
        bindCompanyColors(this.company);
        bindCompanyLogo(this.company);
        toast.success(this.translate("toasts.settings.branding.saved"));
      }
      catch {
        toast.error(this.translate("toasts.error.default"));
      }
      finally {
        this.loading.saving.company = false;
      }
    },

    async loadCompanySettings() {
      if (!this.company) return;
      this.loading.settings.default = true;

      try {
        const response = await this.api.get(`/companies/${this.company.id}`, { version: 2, endpointVersion: 1, vanilla: true }, {
          query: {
            "fields[companies]": "default,managerSettings",
          },
        });
        this.companySettings = buildCompanySettings(response.data);
      }
      catch {
        toast.error(this.translate("toasts.error.default"));
      }
      finally {
        this.loading.settings.default = false;
      }
    },
    async uploadIcon(blob: Blob): Promise<Nullable<string>> {
      this.loading.icon = true;

      let icon: Nullable<string> = null;

      try {
        const response = await useFileUpload().upload(blob, 4);
        icon = response.data.attributes.file.thumbnail;
      }
      catch (e) {
        this.logger.error(e);
      }
      finally {
        this.loading.icon = false;
      }

      return icon;
    },
    async uploadLogo(blob: Blob): Promise<Nullable<string>> {
      this.loading.logo = true;

      let logo: Nullable<string> = null;

      try {
        const response = await useFileUpload().upload(blob, 4);
        logo = response.data.attributes.file.thumbnail;
      }
      catch (e) {
        this.logger.error(e);
      }
      finally {
        this.loading.logo = false;
      }

      return logo;
    },
    async saveCompanySettings(settings: {
      tld?: Listed<string>;
      mentorInvite: boolean;
      forceMentorInvite: boolean;
      shareResults: boolean;
      shareResultsScope: number;
      autoAssignAdminToTickets: boolean;
      videoconferenceButton: boolean;
    }) {
      if (!this.company || !this.companySettings) return;
      this.loading.saving.default = true;

      try {
        const response = await this.api.put(`/companies/${this.company.id}`, { version: 2, endpointVersion: 1 }, {
          query: {
            "fields[companies]": "default,managerSettings",
          },
          body: {
            data: {
              id: Number(this.company.id),
              type: EntityType.COMPANY,
              attributes: {
                tlds: settings.tld,
                allowVideoConferenceRoom: settings.videoconferenceButton,
                canInviteManager: settings.mentorInvite,
                handleTickets: settings.autoAssignAdminToTickets,
                managerSettings: {
                  forceManager: settings.forceMentorInvite,
                  shareResults: {
                    active: settings.shareResults,
                    mode: {
                      value: settings.shareResultsScope,
                    },
                  },
                },
              },
            },
          },
        });
        console.log(response.data);
        this.companySettings = buildCompanySettings(response.data);
        toast.success(this.translate("toasts.settings.general.saved"));
      }
      catch {
        toast.error(this.translate("toasts.error.default"));
      }
      finally {
        this.loading.saving.default = false;
      }
    },

    async loadTerms() {
      if (!this.company) return;

      this.loading.settings.terms = true;

      try {
        const response = await this.api.get(`/companies/${this.company.id}`, { version: 2, endpointVersion: 1, vanilla: true }, {
          query: {
            "fields[terms]": "display,dates,permissions",
            "fields[companies]": "default",
            "include": "terms",
          },
        });

        const terms = response.included.filter((e: any) => e.type === EntityType.TERM);
        this.terms = terms.map(buildTermEntity);
      }
      catch (e) {
        this.logger.error(e);
      }
      finally {
        this.loading.settings.terms = false;
      }
    },
    async createTerm(body: { name: string; description: string }): Promise<boolean> {
      if (!this.company) return false;
      this.loading.creating.terms = true;
      let state = true;

      try {
        const response = await this.api.post("/terms", { version: 2, endpointVersion: 1 }, {
          body: {
            data: {
              type: EntityType.TERM,
              attributes: {
                title: body.name,
                displayTitle: body.name,
                description: body.description,
                displayDescription: body.description,
              },
              relationships: {
                scope: {
                  data: {
                    type: EntityType.COMPANY,
                    id: this.company.id,
                  },
                },
              },
            },
          },
        });

        this.terms = [...this.terms, buildTermEntity(response.data)];
      }
      catch (e) {
        console.error(e);
        state = false;
      }
      finally {
        this.loading.creating.terms = false;
      }

      return state;
    },
    async saveTerm(id: number, body: { name: string; description: string }): Promise<boolean> {
      if (!this.company) return false;
      this.loading.saving.terms = true;
      let state = true;

      try {
        const response = await this.api.put(`/terms/${id}`, { version: 2, endpointVersion: 1 }, {
          body: {
            data: {
              id,
              type: EntityType.TERM,
              attributes: {
                title: body.name,
                displayTitle: body.name,
                description: body.description,
                displayDescription: body.description,
              },
              relationships: {
                scope: {
                  data: {
                    type: EntityType.COMPANY,
                    id: this.company.id,
                  },
                },
              },
            },
          },
        });

        this.terms = this.terms.map(term => term.id === id ? buildTermEntity(response.data) : term);
      }
      catch (e) {
        console.error(e);
        state = false;
      }
      finally {
        this.loading.saving.terms = false;
      }

      return state;
    },
    async deleteTerm(id: number) {
      try {
        await this.api.delete(`/terms/${id}`, { version: 2, endpointVersion: 1 });
        this.terms = this.terms.filter(term => term.id !== id);
      }
      catch (e) {
        console.error(e);
      }
    },

    async loadLocations() {
      if (!this.company) return;

      this.loading.settings.locations = true;

      try {
        const response = await this.api.get("/locations", { version: 2, endpointVersion: 1, vanilla: true }, {
          query: {
            "include": "country",
            "fields[locations]": "name,city,stats.journeys",
            "companies": this.company.id,
            "limit": -1,
          },
        });

        const { data, included } = response;
        this.locations = data.map((loc: any) => buildLocationEntity(loc, included));
      }
      catch (e) {
        this.logger.error(e);
      }
      finally {
        this.loading.settings.locations = false;
      }
    },
    // todo: async createLocation() {},
    // todo: async updateLocation(id: number) {},
    // todo: async deleteLocation(id: number) {},

    async loadUsers() {
      if (!this.company) return;

      this.loading.settings.users = true;

      try {
        const response = await this.api.get("/users", { version: 2, endpointVersion: 1, vanilla: true }, {
          query: {
            "include": "interfaceLanguage",
            "sort": "firstname",
            "fields[users]": "name,dates,active,recipient,email,picture",
            "companies": this.company.id,
            "limit": -1,
          },
        });

        const { data, included } = response;
        this.users = data.map((user: any) => buildCompanyUserEntity(user, included));
      }
      catch (e) {
        this.logger.error(e);
      }
      finally {
        this.loading.settings.users = false;
      }
    },
    // todo: async createUser() {},
    // todo: async updateUser() {},
    // todo: async deleteUser() {},

    async loadCompanies() {
      if (!this.company) return;

      this.loading.settings.companies = true;

      try {
        const response = await this.api.get("/companies", { version: 2, endpointVersion: 1, vanilla: true }, {
          query: {
            "include": "clientPrimary",
            "sort": "name",
            "fields[companies]": "default,name,stats.participants,key,active,logo",
            "fields[users]": "name,email,picture",
            "offset": 0,
            "limit": -1,
            "active": 1,
          },
        });

        const { data, included } = response;

        this.companies = data.map((c: any) => buildCompanyEntity(c, included));
      }
      catch (e) {
        this.logger.error(e);
      }
      finally {
        this.loading.settings.companies = false;
      }
    },
    // todo: async createCompany() {}
    // todo: async updateCompany() {}
    // todo: async deleteCompany() {}

    async loadInvitationPageSettings() {
      if (!this.company) return;

      this.loading.settings.invitation = true;

      try {
        const response = await this.api.get(`/companies/${this.company.id}`, { version: 2, endpointVersion: 1, vanilla: true }, {
          query: {
            "fields[companies]": "invitationPage",
            "include": "programs",
          },
        });

        const { data, included } = response;

        this.invitationPageSettings = buildInvitationPageSettings(data, included);
      }
      catch (e) {
        useLogger().error(e);
      }
      finally {
        this.loading.settings.invitation = false;
      }
    },
    async saveInvitationPageSettings(settings: CompanyInvitationPageSettings) {
      if (!this.company || !this.invitationPageSettings) return;
      this.loading.saving.invitation = true;

      try {
        const response = await this.api.put(`/companies/${this.company.id}`, { version: 2, endpointVersion: 1 }, {
          query: {
            "fields[companies]": "invitationPage",
            "include": "programs",
          },
          body: {
            data: {
              id: Number(this.company.id),
              type: EntityType.COMPANY,
              attributes: {
                invitationPage: {
                  active: settings.active,
                  alias: this.company.alias,
                  title: settings.title,
                  description: settings.description,
                  programs: settings.programs,
                  displayJourneys: settings.display.journeys,
                  displayTeams: settings.display.teams,
                  journeyDateMode: {
                    value: settings.dateMode,
                  },
                },
              },
            },
          },
        });
        this.invitationPageSettings = buildInvitationPageSettings(response.data, response.included);
      }
      catch {
        toast.error(this.translate("toasts.error.default"));
      }
      finally {
        this.loading.saving.invitation = false;
      }
    },
    async uploadBanner(blob: Blob) {
      if (!this.company || !this.invitationPageSettings) return;
      this.loading.saving.invitation = true;

      try {
        const fileResponse = await useFileUpload().upload(blob, 4);
        await this.api.put(`/companies/${this.company.id}`, { version: 2, endpointVersion: 1 }, {
          query: {
            "fields[companies]": "invitationPage",
          },
          body: {
            data: {
              id: Number(this.company.id),
              type: EntityType.COMPANY,
              attributes: {
                invitationPage: {
                  banner: fileResponse.data.attributes.file.filename,
                },
              },
            },
          },
        });
        this.invitationPageSettings = {
          ...this.invitationPageSettings,
          banner: fileResponse.data.attributes.file.thumbnail,
        };
      }
      catch {
        toast.error(this.translate("toasts.error.default"));
      }
      finally {
        this.loading.saving.invitation = false;
      }
    },
    async clearBanner() {
      if (!this.company || !this.invitationPageSettings) return;
      this.loading.saving.invitation = true;

      try {
        await this.api.put(`/companies/${this.company.id}`, { version: 2, endpointVersion: 1 }, {
          query: {
            "fields[companies]": "invitationPage",
          },
          body: {
            data: {
              id: Number(this.company.id),
              type: EntityType.COMPANY,
              attributes: {
                invitationPage: {
                  banner: null,
                },
              },
            },
          },
        });
        this.invitationPageSettings = {
          ...this.invitationPageSettings,
          banner: null,
        };
      }
      catch {
        toast.error(this.translate("toasts.error.default"));
      }
      finally {
        this.loading.saving.invitation = false;
      }
    },

    async loadShopSettings() {
      if (!this.company) return;

      this.loading.settings.shop = true;

      try {
        const [settings, programs] = await Promise.all([
          this.api.get(`/companies/${this.company.id}`, { version: 2, endpointVersion: 1, vanilla: true }, {
            query: {
              "fields[companies]": "lmsCatalogue",
            },
          }),
          this.api.get("/programs", { version: 2, endpointVersion: 1, vanilla: true }, {
            query: {
              "offset": 0,
              "limit": -1,
              "creator": 1,
              "default": 0,
              "active": 1,
              "companies": this.company.id,
              "fields[programs]": "name,description,design,lmsCatalogue",
            },
          }),
        ]);

        this.storeSettings = buildStoreSettings(settings.data, programs.data);
        this.logger.log(this.storeSettings);
      }
      catch {
        this.logger.error("Nope");
      }
      finally {
        this.loading.settings.shop = false;
      }
    },
    async saveShopSettings(settings: CompanyStoreSettings) {
      if (!this.company) return;

      this.loading.saving.storeSettings = true;

      try {
        await this.api.put(`/companies/${this.company.id}`, { version: 2, endpointVersion: 1 }, {
          body: {
            data: {
              id: Number(this.company.id),
              type: EntityType.COMPANY,
              attributes: {
                lmsCatalogue: {
                  legalForm: settings.legal.type,
                  postalAddress: settings.legal.address,
                  lmsCatalogueActivated: settings.active,
                  lmsCataloguePassword: settings.access.password,
                },
              },
            },
          },
        });
        this.storeSettings = { ...settings };
        toast.success(this.translate("toasts.settings.shop.saved"));
      }
      catch {
        this.logger.error("nope");
      }
      finally {
        this.loading.saving.storeSettings = false;
      }
    },
    async saveProgramPrice(program: CompanyStoreProgram) {
      if (!this.company || this.loading.saving.price.includes(program.id)) return;

      this.loading.saving.price.push(program.id);
      const { public: config } = useRuntimeConfig();

      try {
        await Promise.all([
          this.api.post("/stripe/price", { version: 2, endpointVersion: 1 }, {
            body: {
              company_id: this.company.id,
              key: config.api.key,
              program_id: program.id,
              program_price: program.catalogue.price,
              return_url: config.urls.stripePriceCallback.replaceAll("{alias}", this.company.alias),
            },
          }),
          this.api.put(`/programs/${program.id}`, { version: 2, endpointVersion: 1 }, {
            body: {
              data: {
                type: EntityType.PROGRAM,
                attributes: {
                  lmsCatalogue: {
                    isActivatedForLmsCatalogue: program.catalogue.active,
                    lmsCatalogueDescription: program.catalogue.description || null,
                    price: program.catalogue.price || 0,
                  },
                },
              },
            },
          }),
        ]);
        toast.success(this.translate("toasts.settings.shop.saved-price"));
      }
      catch {
        this.logger.error("Nope");
      }
      finally {
        this.loading.saving.price.splice(this.loading.saving.price.indexOf(program.id), 1);
      }
    },

    async loadSSOSettings() {
      if (!this.company) return;

      this.loading.settings.sso = true;

      try {
        const response = await this.api.get(`/companies/${this.company.id}`, { version: 2, endpointVersion: 1, vanilla: true }, {
          query: {
            "fields[companies]": "sso",
          },
        });

        this.ssoSettings = buildSSOSettings(response.data);
      }
      catch {
        this.logger.error("nope");
      }
      finally {
        this.loading.settings.sso = false;
      }
    },
    async saveSSOSettings(settings: CompanySSOSettings) {
      if (!this.company || !this.ssoSettings) return;

      this.loading.saving.sso = true;

      try {
        await this.api.put(`/companies/${this.company.id}`, { version: 2, endpointVersion: 1 }, {
          body: {
            data: {
              id: Number(this.company.id),
              type: EntityType.COMPANY,
              attributes: {
                sso: {
                  active: settings.active,
                  alias: settings.alias,
                  certificate: settings.certificate,
                  issuerUrl: settings.issuer,
                  sloEndpoint: settings.slo.endpoint,
                  samlEndpoint: settings.saml.endpoint,
                  samlSignatureAlgorithm: settings.saml.signatureAlgorithm,
                  mapping: settings.mapping,
                },
              },
            },
          },
          query: {
            "fields[companies]": "sso",
          },
        });
        this.ssoSettings = { ...settings };

        toast.success(this.translate("toasts.settings.sso.saved"));
      }
      catch {
        this.logger.error("nope");
      }
      finally {
        this.loading.saving.sso = false;
      }
    },

    async loadSMTPSettings() {
      if (!this.company) return;
      this.loading.settings.smtp = true;

      try {
        const response = await this.api.get(`/companies/${this.company.id}`, { version: 2, endpointVersion: 1, vanilla: true }, {
          query: {
            "fields[companies]": "smtp",
          },
        });

        this.smtpSettings = buildSMTPSettings(response.data);
      }
      catch {
        toast.error(this.translate("toasts.error.default"));
      }
      finally {
        this.loading.settings.smtp = false;
      }
    },
    async saveSMTPSettings(settings: CompanySMTPSettings) {
      if (!this.company || !this.smtpSettings) return;
      this.loading.saving.smtp = true;

      try {
        const response = await this.api.put(`/companies/${this.company.id}`, { version: 2, endpointVersion: 1 }, {
          query: {
            "fields[companies]": "smtp",
          },
          body: {
            data: {
              id: Number(this.company.id),
              type: EntityType.COMPANY,
              attributes: {
                smtp: {
                  active: settings.active,
                  settings: {
                    host: settings.host,
                    port: settings.port,
                    username: settings.auth.username,
                    password: settings.auth.password,
                    encryption: settings.encryption,
                    from: settings.from,
                  },
                },
              },
            },
          },
        });

        this.smtpSettings = buildSMTPSettings(response.data);
        toast.success(this.translate("toasts.settings.smtp.saved"));
      }
      catch {
        toast.error(this.translate("toasts.error.default"));
      }
      finally {
        this.loading.saving.smtp = false;
      }
    },

    async loadLRSSettings() {
      if (!this.company) return;
      this.loading.settings.lrs = true;

      try {
        const response = await this.api.get(`/companies/${this.company.id}`, { version: 2, endpointVersion: 1, vanilla: true }, {
          query: {
            "fields[companies]": "lrs",
          },
        });
        this.lrsSettings = buildLRSSettings(response.data);
      }
      catch {
        toast.error(this.translate("toasts.error.default"));
      }
      finally {
        this.loading.settings.lrs = false;
      }
    },
    async saveLRSSettings(settings: CompanyLRSSettings) {
      if (!this.company || !this.lrsSettings) return;
      this.loading.saving.lrs = true;

      try {
        const response = await this.api.put(`/companies/${this.company.id}`, { version: 2, endpointVersion: 1 }, {
          query: {
            "fields[companies]": "lrs",
          },
          body: {
            data: {
              id: Number(this.company.id),
              type: EntityType.COMPANY,
              attributes: {
                lrs: {
                  active: settings.active,
                  url: settings.url,
                  authentication: {
                    mode: {
                      value: settings.mode,
                    },
                    settings: {
                      basicAuthLogin: settings.auth?.login || "",
                      basicAuthPassword: settings.auth?.password || "",
                    },
                  },
                },
              },
            },
          },
        });
        this.lrsSettings = buildLRSSettings(response.data);
        toast.success(this.translate("toasts.settings.lrs.saved"));
      }
      catch {
        toast.error(this.translate("toasts.error.default"));
      }
      finally {
        this.loading.saving.lrs = false;
      }
    },

    async loadDeveloperSettings() {
      if (!this.company) return;

      this.loading.settings.developer = true;

      try {
        const response = await this.api.get(`/companies/${this.company.id}`, { version: 2, endpointVersion: 1 }, {
          query: {
            "fields[companies]": "api",
          },
        });
        this.developerSettings = buildDeveloperSettings(response.data);
      }
      catch {
        this.logger.error("nope");
      }
      finally {
        this.loading.settings.developer = false;
      }
    },
    async saveDeveloperSettings(webhook: string) {
      if (!this.company || !this.developerSettings) return;

      this.loading.saving.developer = true;

      try {
        await this.api.put(`/companies/${this.company.id}`, { version: 2, endpointVersion: 1 }, {
          body: {
            data: {
              id: Number(this.company.id),
              type: EntityType.COMPANY,
              attributes: {
                api: {
                  webhookUrl: webhook || null,
                },
              },
            },
          },
          query: {
            "fields[companies]": "api",
          },
        });
        toast.success(this.translate("toasts.settings.developer.save"));
      }
      catch {
        this.logger.error("nope");
      }
      finally {
        this.loading.saving.developer = false;
      }
    },
    async refreshToken() {
      if (!this.company || !this.developerSettings) return;

      this.loading.settings.refreshApiToken = true;

      try {
        const response = await this.api.put(`/companies/${this.company.id}`, { version: 2, endpointVersion: 1 }, {
          body: {
            data: {
              id: Number(this.company.id),
              type: EntityType.COMPANY,
              attributes: {
                api: {
                  refreshAuthToken: true,
                },
              },
            },
          },
          query: {
            "fields[companies]": "api",
          },
        });
        this.developerSettings = {
          ...this.developerSettings,
          token: response.data.attributes.api.authToken,
        };
        toast.success(this.translate("toasts.settings.developer.token-refreshed"));
      }
      catch {
        this.logger.error("nope");
      }
      finally {
        this.loading.settings.refreshApiToken = false;
      }
    },
  },
});
