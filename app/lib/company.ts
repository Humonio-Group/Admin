import type { Company, CompanyUser } from "~/types/entities/company";
import { EntityType } from "~/types/entities";

export function buildCompanyEntity(data: any): Company {
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

export function buildCompanyUserEntity(data: any, included: any): CompanyUser {
  return {
    id: data.id,
    email: data.attributes.email,
    avatar: data.attributes.picture.thumbnail,
    language: included.find((e: any) => e.type === EntityType.LANGUAGE && e.id === data.relationships.interfaceLanguage.data[0]?.id)?.id ?? null,
    name: {
      first: data.attributes.firstname,
      last: data.attributes.lastname,
      full: data.attributes.name,
    },
    workspaces: data.attributes.recipient.rolesInWorkspace.map((workspace: any) => ({
      id: workspace.id,
      name: workspace.name,
      roles: workspace.roles,
    })),
  };
}

export function bindCompanyColors(company: Company) {
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
export function bindCompanyLogo(company: Company) {
  useHead({
    link: [
      {
        rel: "icon",
        href: company.icon,
      },
    ],
  });
}
