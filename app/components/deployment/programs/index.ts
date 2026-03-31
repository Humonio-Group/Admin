import type { HumonioProps } from "~/types/components/default";
import type { ProgramListEntity } from "~/types/entities/program";

export interface ProgramCardProps extends HumonioProps {
  program: ProgramListEntity;
}

export interface ProgramActionsProps extends HumonioProps {
  program: ProgramListEntity;
}
