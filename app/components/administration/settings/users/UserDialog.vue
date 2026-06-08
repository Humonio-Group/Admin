<script setup lang="ts">
import type { UserDialogProps } from "~/components/administration/settings/users/index";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";
import { UserRole } from "~/types/entities/user";

const props = defineProps<UserDialogProps>();
const userRoles = [3, 4, 5, 6, 7, 8, 9, 10] as const;

const store = useCompanyStore();
const { loading } = storeToRefs(store);

const form = useForm({
  validationSchema: toTypedSchema(z.object({
    firstname: z.string(),
    lastname: z.string(),
    email: z.string().email(),
    roles: z.array(z.number().min(userRoles[0]).max(userRoles[userRoles.length - 1]!)).default([]),
  })),
  initialValues: {
    roles: [],
  },
});

const open = defineModel<boolean>("open", { default: false });
const editMode = computed(() => !!props.user);

const { company } = storeToRefs(useCompanyStore());

watch(open, (val) => {
  if (!val) return;

  if (props.user) form.resetForm({
    values: {
      firstname: props.user.name.first,
      lastname: props.user.name.last,
      email: props.user.email,
      roles: props.user.workspaces.find(workspace => workspace.id === Number(company.value!.id))!.roles,
    },
  });
  else form.resetForm({
    values: {
      roles: [],
    },
  });
});

const submit = form.handleSubmit(async (values) => {
  open.value = !(props.user ? await store.saveUser(props.user.id, values) : await store.createUser(values));
});

function toggleRole(role: number) {
  if (form.values.roles?.includes(role)) form.setFieldValue("roles", form.values.roles?.filter(r => r !== role));
  else form.setFieldValue("roles", [...(form.values.roles ?? []), role]);
}
</script>

<template>
  <UiDialog v-model:open="open">
    <UiDialogTrigger
      v-if="trigger"
      as-child
    >
      <slot />
    </UiDialogTrigger>

    <UiDialogContent>
      <form
        class="grid gap-4"
        @submit="submit"
      >
        <UiDialogHeader>
          <template v-if="editMode">
            <UiDialogTitle>{{ $t("settings.users.dialog.edit.title") }}</UiDialogTitle>
            <UiDialogDescription>{{ $t("settings.users.dialog.edit.description") }}</UiDialogDescription>
          </template>
          <template v-else>
            <UiDialogTitle>{{ $t("settings.users.dialog.new.title") }}</UiDialogTitle>
            <UiDialogDescription>{{ $t("settings.users.dialog.new.description") }}</UiDialogDescription>
          </template>
        </UiDialogHeader>

        <main class="grid gap-4">
          <UiFormField
            v-slot="{ componentField }"
            name="firstname"
          >
            <UiFormItem>
              <UiFormLabel>{{ $t("settings.users.dialog.fields.first-name") }}</UiFormLabel>
              <UiFormControl>
                <UiInput v-bind="componentField" />
              </UiFormControl>
            </UiFormItem>
          </UiFormField>
          <UiFormField
            v-slot="{ componentField }"
            name="lastname"
          >
            <UiFormItem>
              <UiFormLabel>{{ $t("settings.users.dialog.fields.last-name") }}</UiFormLabel>
              <UiFormControl>
                <UiInput v-bind="componentField" />
              </UiFormControl>
            </UiFormItem>
          </UiFormField>
          <UiFormField
            v-slot="{ componentField }"
            name="email"
          >
            <UiFormItem>
              <UiFormLabel>{{ $t("settings.users.dialog.fields.email") }}</UiFormLabel>
              <UiFormControl>
                <UiInput
                  v-bind="componentField"
                  type="email"
                />
              </UiFormControl>
            </UiFormItem>
          </UiFormField>
          <UiFormField
            v-slot="{ componentField }"
            name="roles"
          >
            <UiFormItem>
              <UiFormLabel>
                {{ $t("settings.users.dialog.fields.roles") }}
              </UiFormLabel>

              <UiLabel
                v-for="role in userRoles"
                :key="`role-${role}`"
                class=""
                :class="{ 'text-muted-foreground': role === UserRole.PARTICIPANT }"
              >
                <UiCheckbox
                  :disabled="role === UserRole.PARTICIPANT"
                  :model-value="componentField.modelValue.includes(role)"
                  @update:model-value="toggleRole(role)"
                />
                {{ $t(`labels.roles.${role}`) }}
              </UiLabel>
            </UiFormItem>
          </UiFormField>
        </main>

        <UiDialogFooter>
          <UiDialogClose as-child>
            <UiButton
              type="button"
              variant="secondary"
            >
              {{ $t("btn.cancel") }}
            </UiButton>
          </UiDialogClose>
          <UiButton :disabled="loading.creating.user || loading.saving.user">
            {{ $t(`btn.${editMode ? "save" : "create.user"}`) }}
            <UiSpinner v-if="loading.creating.user || loading.saving.user" />
          </UiButton>
        </UiDialogFooter>
      </form>
    </UiDialogContent>
  </UiDialog>
</template>
