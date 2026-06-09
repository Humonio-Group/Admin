<script setup lang="ts">
import { useForm } from "vee-validate";
import type { LocationEditDialogProps } from "~/components/administration/settings/locations/index";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";
import FlagIcon from "~/components/icons/FlagIcon.vue";

const props = withDefaults(defineProps<LocationEditDialogProps>(), {
  trigger: false,
});

const store = useCompanyStore();
const { countries, loading: _loading, isCountriesLoaded } = storeToRefs(store);
const loading = computed(() => _loading.value.creating.location || _loading.value.saving.location);

const open = defineModel<boolean>("open", { default: false });
watch(open, async (val) => {
  if (!val) return;
  if (isCountriesLoaded.value) {
    resetForm();
    return;
  }
  await store.loadCountries();
  resetForm();
});

const form = useForm({
  validationSchema: toTypedSchema(z.object({
    name: z.string(),
    country: z.coerce.number().min(1),
    city: z.string(),
    zipcode: z.string().regex(/^[\d]{4,6}$/),
    addressMain: z.string(),
    addressComp: z.string().optional(),
    infos: z.string().optional(),
  })),
  initialValues: {
    name: props.location?.name ?? undefined,
    country: props.location?.country.id ?? countries.value[0]?.id ?? undefined,
    city: props.location?.city ?? undefined,
    zipcode: props.location?.zip ?? undefined,
    addressMain: props.location?.address.main ?? undefined,
    addressComp: props.location?.address.comp ?? undefined,
    infos: props.location?.infos ?? undefined,
  },
});
const submit = form.handleSubmit(async (values) => {
  const state = props.location ? await store.saveLocation(props.location.id, values) : await store.createLocation(values);
  open.value = !state;
});

const selectedCountryCode = computed(() => countries.value.find(country => country.id === form.values.country)?.code);

function resetForm() {
  form.resetForm({
    values: {
      name: props.location?.name ?? undefined,
      country: props.location?.country.id ?? countries.value[0]?.id ?? undefined,
      city: props.location?.city ?? undefined,
      zipcode: props.location?.zip ?? undefined,
      addressMain: props.location?.address.main ?? undefined,
      addressComp: props.location?.address.comp ?? undefined,
      infos: props.location?.infos ?? undefined,
    },
  });
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
        class="grid gap-6"
        @submit="submit"
      >
        <UiDialogHeader>
          <UiDialogTitle>Titre</UiDialogTitle>
        </UiDialogHeader>

        <UiFormField
          v-slot="{ componentField }"
          name="name"
        >
          <UiFormItem>
            <UiFormLabel>Nom</UiFormLabel>
            <UiFormControl>
              <UiInput
                v-bind="componentField"
                placeholder="ex. Humonio Office"
              />
            </UiFormControl>
          </UiFormItem>
        </UiFormField>

        <UiFormField
          v-slot="{ componentField }"
          name="country"
        >
          <UiFormItem>
            <UiFormLabel>Pays</UiFormLabel>
            <div class="flex items-center gap-2">
              <FlagIcon
                v-if="selectedCountryCode"
                :country-code="selectedCountryCode"
                class="text-3xl"
              />
              <span
                v-else
                class="aspect-square size-9 rounded-md bg-muted"
              />

              <UiFormControl>
                <div class="flex-1 flex items-center gap-2">
                  <UiSelect
                    v-bind="componentField"
                    :disabled="_loading.settings.countries"
                  >
                    <UiSelectTrigger class="w-full">
                      <UiSelectValue />
                    </UiSelectTrigger>

                    <UiSelectContent>
                      <UiSelectItem
                        v-for="country in countries"
                        :key="country.id"
                        :value="country.id"
                      >
                        {{ country.name }}
                      </UiSelectItem>
                    </UiSelectContent>
                  </UiSelect>
                  <UiSpinner v-if="_loading.settings.countries" />
                </div>
              </UiFormControl>
            </div>
          </UiFormItem>
        </UiFormField>

        <UiFormField
          v-slot="{ componentField }"
          name="city"
        >
          <UiFormItem>
            <UiFormLabel>Ville</UiFormLabel>
            <UiFormControl>
              <UiInput
                v-bind="componentField"
                placeholder="ex. Strasbourg"
              />
            </UiFormControl>
          </UiFormItem>
        </UiFormField>

        <UiFormField
          v-slot="{ componentField }"
          name="zipcode"
        >
          <UiFormItem>
            <UiFormLabel>Code Postal</UiFormLabel>
            <UiFormControl>
              <UiInput
                v-bind="componentField"
                inputmode="numeric"
                placeholder="ex. 67100"
              />
            </UiFormControl>
          </UiFormItem>
        </UiFormField>

        <UiFormField
          v-slot="{ componentField }"
          name="addressMain"
        >
          <UiFormItem>
            <UiFormLabel>Adresse</UiFormLabel>
            <UiFormControl>
              <UiInput v-bind="componentField" />
            </UiFormControl>
          </UiFormItem>
        </UiFormField>

        <UiFormField
          v-slot="{ componentField }"
          name="addressComp"
        >
          <UiFormItem>
            <UiFormLabel>Complément d'adresse</UiFormLabel>
            <UiFormControl>
              <UiInput v-bind="componentField" />
            </UiFormControl>
          </UiFormItem>
        </UiFormField>

        <UiFormField
          v-slot="{ componentField }"
          name="infos"
        >
          <UiFormItem>
            <UiFormLabel>Informations d'expédition</UiFormLabel>
            <UiFormControl>
              <UiTextarea
                v-bind="componentField"
                class="min-h-24 resize-none"
              />
            </UiFormControl>
          </UiFormItem>
        </UiFormField>

        <UiDialogFooter>
          <UiDialogClose as-child>
            <UiButton
              type="button"
              variant="secondary"
            >
              {{ $t("btn.cancel") }}
            </UiButton>
          </UiDialogClose>

          <UiButton
            type="submit"
            :disabled="loading"
          >
            {{ $t("btn.save") }}
            <UiSpinner v-if="loading" />
          </UiButton>
        </UiDialogFooter>
      </form>
    </UiDialogContent>
  </UiDialog>
</template>
