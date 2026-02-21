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
    outdoor: MonthRange;
  };
  germination: GerminationType;
  colors: string[];
  imageUrl: string;
  maintenanceNotes: BilingualText;
  plantingConditions: PlantingCondition[];
  minDistanceCm: number;
  stemTips: BilingualText | null;
  sun: SunRequirement;
}
