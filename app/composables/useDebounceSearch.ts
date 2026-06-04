import { useDebounceFn } from "@vueuse/core";

export function useDebounceSearch(cb: (search: string) => Promise<unknown> | unknown) {
  const { query } = useRoute();
  const searchParam = query.q as string || query.search as string || "";

  const search = ref<string>(searchParam);
  watch(search, (val) => {
    if (!val) {
      navigateTo({
        query: {
          ...query,
          search: undefined,
          q: undefined,
        },
        replace: true,
      });
      return;
    }

    const param = query.search ? "search" : "q";
    navigateTo({
      query: {
        ...query,
        [param]: val,
      },
      replace: true,
    });
  });
  watch(search, useDebounceFn((val: string) => cb(val)));

  async function reload() {
    await cb(search.value ?? "");
  }

  function clear() {
    search.value = "";
  }

  return { search, reload, clear };
}
