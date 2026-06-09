import { Tooltip, TooltipTrigger, TooltipContent } from "~/components/ui/tooltip";

export function buildTooltipComponent(component: Component, text: string) {
  const trigger = h(TooltipTrigger, { asChild: true }, component);
  const content = h(TooltipContent, h("p", text));

  return h(Tooltip, [trigger, content]);
}
