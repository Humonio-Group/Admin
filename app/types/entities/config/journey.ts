import type { Translation } from "~/types/primitives/translations";
import type { QiguLanguage } from "~/types/entities/language";
import type { Listed, Nullable } from "~/types/primitives/objects";
import { z } from "zod";

const contentSchema = z.object({
  id: z.number().readonly(),
  date: z.date().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  location: z.coerce.number().optional(),
  facilitators: z.array(z.coerce.number()).min(1).optional(),
});
export const stageSchema = z.object({
  id: z.number().readonly(),
  date: z.date().optional(),
  contents: z.array(contentSchema),
});
export type Content = z.infer<typeof contentSchema>;
export type Stage = z.infer<typeof stageSchema>;

export interface ActivationCondition {
  type: 1 | 2 | 3 | 4;
}
export interface DateCondition extends ActivationCondition {
  type: 4;
  days: number;
  hours: number;
  minutes: number;
}
export interface ContentWorkshopConfig {
  start: Omit<DateCondition, "type">;
  end: Omit<DateCondition, "type">;
  defaultLocation?: number;
  defaultFacilitators: number[];
}

export interface JourneyConfigProgram {
  id: number;
  name: Translation;
  description: Translation;

  defaultLanguage: QiguLanguage;
  languages: Listed<QiguLanguage>;

  duration: number;

  stages: Listed<JourneyConfigProgramStage>;
}

export interface JourneyConfigProgramStage {
  id: number;
  name: Translation;
  type: Translation;
  condition: Nullable<DateCondition>;
  contents: Listed<JourneyConfigProgramContent>;
}

export interface JourneyConfigProgramContent {
  id: number;
  name: Translation;
  picture: Nullable<string>;
  condition: Nullable<DateCondition>;
  workshop: Nullable<ContentWorkshopConfig>;
}
