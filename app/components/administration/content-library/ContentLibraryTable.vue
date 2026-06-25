<script setup lang="ts">
import { columns } from "~/components/administration/content-library/index";

const { contents, loading } = storeToRefs(useContentLibraryStore());
</script>

<template>
  <UiDataTable
    :columns="columns()"
    :data="contents"
    :loading="loading.list"
  />
</template>
