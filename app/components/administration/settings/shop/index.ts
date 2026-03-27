import type { CompanyStoreProgram } from "~/types/entities/company";
import type { HumonioProps } from "~/types/components/default";

export interface ProgramCardProps extends HumonioProps {
  program: CompanyStoreProgram;
}
