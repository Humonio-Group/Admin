import type { Listed } from "~/types/primitives/objects";
import type { BreadcrumbItem } from "~/components/navigation/AppBreadcrumb.vue";

export interface NavigationState {
  breadcrumb: Listed<BreadcrumbItem>;
}
