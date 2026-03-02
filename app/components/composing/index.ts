import type { HTMLAttributes } from "vue";
import type { HumonioProps } from "~/types/components/default";

export interface ComposingProps extends HumonioProps {
  name?: string;
}
export interface PageRootProps extends ComposingProps {
  wrapper?: boolean;
  wrapperClass?: HTMLAttributes["class"];
}
