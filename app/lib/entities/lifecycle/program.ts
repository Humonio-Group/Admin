import type { ProgramListEntity, ProgramTag } from "~/types/entities/program";

export function buildProgramListEntity(data: any): ProgramListEntity {
  const { attributes } = data;

  return {
    id: data.id,
    key: attributes.key,
    duration: attributes.config.duration,
    active: attributes.active,
    default: attributes.default,
    name: attributes.name,
    description: attributes.description,
    picture: attributes.design.picture.thumbnail || null,
    stats: {
      journeys: attributes.stats.nbJourneys,
      facilitators: attributes.stats.facilitators,
      participants: attributes.stats.participants,
      rate: attributes.stats.evaluation.experience,
    },
  };
}
export function buildProgramEntity() {}

export function buildTagEntity(data: any): ProgramTag {
  return {
    id: data.id,
    name: data.attributes.name,
  };
}
