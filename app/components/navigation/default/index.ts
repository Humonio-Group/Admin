import type { NavigationGroup, NavigationItem } from "~/types/primitives/sidebar";
import { Folder, Flag, Zap, Gauge, Brain, Settings, MessageCircleWarning, Ticket } from "@lucide/vue";
import { LibraryBig } from "lucide-vue-next";

export interface DefaultSidebarItemProps {
  index: number;
  item: NavigationItem;
}

export interface DefaultSidebarProps {
  showSearch?: boolean;
}

export const sidebarContent = computed<NavigationGroup[]>(() => {
  const { t } = useNuxtApp().$i18n;

  const support: NavigationGroup[] = [{
    type: "group",
    label: t("navigation.support.label"),
    children: [
      {
        type: "item",
        label: t("navigation.support.tickets"),
        path: "/support/tickets",
        icon: Ticket,
      },
      {
        type: "item",
        label: t("navigation.support.abuses"),
        path: "/support/abuses",
        icon: MessageCircleWarning,
      },
    ],
  }];

  const contentLibrary: NavigationItem[] = [{
    type: "item",
    label: t("navigation.administration.content-library"),
    path: "/administration/content-library",
    icon: LibraryBig,
  }];
  const settings: NavigationItem[] = [{
    type: "item",
    label: t("navigation.administration.settings"),
    path: "/administration/settings",
    icon: Settings,
  }];
  const admin: NavigationGroup[] = [{
    type: "group",
    label: t("navigation.administration.label"),
    children: [
      ...(useHasRole("coordinator").value ? contentLibrary : []),
      ...(useHasRole("admin").value ? settings : []),
    ],
  }];

  const analytics: NavigationGroup[] = [{
    type: "group",
    label: t("navigation.analytics.label"),
    children: [
      {
        type: "item",
        label: t("navigation.analytics.usage"),
        path: "/analytics/usage",
        icon: Gauge,
      },
      {
        type: "item",
        label: t("navigation.analytics.ai"),
        path: "/analytics/ai",
        icon: Brain,
      },
    ],
  }];

  return [
    {
      type: "group",
      label: t("navigation.deployment.label"),
      children: [
        {
          type: "item",
          label: t("navigation.deployment.programs"),
          path: "/deployment/programs",
          icon: Folder,
        },
        {
          type: "item",
          label: t("navigation.deployment.courses"),
          path: "/deployment/journeys",
          icon: Flag,
        },
        {
          type: "item",
          label: t("navigation.deployment.actions"),
          path: "/deployment/actions",
          icon: Zap,
        },
      ],
    },
    ...(useHasRole("admin").value || useHasRole("analyst").value ? analytics : []),
    ...(useHasRole("support").value ? support : []),
    ...(useHasRole("admin").value || useHasRole("coordinator").value ? admin : []),
  ];
});
