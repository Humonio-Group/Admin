export function usePagination(cb: (val: number) => Promise<unknown> | unknown) {
  const { query } = useRoute();
  const { page: pageParam } = query;
  const page = pageParam ? Number(pageParam) : 1;
  const defaultPage = page >= 1 ? page : 1;

  const activePage = ref<number>(defaultPage);
  watch(activePage, async (val) => {
    const p = val ? (val >= 1 ? val : 1) : 1;
    navigateTo({
      query: {
        ...query,
        page: p,
      },
      replace: true,
    });
    await cb(p);
  }, { immediate: true });

  async function reload() {
    cb(activePage.value);
  }

  return { activePage, reload };
}
