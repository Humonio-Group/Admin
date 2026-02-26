import type { NavigationGroup } from "~/types/primitives/sidebar";
import { Home, Palette, MapPin, Newspaper, Users, Code, Database, Mail, Lock, ShoppingBag, Link, BriefcaseBusiness } from "lucide-vue-next";

export const sidebarContent = computed<NavigationGroup[]>(() => {
  const { t } = useNuxtApp().$i18n;

  return [
    {
      type: "group",
      children: [
        {
          type: "item",
          label: t("settings.navigation.general"),
          icon: Home,
          path: "/administration/settings",
          exact: true,
        },
      ],
    },
    {
      type: "group",
      label: t("settings.navigation.brand.label"),
      children: [
        {
          type: "item",
          label: t("settings.navigation.brand.identity"),
          icon: Palette,
          path: "/administration/settings/branding",
        },
        {
          type: "item",
          label: t("settings.navigation.brand.conditions"),
          icon: Newspaper,
          path: "/administration/settings/conditions",
        },
      ],
    },
    {
      type: "group",
      label: t("settings.navigation.management.label"),
      children: [
        {
          type: "item",
          label: t("settings.navigation.management.locations"),
          icon: MapPin,
          path: "/administration/settings/locations",
        },
        {
          type: "item",
          label: t("settings.navigation.management.users"),
          icon: Users,
          path: "/administration/settings/users",
        },
        {
          type: "item",
          label: t("settings.navigation.management.companies"),
          icon: BriefcaseBusiness,
          path: "/administration/settings/companies",
        },
      ],
    },
    {
      type: "group",
      label: t("settings.navigation.public.label"),
      children: [
        {
          type: "item",
          label: t("settings.navigation.public.invitation"),
          icon: Link,
          path: "/administration/settings/invitation",
        },
        {
          type: "item",
          label: t("settings.navigation.public.shop"),
          icon: ShoppingBag,
          path: "/administration/settings/shop",
        },
      ],
    },
    {
      type: "group",
      label: t("settings.navigation.advanced.label"),
      children: [
        {
          type: "item",
          label: t("settings.navigation.advanced.sso"),
          icon: Lock,
          path: "/administration/settings/sso",
        },
        {
          type: "item",
          label: t("settings.navigation.advanced.mailing"),
          icon: Mail,
          path: "/administration/settings/mailing",
        },
        {
          type: "item",
          label: t("settings.navigation.advanced.data-storage"),
          icon: Database,
          path: "/administration/settings/data-storage",
        },
        {
          type: "item",
          label: t("settings.navigation.advanced.developer"),
          icon: Code,
          path: "/administration/settings/developer",
        },
      ],
    },
  ];
});
