export function buildDeveloperSettings(data: any) {
  const { id, attributes } = data;
  return {
    id,
    token: attributes.api.authToken,
    webhook: attributes.api.webhookUrl,
  };
}
