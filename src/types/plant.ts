export type PlantType = 'flower' | 'vegetable' | 'herb';
export type GerminationType = 'light' | 'dark';
export type SunRequirement = 'full-sun' | 'partial-shade' | 'shade';
export type PlantingCondition =
  | 'tray'
  | 'outside-direct'
  | 'p9-pot'
  | 'small-pot'
  | 'big-pot'
  | 'module-tray';
export type MonthRange = [number, number] | null;

export interface BilingualText {
  nl: string;
  en: string;
}

export interface HeightRange {
  min: number;
  max: number;
}

export interface GerminationDays {
  min: number;
  max: number;
}

export interface GerminationTemp {
  min: number;
  max: number;
}

export interface PlantColor {
  name: string;
  hex: string;
}

export type CareConditionType = 'days' | 'height' | 'leaves' | 'temperature' | 'date' | 'custom';

export interface CareStep {
  action: BilingualText;
  condition: {
    type: CareConditionType;
    value: number | string | null;
    unit: string | null;
    description: BilingualText;
  };
  order: number;
}

export interface Plant {
  id: string;
  species: string;
  variety: string | null;
  latinName: string;
  name: BilingualText;
  type: PlantType;
  calendar: {
    indoorSowing: MonthRange;
    greenhouse: MonthRange;
    coldGreenhouse: MonthRange;
    outdoor: MonthRange;
  };
  germination: GerminationType;
  colors: PlantColor[];
  images: string[];
  heightCm: HeightRange | null;
  sowingDepthMm: number | null;
  germinationDays: GerminationDays | null;
  germinationTempC: GerminationTemp | null;
  pinching: boolean;
  seedsPerCell: number | null;
  careSteps: CareStep[];
  maintenanceNotes: BilingualText;
  plantingConditions: PlantingCondition[];
  minDistanceCm: number;
  stemTips: BilingualText | null;
  sun: SunRequirement;
  verified: boolean;
}
