import type { CompanyInvitationPageProgram, CompanyInvitationPageSettings } from "~/types/entities/company";
import { EntityType } from "~/types/entities";

export function buildInvitationPageProgramEntity(data: any): CompanyInvitationPageProgram {
  const { id, attributes } = data;
  const {
    key,
    name,
    design,
  } = attributes;

  return {
    id,
    key,
    name,
    picture: design.picture.thumbnail,
  };
}

export function buildInvitationPageSettings(data: any, included: any): CompanyInvitationPageSettings {
  const { attributes } = data;

  console.log(data);

  const {
    title,
    description,
    active,
    picture,
    programs,
    availablePrograms: availableProgramsIds,
    displayJourneys,
    displayTeams,
    journeyDateMode,
  } = attributes.invitationPage;

  return {
    active,
    title,
    description,
    banner: picture.thumbnail,
    programs,
    availablePrograms: availableProgramsIds.map((id: number) => {
      const relatedProgram = included.find((entity: any) => entity.type === EntityType.PROGRAM && entity.id === id);
      return buildInvitationPageProgramEntity(relatedProgram);
    }),
    dateMode: journeyDateMode.value,
    display: {
      journeys: displayJourneys,
      teams: displayTeams,
    },
  };
}
