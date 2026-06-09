import type { JourneySimulation } from "~/types/entities/journey";

export interface JourneySimulationCardProps {
  simulation: JourneySimulation;
}

export interface JourneySimulationActionsProps {
  simulation: JourneySimulation;
}

export interface JourneySimulationExportDialogProps {
  simulation: JourneySimulation;
}

export interface JourneySimulationShareDialogProps {
  simulation: JourneySimulation;
  trigger?: boolean;
}
