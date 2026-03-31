import type { NavigationState } from "~/types/states/navigation";

export const useNavigationStore = defineStore("navigation", {
  state: (): NavigationState => ({
    breadcrumb: [],
  }),
  actions: {
    storeBreadcrumb(bc: NavigationState["breadcrumb"]) {
      this.breadcrumb = bc;
    },
  },
});
