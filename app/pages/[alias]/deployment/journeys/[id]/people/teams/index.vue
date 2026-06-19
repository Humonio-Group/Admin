<script setup lang="ts">
const store = useJourneyStore();
const { journey, teams } = storeToRefs(store);

const { company } = storeToRefs(useCompanyStore());

await navigateTo(`/${company.value?.alias}/deployment/journeys/${journey.value?.id}/people/teams/${teams.value[0]?.id}`);
</script>
