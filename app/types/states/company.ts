import type { Listed, Nullable } from "~/types/primitives/objects";
import type {
  Companies,
  Company, CompanyDeveloperSettings,
  CompanyInvitationPageSettings, CompanyLRSSettings, CompanySettings, CompanySMTPSettings, CompanySSOSettings,
  CompanyStoreSettings,
  CompanyUsers,
} from "~/types/entities/company";
import type { Terms } from "~/types/entities/terms";
import type { LocationCountry, Locations } from "~/types/entities/location";

export interface CompanyState {
  company: Nullable<Company>;
  terms: Terms;
  locations: Locations;
  users: CompanyUsers;
  totalUsers: number;
  companies: Companies;
  countries: Listed<LocationCountry>;
  invitationPageSettings: Nullable<CompanyInvitationPageSettings>;
  storeSettings: Nullable<CompanyStoreSettings>;
  developerSettings: Nullable<CompanyDeveloperSettings>;
  ssoSettings: Nullable<CompanySSOSettings>;
  smtpSettings: Nullable<CompanySMTPSettings>;
  lrsSettings: Nullable<CompanyLRSSettings>;
  companySettings: Nullable<CompanySettings>;
  loading: {
    icon: boolean;
    logo: boolean;
    settings: {
      countries: boolean;
      default: boolean;
      terms: boolean;
      locations: boolean;
      users: boolean;
      companies: boolean;
      invitation: boolean;
      shop: boolean;
      developer: boolean;
      refreshApiToken: boolean;
      sso: boolean;
      smtp: boolean;
      lrs: boolean;
    };
    creating: {
      terms: boolean;
      location: boolean;
      user: boolean;
    };
    saving: {
      terms: boolean;
      location: boolean;
      user: boolean;

      price: Listed<number>;
      default: boolean;
      storeSettings: boolean;
      developer: boolean;
      sso: boolean;
      smtp: boolean;
      lrs: boolean;
      invitation: boolean;
      company: boolean;
    };
  };
}

export const defaults: CompanyState = {
  company: null,
  terms: [],
  locations: [],
  users: [],
  totalUsers: -1,
  companies: [],
  countries: [],
  invitationPageSettings: null,
  storeSettings: null,
  developerSettings: null,
  ssoSettings: null,
  smtpSettings: null,
  lrsSettings: null,
  companySettings: null,
  loading: {
    icon: false,
    logo: false,
    settings: {
      countries: false,
      default: false,
      terms: false,
      locations: false,
      users: false,
      companies: false,
      invitation: false,
      shop: false,
      developer: false,
      refreshApiToken: false,
      sso: false,
      smtp: false,
      lrs: false,
    },
    creating: {
      terms: false,
      location: false,
      user: false,
    },
    saving: {
      terms: false,
      location: false,
      user: false,

      price: [],
      default: false,
      storeSettings: false,
      developer: false,
      sso: false,
      smtp: false,
      lrs: false,
      invitation: false,
      company: false,
    },
  },
};
