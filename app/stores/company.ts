import type { Nullable } from "~/types/primitives/objects";
import type { Company } from "~/types/entities/company";
import { EntityType } from "~/types/entities";
import { buildTermEntity } from "~/lib/terms";
import type { Terms } from "~/types/entities/terms";

interface CompanyState {
  company: Nullable<Company>;
  terms: Terms;
  loading: {
    icon: boolean;
    logo: boolean;
    settings: {
      terms: boolean;
    };
  };
}

function buildCompanyEntity(data: any): Company {
  return {
    id: data.id,
    key: data.attributes.key,
    alias: data.attributes.alias,
    name: data.attributes.name,
    drive: data.attributes.isDrive,
    colors: {
      first: data.attributes.colors.firstGradient,
      second: data.attributes.colors.secondGradient,
    },
    icon: data.attributes.icon.thumbnail,
    logo: data.attributes.logo.thumbnail,
  };
}

function bindCompanyColors(company: Company) {
  const style = document.createElement("style");
  style.id = "company-theme";

  let cssRules = "";

  cssRules += `:root { --primary: #${company.colors.first}; }\n`;
  cssRules += `.dark { --primary: #${company.colors.second}; }\n`;
  cssRules += `:root { --sidebar-primary: #${company.colors.first}; }\n`;
  cssRules += `.dark { --sidebar-primary: #${company.colors.second}; }\n`;

  if (cssRules) {
    const existingStyle = document.getElementById("company-theme");
    if (existingStyle)
      existingStyle.remove();

    style.textContent = cssRules;
    document.head.appendChild(style);
  }
}
function bindCompanyLogo(company: Company) {
  useHead({
    link: [
      {
        rel: "icon",
        href: company.icon,
      },
    ],
  });
}

export const useCompanyStore = defineStore("company", {
  state: (): CompanyState => ({
    company: null,
    terms: [],
    loading: {
      icon: false,
      logo: false,
      settings: {
        terms: false,
      },
    },
  }),
  getters: {
    api: () => useApi(),
    logger: () => useLogger("[COMPANY]"),

    isLoaded: state => !!state.company,
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
  },
});
