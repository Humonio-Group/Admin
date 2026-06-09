import type { QiguLanguage } from "~/types/entities/language";

export function buildQiguLanguageEntity(data: any): QiguLanguage {
  const { id, attributes } = data;
  const { name, nativeName, code } = attributes;

  return {
    id,
    name,
    nativeName,
    code,
  };
}
