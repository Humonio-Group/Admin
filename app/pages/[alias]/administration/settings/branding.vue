<script setup lang="ts">
import PageRoot from "~/components/composing/PageRoot.vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";
import ImageCropDialog from "~/components/primitives/ImageCropDialog.vue";

const store = useCompanyStore();
const { company, loading: _loading } = storeToRefs(store);
const saving = computed(() => _loading.value.saving.company);

const iconCropper = useImageCrop("iconInput", async blob => form.setFieldValue("icon", await store.uploadIcon(blob) ?? undefined));
const logoCropper = useImageCrop("logoInput", async blob => form.setFieldValue("logo", await store.uploadLogo(blob) ?? undefined));

const form = useForm({
  validationSchema: toTypedSchema(z.object({
    name: z.string(),
    alias: z.string(),
    icon: z.string(),
    logo: z.string(),
    colors: z.object({
      primary: z.string(),
      secondary: z.string(),
    }),
  })),
  initialValues: {
    name: company.value!.name,
    alias: company.value!.alias,
    icon: company.value!.icon,
    logo: company.value!.logo,
    colors: {
      primary: `#${company.value!.colors.first.replaceAll("#", "")}`,
      secondary: `#${company.value!.colors.second.replaceAll("#", "")}`,
    },
  },
});
const submit = form.handleSubmit(async (values) => {
  await store.saveCompanyInfo(values);
});
</script>

<template>
  <PageRoot
    name="settings.administration.branding"
    class="pt-2 flex flex-col gap-6"
  >
    <header class="grid gap-1.5">
      <h1 class="text-xl font-bold">
        {{ $t("settings.branding.title") }}
      </h1>
    </header>

    <form
      class="flex flex-col gap-4"
      @submit="submit"
    >
      <main class="grid grid-cols-2 gap-4 items-start">
        <!-- general -->
        <UiFormField
          v-slot="{ componentField }"
          name="name"
        >
          <UiFormItem>
            <UiFormLabel>{{ $t("settings.branding.fields.name") }}</UiFormLabel>
            <UiFormControl>
              <UiInput
                :disabled="saving"
                v-bind="componentField"
              />
            </UiFormControl>
          </UiFormItem>
        </UiFormField>
        <UiFormField
          v-slot="{ componentField }"
          name="alias"
        >
          <UiFormItem>
            <UiFormLabel>{{ $t("settings.branding.fields.alias.label") }}</UiFormLabel>
            <UiFormControl>
              <UiInput
                :disabled="saving"
                v-bind="componentField"
              />
            </UiFormControl>
            <UiFormDescription>{{ $t("settings.branding.fields.alias.description") }}</UiFormDescription>
          </UiFormItem>
        </UiFormField>

        <!-- logos -->
        <UiFormField
          v-slot="{ componentField }"
          name="icon"
        >
          <UiFormItem class="space-y-0 flex flex-col gap-2">
            <UiFormLabel>{{ $t("settings.branding.fields.icon.label") }}</UiFormLabel>
            <UiFormDescription>{{ $t("settings.branding.fields.icon.description") }}</UiFormDescription>
            <UiFormControl>
              <input
                ref="iconInput"
                :disabled="saving"
                type="file"
                class="hidden"
                accept="image/jpeg,image/pjpeg,image/png,image/gif"
                @change="iconCropper.onFileChange"
              >
            </UiFormControl>

            <ImageCropDialog
              v-if="iconCropper.src.value"
              v-model:open="iconCropper.open.value"
              :src="iconCropper.src.value"
              :mime-type="iconCropper.mimeType.value"
              :aspect-ratio="1"
              @crop="iconCropper.onConfirm"
              @update:open="iconCropper.onOpenChange"
            />

            <NuxtImg
              v-if="componentField.modelValue"
              :src="componentField.modelValue"
              class="self-center aspect-square object-cover rounded-lg"
            />

            <UiButton
              class="self-center"
              size="sm"
              variant="outline"
              :disabled="saving"
              @click="iconCropper.inputRef.value?.click()"
            >
              {{ $t("btn.change") }}
            </UiButton>
          </UiFormItem>
        </UiFormField>
        <UiFormField
          v-slot="{ componentField }"
          name="logo"
        >
          <UiFormItem class="space-y-0 flex flex-col gap-2">
            <UiFormLabel>{{ $t("settings.branding.fields.logo") }}</UiFormLabel>
            <UiFormControl>
              <input
                ref="logoInput"
                :disabled="saving"
                type="file"
                class="hidden"
                accept="image/jpeg,image/pjpeg,image/png,image/gif"
                @change="logoCropper.onFileChange"
              >
            </UiFormControl>

            <ImageCropDialog
              v-if="logoCropper.src.value"
              v-model:open="logoCropper.open.value"
              :src="logoCropper.src.value"
              :mime-type="logoCropper.mimeType.value"
              @crop="logoCropper.onConfirm"
              @update:open="logoCropper.onOpenChange"
            />

            <NuxtImg
              v-if="componentField.modelValue"
              :src="componentField.modelValue"
              class="self-center w-full object-cover rounded-lg"
            />

            <UiButton
              class="self-center"
              size="sm"
              variant="outline"
              :disabled="saving"
              @click="logoCropper.inputRef.value?.click()"
            >
              {{ $t("btn.change") }}
            </UiButton>
          </UiFormItem>
        </UiFormField>

        <!-- colors -->
        <UiFormField
          v-slot="{ componentField }"
          name="colors.primary"
        >
          <UiFormItem>
            <UiFormLabel>{{ $t("settings.branding.fields.light") }}</UiFormLabel>
            <UiFormControl>
              <UiColorPicker
                :disabled="saving"
                :model-value="componentField.modelValue"
                @update:model-value="componentField['onUpdate:modelValue']"
              />
            </UiFormControl>
          </UiFormItem>
        </UiFormField>
        <UiFormField
          v-slot="{ componentField }"
          name="colors.secondary"
        >
          <UiFormItem>
            <UiFormLabel>{{ $t("settings.branding.fields.dark") }}</UiFormLabel>
            <UiFormControl>
              <UiColorPicker
                :disabled="saving"
                :model-value="componentField.modelValue"
                @update:model-value="componentField['onUpdate:modelValue']"
              />
            </UiFormControl>
          </UiFormItem>
        </UiFormField>
      </main>

      <footer class="self-end">
        <UiButton
          size="sm"
          :disabled="saving"
        >
          {{ $t("btn.save") }}
          <UiSpinner v-if="saving" />
        </UiButton>
      </footer>
    </form>
  </PageRoot>
</template>
