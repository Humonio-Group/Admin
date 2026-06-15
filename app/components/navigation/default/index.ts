import type { NavigationGroup, NavigationItem } from "~/types/primitives/sidebar";
import { Folder, Flag, Zap, Gauge, Brain, Settings } from "lucide-vue-next"; // Ticket, MessageCircleWarning, LibraryBig,

export interface DefaultSidebarItemProps {
  index: number;
  item: NavigationItem;
}

export interface DefaultSidebarProps {
  showSearch?: boolean;
}

export const sidebarContent = computed<NavigationGroup[]>(() => {
  const { t } = useNuxtApp().$i18n;

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
    {
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
    },
    /* {
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
    }, */
    {
      type: "group",
      label: t("navigation.administration.label"),
      children: [
        /* {
          type: "item",
          label: t("navigation.administration.content-library"),
          path: "/administration/content-library",
          icon: LibraryBig,
        }, */
        {
          type: "item",
          label: t("navigation.administration.settings"),
          path: "/administration/settings",
          icon: Settings,
        },
      ],
    },
  ];
});
