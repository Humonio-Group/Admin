import type { CompanySSOSettings, SSOAlgorithm, SSOUserField } from "~/types/entities/company";
import { v4 as uuid } from "uuid";

export function buildSSOSettings(data: any): CompanySSOSettings {
  const { sso } = data.attributes;

  const {
    active,
    alias,
    issuerUrl,
    certificate,
    mapping,
    samlEndpoint,
    samlSignatureAlgorithm,
    sloEndpoint,
  } = sso;

  return {
    active,
    alias,
    certificate,
    issuer: issuerUrl,
    mapping: mapping.map((map: any) => ({
      key: uuid(),
      userField: map.userField as SSOUserField,
      attributeName: map.attributeName,
    })),
    slo: {
      endpoint: sloEndpoint,
    },
    saml: {
      endpoint: samlEndpoint,
      signatureAlgorithm: samlSignatureAlgorithm as SSOAlgorithm,
    },
  };
}
