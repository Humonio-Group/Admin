import type { Journey, JourneyEvent, JourneyScore } from "~/types/entities/journey";
import { ArrowRight } from "lucide-vue-next";
import type { ColumnDef } from "@tanstack/vue-table";
import type { Listed } from "~/types/primitives/objects";
import { formatDate } from "date-fns";
import * as locales from "date-fns/locale";
import { Badge } from "~/components/ui/badge";
import { computeStatus, computeStatusColors } from "~/lib/entities/lifecycle/journey";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import JourneyActions from "~/components/deployment/journeys/JourneyActions.vue";
import { NuxtLinkLocale } from "#components";

export interface JourneyActionsProps {
  journey: Journey;
  showJourneyShortcuts?: boolean;
}

export interface JourneyStatCardProps {
  label: string;
  max: number;
  value: number;
}

export interface NextEventCardProps {
  event: JourneyEvent;
}

export interface JourneyTeamScoreProps {
  score: JourneyScore;
}

export const columns = (showProgram: boolean = false): Listed<ColumnDef<Journey>> => {
  const { t, locale } = useNuxtApp().$i18n;
  const headerKey = (path: string) => t(`deployment.journeys.table.headers.${path}`);
  const { company } = storeToRefs(useCompanyStore());

  const programColumn: ColumnDef<Journey> = {
    id: "program",
    header: () => h("div", t("Programme")),
    cell: ({ row }) => {
      const link = h(NuxtLinkLocale, { class: "truncate", to: `/${company.value?.alias}/deployment/programs/${row.original.relatedProgram?.id}` }, () => row.original.relatedProgram?.name[locale.value] || row.original.relatedProgram?.name[row.original.relatedProgram?.defaultLanguage?.code]);
      const button = h(Button, { asChild: true, variant: "link", class: "text-foreground! px-0! overflow-hidden" }, link);

      return h("div", { class: "relative z-1 max-w-xs overflow-hidden" }, button);
    },
  };

  return [
    {
      id: "info",
      cell: ({ row }) => {
        const title = h("p", { class: "font-medium truncate" }, row.original.name);

        const statusColors = computeStatusColors(row.original.status);
        const status = h(Badge, { variant: "outline", class: `${statusColors.border} ${statusColors.text} ${statusColors.background}` }, t(`labels.state.${computeStatus(row.original.status)}.f`, 1));

        return h("div", { class: "flex flex-col gap-1 max-w-xs overflow-hidden" }, [title, status]);
      },
    },
    ...(showProgram ? [programColumn] : []),
    {
      id: "time-lapse",
      header: () => h("div", headerKey("time-lapse")),
      cell: ({ row }) => {
        const start = h("p", formatDate(row.original.dates.start, t("deployment.journeys.table.formats.dates"), { locale: locales[locale.value] }));
        const end = h("p", formatDate(row.original.dates.end, t("deployment.journeys.table.formats.dates"), { locale: locales[locale.value] }));
        const arrow = h(ArrowRight, { class: "size-3.5" });

        return h("div", { class: "flex items-center gap-1" }, [start, arrow, end]);
      },
    },
    {
      id: "facilitators",
      header: () => h("div", headerKey("facilitators")),
      cell: ({ row }) => {
        const length = row.original.facilitators.length;
        const users = row.original.facilitators.slice(0, 3).map((facilitator, index) => {
          const avatarImage = h(AvatarImage, { src: facilitator.avatar });
          const avatar = h(Avatar, { class: `${index > 0 ? "-ml-2" : ""} outline-background outline-3` }, avatarImage);

          const tooltipTrigger = h(TooltipTrigger, { asChild: true }, avatar);
          const tooltipContent = h(TooltipContent, `${facilitator.firstName} ${facilitator.lastName}`);
          return h(Tooltip, [tooltipTrigger, tooltipContent]);
        });

        const moreFallback = h(AvatarFallback, { class: "text-xs font-medium text-muted-foreground" }, `+${length - users.length}`);
        const more = h(Avatar, { class: "-ml-2 outline-background outline-3" }, moreFallback);

        return h("div", { class: "flex items-center" }, [...users, ...(length > 3 ? [more] : [])]);
      },
    },
    {
      id: "participants",
      header: () => h("div", headerKey("participants")),
      cell: ({ row }) => {
        const length = row.original.participants.length;
        const users = row.original.participants.slice(0, 3).map((participant, index) => {
          const avatarImage = h(AvatarImage, { src: participant.avatar });
          const avatar = h(Avatar, { class: `${index > 0 ? "-ml-2" : ""} outline-background outline-3` }, avatarImage);

          const tooltipTrigger = h(TooltipTrigger, { asChild: true }, avatar);
          const tooltipContent = h(TooltipContent, `${participant.firstName} ${participant.lastName}`);
          return h(Tooltip, [tooltipTrigger, tooltipContent]);
        });

        const moreFallback = h(AvatarFallback, { class: "text-xs font-medium text-muted-foreground" }, `+${length - users.length}`);
        const more = h(Avatar, { class: "-ml-2 outline-background outline-3" }, moreFallback);

        return h("div", { class: "flex items-center" }, [...users, ...(length > 3 ? [more] : [])]);
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const actions = h(JourneyActions, { journey: row.original });
        return h("div", { class: "relative z-1 flex justify-end" }, actions);
      },
    },
  ];
};
