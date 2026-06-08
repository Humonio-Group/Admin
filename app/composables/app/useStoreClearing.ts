export const useStoreClearing = (user: boolean = true) => {
  useCompanyStore().$reset();
  if (user) useUserStore().$reset();
};
