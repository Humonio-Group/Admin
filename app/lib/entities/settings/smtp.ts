import type { CompanySMTPSettings, SMTPProtocol } from "~/types/entities/company";

export function buildSMTPSettings(data: any): CompanySMTPSettings {
  const { smtp } = data.attributes;

  return {
    active: smtp.active,
    valid: smtp.valid,
    encryption: smtp.encryption as SMTPProtocol || "SSL",
    host: smtp.settings.host || "",
    port: smtp.settings.port || "",
    auth: {
      username: smtp.settings.username || "",
      password: smtp.settings.password || "",
    },
    from: {
      name: smtp.settings.from?.name || "",
      address: smtp.settings.from?.address || "",
    },
  };
}
