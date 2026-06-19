<script setup lang="ts">
import PageRoot from "~/components/composing/PageRoot.vue";
import ProgramActions from "~/components/deployment/programs/ProgramActions.vue";
import FlagIcon from "~/components/icons/FlagIcon.vue";

const { t, locale } = useI18n();

const store = useProgramStore();
const { company } = storeToRefs(useCompanyStore());
const { selectedProgram: program, loading: _loading } = storeToRefs(store);
const loading = computed(() => _loading.value.specimen);

const { isStuck, observed } = useSticky();

const route = useRoute();
const programId = computed<number>(() => Number(route.params.id as string));
watch(programId, async (val) => {
  if (!val) return;
  await store.loadProgram(val);

  useBreadcrumb([
    { label: t("deployment.programs.title"), to: "/deployment/programs" },
    { label: `${program.value?.name[locale.value] || program.value?.name[program.value?.defaultLanguage.code]}` },
  ]);
}, { immediate: true });
</script>

<template>
  <PageRoot
    name="deployment.programs.details"
    class="flex flex-col"
  >
    <main
      v-if="loading"
      class="h-24 grid place-items-center"
    >
      <UiSpinner />
    </main>
    <template v-else-if="program">
      <header class="flex gap-4 mb-6">
        <div class="aspect-4/2.5 shrink-0 max-w-sm overflow-hidden rounded-xl">
          <NuxtImg
            v-if="program.picture"
            class="block size-full object-cover"
            :src="program.picture"
          />
          <span
            v-else
            class="block size-full bg-accent"
          />
        </div>

        <div class="flex-1 flex flex-col gap-1.5 py-4">
          <h1 class="text-3xl font-bold">
            {{ program.name[locale] || program.name[program.defaultLanguage.code]! }}
          </h1>
          <UiEditorRenderer
            :content="program.description[locale] || program.name[program.defaultLanguage.code]!"
            class="*:text-base! line-clamp-4"
          />

          <div class="mt-auto flex items-start gap-4">
            <div class="grid gap-1.5">
              <p class="text-sm text-muted-foreground">
                {{ $t("labels.languages.default", program.languages.length > 1 ? 2 : 1) }}
              </p>
              <div class="flex items-center gap-1">
                <UiTooltip
                  v-for="language in program.languages"
                  :key="language.id"
                >
                  <UiTooltipTrigger>
                    <FlagIcon
                      :country-code="language.code === 'en' ? 'gb' : language.code"
                      class="text-lg rounded-xs"
                    />
                  </UiTooltipTrigger>
                  <UiTooltipContent>
                    <p>{{ language.nativeName }}</p>
                  </UiTooltipContent>
                </UiTooltip>
              </div>
            </div>

            <div
              v-if="program.languages.length > 1"
              class="grid gap-1.5"
            >
              <p class="text-sm text-muted-foreground">
                {{ $t("labels.languages.by-default") }}
              </p>
              <div class="flex items-center gap-1">
                <UiTooltip>
                  <UiTooltipTrigger>
                    <FlagIcon
                      :country-code="program.defaultLanguage.code === 'en' ? 'gb' : program.defaultLanguage.code"
                      class="text-lg rounded-xs"
                    />
                  </UiTooltipTrigger>
                  <UiTooltipContent>
                    <p>{{ program.defaultLanguage.nativeName }}</p>
                  </UiTooltipContent>
                </UiTooltip>
              </div>
            </div>

            <div class="grid gap-1.5">
              <p class="text-sm text-muted-foreground">
                {{ $t("labels.duration") }}
              </p>
              <p class="font-medium">
                {{ $t("labels.time.days", program.duration, { named: { count: program.duration } }) }}
              </p>
            </div>
          </div>
        </div>

        <ProgramActions
          class="self-start"
          :program
          :show-program-shortcuts="false"
        />
      </header>

      <div class="rounded-3xl border isolate">
        <nav
          ref="observed"
          class="sticky z-10 top-12 flex items-center gap-1.5 p-2 bg-background border-b overflow-x-auto"
          :class="{ 'rounded-t-3xl': !isStuck }"
        >
          <UiButton
            v-if="false"
            variant="outline"
            class="rounded-full"
            as-child
          >
            <NuxtLinkLocale
              :to="`/${company?.alias}/deployment/programs/${program?.id}/`"
              exact-active-class="bg-accent! hover:bg-accent/85!"
            >
              {{ $t("deployment.programs.navigation.overview") }}
            </NuxtLinkLocale>
          </UiButton>
          <UiButton
            variant="outline"
            class="rounded-full"
            as-child
          >
            <NuxtLinkLocale
              :to="`/${company?.alias}/deployment/programs/${program?.id}/journeys`"
              active-class="bg-accent! hover:bg-accent/85!"
            >
              {{ $t("deployment.programs.navigation.journeys") }}
            </NuxtLinkLocale>
          </UiButton>
          <UiButton
            v-if="false"
            variant="outline"
            class="rounded-full"
            as-child
          >
            <NuxtLinkLocale
              :to="`/${company?.alias}/deployment/programs/${program?.id}/events`"
              active-class="bg-accent! hover:bg-accent/85!"
            >
              {{ $t("deployment.programs.navigation.events") }}
            </NuxtLinkLocale>
          </UiButton>
          <UiButton
            v-if="false"
            variant="outline"
            class="rounded-full"
            as-child
          >
            <NuxtLinkLocale
              :to="`/${company?.alias}/deployment/programs/${program?.id}/contents`"
              active-class="bg-accent! hover:bg-accent/85!"
            >
              {{ $t("deployment.programs.navigation.contents") }}
            </NuxtLinkLocale>
          </UiButton>
          <UiButton
            v-if="false"
            variant="outline"
            class="rounded-full"
            as-child
          >
            <NuxtLinkLocale
              :to="`/${company?.alias}/deployment/programs/${program?.id}/people`"
              active-class="bg-accent! hover:bg-accent/85!"
            >
              {{ $t("deployment.programs.navigation.people") }}
            </NuxtLinkLocale>
          </UiButton>
          <UiButton
            v-if="false"
            variant="outline"
            class="rounded-full"
            as-child
          >
            <NuxtLinkLocale
              :to="`/${company?.alias}/deployment/programs/${program?.id}/reports`"
              active-class="bg-accent! hover:bg-accent/85!"
            >
              {{ $t("deployment.programs.navigation.reports") }}
            </NuxtLinkLocale>
          </UiButton>
        </nav>

        <main class="p-4">
          <NuxtPage />
        </main>
      </div>
    </template>
  </PageRoot>
</template>
