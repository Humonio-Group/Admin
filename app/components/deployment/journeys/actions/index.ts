import type { Listed } from "~/types/primitives/objects";
import type { ColumnDef } from "@tanstack/vue-table";
import type { Action } from "~/types/entities/action";
import { formatDate } from "date-fns";
import * as locales from "date-fns/locale";
import ActionBadgeStatus from "~/components/deployment/journeys/actions/ActionBadgeStatus.vue";
import ActionDetailsDialog from "~/components/deployment/journeys/actions/ActionDetailsDialog.vue";

export interface ActionStatusBadgeProps {
  action: Action;
}

export interface ActionDetailsDialogProps {
  action: Action;
}

export const columns = (): Listed<ColumnDef<Action>> => {
  const { t, locale } = useNuxtApp().$i18n;

  return [
    {
      accessorKey: "id",
      header: () => h("div", { class: "text-muted-foreground" }, "#"),
      cell: ({ row }) => h("div", row.getValue("id")),
    },
    {
      id: "description",
      header: () => h("div", t("deployment.journeys.actions.table.headers.description")),
      cell: ({ row }) => h("div", { class: "max-w-xs" }, h("p", { class: "truncate" }, row.original.description.raw)),
    },
    {
      id: "author",
      header: () => h("div", t("deployment.journeys.actions.table.headers.author")),
      cell: ({ row }) => h("p", row.original.author.name.full),
    },
    {
      accessorKey: "template",
      header: () => h("div", t("deployment.journeys.actions.table.headers.template")),
      cell: ({ row }) => h("p", row.getValue("template") || "-"),
    },
    {
      id: "status",
      header: () => h("div", t("deployment.journeys.actions.table.headers.status")),
      cell: ({ row }) => h(ActionBadgeStatus, { action: row.original }),
    },
    {
      id: "createdAt",
      header: () => h("div", t("deployment.journeys.actions.table.headers.created-at")),
      cell: ({ row }) => {
        console.log(row.original.dates.createdAt);
        return h("p", formatDate(row.original.dates.createdAt, t("deployment.journeys.actions.table.date-format"), { locale: locales[locale.value] }));
      },
    },
    {
      id: "action",
      cell: ({ row }) => h("div", { class: "flex justify-end" }, h(ActionDetailsDialog, { action: row.original })),
    },
  ];
};
