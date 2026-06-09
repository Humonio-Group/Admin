import type { HumonioProps } from "~/types/components/default";
import type { ColumnDef } from "@tanstack/vue-table";
import type { Term } from "~/types/entities/terms";
import ConditionActions from "~/components/administration/settings/conditions/ConditionActions.vue";
import TermDialog from "~/components/user/settings/terms/TermDialog.vue";

export interface ConditionEditDialogProps extends HumonioProps {
  term?: Term;
  trigger?: boolean;
}

export interface ConditionActionsProps extends HumonioProps {
  term: Term;
}

export const columns = (): ColumnDef<Term>[] => {
  const { t } = useNuxtApp().$i18n;
  const { formatDate } = useDateUtils();
  const { formatTime } = useTimeUtils();

  return [
    {
      accessorKey: "id",
      header: () => h("div", { class: "text-muted-foreground/50" }, "#"),
      cell: ({ row }) => h("div", row.getValue("id")),
    },
    {
      accessorKey: "name",
      header: () => h("div", {}, t("settings.conditions.table.headers.name")),
      cell: ({ row }) => {
        const trigger = h("button", { class: "cursor-pointer underline-offset-4 hover:underline" }, row.getValue("name"));
        const dialog = h(TermDialog, { term: row.original, trigger: true }, trigger);

        return h("div", dialog);
      },
    },
    {
      id: "lastUpdate",
      header: () => h("div", {}, t("settings.conditions.table.headers.last-update")),
      cell: ({ row }) => {
        const date = row.original.lastUpdate;

        return h("div", {}, `${formatDate("medium")(date)}, ${formatTime("short")(date)}`);
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return h("div", { class: "flex items-center justify-end" }, h(ConditionActions, { term: row.original }));
      },
    },
  ];
};
