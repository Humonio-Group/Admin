import type {
  ContentWorkshopConfig,
  DateCondition,
  JourneyConfigProgram,
  JourneyConfigProgramContent,
  JourneyConfigProgramStage,
} from "~/types/entities/config/journey";
import { buildQiguLanguageEntity } from "~/lib/entities/lifecycle/language";
import { EntityType } from "~/types/entities";
import type { Listed, Nullable } from "~/types/primitives/objects";

export function buildJourneyConfigurationWorkshopData(data: any): Nullable<ContentWorkshopConfig> {
  const { attributes, relationships } = data;
  const { blended } = attributes;
  if (!blended?.dates) return null;

  return {
    start: {
      days: blended.dates.start.date,
      hours: Number(blended.dates.start.time.split(":")[0]!),
      minutes: Number(blended.dates.start.time.split(":")[1]!),
    },
    end: {
      days: blended.dates.end.date,
      hours: Number(blended.dates.end.time.split(":")[0]!),
      minutes: Number(blended.dates.end.time.split(":")[1]!),
    },
    defaultLocation: relationships.defaultLocations?.data[0]?.id,
    defaultFacilitators: relationships.defaultFacilitators.data.map((facilitator: any) => facilitator.id),
  };
}

export function buildJourneyConfigurationStageContent(data: any): JourneyConfigProgramContent {
  const { id, attributes } = data;

  const conditions = attributes.activation.conditions;
  const dateCondition = conditions.find((condition: any) => condition.type === 4);
  const condition = dateCondition
    ? {
        days: dateCondition.specific.date,
        hours: Number(dateCondition.specific.time.split(":")[0]!),
        minutes: Number(dateCondition.specific.time.split(":")[1]!),
      } as DateCondition
    : null;

  return {
    id,
    name: attributes.translations.displayName,
    picture: attributes.design.picture?.thumbnail ?? null,
    condition,
    workshop: buildJourneyConfigurationWorkshopData(data),
  };
}

export function buildJourneyConfigurationStage(data: any, included: any): JourneyConfigProgramStage {
  const { id, attributes, relationships } = data;

  const conditions = attributes.activation.conditions;
  const dateCondition = conditions.find((condition: any) => condition.type === 4);
  const condition = dateCondition
    ? {
        type: 4,
        days: dateCondition.specific.date,
        hours: Number(dateCondition.specific.time.split(":")[0]!),
        minutes: Number(dateCondition.specific.time.split(":")[1]!),
      } as DateCondition
    : null;

  const contentIds = (relationships.timebasedContents.data as any[]).reduce<Listed<number>>((acc, curr) => {
    acc = [...acc, curr.id];
    return acc;
  }, []);
  const contents = included.filter((entity: any) => entity.type === EntityType.CONTENT && contentIds.includes(entity.id)).map(buildJourneyConfigurationStageContent);

  return {
    id,
    name: attributes.translations.displayName,
    type: attributes.translations.type,
    condition,
    contents,
  };
}

export function buildJourneyConfiguration(data: any, included: any): JourneyConfigProgram {
  const { id, attributes, relationships } = data;

  const languageIds = relationships.languages.data.map((l: any) => l.id);
  const languages = included.filter((entity: any) => entity.type === EntityType.LANGUAGE && languageIds.includes(entity.id)).map(buildQiguLanguageEntity);
  const defaultLanguage = buildQiguLanguageEntity(included.find((entity: any) => entity.type === EntityType.LANGUAGE && entity.id === relationships.defaultLanguage.data[0]!.id)!);

  const stageIds = relationships.programStages.data.map((s: any) => s.id);
  const stages = included.filter((entity: any) => entity.type === EntityType.PROGRAM_STAGE && stageIds.includes(entity.id)).map((stage: any) => buildJourneyConfigurationStage(stage, included));

  return {
    id,
    name: attributes.translations.name,
    description: attributes.translations.description,

    duration: attributes.config.duration || 100,

    defaultLanguage,
    languages,

    stages,
  };
}
