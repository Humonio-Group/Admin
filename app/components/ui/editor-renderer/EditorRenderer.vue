<script setup lang="ts">
import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "vue";

const props = defineProps<{
  content: string;
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <Suspense>
    <MDC
      :value="content"
      :class="cn('editor-renderer', props.class)"
    />

    <template #fallback>
      <div class="h-16 grid place-items-center">
        <UiSpinner />
      </div>
    </template>
  </Suspense>
</template>

<style>
.editor-renderer h1 { font-size: 1.875rem; font-weight: 700; margin: 1.5rem 0 0.75rem; }
.editor-renderer h2 { font-size: 1.5rem; font-weight: 700; margin: 1.25rem 0 0.5rem; }
.editor-renderer h3 { font-size: 1.25rem; font-weight: 600; margin: 1rem 0 0.5rem; }
.editor-renderer h4 { font-size: 1.125rem; font-weight: 600; margin: 0.75rem 0 0.25rem; }
.editor-renderer h5 { font-size: 1rem; font-weight: 600; margin: 0.5rem 0 0.25rem; }
.editor-renderer h6 { font-size: 0.875rem; font-weight: 600; margin: 0.5rem 0 0.25rem; }

.editor-renderer p { margin-bottom: 0.75rem; line-height: 1.75; }
.editor-renderer p:last-child { margin-bottom: 0; }

.editor-renderer ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 0.75rem; }
.editor-renderer ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 0.75rem; }
.editor-renderer li { margin-bottom: 0.25rem; line-height: 1.75; }

.editor-renderer blockquote {
  border-left: 3px solid var(--border);
  padding-left: 1rem;
  margin: 1rem 0;
  color: var(--muted-foreground);
  font-style: italic;
}

.editor-renderer code {
  background: var(--muted);
  border-radius: 0.25rem;
  padding: 0.125rem 0.375rem;
  font-size: 0.875em;
  font-family: monospace;
}

.editor-renderer pre {
  background: var(--muted);
  border-radius: 0.5rem;
  padding: 1rem 1.25rem;
  margin: 1rem 0;
  overflow-x: auto;
}
.editor-renderer pre code {
  background: none;
  padding: 0;
  font-size: 0.875rem;
}

.editor-renderer hr {
  border: none;
  border-top: 1px solid var(--border);
  margin: 1.5rem 0;
}

.editor-renderer a {
  color: var(--primary);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.editor-renderer a:hover { opacity: 0.8; }

.editor-renderer img {
  max-width: 100%;
  width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.editor-renderer table {
  border-collapse: collapse;
  width: 100%;
  margin: 1rem 0;
}
.editor-renderer td,
.editor-renderer th {
  border: 1px solid var(--border);
  padding: 0.5rem 0.75rem;
  text-align: left;
}
.editor-renderer th {
  background: var(--muted);
  font-weight: 600;
}
</style>
