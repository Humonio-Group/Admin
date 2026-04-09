import type { Listed } from "~/types/primitives/objects";
import type { ColumnDef } from "@tanstack/vue-table";
import type { JourneyTeam, JourneyTeamMember } from "~/types/entities/journey";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import JourneyTeamMemberGroupMenu from "~/components/deployment/journeys/teams/JourneyTeamMemberGroupMenu.vue";
import JourneyTeamMemberAction from "~/components/deployment/journeys/teams/JourneyTeamMemberAction.vue";

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

        const name = h("p", `${row.original.firstName} ${row.original.lastName}`);

        return h("div", { class: "flex items-center gap-2" }, [avatar, name]);
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
      id: "actions",
      cell: ({ row }) => h("div", { class: "flex justify-end" }, h(JourneyTeamMemberAction, { member: row.original, team })),
    },
  ];
};
