import type { Plant, PlantType, GerminationType, SunRequirement } from 'src/types/plant';

export interface ValidationResult {
  valid: boolean;
  plant: Plant;
  errors: string[];
  warnings: string[];
  hasNameCorrections: boolean;
  nameCorrections: {
    originalSpecies: string;
    originalVariety: string;
    correctedSpecies: string;
    correctedVariety: string;
  } | undefined;
}

const VALID_TYPES: PlantType[] = ['flower', 'vegetable', 'herb'];
const VALID_GERMINATION: GerminationType[] = ['light', 'dark'];
const VALID_SUN: SunRequirement[] = ['full-sun', 'partial-shade', 'shade'];

function validateBilingualText(obj: unknown, fieldName: string): string[] {
  const errors: string[] = [];
  if (!obj || typeof obj !== 'object') {
    errors.push(`${fieldName}: must be an object with nl and en strings`);
    return errors;
  }
  const rec = obj as Record<string, unknown>;
  if (typeof rec.nl !== 'string') errors.push(`${fieldName}.nl: must be a string`);
  if (typeof rec.en !== 'string') errors.push(`${fieldName}.en: must be a string`);
  return errors;
}

export function usePlantValidator() {
  function validatePlant(data: Record<string, unknown>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required string fields
    if (typeof data.id !== 'string' || !data.id) errors.push('id: required string');
    if (typeof data.species !== 'string' || !data.species) errors.push('species: required string');
    if (typeof data.latinName !== 'string') errors.push('latinName: required string');

    // Type
    if (!VALID_TYPES.includes(data.type as PlantType)) {
      errors.push(`type: must be one of ${VALID_TYPES.join(', ')}`);
    }

    // Germination
    if (!VALID_GERMINATION.includes(data.germination as GerminationType)) {
      errors.push(`germination: must be one of ${VALID_GERMINATION.join(', ')}`);
    }

    // Sun
    if (!VALID_SUN.includes(data.sun as SunRequirement)) {
      errors.push(`sun: must be one of ${VALID_SUN.join(', ')}`);
    }

    // Bilingual fields
    errors.push(...validateBilingualText(data.name, 'name'));
    errors.push(...validateBilingualText(data.maintenanceNotes, 'maintenanceNotes'));

    // Calendar
    if (data.calendar && typeof data.calendar === 'object') {
      const cal = data.calendar as Record<string, unknown>;
      for (const key of ['indoorSowing', 'greenhouse', 'coldGreenhouse', 'outdoor']) {
        const val = cal[key];
        if (val !== null && (!Array.isArray(val) || val.length !== 2)) {
          warnings.push(`calendar.${key}: should be [start, end] or null`);
        }
      }
    } else {
      errors.push('calendar: required object');
    }

    // Arrays
    if (!Array.isArray(data.colors)) warnings.push('colors: should be an array');
    if (!Array.isArray(data.images)) warnings.push('images: should be an array');
    if (!Array.isArray(data.careSteps)) warnings.push('careSteps: should be an array');
    if (!Array.isArray(data.plantingConditions)) warnings.push('plantingConditions: should be an array');

    // Name corrections
    const nameCorrections = data.nameCorrections as Record<string, string> | undefined;
    const hasNameCorrections = !!nameCorrections && typeof nameCorrections === 'object';

    // Force status to unverified
    data.status = 'unverified';

    return {
      valid: errors.length === 0,
      plant: data as unknown as Plant,
      errors,
      warnings,
      hasNameCorrections,
      nameCorrections: hasNameCorrections ? nameCorrections as ValidationResult['nameCorrections'] : undefined,
    };
  }

  function parseAndValidate(jsonString: string): { results: ValidationResult[]; parseError?: string } {
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonString);
    } catch (e) {
      return { results: [], parseError: `Invalid JSON: ${(e as Error).message}` };
    }

    if (!Array.isArray(parsed)) {
      // Single plant object
      if (typeof parsed === 'object' && parsed !== null) {
        parsed = [parsed];
      } else {
        return { results: [], parseError: 'Expected a JSON array of plant objects' };
      }
    }

    const results = (parsed as Record<string, unknown>[]).map((item) => validatePlant(item));
    return { results };
  }

  return { validatePlant, parseAndValidate };
}
