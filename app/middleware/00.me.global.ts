export default defineNuxtRouteMiddleware(async (to) => {
  const store = useUserStore();
  const { user } = storeToRefs(store);

  if (store.isLoggedIn) return;

  const { public: config } = useRuntimeConfig();

  await store.fetchUser();
  if (user.value?.termsToApprove) return navigateTo(config.urls.auth.replaceAll("{alias}", to.params.alias as string), { external: true });
});
