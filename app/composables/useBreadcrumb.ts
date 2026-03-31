import type { NavigationState } from "~/types/states/navigation";

export function useBreadcrumb(breadcrumb: NavigationState["breadcrumb"]) {
  const store = useNavigationStore();
  store.storeBreadcrumb(breadcrumb);

  onBeforeRouteLeave(() => store.storeBreadcrumb([]));
}
