import type { Nullable } from "~/types/primitives/objects";
import type { Companies, Company, CompanyInvitationPageSettings, CompanyUsers } from "~/types/entities/company";
import { EntityType } from "~/types/entities";
import { buildTermEntity } from "~/lib/terms";
import type { Terms } from "~/types/entities/terms";
import type { Locations } from "~/types/entities/location";
import { buildLocationEntity } from "~/lib/location";
import { buildCompanyEntity, bindCompanyColors, bindCompanyLogo, buildCompanyUserEntity } from "~/lib/company";
import { buildInvitationPageSettings } from "~/lib/invitiation";

interface CompanyState {
  company: Nullable<Company>;
  terms: Terms;
  locations: Locations;
  users: CompanyUsers;
  companies: Companies;
  invitationPageSettings: Nullable<CompanyInvitationPageSettings>;
  loading: {
    icon: boolean;
    logo: boolean;
    settings: {
      terms: boolean;
      locations: boolean;
      users: boolean;
      companies: boolean;
      invitation: boolean;
    };
  };
}

export const useCompanyStore = defineStore("company", {
  state: (): CompanyState => ({
    company: null,
    terms: [],
    locations: [],
    users: [],
    companies: [],
    invitationPageSettings: null,
    loading: {
      icon: false,
      logo: false,
      settings: {
        terms: false,
        locations: false,
        users: false,
        companies: false,
        invitation: false,
      },
    },
  }),
  getters: {
    api: () => useApi(),
    logger: () => useLogger("[COMPANY]"),

    isLoaded: state => !!state.company,

    invpSelectedPrograms: state => state.invitationPageSettings?.availablePrograms.filter(p => state.invitationPageSettings?.programs.includes(p.id)) ?? [],
    invpAvailablePrograms: state => state.invitationPageSettings?.availablePrograms.filter(p => !state.invitationPageSettings?.programs.includes(p.id)) ?? [],
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
    // todo: async createTerm() {},
    // todo: async updateTerm(id: number) {},
    // todo: async deleteTerm(id: number) {},

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
  },
});
