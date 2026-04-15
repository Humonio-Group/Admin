import type { Listed } from "~/types/primitives/objects";
import type { ColumnDef } from "@tanstack/vue-table";
import type { JourneyTeam, JourneyTeamMember } from "~/types/entities/journey";
import { Badge } from "~/components/ui/badge";
import { Crown } from "lucide-vue-next";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import JourneyTeamMemberGroupMenu from "~/components/deployment/journeys/teams/JourneyTeamMemberGroupMenu.vue";
import JourneyTeamMemberAction from "~/components/deployment/journeys/teams/JourneyTeamMemberAction.vue";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";

export interface JourneyTeamMemberGroupMenuProps {
  member: JourneyTeamMember;
  team: JourneyTeam;
}

export interface JourneyTeamMemberActionsProps {
  member: JourneyTeamMember;
  team: JourneyTeam;
}

export interface TeamAddMemberDialogProps {
  team: JourneyTeam;
  trigger?: boolean;
}

export interface TeamMoveMemberDialogProps {
  members: Listed<JourneyTeamMember>;
  team: JourneyTeam;
  teams: Listed<JourneyTeam>;
}

export interface TeamDialog {
  team?: JourneyTeam;
  trigger?: boolean;
}

export const columns = (team: JourneyTeam): Listed<ColumnDef<JourneyTeamMember>> => {
  return [
    {
      id: "participant",
      header: () => h("div", "Participant"),
      cell: ({ row }) => {
        const avatarImage = h(AvatarImage, { src: row.original.avatar ?? "" });
        const avatarFallback = h(AvatarFallback, `${row.original.firstName[0]}${row.original.lastName[0]}`);
        const avatar = h(Avatar, [avatarImage, avatarFallback]);

        const crown = h(Crown, { class: "size-3.5 text-primary" });
        const trigger = h(TooltipTrigger, { asChild: true }, crown);
        const content = h(TooltipContent, h("p", "Chef d'équipe"));
        const tooltip = h(Tooltip, [trigger, content]);

        const name = h("p", { class: "flex items-center gap-2" }, [
          `${row.original.firstName} ${row.original.lastName}`,
          ...(row.original.reference === team.leader ? [tooltip] : []),
        ]);
        const archived = h("p", { class: "text-xs text-destructive" }, "Archivé");
        const info = h("div", { class: "grid" }, [name, ...(row.original.archived ? [archived] : [])]);

        return h("div", { class: "flex items-center gap-2" }, [avatar, info]);
      },
    },
    {
      id: "groups",
      header: () => h("div", "Groupes"),
      cell: ({ row }) => {
        const groups = row.original.groups.map(group => h(Badge, { variant: "outline" }, group.name));
        const add = h(JourneyTeamMemberGroupMenu, { member: row.original, team });

        return h("div", { class: "flex items-center gap-1" }, [...groups, add]);
      },
    },
    {
      id: "mentor",
      header: () => h("div", "Mentor"),
      cell: () => h("div", "-"),
    },
    {
      id: "actions",
      cell: ({ row }) => h("div", { class: "flex justify-end" }, h(JourneyTeamMemberAction, { member: row.original, team })),
    },
  ];
};
