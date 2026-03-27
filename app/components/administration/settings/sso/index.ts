import type { Listed } from "~/types/primitives/objects";
import type { ColumnDef } from "@tanstack/vue-table";
import type { CompanySSOSettings } from "~/types/entities/company";
import SSOMappingActions from "~/components/administration/settings/sso/SSOMappingActions.vue";

export type MappingEntry = CompanySSOSettings["mapping"][0];

export interface SSOMappingActionsProps {
  entry: MappingEntry;
  deleteEntry: (key: string) => void;
}

export const columns = (deleteEntry: (key: string) => void): Listed<ColumnDef<MappingEntry>> => {
  const t = useNuxtApp().$i18n.t;

  return [
    {
      accessorKey: "attributeName",
      header: () => h("div", t("settings.sso.labels.mapping.attribute-name")),
      cell: ({ row }) => h("div", row.original.attributeName),
    },
    {
      accessorKey: "userField",
      header: () => h("div", t("settings.sso.labels.mapping.user-field.default")),
      cell: ({ row }) => h("div", `${t(`settings.sso.labels.mapping.user-field.${row.original.userField}`)} (${row.original.userField})`),
    },
    {
      id: "actions",
      cell: ({ row }) => h("div", { class: "flex justify-end" }, h(SSOMappingActions, { entry: row.original, deleteEntry })),
    },
  ];
};
