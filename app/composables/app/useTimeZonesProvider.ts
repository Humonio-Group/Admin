import type { Listed } from "~/types/primitives/objects";
import type { TimeZone } from "~/types/entities/time-zone";
import { buildTimeZoneEntity } from "~/lib/entities/lifecycle/time-zone";
import { getLocalTimeZone } from "@internationalized/date";

export function useTimeZonesProvider() {
  const { t } = useNuxtApp().$i18n;

  const loadingTimeZones = ref<boolean>(false);
  const timeZones = ref<Listed<TimeZone>>([]);
  const references = [
    {
      id: 1,
      name: t("labels.timezone-references.distribution"),
    },
    {
      id: 2,
      name: t("labels.timezone-references.participant"),
    },
  ] as const;
  const localTimeZone = computed(() => timeZones.value.find(tz => tz.name === getLocalTimeZone()));

  async function list() {
    if (timeZones.value.length) return;

    loadingTimeZones.value = true;

    try {
      const response = await useApi().get("/timezones", { version: 2, endpointVersion: 1, vanilla: true }, {
        query: {
          limit: -1,
        },
      });

      timeZones.value = response.data.map(buildTimeZoneEntity);
    }
    catch (e) {
      console.error(e);
    }
    finally {
      loadingTimeZones.value = false;
    }
  }

  provide("timeZones", timeZones);

  return {
    loadingTimeZones,

    timeZones,
    localTimeZone,
    references,

    list,
  };
}
