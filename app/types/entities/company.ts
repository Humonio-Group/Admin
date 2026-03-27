import type { UserRole } from "~/types/entities/user";
import type { Listed, Nullable } from "~/types/primitives/objects";

export interface Company {
  id: number;
  key: string;
  alias: string;
  name: string;
  drive: boolean;
  active: boolean;
  colors: {
    first: string;
    second: string;
  };
  dates?: {
    createdAt: Date;
  };
  icon: string;
  logo: string;

  mainContact?: {
    avatar: string;
    name: {
      first: string;
      last: string;
      full: string;
    };
    email: string;
  };
}
export type Companies = Listed<Company>;

export interface CompanyUser {
  id: number;
  avatar: string;
  name: {
    first: string;
    last: string;
    full: string;
  };
  email: string;
  language: Nullable<number>;
  workspaces: {
    id: number;
    name: string;
    roles: UserRole[];
  }[];
}
export type CompanyUsers = Listed<CompanyUser>;

export interface CompanyInvitationPageProgram {
  id: number;
  key: string;
  name: string;
  picture: Nullable<string>;
}
export interface CompanyInvitationPageSettings {
  active: boolean;
  title: string;
  description: string;
  banner: Nullable<string>;
  programs: Listed<number>;
  availablePrograms: Listed<CompanyInvitationPageProgram>;
  dateMode: number;
  display: {
    journeys: boolean;
    teams: boolean;
  };
}

export interface CompanyStoreProgram {
  id: number;
  name: string;
  description: string;
  picture: Nullable<string>;
  catalogue: {
    active: boolean; // transfer to a number for api calls
    description: Nullable<string>;
    price: Nullable<number>;
  };
}
export interface CompanyStoreSettings {
  active: boolean; // transfer to a number for the API requests
  access: {
    password: Nullable<string>;
    url: string;
  };
  legal: {
    type: string;
    address: string;
  };
  stripe: Nullable<string>;
  programs: Listed<CompanyStoreProgram>;
}
