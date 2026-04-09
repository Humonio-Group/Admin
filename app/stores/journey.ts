import { defaults, type JourneyState, PER_PAGE } from "~/types/states/journey";
import { EntityType } from "~/types/entities";
import type { Journey, JourneyTeam, JourneyTeamMember } from "~/types/entities/journey";
import type { Listed } from "~/types/primitives/objects";
import { toast } from "vue-sonner";
import {
  buildJourneyEntity,
  buildTeamEntity,
  buildTeamMemberEntity, buildTeamMemberGroup,
  extendToSelectedJourney,
} from "~/lib/entities/lifecycle/journey";
import { type Group, GroupAction } from "~/types/entities/group";

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
            "fields[journeys]": "default,displayName,stats.participants",
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
        loading: () => this.translate("toasts.journeys.archiving.loading", members.length, {
          named: {
            name: `${members[0]?.firstName} ${members[0]?.lastName}`,
            count: members.length,
          },
        }),
        success: () => {
          members.forEach(member => member.archived = true);
          clearLoading();
          return this.translate("toasts.journeys.archiving.success", members.length, {
            named: {
              name: `${members[0]?.firstName} ${members[0]?.lastName}`,
              count: members.length,
            },
          });
        },
        error: () => {
          clearLoading();
          return this.translate("toasts.journeys.archiving.error", members.length, {
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
        loading: () => this.translate("toasts.journeys.restoring.loading", members.length, {
          named: {
            name: `${members[0]?.firstName} ${members[0]?.lastName}`,
            count: members.length,
          },
        }),
        success: () => {
          members.forEach(member => member.archived = false);
          clearLoading();
          return this.translate("toasts.journeys.restoring.success", members.length, {
            named: {
              name: `${members[0]?.firstName} ${members[0]?.lastName}`,
              count: members.length,
            },
          });
        },
        error: () => {
          clearLoading();
          return this.translate("toasts.journeys.restoring.error", members.length, {
            named: {
              name: `${members[0]?.firstName} ${members[0]?.lastName}`,
              count: members.length,
            },
          });
        },
      });
    },
  },
});
