import type { ColumnDef } from "@tanstack/vue-table";
import type { Location } from "~/types/entities/location";
import FlagIcon from "~/components/icons/FlagIcon.vue";
import LocationActions from "~/components/administration/settings/locations/LocationActions.vue";

export interface LocationActionsProps {
  location: Location;
}

export const columns = (): ColumnDef<Location>[] => {
  const { t } = useNuxtApp().$i18n;

  return [
    {
      accessorKey: "id",
      header: () => h("div", { class: "text-muted-foreground/50" }, "#"),
      cell: ({ row }) => h("div", row.getValue("id")),
    },
    {
      accessorKey: "name",
      header: () => h("div", t("settings.locations.table.headers.name")),
      cell: ({ row }) => h("div", row.getValue("name")),
    },
    {
      accessorKey: "city",
      header: () => h("div", t("settings.locations.table.headers.city")),
      cell: ({ row }) => h("div", row.getValue("city")),
    },
    {
      id: "country",
      header: () => h("div", t("settings.locations.table.headers.country")),
      cell: ({ row }) => {
        const icon = h(FlagIcon, { countryCode: row.original.country.code });

        return h("div", { class: "flex items-center gap-2" }, [
          icon,
          row.original.country.name,
        ]);
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const ctx = h(LocationActions, { location: row.original });
        return h("div", { class: "flex items-center justify-end" }, ctx);
      },
    },
  ];
};
