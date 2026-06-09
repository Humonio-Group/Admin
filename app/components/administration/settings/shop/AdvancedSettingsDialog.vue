<script setup lang="ts">
import { Settings, Copy, Check, SquareArrowOutUpRight, RefreshCw, Eye, EyeOff } from "lucide-vue-next";
import { useClipboard } from "@vueuse/core";
import { generatePassword } from "~/lib/generators/generate-password";

const store = useCompanyStore();
const { storeSettings, loading: _loading } = storeToRefs(store);
const loading = computed(() => _loading.value.saving.storeSettings);

const open = ref<boolean>(false);
const showPassword = ref<boolean>(false);
const { copy: copyLink, copied: linkCopied } = useClipboard();
const { copy: copyPassword, copied: passwordCopied } = useClipboard();

const legalForm = ref<string>("");
const address = ref<string>("");
const password = ref<string>("");

watch(open, (val) => {
  if (!val) return;

  legalForm.value = storeSettings.value!.legal.type;
  address.value = storeSettings.value!.legal.address;
  password.value = storeSettings.value!.access.password ?? "";
});

function randomPassword() {
  password.value = generatePassword();
}
async function save() {
  if (!storeSettings.value) return;

  await store.saveShopSettings({
    ...storeSettings.value,
    access: {
      ...storeSettings.value.access,
      password: password.value || null,
    },
    legal: {
      type: legalForm.value,
      address: address.value,
    },
  });
  open.value = false;
}
</script>

<template>
  <UiDialog
    v-if="storeSettings"
    v-model:open="open"
  >
    <UiTooltip>
      <UiTooltipTrigger>
        <UiDialogTrigger as-child>
          <UiButton
            variant="outline"
            size="icon"
          >
            <Settings />
          </UiButton>
        </UiDialogTrigger>
      </UiTooltipTrigger>
      <UiTooltipContent side="bottom">
        <p>{{ $t("btn.advanced-settings") }}</p>
      </UiTooltipContent>
    </UiTooltip>
    <UiDialogContent class="max-w-xl! gap-8">
      <UiDialogHeader>
        <UiDialogTitle>{{ $t("settings.shop.dialogs.advanced-settings.title") }}</UiDialogTitle>
        <UiDialogDescription>{{ $t("settings.shop.dialogs.advanced-settings.description") }}</UiDialogDescription>

        <section class="grid gap-1.5">
          <p class="text-sm font-medium">
            {{ $t("settings.shop.dialogs.advanced-settings.store-access") }}
          </p>
          <div class="py-1 pl-3 pr-1 bg-accent/50 border rounded-md flex items-center justify-between">
            <p class="text-sm text-primary">
              {{ storeSettings?.access.url }}
            </p>

            <div class="flex items-center">
              <UiTooltip>
                <UiTooltipTrigger as-child>
                  <UiButton
                    variant="ghost"
                    size="icon-sm"
                    @click="copyLink(storeSettings.access.url)"
                  >
                    <Check v-if="linkCopied" />
                    <Copy v-else />
                  </UiButton>
                </UiTooltipTrigger>
                <UiTooltipContent>
                  <p>{{ $t("settings.shop.dialogs.advanced-settings.tooltips.copy-url") }}</p>
                </UiTooltipContent>
              </UiTooltip>
              <UiTooltip>
                <UiTooltipTrigger as-child>
                  <UiButton
                    variant="ghost"
                    size="icon-sm"
                    as-child
                  >
                    <NuxtLink
                      :to="storeSettings.access.url"
                      target="_blank"
                      external
                    >
                      <SquareArrowOutUpRight />
                    </NuxtLink>
                  </UiButton>
                </UiTooltipTrigger>
                <UiTooltipContent>
                  <p>{{ $t("settings.shop.dialogs.advanced-settings.tooltips.open-store") }}</p>
                </UiTooltipContent>
              </UiTooltip>
            </div>
          </div>
        </section>
      </UiDialogHeader>

      <section class="grid gap-4">
        <div class="grid gap-2">
          <UiLabel for="legalForm">
            {{ $t("settings.shop.dialogs.advanced-settings.fields.legal-form") }}
          </UiLabel>
          <UiInput
            id="legalForm"
            v-model="legalForm"
          />
        </div>
        <div class="grid gap-2">
          <UiLabel for="address">
            {{ $t("settings.shop.dialogs.advanced-settings.fields.address") }}
          </UiLabel>
          <UiInput
            id="address"
            v-model="address"
          />
        </div>
      </section>

      <section class="grid gap-2">
        <h3 class="font-semibold">
          {{ $t("settings.shop.dialogs.advanced-settings.sections.stripe.title") }}
        </h3>
        <p class="-mt-1.5 text-sm text-muted-foreground">
          {{ $t("settings.shop.dialogs.advanced-settings.sections.stripe.description") }}
        </p>

        <UiButton variant="outline">
          {{ $t("settings.shop.dialogs.advanced-settings.actions.link-account") }}
        </UiButton>
      </section>

      <section class="grid gap-2">
        <h3 class="font-semibold">
          {{ $t("settings.shop.dialogs.advanced-settings.sections.access.title") }}
        </h3>
        <p class="-mt-1.5 text-sm text-muted-foreground">
          {{ $t("settings.shop.dialogs.advanced-settings.sections.access.description") }}
        </p>

        <div class="flex flex-col">
          <div class="flex items-center gap-1">
            <div class="relative w-full">
              <UiInput
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="pr-8.5"
              />
              <UiButton
                variant="ghost"
                size="icon-sm"
                class="absolute top-1.5 right-1.5 size-6 text-muted-foreground"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" />
                <Eye v-else />
              </UiButton>
            </div>

            <UiTooltip>
              <UiTooltipTrigger as-child>
                <UiButton
                  variant="outline"
                  size="icon"
                  @click="randomPassword"
                >
                  <RefreshCw />
                </UiButton>
              </UiTooltipTrigger>
              <UiTooltipContent>
                <p>{{ $t("settings.shop.dialogs.advanced-settings.tooltips.random-password") }}</p>
              </UiTooltipContent>
            </UiTooltip>
            <UiTooltip>
              <UiTooltipTrigger as-child>
                <UiButton
                  variant="outline"
                  size="icon"
                  @click="copyPassword(password)"
                >
                  <Check v-if="passwordCopied" />
                  <Copy v-else />
                </UiButton>
              </UiTooltipTrigger>
              <UiTooltipContent>
                <p>{{ $t("settings.shop.dialogs.advanced-settings.tooltips.copy-password") }}</p>
              </UiTooltipContent>
            </UiTooltip>
          </div>

          <UiButton
            v-if="password.length"
            variant="link"
            size="sm"
            class="text-xs self-start px-0! text-destructive!"
            @click="password = ''"
          >
            {{ $t("settings.shop.dialogs.advanced-settings.actions.remove-password") }}
          </UiButton>
        </div>
      </section>

      <UiDialogFooter class="justify-center!">
        <UiDialogClose as-child>
          <UiButton
            variant="secondary"
            :disabled="loading"
          >
            {{ $t("btn.close") }}
          </UiButton>
        </UiDialogClose>
        <UiButton
          :disabled="loading"
          @click="save"
        >
          {{ $t("btn.save") }}
          <UiSpinner v-if="loading" />
        </UiButton>
      </UiDialogFooter>
    </UiDialogContent>
  </UiDialog>
</template>
