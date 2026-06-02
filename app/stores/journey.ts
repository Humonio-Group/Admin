import { defaults, type JourneyState, PER_PAGE } from "~/types/states/journey";
import { EntityType } from "~/types/entities";
import type {
  Journey,
  JourneyEvent, JourneySimulation, JourneyStage,
  JourneyTeam,
  JourneyTeamMember,
} from "~/types/entities/journey";
import type { Listed } from "~/types/primitives/objects";
import { toast } from "vue-sonner";
import {
  buildContentGraph,
  buildJourneyEntity, buildJourneyEvent,
  buildJourneyStageContentEntity, buildJourneyStageEntity, buildScore, buildSimulation,
  buildTeamEntity,
  buildTeamMemberEntity, buildTeamMemberGroup,
  extendToSelectedJourney,
} from "~/lib/entities/lifecycle/journey";
import { type Group, GroupAction } from "~/types/entities/group";
import { buildActionEntity } from "~/lib/entities/lifecycle/action";
import type { UserRole } from "~/types/entities/user";
import type { ApiResponse, ApiResponseData } from "~/types/primitives/api";

export const useJourneyStore = defineStore("journeys", {
  state: (): JourneyState => ({ ...defaults }),
  getters: {
    api: () => useApi(),
    translate: () => useNuxtApp().$i18n.t,
    logger: () => useLogger("[JOURNEY]"),

    company: () => {
      const { company } = storeToRefs(useCompanyStore());
      return company.value;
    },

    hasFirstLoaded: state => state.totalEntities >= 0,
    hasTeamsFirstLoaded: state => (state.selectedJourney?.teams.totalEntities ?? -1) >= 0,

    journey: state => state.selectedJourney,
    teams: state => state.selectedJourney?.teams.list ?? [],
  },
  actions: {
    async loadJourneys(status: Listed<Journey["status"]> = [-1, 0, 1, 2], page: number = 1, take: number = PER_PAGE) {
      if (!this.company) return;

      if (page < 1) page = 1;

      const limit = take;
      const offset = take === -1 ? 0 : (page - 1) * take;

      this.loading.items = true;

      try {
        const response = await this.api.get("/journeys", { version: 2, endpointVersion: 1, vanilla: true }, {
          query: {
            limit,
            offset,
            "include": "facilitators,mainFacilitator,participants,program",
            "companies": Number(this.company.id),
            "fields[users]": "name,picture",
            "status": status.join(","),
            "fields[journeys]": "default,displayName,stats.participants",
            "fields[programs]": "default,stats.journeys,stats.participants,stats.facilitators,stats.evaluation",
          },
        });

        const { data, included, meta } = response;
        this.journeys = data.map((journey: any) => buildJourneyEntity(journey, included));
        this.totalEntities = meta.total;
      }
      catch (e) {
        console.error(e);
        toast.error(this.translate("toasts.error.default", { code: 500 }));
      }
      finally {
        this.loading.items = false;
      }
    },
    async loadJourney(id: number) {
      if (!this.company) return;

      this.loading.specimen = true;

      try {
        const response = await this.api.get(`/journeys/${id}`, { version: 2, endpointVersion: 1, vanilla: true }, {
          query: {
            "include": "facilitators,mainFacilitator,participants,program",
            "companies": Number(this.company.id),
            "fields[users]": "name,picture",
            "fields[journeys]": "default,displayName,stats.participants,stats.evaluation",
            "fields[programs]": "default,stats.journeys,stats.participants,stats.facilitators,stats.evaluation",
          },
        });

        const { data, included } = response;

        const journey = buildJourneyEntity(data, included);
        this.selectedJourney = extendToSelectedJourney(journey);
      }
      catch {
        toast.error(this.translate("toasts.error.default", { code: 500 }));
      }
      finally {
        this.loading.specimen = false;
      }
    },

    removeParticipants(...ids: Listed<number>) {
      if (!this.selectedJourney) return;
      this.selectedJourney.participants = this.selectedJourney.participants.filter(member => !ids.includes(member.id));
    },

    async loadGroups() {
      if (!this.selectedJourney) return;

      this.loading.groups = true;

      try {
        const { data } = await this.api.get("/groups", { version: 2, endpointVersion: 1, vanilla: true }, {
          query: {
            journeyExtended: this.selectedJourney.id,
          },
        });

        this.groups = data.map((group: any) => buildTeamMemberGroup(group));
      }
      catch {
        toast.error(this.translate("toasts.error.default", { code: 500 }));
      }
      finally {
        this.loading.groups = false;
      }
    },

    async loadTeams() {
      if (!this.selectedJourney) return;

      this.loading.teams = true;

      try {
        const response = await this.api.get("/teams", { version: 2, endpointVersion: 1, vanilla: true }, {
          query: {
            "journeys": this.selectedJourney.id,
            "include": "leads,leader",
            "fields[teams]": "name,stats.nbParticipants,stats.maxParticipants,isFull",
            "fields[users]": "name,firstname,lastname,picture,email",
            "limit": -1,
            "offset": 0,
          },
        });

        const { data, meta } = response;

        this.selectedJourney.teams = {
          totalEntities: meta.total,
          list: data.map((team: any) => buildTeamEntity(team)),
        };
        this.selectedJourney.teams.list.forEach(team => this.loadTeamMembers(team));
      }
      catch (e) {
        this.logger.error(e);
        toast.error(this.translate("toasts.error.default", { code: 500 }));
      }
      finally {
        this.loading.teams = false;
      }
    },
    async loadTeamMembers(team: JourneyTeam) {
      if (!this.selectedJourney || !this.selectedJourney.teams.list.find(t => t.id === team.id)) return;

      this.loading.teamMembers = [...this.loading.teamMembers, team.id];

      try {
        const response = await this.api.get("/participations", { version: 2, endpointVersion: 1, vanilla: true }, {
          query: {
            "journeys": this.selectedJourney.id,
            "teams": team.id,
            "include": "user,groups",
            "fields[users]": "name,email,picture",
            "limit": -1,
          },
        });

        const { data, included } = response;
        team.participants = data.map((p: any) => buildTeamMemberEntity(p, included));
      }
      catch {
        toast.error(this.translate("toasts.error.default", { code: 500 }));
      }
      finally {
        this.loading.teamMembers = this.loading.teamMembers.filter(t => t !== team.id);
      }
    },

    async loadActions() {
      if (!this.selectedJourney) return;

      this.loading.actions = true;

      try {
        const response = await this.api.get("/actions", { version: 2, endpointVersion: 1, vanilla: true }, {
          query: {
            "journeys": this.selectedJourney.id,
            "include": "user,journey,journey.program,journey.program.company,template",
            "fields[programs]": "name",
          },
        });

        const { data, included } = response;
        this.selectedJourney.actions = data.map((action: any) => buildActionEntity(action, included));
      }
      catch {
        toast.error(this.translate("toasts.error.default", { code: 500 }));
      }
      finally {
        this.loading.actions = false;
      }
    },

    async addTeam(name: string) {
      if (!this.selectedJourney || !this.company) return;

      this.loading.team.adding = true;
      let state = true;

      try {
        const { data } = await this.api.post("/teams", { version: 2, endpointVersion: 1 }, {
          body: {
            key: useRuntimeConfig().public.api.key,
            data: {
              type: EntityType.TEAM,
              attributes: {
                name,
              },
              relationships: {
                journey: {
                  data: {
                    type: EntityType.JOURNEY,
                    id: this.selectedJourney.id,
                  },
                },
              },
            },
          },
        });

        const team = buildTeamEntity(data);
        this.selectedJourney.teams.list = [...this.selectedJourney.teams.list, team];

        navigateTo(useLocalePath()(`/${this.company.alias}/deployment/journeys/${this.selectedJourney.id}/people/teams/${team.id}`));
        toast.success(this.translate("toasts.journeys.team-added", { name: team.name }));
      }
      catch {
        toast.error(this.translate("toasts.error.default", { code: 500 }));
        state = false;
      }
      finally {
        this.loading.team.adding = false;
      }

      return state;
    },
    async updateTeam(team: JourneyTeam, name: string) {
      if (!this.selectedJourney || !this.selectedJourney.teams.list.find(t => t.id === team.id)) return;

      this.loading.team.updating = team.id;
      let state = true;

      try {
        const { data } = await this.api.put(`/teams/${team.id}`, { version: 2, endpointVersion: 1 }, {
          body: {
            data: {
              id: team.id,
              type: EntityType.TEAM,
              attributes: {
                name,
              },
              relationships: {
                journey: {
                  data: {
                    id: this.selectedJourney.id,
                    type: EntityType.JOURNEY,
                  },
                },
              },
            },
          },
        });

        team.name = data.attributes.name;
      }
      catch {
        toast.error(this.translate("toasts.error.default", { code: 500 }));
        state = false;
      }
      finally {
        this.loading.team.updating = -1;
      }

      return state;
    },
    async deleteTeam(team: JourneyTeam) {
      if (!this.selectedJourney || !this.selectedJourney.teams.list.find(t => t.id === team.id)) return;

      this.loading.team.removing = team.id;

      toast.promise(this.api.delete(`/teams/${team.id}`, { version: 2, endpointVersion: 1 }), {
        loading: () => this.translate("toasts.journeys.delete-team.loading", { name: team.name }),
        success: () => {
          this.loading.team.removing = -1;

          const teams = this.selectedJourney!.teams.list.filter(t => t.id !== team.id);
          navigateTo(useLocalePath()(`/${this.company?.alias}/deployment/journeys/${this.selectedJourney?.id}/people/teams/${teams[0]?.id}`));

          this.selectedJourney!.teams.list = [...teams];
          this.selectedJourney!.teams.totalEntities--;

          return this.translate("toasts.journeys.delete-team.success", { name: team.name });
        },
        error: () => {
          this.loading.team.removing = -1;
          return this.translate("toasts.journeys.delete-team.error", { name: team.name });
        },
      });
    },

    async updateGroup(team: JourneyTeam, member: JourneyTeamMember, id: number, action: GroupAction) {
      if (
        !this.selectedJourney
        || !this.selectedJourney.teams.list.find(t => t.id === team.id)
        || !team.participants.find(participant => participant.id === member.id)
      )
        return;

      this.loading.updatingTeamMembers = [...this.loading.updatingTeamMembers, member.id];
      const removeFromLoadingEntities = () => this.loading.updatingTeamMembers = this.loading.updatingTeamMembers.filter(mbr => mbr !== member.id);

      let groups = [...member.groups.reduce((acc, curr) => {
        acc = [...acc, curr.id];
        return acc;
      }, [] as Listed<Group["id"]>)];
      switch (action) {
        case GroupAction.REMOVE: {
          groups = groups.filter(groupId => groupId !== id);
          break;
        }
        default: {
          groups = [...groups, id];
          break;
        }
      }

      const selectedGroup = this.groups.find(group => group.id === id);

      toast.promise(this.api.patch(`/participations/${member.id}/relationships/groups`, { version: 2, endpointVersion: 1 }, {
        body: {
          key: useRuntimeConfig().public.api.key,
          data: {
            ...groups.map(groupId => ({
              id: groupId,
              type: EntityType.GROUP,
            })),
          },
        },
      }), {
        loading: () => this.translate(`toasts.journeys.update-group.${action === GroupAction.ADD ? "adding" : "removing"}`, { groupName: selectedGroup?.name, memberName: `${member.firstName} ${member.lastName}` }),
        success: () => {
          member.groups = this.groups.filter(group => groups.includes(group.id));
          removeFromLoadingEntities();
          return this.translate(`toasts.journeys.update-group.${action === GroupAction.ADD ? "added" : "removed"}`, { groupName: selectedGroup?.name, memberName: `${member.firstName} ${member.lastName}` });
        },
        error: () => {
          removeFromLoadingEntities();
          return this.translate(`toasts.journeys.update-group.error-while-${action === GroupAction.ADD ? "adding" : "removing"}`, { name: selectedGroup?.name });
        },
      });
    },

    async addParticipant(team: JourneyTeam, firstName: string, lastName: string, email: string) {
      if (!this.selectedJourney || !this.selectedJourney.teams.list.find(t => t.id === team.id)) return;

      this.loading.team.addingParticipant = true;
      let state = true;

      try {
        const { data, included } = await this.api.post("/participations", { version: 2, endpointVersion: 1 }, {
          query: {
            "include": "user",
            "fields[users]": "name,email,picture",
          },
          body: {
            key: useRuntimeConfig().public.api.key,
            data: {
              type: EntityType.PARTICIPATION,
              relationships: {
                team: {
                  data: {
                    id: team.id,
                    type: EntityType.TEAM,
                  },
                },
                user: {
                  data: {
                    attributes: {
                      email,
                      firstname: firstName,
                      lastname: lastName,
                    },
                  },
                },
              },
            },
          },
        });

        const participant = buildTeamMemberEntity(data, included);
        team.participants = [...team.participants, participant];
        team.stats.participants++;

        this.selectedJourney.participants = [
          ...this.selectedJourney.participants,
          {
            id: participant.reference,
            firstName: participant.firstName,
            lastName: participant.lastName,
            avatar: participant.avatar ?? "",
          },
        ];

        toast.success(this.translate("toasts.journeys.add-participant.success", { teamName: team.name, memberName: `${participant.firstName} ${participant.lastName}` }));
      }
      catch {
        toast.error(this.translate("toasts.journeys.add-participant.error", { name: `${firstName} ${lastName}` }));
        state = false;
      }
      finally {
        this.loading.team.addingParticipant = false;
      }

      return state;
    },
    async moveParticipants(oldTeam: JourneyTeam, newTeam: JourneyTeam, ...members: Listed<JourneyTeamMember>) {
      if (!this.selectedJourney || !members.length || !this.selectedJourney.teams.list.filter(t => [oldTeam.id, newTeam.id].includes(t.id)).length) return;

      this.loading.team.moving = true;
      let state = true;

      const membersIds = members.reduce((acc, curr) => {
        acc = [...acc, curr.id];
        return acc;
      }, [] as Listed<number>);

      try {
        await this.api.post(`/participations/move`, { version: 2, endpointVersion: 1 }, {
          body: {
            key: useRuntimeConfig().public.api.key,
            meta: {
              ids: membersIds,
              teamId: newTeam.id,
            },
          },
        });

        oldTeam.participants = oldTeam.participants.filter(mbr => !membersIds.includes(mbr.id));
        oldTeam.stats.participants -= members.length;

        newTeam.participants = [...newTeam.participants, ...members.map(member => ({ ...member }))];
        newTeam.stats.participants += members.length;

        toast.success(this.translate("toasts.journeys.members-moved.success", members.length, {
          named: {
            name: `${members[0]?.firstName} ${members[0]?.lastName}`,
            teamName: newTeam.name,
            count: members.length,
          },
        }));
      }
      catch {
        toast.error(this.translate("toasts.journeys.members-moved.error", members.length, {
          named: {
            name: `${members[0]?.firstName} ${members[0]?.lastName}`,
            count: members.length,
          },
        }));
        state = false;
      }
      finally {
        this.loading.team.moving = false;
      }

      return state;
    },
    async archiveParticipants(...members: Listed<JourneyTeamMember>) {
      if (!this.selectedJourney || !members.length) return;

      const membersIds = members.reduce((acc, curr) => {
        acc = [...acc, curr.id];
        return acc;
      }, [] as Listed<number>);
      this.loading.team.archiving = [...this.loading.team.archiving, ...membersIds];

      const clearLoading = () => this.loading.team.archiving = this.loading.team.archiving.filter(m => !membersIds.includes(m));
      toast.promise(this.api.post("/participations/archive", { version: 2, endpointVersion: 1 }, {
        body: {
          key: useRuntimeConfig().public.api.key,
          meta: {
            ids: membersIds,
            archived: true,
          },
        },
      }), {
        loading: () => this.translate("toasts.journeys.archiving-participants.loading", members.length, {
          named: {
            name: `${members[0]?.firstName} ${members[0]?.lastName}`,
            count: members.length,
          },
        }),
        success: () => {
          members.forEach(member => member.archived = true);
          this.removeParticipants(...members.reduce((acc, curr) => {
            acc = [...acc, curr.reference];
            return acc;
          }, [] as Listed<number>));

          clearLoading();
          return this.translate("toasts.journeys.archiving-participants.success", members.length, {
            named: {
              name: `${members[0]?.firstName} ${members[0]?.lastName}`,
              count: members.length,
            },
          });
        },
        error: () => {
          clearLoading();
          return this.translate("toasts.journeys.archiving-participants.error", members.length, {
            named: {
              name: `${members[0]?.firstName} ${members[0]?.lastName}`,
              count: members.length,
            },
          });
        },
      });
    },
    async restoreParticipants(...members: Listed<JourneyTeamMember>) {
      if (!this.selectedJourney || !members.length) return;

      const membersIds = members.reduce((acc, curr) => {
        acc = [...acc, curr.id];
        return acc;
      }, [] as Listed<number>);
      this.loading.team.restoring = [...this.loading.team.restoring, ...membersIds];

      const clearLoading = () => this.loading.team.restoring = this.loading.team.restoring.filter(m => !membersIds.includes(m));
      toast.promise(this.api.post("/participations/archive", { version: 2, endpointVersion: 1 }, {
        body: {
          key: useRuntimeConfig().public.api.key,
          meta: {
            ids: membersIds,
            archived: false,
          },
        },
      }), {
        loading: () => this.translate("toasts.journeys.restoring-participants.loading", members.length, {
          named: {
            name: `${members[0]?.firstName} ${members[0]?.lastName}`,
            count: members.length,
          },
        }),
        success: () => {
          members.forEach(member => member.archived = false);
          this.selectedJourney!.participants = [
            ...this.selectedJourney!.participants,
            ...members.map(member => ({
              id: member.reference,
              firstName: member.firstName,
              lastName: member.lastName,
              avatar: member.avatar ?? "",
            })),
          ];

          clearLoading();
          return this.translate("toasts.journeys.restoring-participants.success", members.length, {
            named: {
              name: `${members[0]?.firstName} ${members[0]?.lastName}`,
              count: members.length,
            },
          });
        },
        error: () => {
          clearLoading();
          return this.translate("toasts.journeys.restoring-participants.error", members.length, {
            named: {
              name: `${members[0]?.firstName} ${members[0]?.lastName}`,
              count: members.length,
            },
          });
        },
      });
    },
    async deleteParticipants(team: JourneyTeam, ...members: Listed<JourneyTeamMember>) {
      if (!this.selectedJourney || !members.length) return;

      const membersIds = members.reduce((acc, curr) => {
        acc = [...acc, curr.id];
        return acc;
      }, [] as Listed<number>);
      this.loading.team.deleting = [...this.loading.team.deleting, ...membersIds];

      const clearLoading = () => this.loading.team.deleting = this.loading.team.deleting.filter(m => !membersIds.includes(m));

      toast.promise(this.api.delete("/participations/multiple", { version: 2, endpointVersion: 1 }, {
        body: {
          meta: {
            ids: membersIds,
          },
        },
      }), {
        loading: () => this.translate("toasts.journeys.deleting-participants.loading", members.length, {
          named: {
            name: `${members[0]?.firstName} ${members[0]?.lastName}`,
            count: members.length,
          },
        }),
        success: () => {
          team.participants = team.participants.filter(mbr => !membersIds.includes(mbr.id));
          team.stats.participants -= members.length;
          this.removeParticipants(...members.reduce((acc, curr) => {
            acc = [...acc, curr.reference];
            return acc;
          }, [] as Listed<number>));

          clearLoading();
          return this.translate("toasts.journeys.deleting-participants.success", members.length, {
            named: {
              name: `${members[0]?.firstName} ${members[0]?.lastName}`,
              count: members.length,
            },
          });
        },
        error: () => {
          clearLoading();
          return this.translate("toasts.journeys.deleting-participants.error", members.length, {
            named: {
              name: `${members[0]?.firstName} ${members[0]?.lastName}`,
              count: members.length,
            },
          });
        },
      });
    },
    async setLeader(team: JourneyTeam, member: JourneyTeamMember) {
      const oldLeaderId = team.leader;
      const oldLeader = { ...team.participants.find(participant => participant.reference === oldLeaderId) };

      team.leader = member.reference;
      team.participants = team.participants.map(participant => participant.reference === member.id ? { ...participant, leader: true } : { ...participant, leader: false });

      const reset = () => {
        team.leader = oldLeaderId;
        team.participants = team.participants.map(participant => participant.reference === oldLeaderId ? { ...participant, leader: true } : { ...participant, leader: false });
      };

      try {
        await this.api.put(`/teams/${team.id}`, { version: 2, endpointVersion: 1 }, {
          body: {
            data: {
              id: team.id,
              type: EntityType.TEAM,
              relationships: {
                leader: {
                  data: {
                    id: member.reference,
                    type: EntityType.USER,
                  },
                },
              },
            },
          },
        });
      }
      catch {
        toast.error(this.translate("toasts.journeys.leader-update.error", { name: `${member.firstName} ${member.lastName}` }));

        if (!oldLeaderId) {
          team.leader = null;
          return;
        }
        if (!oldLeader) return;

        reset();
      }
    },
    async removeLeader(team: JourneyTeam, member: JourneyTeamMember) {
      const oldLeaderId = team.leader;
      const oldLeader = { ...team.participants.find(participant => participant.reference === oldLeaderId) };

      team.leader = null;
      member.leader = false;

      const reset = () => {
        team.leader = oldLeaderId;
        team.participants = team.participants.map(participant => participant.reference === oldLeaderId ? { ...participant, leader: true } : { ...participant, leader: false });
      };

      try {
        await this.api.put(`/teams/${team.id}`, { version: 2, endpointVersion: 1 }, {
          body: {
            data: {
              id: team.id,
              type: EntityType.TEAM,
              relationships: {
                leader: {
                  data: null,
                },
              },
            },
          },
        });
      }
      catch {
        toast.error(this.translate("toasts.journeys.remove-leader.error", { name: "" }));

        if (!oldLeaderId) {
          team.leader = null;
          return;
        }
        if (!oldLeader) return;

        reset();
      }
    },

    async loadNextEvents() {
      if (!this.selectedJourney) return;

      this.loading.nextEvents = true;

      try {
        const response = await this.api.get(`/journeys/${this.selectedJourney.id}`, { version: 2, endpointVersion: 1, vanilla: true }, {
          query: {
            "journey": this.selectedJourney.id,
            "include": "journeyStages,journeyStages.blendedContents,journeyStages.timebasedContents.location,journeyStages.timebasedContents.facilitators",
            "fields[journeys]": "displayName,blendedContents",
            "fields[users]": "name,picture",
          },
        });

        const { included } = response;
        const journeyStages = included.filter((entity: any) => entity.type === EntityType.JOURNEY_STAGE && entity.relationships.timebasedContents?.data.length);
        const timeBasedContents = journeyStages
          .map((js: any) => [...js.attributes.timebasedContents])
          .reduce((acc: Listed<any>, curr: Listed<any>) => [...acc, ...curr], [] as Listed<any>)
          .filter((content: any) => {
            const start = new Date(content.attributes.blended.start).getTime();
            const end = new Date(content.attributes.blended.end).getTime();

            return Date.now() < start || Date.now() < (end + (1000 * 60 * 60 * 24));
          });

        const contents = timeBasedContents.map((content: any) => buildJourneyEvent(content, included));
        this.selectedJourney.nextEvents.totalEntities = contents.length;
        this.selectedJourney.nextEvents.list = contents;
      }
      catch (e) {
        console.error(e);
        toast.error(this.translate("toasts.error.default"));
      }
      finally {
        this.loading.nextEvents = false;
      }
    },
    async downloadEventCalendarIcs(event: JourneyEvent) {
      if (!this.selectedJourney || this.loading.requestingEventCalendarIcs.includes(event.id)) return;

      this.loading.requestingEventCalendarIcs = [...this.loading.requestingEventCalendarIcs, event.id];

      try {
        const response = await this.api.get(`journeys/${this.selectedJourney.id}/contents/${event.id}/calendar`, { version: 2, endpointVersion: 1, vanilla: true }, {});
        const link = response.meta.url;

        const a = document.createElement("a");
        a.href = link;
        a.download = `event-${event.id}-${event.dates.start.getTime()}-${event.dates.end.getTime()}.ics`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      catch {
        toast.error(this.translate("toasts.error.default"));
      }
      finally {
        this.loading.requestingEventCalendarIcs = this.loading.requestingEventCalendarIcs.filter(e => e !== event.id);
      }
    },

    async loadScores() {
      if (!this.selectedJourney) return;

      this.loading.scores = true;

      try {
        const response = await this.api.get(`journeys/${this.selectedJourney.id}`, { version: 2, endpointVersion: 1, vanilla: true }, {
          query: {
            "journey": this.selectedJourney.id,
            "include": "teams,program,program.scores",
            "fields[programs]": "name",
            "fields[scores]": "default,recipient.programAverageScores",
            "fields[teams]": "name,stats.all",
          },
        });

        const { included } = response;
        const scores = included.filter((entity: any) => entity.type === EntityType.SCORE);
        const stats = included
          .filter((entity: any) => entity.type === EntityType.TEAM)
          .map((team: any) => ({
            name: team.attributes.name,
            viewed: team.attributes.stats.progression.viewed,
          }));

        const accessRate = stats.map((stat: any) => buildScore(stat, "access"));
        const averageParticipants = scores.map((score: any) => buildScore(score, "scores-participants"));
        const averageTeams = scores.map((score: any) => buildScore(score, "scores-teams"));

        this.selectedJourney.scores.access = accessRate;
        this.selectedJourney.scores.average.participants = averageParticipants;
        this.selectedJourney.scores.average.teams = averageTeams;
      }
      catch (e) {
        console.error(e);
        toast.error(this.translate("toasts.error.default"));
      }
      finally {
        this.loading.scores = false;
      }
    },

    async loadSimulations() {
      if (!this.selectedJourney) return;

      this.loading.simulations = true;

      try {
        const response = await this.api.get("contents", { version: 2, endpointVersion: 1, vanilla: true }, {
          query: {
            journey: this.selectedJourney.id,
            types: 7,
            subtypes: "1,3",
            status: 1,
            sort: "-id",
            limit: -1,
            include: "embedContent",
          },
        });

        const { data, included } = response;
        const simulations = data.map((content: any) => buildSimulation(content, included));

        this.selectedJourney.simulations.totalEntities = simulations.length;
        this.selectedJourney.simulations.list = simulations;
      }
      catch {
        toast.error(this.translate("toasts.error.default"));
      }
      finally {
        this.loading.simulations = false;
      }
    },
    async exportSimulation(simulation: JourneySimulation, format: "scorm-1_2" | "scorm-2004", mainScore: number = 0) {
      const { public: config } = useRuntimeConfig();

      this.loading.exportSimulation = true;
      let state = true;

      try {
        const response = await $fetch(`${config.sinsim.api}/simulations/${simulation.token}/versions/${simulation.version.key}/standalone`, {
          method: "POST",
          body: {
            apiKey: config.sinsim.key,
            apiToken: config.sinsim.token,
            mainScoreId: mainScore || null,
            os: format,
            requesterKey: storeToRefs(useUserStore()).user.value?.key,
            webhook: this.api.path(this.api.url(2, 1), `/simulation_evolutions/webhook?key=${config.api.key}`),
          },
          credentials: "include",
        });

        console.log(response);
      }
      catch {
        state = false;
        toast.error(this.translate("toasts.error.default", { code: 500 }));
      }
      finally {
        this.loading.exportSimulation = false;
      }

      return state;
    },
    async shareSimulation(to: Listed<number>, subject: string, body: string): Promise<boolean> {
      if (!this.selectedJourney) return false;

      this.loading.shareSimulation = true;
      let state = true;

      try {
        await this.api.post("/notificate", { version: 1, endpointVersion: 2 }, {
          body: {
            email: true,
            emailSubject: subject,
            emailContent: body,
            users: to,
            journey_id: this.selectedJourney.id,
            notification_id: 250,
            key: useRuntimeConfig().public.api.key,
          },
        });
        toast.success(this.translate("toasts.simulations.shared", to.length, {
          named: {
            count: to.length,
          },
        }));
      }
      catch {
        state = false;
      }
      finally {
        this.loading.shareSimulation = false;
      }

      return state;
    },

    async loadResults() {
      if (!this.selectedJourney) return;

      this.loading.results.stages = true;

      try {
        const response = await this.api.get(`/journeys/${this.selectedJourney.id}`, { version: 2, endpointVersion: 1, vanilla: true }, {
          query: {
            "include": "journeyStages,journeyStages.timebasedContents,journeyStages.timebasedContents.location,journeyStages.programStage",
            "fields[journeys]": "displayName",
            "fields[journeyStages]": "default",
            "fields[programStages]": "default,position",
          },
        });

        const { included } = response;
        const journeyStages = included.filter((entity: any) => entity.type === EntityType.JOURNEY_STAGE);
        const programStages = included.filter((entity: any) => entity.type === EntityType.PROGRAM_STAGE);

        this.selectedJourney.results.stages = journeyStages
          .map((journeyStage: any) => {
            const programStage = programStages.find((ps: any) => ps.id === journeyStage.relationships.programStage.data[0]?.id);

            return {
              journeyStage,
              programStage,
            };
          })
          .map((stage: any) => buildJourneyStageEntity(stage, this.selectedJourney?.results.stages.find(s => s.id === stage.journeyStage.id))) as Listed<JourneyStage>;
      }
      catch (e) {
        console.error(e);
      }
      finally {
        this.loading.results.stages = false;
        await Promise.all(this.selectedJourney.results.stages.map(async stage => this.loadResultsStageContents(stage)));
      }
    },
    async loadResultsStageContents(stage: JourneyStage) {
      if (!this.selectedJourney) return;

      this.loading.results.contents = [...this.loading.results.contents, stage.id];

      try {
        const { data } = await this.api.get("/contents", { version: 2, endpointVersion: 1, vanilla: true }, {
          query: {
            "journey": this.selectedJourney.id,
            "recipientRole": 6,
            "fields[contents]": "name,type,design,stats,stats.all,activation.graphicSettings,topicSettings",
            "sort": "order",
            "limit": -1,
            "journeyStages": stage.id,
          },
        });

        stage.contents = data.map((content: any) => buildJourneyStageContentEntity(content));
        stage.progress = stage.contents.reduce((acc, curr) => {
          acc += curr.stats.completion;
          return acc;
        }, 0) / stage.contents.length;
      }
      catch (e) {
        console.error(e);
      }
      finally {
        this.loading.results.contents = this.loading.results.contents.filter(id => id !== stage.id);
      }
    },
    async loadResultContentGraphs(id: number, role: UserRole, defaultReporting: boolean = true) {
      if (!this.selectedJourney) return;
      this.loading.results.graphs = true;

      try {
        const response = await this.api.get<ApiResponse>(`/contents/${id}/graph_results`, { version: 1, endpointVersion: 2 }, {
          query: {
            journey: this.selectedJourney.id,
            offset: 0,
            limit: -1,
            requester_role: role,
            ...(defaultReporting ? { defaultReporting: 1 } : {}),
          },
          headers: {
            "X-COMPANY": this.company?.key ?? "",
          },
        });
        if (!response) return;

        const { data } = response;
        this.selectedJourney.results.stages = this.selectedJourney.results.stages.map(s => s.contents.find(c => c.id === id)
          ? {
              ...s,
              contents: s.contents.map(c => c.id === id ? { ...c, graphs: (data as ApiResponseData[]).map(buildContentGraph) } : c),
            }
          : s);
      }
      catch (e) {
        console.error(e);
        toast.error(this.translate("toasts.error.default", { code: (e as any).statusCode }));
      }
      finally {
        this.loading.results.graphs = false;
      }
    },
  },
});
