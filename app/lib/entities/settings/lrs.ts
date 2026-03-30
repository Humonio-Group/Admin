import type { CompanyLRSSettings } from "~/types/entities/company";

export function buildLRSSettings(data: any): CompanyLRSSettings {
  const { lrs } = data.attributes;

  return {
    active: lrs.active,
    mode: lrs.authentication.mode.value,
    url: lrs.url || "",
    auth: {
      login: lrs.authentication.settings.basicAuthLogin || "",
      password: lrs.authentication.settings.basicAuthPassword || "",
    },
  };
}
