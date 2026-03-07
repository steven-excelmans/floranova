import type { Plant, PlantType, PlantLifecycle, GerminationType, SunRequirement, PropagationType } from 'src/types/plant';
import { normalizeMonthRange } from 'src/types/plant';

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
const VALID_LIFECYCLES: PlantLifecycle[] = ['annual', 'biennial', 'perennial'];
const VALID_GERMINATION: GerminationType[] = ['light', 'dark'];
const VALID_SUN: SunRequirement[] = ['full-sun', 'partial-shade', 'shade'];
const VALID_PROPAGATION: PropagationType[] = ['seed', 'tuber'];

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

function stripQuotedVariety(name: string, variety: string): string {
  // Strip variety from name if it appears as a quoted suffix like "Zinnia 'Queen Lime'"
  for (const [open, close] of [["'", "'"], ['\u2018', '\u2019']]) {
    const suffix = `${open}${variety}${close}`;
    if (name.endsWith(suffix)) return name.slice(0, -suffix.length).trimEnd();
  }
  return name;
}

export function usePlantValidator() {
  function validatePlant(data: Record<string, unknown>, existingPlants?: Plant[]): ValidationResult {
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

    // Lifecycle (optional — default to 'annual' if missing)
    if (data.lifecycle && !VALID_LIFECYCLES.includes(data.lifecycle as PlantLifecycle)) {
      warnings.push(`lifecycle: must be one of ${VALID_LIFECYCLES.join(', ')}`);
    }
    if (!data.lifecycle) {
      data.lifecycle = 'annual';
    }

    // Propagation (optional — default to 'seed' if missing)
    if (data.propagation && !VALID_PROPAGATION.includes(data.propagation as PropagationType)) {
      warnings.push(`propagation: must be one of ${VALID_PROPAGATION.join(', ')}`);
    }
    if (!data.propagation) {
      data.propagation = 'seed';
    }

    // Germination (not required for tubers)
    if (data.propagation !== 'tuber' && !VALID_GERMINATION.includes(data.germination as GerminationType)) {
      errors.push(`germination: must be one of ${VALID_GERMINATION.join(', ')}`);
    }

    // Sun
    if (!VALID_SUN.includes(data.sun as SunRequirement)) {
      errors.push(`sun: must be one of ${VALID_SUN.join(', ')}`);
    }

    // Bilingual fields
    errors.push(...validateBilingualText(data.name, 'name'));
    errors.push(...validateBilingualText(data.maintenanceNotes, 'maintenanceNotes'));

    // Calendar — backward compat: rename bloomPeriod → harvestPeriod
    if (data.calendar && typeof data.calendar === 'object') {
      const cal = data.calendar as Record<string, unknown>;
      if (cal.bloomPeriod !== undefined && cal.harvestPeriod === undefined) {
        cal.harvestPeriod = cal.bloomPeriod;
        delete cal.bloomPeriod;
      }
      for (const key of ['indoorSowing', 'coldGreenhouse', 'outdoor', 'harvestPeriod']) {
        const val = cal[key];
        if (val !== null && !Array.isArray(val)) {
          warnings.push(`calendar.${key}: should be an array of months or null`);
        }
      }
    } else {
      errors.push('calendar: required object');
    }

    // Arrays
    if (!Array.isArray(data.colors)) warnings.push('colors: should be an array');
    if (!Array.isArray(data.images)) {
      warnings.push('images: should be an array');
    } else {
      // Normalize string URLs to PlantImage objects
      data.images = (data.images as (string | Record<string, unknown>)[]).map((img) =>
        typeof img === 'string' ? { url: img } : img,
      );
    }
    if (!Array.isArray(data.careSteps)) warnings.push('careSteps: should be an array');
    if (!Array.isArray(data.plantingConditions)) warnings.push('plantingConditions: should be an array');

    // Clean up quoted variety in name and latinName fields
    if (data.variety && typeof data.variety === 'string') {
      const variety = data.variety;
      if (data.name && typeof data.name === 'object') {
        const nameObj = data.name as Record<string, string>;
        if (nameObj.nl) nameObj.nl = stripQuotedVariety(nameObj.nl, variety);
        if (nameObj.en) nameObj.en = stripQuotedVariety(nameObj.en, variety);
      }
      if (typeof data.latinName === 'string') {
        data.latinName = stripQuotedVariety(data.latinName, variety);
      }
    }

    // Duplicate detection — warn if same species+variety already exists
    if (existingPlants && typeof data.species === 'string') {
      const dupe = existingPlants.find(
        (p) => p.id !== data.id && p.species === data.species && (p.variety || null) === (data.variety || null),
      );
      if (dupe) {
        warnings.push(`Duplicate: ${dupe.id} has the same species/variety`);
      }
    }

    // Name corrections
    const nameCorrections = data.nameCorrections as Record<string, string> | undefined;
    const hasNameCorrections = !!nameCorrections && typeof nameCorrections === 'object';

    // Force status to unverified
    data.status = 'unverified';

    // Normalize legacy [start, end] calendar ranges to month arrays
    if (data.calendar && typeof data.calendar === 'object') {
      const cal = data.calendar as Record<string, unknown>;
      for (const key of ['indoorSowing', 'coldGreenhouse', 'outdoor', 'harvestPeriod']) {
        if (Array.isArray(cal[key])) {
          cal[key] = normalizeMonthRange(cal[key] as number[]);
        }
      }
    }

    return {
      valid: errors.length === 0,
      plant: data as unknown as Plant,
      errors,
      warnings,
      hasNameCorrections,
      nameCorrections: hasNameCorrections ? nameCorrections as ValidationResult['nameCorrections'] : undefined,
    };
  }

  function parseAndValidate(jsonString: string, existingPlants?: Plant[]): { results: ValidationResult[]; parseError?: string } {
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

    const results = (parsed as Record<string, unknown>[]).map((item) => validatePlant(item, existingPlants));
    return { results };
  }

  return { validatePlant, parseAndValidate };
}
