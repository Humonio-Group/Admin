import type { Listed } from "~/types/primitives/objects";
import { computeRole } from "~/lib/user";

export function useHasRole(...roles: Listed<string>): ComputedRef<boolean> {
  const { activeRoles } = storeToRefs(useUserStore());

  return computed<boolean>(() => {
    if (!activeRoles.value.length) return false;
    return roles.map(computeRole).every(role => activeRoles.value.includes(role));
  });
}
