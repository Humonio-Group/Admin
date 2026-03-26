import type { UserRole } from "~/types/entities/user";
import type { Nullable } from "~/types/primitives/objects";

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
export type Companies = Company[];

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
export type CompanyUsers = CompanyUser[];
