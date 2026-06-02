import { defaults, type UsageState, type AiUsageEntity } from "~/types/states/usage";
import { toast } from "vue-sonner";
import type { AreaChartData } from "~/types/entities/graph";
import { MONTHS } from "~/types/primitives/constants";

export const useUsageStore = defineStore("usages", {
  state: (): UsageState => ({ ...defaults }),
  getters: {
    api: () => useApi(),
    translate: () => useNuxtApp().$i18n.t,
  },
  actions: {
    async loadPlatformUsage(year: number = new Date().getUTCFullYear()) {
      this.loading.platform = true;

      try {
        const response = await this.api.get("/statistics/platform", { version: 2, endpointVersion: 2, vanilla: true }, {
          query: {
            year,
          },
        });

        const { data, available_years } = response;
        this.years = available_years;

        const admins = (data as any[]).reduce<number[]>((acc, curr) => {
          acc = [...acc, curr.nb_admins_logged_in];
          return acc;
        }, []);
        const participants = (data as any[]).reduce<number[]>((acc, curr) => {
          acc = [...acc, curr.nb_participants_logged_in];
          return acc;
        }, []);
        const facilitators = (data as any[]).reduce<number[]>((acc, curr) => {
          acc = [...acc, curr.nb_facilitators_logged_in];
          return acc;
        }, []);
        const coaches = (data as any[]).reduce<number[]>((acc, curr) => {
          acc = [...acc, curr.nb_coaches_logged_in];
          return acc;
        }, []);

        this.platform = {
          categories: MONTHS.map(m => this.translate(`labels.dates.months.${m}`)),
          series: [
            {
              name: "Administrateurs",
              config: {
                min: 0,
                max: Math.max(...admins),
              },
              data: admins,
            },
            {
              name: "Participants",
              config: {
                min: 0,
                max: Math.max(...participants),
              },
              data: participants,
            },
            {
              name: "Facilitateurs",
              config: {
                min: 0,
                max: Math.max(...facilitators),
              },
              data: facilitators,
            },
            {
              name: "Coachs",
              config: {
                min: 0,
                max: Math.max(...coaches),
              },
              data: coaches,
            },
          ],
        } as AreaChartData;
      }
      catch {
        toast.error(this.translate("toasts.error.default"));
      }
      finally {
        this.loading.platform = false;
      }
    },

    async loadAiUsage(type: "text" | "audio" | "video", year: number = new Date().getUTCDate()) {
      this.loading.ai = true;

      try {
        const [statistics] = await Promise.all([
          this.api.get(`/statistics/ai-${type}`, { version: 2, endpointVersion: 2, vanilla: true }, {
            query: {
              year,
            },
          }),
        ]);

        const { data: _data } = statistics;
        const data = _data as any[];

        this.years = statistics.available_years;
        const simulations = (data as any[]).reduce<number>((acc, curr) => {
          acc += curr.nb_simulations;
          return acc;
        }, 0);

        let graph: AreaChartData;
        let remaining: AiUsageEntity["remaining"];
        let available: AiUsageEntity["available"];

        switch (type) {
          case "text": {
            const tokens = data.reduce<number[]>((acc, curr) => {
              acc = [...acc, curr.tokens_consumed];
              return acc;
            }, []);

            graph = {
              categories: MONTHS.map(m => this.translate(`labels.dates.months.${m}`)),
              series: [
                {
                  name: "Crédits",
                  config: {
                    min: 0,
                    max: Math.max(...tokens),
                  },
                  data: tokens,
                },
              ],
            } as AreaChartData;
            remaining = { tokens: data[0]!.tokens_remaining };
            available = { tokens: data[0]!.tokens_available };
            break;
          }
          case "audio": {
            const minutesIn = data.reduce<number[]>((acc, curr) => {
              acc = [...acc, curr.minutes_in_consumed];
              return acc;
            }, []);
            const minutesOut = data.reduce<number[]>((acc, curr) => {
              acc = [...acc, curr.minutes_in_consumed];
              return acc;
            }, []);

            const remainingIn = data[0]!.minutes_in_remaining;
            const remainingOut = data[0]!.minutes_out_remaining;
            const availableIn = data[0]!.minutes_in_available;
            const availableOut = data[0]!.minutes_out_available;

            graph = {
              categories: MONTHS.map(m => this.translate(`labels.dates.months.${m}`)),
              series: [
                {
                  name: "Minutes In",
                  config: {
                    min: 0,
                    max: Math.max(...minutesIn),
                  },
                  data: minutesIn,
                },
                {
                  name: "Minutes Out",
                  config: {
                    min: 0,
                    max: Math.max(...minutesOut),
                  },
                  data: minutesOut,
                },
              ],
            } as AreaChartData;
            remaining = { minutesIn: remainingIn, minutesOut: remainingOut };
            available = { minutesIn: availableIn, minutesOut: availableOut };
            break;
          }
          case "video": {
            const minutes = data.reduce<number[]>((acc, curr) => {
              acc = [...acc, curr.minutes_consumed];
              return acc;
            }, []);

            graph = {
              categories: MONTHS.map(m => this.translate(`labels.dates.months.${m}`)),
              series: [
                {
                  name: "Minutes",
                  config: {
                    min: 0,
                    max: Math.max(...minutes),
                  },
                  data: minutes,
                },
              ],
            } as AreaChartData;
            remaining = { minutes: data[0]!.minutes_remaining };
            available = { minutes: data[0!].minutes_available };
            break;
          }
        }

        this.ai = {
          simulations,
          remaining,
          available,
          graph,
        };
      }
      catch {
        toast.error(this.translate("toasts.error.default"));
      }
      finally {
        this.loading.ai = false;
      }
    },
  },
});
