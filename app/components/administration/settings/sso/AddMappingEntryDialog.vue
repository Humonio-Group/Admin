<script setup lang="ts">
import { type CompanySSOSettings, SSOUserFields, type SSOUserField } from "~/types/entities/company";
import { Plus } from "lucide-vue-next";

const props = withDefaults(defineProps<{
  entry?: CompanySSOSettings["mapping"][0];
  add?: (attribute: string, userField: SSOUserField) => void;
  save?: (key: string, attribute: string, userField: SSOUserField) => void;
  trigger?: boolean;
}>(), {
  trigger: true,
});

const open = defineModel<boolean>("open", { default: false });

const attributeName = ref<string>(props.entry?.attributeName ?? "");
const userField = ref<SSOUserField>(props.entry?.userField ?? "firstname");

const editMode = computed(() => !!props.entry);

function addEntry() {
  if (props.add) props.add(attributeName.value, userField.value);
  else if (props.entry && props.save) props.save(props.entry.key, attributeName.value, userField.value);

  open.value = false;
}
</script>

<template>
  <UiDialog v-model:open="open">
    <UiDialogTrigger
      v-if="trigger"
      as-child
    >
      <UiButton size="sm">
        <Plus />
        {{ $t("btn.add.entry") }}
      </UiButton>
    </UiDialogTrigger>
    <UiDialogContent>
      <UiDialogHeader />

      <section class="grid gap-4">
        <div class="grid gap-2">
          <UiLabel for="attribute-name">
            {{ $t("settings.sso.labels.mapping.attribute-name") }}
          </UiLabel>
          <UiInput
            id="attribute-name"
            v-model="attributeName"
            :placeholder="$t('settings.sso.placeholders.attribute-name')"
          />
        </div>
        <div class="grid gap-2">
          <UiLabel for="user-field">
            {{ $t("settings.sso.labels.mapping.user-field.default") }}
          </UiLabel>
          <UiSelect
            id="user-field"
            v-model="userField"
          >
            <UiSelectTrigger class="w-full">
              <UiSelectValue :placeholder="$t('settings.sso.placeholders.user-field')" />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem
                v-for="userField in SSOUserFields"
                :key="userField"
                :value="userField"
              >
                {{ $t(`settings.sso.labels.mapping.user-field.${userField}`) }}
              </UiSelectItem>
            </UiSelectContent>
          </UiSelect>
        </div>
      </section>

      <UiDialogFooter class="justify-center!">
        <UiDialogClose as-child>
          <UiButton variant="secondary">
            {{ $t("btn.close") }}
          </UiButton>
        </UiDialogClose>
        <UiButton
          :disabled="attributeName.length <= 0 || !userField"
          @click="addEntry"
        >
          {{ $t(editMode ? "btn.save" : "btn.add.default") }}
        </UiButton>
      </UiDialogFooter>
    </UiDialogContent>
  </UiDialog>
</template>
