export type PlantType = 'flower' | 'vegetable' | 'herb';
export type PlantLifecycle = 'annual' | 'biennial' | 'perennial';
export type GerminationType = 'light' | 'dark';
export type PropagationType = 'seed' | 'tuber';
export type SunRequirement = 'full-sun' | 'partial-shade' | 'shade';
export type PlantingCondition = 'tray' | 'pot' | 'outdoor' | 'sprout-tray';
export type MonthRange = number[] | null;

/**
 * Normalize a MonthRange from legacy [start, end] format to explicit month array.
 * Legacy format: [3, 5] meant months 3,4,5 (contiguous range).
 * New format: [3, 4, 5] lists each month explicitly.
 * If array has >2 elements, it's already in new format.
 */
export function normalizeMonthRange(range: MonthRange): MonthRange {
  if (!range || range.length === 0) return null;
  if (range.length > 2) return range;
  if (range.length === 1) return range;
  // Legacy [start, end] — expand to full array
  const start = range[0]!;
  const end = range[1]!;
  if (start === end) return [start];
  const months: number[] = [];
  if (start <= end) {
    for (let m = start; m <= end; m++) months.push(m);
  } else {
    // Wrapping range (e.g. [11, 2] = Nov, Dec, Jan, Feb)
    for (let m = start; m <= 12; m++) months.push(m);
    for (let m = 1; m <= end; m++) months.push(m);
  }
  return months;
}

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

export interface PlantImage {
  url: string;
  focalPoint?: { x: number; y: number };      // 0-100 — detail page hero crop
  thumbFocalPoint?: { x: number; y: number };  // 0-100 — card thumbnail crop
  isCover?: boolean;
  isCardPreview?: boolean;
}

export function normalizeImage(img: string | PlantImage): PlantImage {
  if (typeof img === 'string') return { url: img };
  return img;
}

export function getCoverImage(images: (string | PlantImage)[]): PlantImage | null {
  if (images.length === 0) return null;
  const normalized = images.map(normalizeImage);
  return normalized.find(i => i.isCover) ?? normalized[0] ?? null;
}

export function getCardPreviewImage(images: (string | PlantImage)[]): PlantImage | null {
  if (images.length === 0) return null;
  const normalized = images.map(normalizeImage);
  return normalized.find(i => i.isCardPreview) ?? normalized.find(i => i.isCover) ?? normalized[0] ?? null;
}

export type PlantStatus = 'pending' | 'unverified' | 'verified';

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
  lifecycle: PlantLifecycle;
  propagation: PropagationType;
  calendar: {
    indoorSowing: MonthRange;
    coldGreenhouse: MonthRange;
    outdoor: MonthRange;
    harvestPeriod: MonthRange;
  };
  germination: GerminationType;
  colors: PlantColor[];
  images: (string | PlantImage)[];
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
  status: PlantStatus;
  createdAt?: string;
  updatedAt?: string;
  nameCorrections?: {
    originalSpecies: string;
    originalVariety: string;
    correctedSpecies: string;
    correctedVariety: string;
  };
}
