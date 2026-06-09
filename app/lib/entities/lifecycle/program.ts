import type { Program, ProgramListEntity, ProgramTag, SelectedProgram } from "~/types/entities/program";
import { buildQiguLanguageEntity } from "~/lib/entities/lifecycle/language";
import { EntityType } from "~/types/entities";
import { buildCompanyUserEntity } from "~/lib/company";

export function buildProgramListEntity(data: any, included: any): ProgramListEntity {
  const { id, attributes, relationships } = data;

  const defaultLanguage = buildQiguLanguageEntity(included.find((entity: any) => entity.type === EntityType.LANGUAGE && entity.id === relationships.defaultLanguage.data[0]!.id)!);
  const languages = included.filter((entity: any) => entity.type === EntityType.LANGUAGE && relationships.languages.data.map((l: any) => l.id).includes(entity.id)).map(buildQiguLanguageEntity);
  const defaultFacilitator = buildCompanyUserEntity(included.find((entity: any) => entity.type === EntityType.USER && entity.id === relationships.defaultFacilitator.data[0]!.id), included);

  return {
    id,
    key: attributes.key,
    duration: attributes.config.duration,
    active: attributes.active,
    default: attributes.default,
    name: attributes.translations.name,
    description: attributes.translations.description,
    picture: attributes.design.picture.thumbnail || null,
    config: {
      minFacilitators: attributes.config.minFacilitators ?? null,
      minPartPerJourney: attributes.config.minPartPerJourney ?? null,
      minParticipants: attributes.config.minParticipants ?? null,
      numParticipants: attributes.config.numParticipants ?? null,
      numTeams: attributes.config.numTeams ?? null,
    },
    stats: {
      journeys: attributes.stats.nbJourneys,
      facilitators: attributes.stats.facilitators,
      participants: attributes.stats.participants,
      rate: attributes.stats.evaluation.experience,
    },
    defaultLanguage,
    languages,
    defaultFacilitator,
  };
}
export function buildProgramEntity(data: any, included: any): Program {
  const { id, attributes, relationships } = data;

  const defaultLanguage = buildQiguLanguageEntity(included.find((entity: any) => entity.type === EntityType.LANGUAGE && entity.id === relationships.defaultLanguage.data[0]!.id)!);
  const languages = included.filter((entity: any) => entity.type === EntityType.LANGUAGE && relationships.languages.data.map((l: any) => l.id).includes(entity.id)).map(buildQiguLanguageEntity);
  const defaultFacilitator = buildCompanyUserEntity(included.find((entity: any) => entity.type === EntityType.USER && entity.id === relationships.defaultFacilitator.data[0]!.id), included);

  return {
    id,
    key: attributes.key,
    duration: attributes.config.duration,
    active: attributes.active,
    default: attributes.default,
    name: attributes.translations.name,
    description: attributes.translations.description,
    picture: attributes.design.picture.thumbnail ?? null,
    config: {
      minFacilitators: attributes.config.minFacilitators ?? null,
      minPartPerJourney: attributes.config.minPartPerJourney ?? null,
      minParticipants: attributes.config.minParticipants ?? null,
      numParticipants: attributes.config.numParticipants ?? null,
      numTeams: attributes.config.numTeams ?? null,
    },
    stats: {
      journeys: attributes.stats.nbJourneys,
      rate: attributes.stats.evaluation.experience,
      participants: attributes.stats.participants,
      facilitators: attributes.stats.facilitators,
    },
    defaultLanguage,
    languages,
    defaultFacilitator,
  };
}

export function extendToSelectedProgram(program: Program): SelectedProgram {
  return {
    ...program,
    journeys: {
      totalEntities: -1,
      list: [],
    },
  };
}

export function buildTagEntity(data: any): ProgramTag {
  return {
    id: data.id,
    name: data.attributes.name,
  };
}
