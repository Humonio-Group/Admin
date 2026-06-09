import type { ColumnDef } from "@tanstack/vue-table";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import type { CompanyUser } from "~/types/entities/company";
import { Badge } from "~/components/ui/badge";
import UserActions from "~/components/administration/settings/users/UserActions.vue";

export interface UserActionsProps {
  user: CompanyUser;
}

export interface UserDialogProps {
  user?: CompanyUser;
  trigger?: boolean;
  tooltip?: string;
}

export const columns = (): ColumnDef<CompanyUser>[] => {
  const { t } = useNuxtApp().$i18n;
  const { company } = storeToRefs(useCompanyStore());

  return [
    {
      accessorKey: "id",
      header: () => h("div", { class: "text-muted-foreground/50" }, "#"),
      cell: ({ row }) => h("div", row.getValue("id")),
    },
    {
      id: "name",
      header: () => h("div", t("settings.users.table.headers.name")),
      cell: ({ row }) => {
        const avatarImage = h(AvatarImage, { src: row.original.avatar });
        const avatarFallback = h(AvatarFallback, `${row.original.name.first[0]}${row.original.name.last[0]}`);
        const avatar = h(Avatar, { class: "size-6 rounded-sm" }, [
          avatarImage,
          avatarFallback,
        ]);

        return h("div", { class: "flex items-center gap-2" }, [
          avatar,
          row.original.name.full,
        ]);
      },
    },
    {
      accessorKey: "email",
      header: () => h("div", t("settings.users.table.headers.email")),
      cell: ({ row }) => h("div", row.getValue("email")),
    },
    {
      id: "roles",
      header: () => h("div", t("settings.users.table.headers.roles")),
      cell: ({ row }) => {
        const roles = row.original.workspaces.find(workspace => workspace.id === Number(company.value!.id))?.roles;
        const rolesDisplay = roles?.slice(0, 2).map(role => h(Badge, { variant: "outline" }, t(`labels.roles.${role}`))) ?? [];

        const diff = (roles?.length ?? 0) - rolesDisplay.length;

        return h("div", { class: "flex items-center gap-2" }, [
          ...rolesDisplay,
          ...(diff > 0 ? [h(Badge, { variant: "outline" }, `+${diff}`)] : []),
        ]);
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const actions = h(UserActions, { user: row.original });
        return h("div", { class: "flex items-center justify-end" }, actions);
      },
    },
  ];
};
