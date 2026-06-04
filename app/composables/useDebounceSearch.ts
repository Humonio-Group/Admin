import { useDebounceFn } from "@vueuse/core";

export function useDebounceSearch(cb: (search: string) => Promise<unknown> | unknown) {
  const search = ref<string>("");
  watch(search, useDebounceFn((val: string) => cb(val)));

  async function reload() {
    await cb(search.value ?? "");
  }

  function clear() {
    search.value = "";
  }

  return { search, reload, clear };
}
