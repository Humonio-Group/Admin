<script setup lang="ts">
const { company } = storeToRefs(useCompanyStore());

navigateTo(useLocalePath()(`/${company.value?.alias}/analytics/ai/text`));
</script>
