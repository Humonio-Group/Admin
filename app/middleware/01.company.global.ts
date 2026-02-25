const publicPaths: string[] = [];

export default defineNuxtRouteMiddleware(async (to) => {
  const alias = to.params.alias;
  const { user } = storeToRefs(useUserStore());
  const store = useCompanyStore();

  const { public: config } = useRuntimeConfig();

  if (user.value && !alias && !publicPaths.includes(to.path)) return navigateTo(config.urls.auth.replaceAll("{alias}", to.params.alias as string), { external: true });
  if (store.isLoaded && storeToRefs(store).company.value!.alias === alias) return;

  if (user.value) await store.fetchCompany(alias as string);
});
