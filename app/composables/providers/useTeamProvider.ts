import type { JourneyTeam } from "~/types/entities/journey";
import type { Listed } from "~/types/primitives/objects";
import { buildTeamEntity, buildTeamMemberEntity } from "~/lib/entities/lifecycle/journey";
import { toast } from "vue-sonner";

export function useTeamProvider(id: number) {
  const api = useApi();
  const { t } = useNuxtApp().$i18n;

  const teams = ref<Listed<JourneyTeam>>([]);
  const loading = ref<boolean>(false);

  async function load() {
    loading.value = true;

    try {
      const response = await api.get("/teams", { version: 2, endpointVersion: 1, vanilla: true }, {
        query: {
          "journeys": id,
          "include": "leads,leader",
          "fields[teams]": "name,stats.nbParticipants,stats.maxParticipants,isFull",
          "fields[users]": "name,firstname,lastname,picture,email",
          "limit": -1,
          "offset": 0,
        },
      });

      const { data } = response;

      teams.value = data.map((team: any) => buildTeamEntity(team));
      await Promise.all(teams.value.map(team => loadMembers(team)));
    }
    catch {
      toast.error(t("toasts.error.default", { code: 500 }));
    }
    finally {
      loading.value = false;
    }
  }
  async function loadMembers(team: JourneyTeam) {
    try {
      const response = await api.get("/participations", { version: 2, endpointVersion: 1, vanilla: true }, {
        query: {
          "journeys": id,
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
      toast.error(t("toasts.error.default", { code: 500 }));
    }
  }

  return { load, teams, loading };
}
