import type { Listed } from "~/types/primitives/objects";
import type { ColumnDef } from "@tanstack/vue-table";
import { formatDate } from "date-fns";
import * as locales from "date-fns/locale";
import { Avatar, AvatarImage } from "~/components/ui/avatar";

export const columns = (): Listed<ColumnDef<any>> => {
  const { t, locale } = useNuxtApp().$i18n;

  return [
    {
      accessorKey: "name",
      header: () => "Titre",
      cell: ({ row }) => {
        const avatarImage = h(AvatarImage, { class: "bg-primary", src: row.original.icon });
        const avatar = h(Avatar, { class: "size-6 rounded-sm" }, avatarImage);
        const name = h("p", row.original.name[locale.value] || row.original.name[Object.keys(row.original.name)[0]!]);

        return h("div", { class: "flex items-center gap-2" }, [avatar, name]);
      },
    },
    {
      accessorKey: "type",
      header: () => "Type",
      cell: ({ row }) => h("p", row.original.type),
    },
    {
      accessorKey: "author",
      header: () => "Auteur",
      cell: ({ row }) => {
        const avatarImage = h(AvatarImage, { src: row.original.author.picture });
        const avatar = h(Avatar, { class: "size-7" }, avatarImage);
        const name = h("p", row.original.author.name);

        return h("div", { class: "flex items-center gap-2" }, [avatar, name]);
      },
    },
    {
      id: "created-at",
      header: () => "Créé le",
      cell: ({ row }) => h("p", formatDate(row.original.createdAt, "d MMMM yyyy, HH:mm", { locale: locales[locale.value] })),
    },
    {
      id: "updated-at",
      header: () => "Mis à jour le",
      cell: ({ row }) => h("p", formatDate(row.original.updatedAt, "d MMMM yyyy, HH:mm", { locale: locales[locale.value] })),
    },
  ];
};
