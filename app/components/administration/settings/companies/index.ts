import type { ColumnDef } from "@tanstack/vue-table";
import type { Company } from "~/types/entities/company";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { formatDate } from "date-fns";
import * as locales from "date-fns/locale";
import CompaniesActions from "~/components/administration/settings/companies/CompaniesActions.vue";

export interface CompanyActionsProps {
  company: Company;
}

export const columns = (): ColumnDef<Company>[] => {
  const { t, locale } = useNuxtApp().$i18n;

  return [
    {
      accessorKey: "id",
      header: () => h("div", { class: "text-muted-foreground/50" }, "#"),
      cell: ({ row }) => h("div", row.getValue("id")),
    },
    {
      id: "name",
      header: () => h("div", t("settings.companies.table.headers.name")),
      cell: ({ row }) => {
        const avatarImage = h(AvatarImage, { src: row.original.icon });
        const avatarFallback = h(AvatarFallback, `${row.original.name.substring(0, 2)}`);
        const avatar = h(Avatar, [avatarImage, avatarFallback]);

        const name = h("p", row.original.name);

        return h("div", { class: "flex items-center gap-2" }, [avatar, name]);
      },
    },
    {
      id: "createdAt",
      header: () => h("div", t("settings.companies.table.headers.created-at")),
      cell: ({ row }) => h("div", row.original.dates ? formatDate(row.original.dates.createdAt, "PPP", { locale: locales[locale.value] }) : "-"),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const actions = h(CompaniesActions, { company: row.original });
        return h("div", { class: "flex justify-end" }, actions);
      },
    },
  ];
};
