import type { CompanyStoreProgram, CompanyStoreSettings } from "~/types/entities/company";

function buildProgramEntity(data: any): CompanyStoreProgram {
  const { id, attributes } = data;
  const { name, description, design, lmsCatalogue } = attributes;

  return {
    id,
    name,
    description,
    picture: design.picture.thumbnail,
    catalogue: {
      active: lmsCatalogue.isActivatedForLmsCatalogue === 1,
      description: lmsCatalogue.lmsCatalogueDescription,
      price: lmsCatalogue.price ?? 0,
    },
  };
}

export function buildStoreSettings(data: any, programs: any): CompanyStoreSettings {
  const { lmsCatalogue } = data.attributes;

  return {
    active: lmsCatalogue.lmsCatalogueActivated === 1,
    access: {
      password: lmsCatalogue.lmsCataloguePassword,
      url: lmsCatalogue.lmsCatalogueUrl,
    },
    legal: {
      type: lmsCatalogue.legalForm,
      address: lmsCatalogue.postalAddress,
    },
    stripe: lmsCatalogue.stripeAccountId,
    programs: programs.map((program: any) => buildProgramEntity(program)),
  };
}
