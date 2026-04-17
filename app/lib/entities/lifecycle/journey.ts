import type { JourneyScoreScope,
  Journey, JourneyEvent, JourneyScore,
  JourneyTeam,
  JourneyTeamMember,
  SelectedJourney } from "~/types/entities/journey";
import { EntityType } from "~/types/entities";
import { buildProgramEntity } from "~/lib/entities/lifecycle/program";
import type { Group } from "~/types/entities/group";

export function buildJourneyEntity(data: any, included: any): Journey {
  const { id, attributes, relationships } = data;
  const relatedProgram = included.find((e: any) => e.type === EntityType.PROGRAM && e.id === relationships.program.data[0]?.id);

  const facilitatorIds = [
    ...relationships.facilitators.data.map((entity: any) => entity.id),
    ...(relationships.mainFacilitator.data[0] ? [relationships.mainFacilitator.data[0].id] : []),
  ];
  const facilitators = included.filter((entity: any) => entity.type === EntityType.USER && facilitatorIds.includes(entity.id));

  const participantsIds = relationships.participants.data.map((entity: any) => entity.id);
  const participants = included.filter((entity: any) => entity.type === EntityType.USER && participantsIds.includes(entity.id));

  return {
    id,
    name: attributes.displayName,
    status: attributes.status.value,
    picture: attributes.picture?.thumbnail || null,
    dates: {
      start: new Date(attributes.dates.start),
      end: new Date(attributes.dates.end),
    },
    stats: {
      evaluation: {
        experience: attributes.stats.evaluation.experience,
        facilitators: attributes.stats.evaluation.facilitator,
      },
    },
    facilitators: facilitators.map((f: any) => ({
      id: f.id,
      firstName: f.attributes.firstname,
      lastName: f.attributes.lastname,
      avatar: f.attributes.picture.thumbnail,
    })),
    participants: participants.map((p: any) => ({
      id: p.id,
      firstName: p.attributes.firstname,
      lastName: p.attributes.lastname,
      avatar: p.attributes.picture.thumbnail,
    })),

    relatedProgram: relatedProgram ? buildProgramEntity(relatedProgram) : undefined,
  };
}

export function computeStatus(status: Journey["status"]) {
  switch (status) {
    case -1: return "cancelled";
    case 1: return "confirmed";
    case 2: return "closed";
    default: return "unconfirmed";
  }
}
export function parseStatus(status: string): Journey["status"] {
  switch (status) {
    case "confirmed": return 1;
    case "cancelled": return -1;
    case "closed": return 2;
    default: return 0;
  }
}
export function computeStatusColors(status: Journey["status"]): { border: string; text: string; background: string } {
  switch (status) {
    case -1: return {
      border: "border-rose-400",
      text: "text-rose-700 dark:text-rose-400",
      background: "bg-rose-400/10 dark:bg-rose-400/20",
    };
    case 1: return {
      border: "border-green-400",
      text: "text-green-700 dark:text-green-400",
      background: "bg-green-400/10 dark:bg-green-400/20",
    };
    case 2: return {
      border: "border-sky-400",
      text: "text-sky-700 dark:text-sky-400",
      background: "bg-sky-400/10 dark:bg-sky-400/20",
    };
    default: return {
      border: "border-amber-400",
      text: "text-amber-700 dark:text-amber-400",
      background: "bg-amber-400/10 dark:bg-amber-400/20",
    };
  }
}

export function extendToSelectedJourney(journey: Journey): SelectedJourney {
  return {
    ...journey,
    teams: {
      totalEntities: -1,
      list: [],
    },
    actions: {
      totalEntities: -1,
      list: [],
    },
    nextEvents: {
      totalEntities: -1,
      list: [],
    },
    scores: {
      access: [],
      average: {
        participants: [],
        teams: [],
      },
    },
  };
}

export function buildTeamEntity(data: any): JourneyTeam {
  const { id, attributes, relationships } = data;
  const leader = relationships.leader.data[0]?.id ?? null;

  return {
    id,
    name: attributes.name,
    stats: {
      full: attributes.isFull,
      maxParticipants: attributes.stats.maxParticipants,
      coaches: attributes.stats.nbLeads,
      participants: attributes.stats.nbParticipants,
    },
    leader,
    coaches: [],
    participants: [],
  };
}
export function buildTeamMemberEntity(data: any, included: any): JourneyTeamMember {
  const { id, attributes, relationships } = data;
  const user = included.find((e: any) => e.type === EntityType.USER && e.id === relationships.user.data[0]?.id);
  const groups = included.filter((e: any) => e.type === EntityType.GROUP && relationships.groups.data.map((g: any) => g.id).includes(e.id));

  return {
    id,
    reference: user.id,
    archived: attributes.archived,
    avatar: user.attributes.picture.thumbnail || null,
    firstName: user.attributes.firstname,
    lastName: user.attributes.lastname,
    email: user.attributes.email,
    groups: groups.map(buildTeamMemberGroup),
  };
}

export function buildTeamMemberGroup(data: any): Group {
  return {
    id: data.id,
    name: data.attributes.name,
  };
}

export function buildJourneyEvent(data: any, included: any): JourneyEvent {
  const { id, attributes, relationships } = data;
  const facilitators = relationships.facilitators.data.map((d: any) => {
    const related = included.find((entity: any) => entity.type === EntityType.USER && entity.id === d.id);
    return {
      id: related.id,
      firstName: related.attributes.firstname,
      lastName: related.attributes.lastname,
      avatar: related.attributes.picture.thumbnail,
    };
  });

  const timeBasedContent = included.find((entity: any) => entity.type === EntityType.CONTENT && entity.id === id);
  const location = included.find((entity: any) => entity.type === EntityType.LOCATION && entity.id === relationships.location?.data.id);

  const meetingUrl = attributes.links?.meetingUrl;
  const mapUrl = location?.attributes.googleMapsLink;

  return {
    id,
    name: timeBasedContent?.attributes.displayName,
    duration: attributes.blended.duration,
    icon: timeBasedContent.attributes.design.picture?.thumbnail || null,
    dates: {
      start: new Date(attributes.blended.start),
      end: new Date(attributes.blended.end),
    },
    config: {
      calendarLink: "",
      link: meetingUrl || mapUrl || null,
      place: location?.attributes.inline || null,
      display: attributes.links?.lable || null,
    },
    facilitators,
  };
}

export function buildScore(data: any, scope: JourneyScoreScope): JourneyScore {
  const { attributes } = data;

  switch (scope) {
    case "scores-participants": return {
      label: attributes.name,
      min: attributes.minimum,
      max: attributes.maximum,
      value: attributes.recipient.programAverageScores.byJourney[0].averageScore.participants,
      percent: false,
    };
    case "scores-teams": return {
      label: attributes.name,
      min: attributes.minimum,
      max: attributes.maximum,
      value: attributes.recipient.programAverageScores.byJourney[0].averageScore.teams,
      percent: true,
    };
    default: return {
      label: data.name,
      min: 0,
      max: 100,
      value: data.viewed,
      percent: true,
    };
  }
}
