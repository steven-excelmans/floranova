import type { Plant } from 'src/types/plant';

const SCHEMA_DESCRIPTION = `
Plant Data Schema:
{
  id: string,              // slug: "species-variety" in lowercase, hyphens
  species: string,         // Botanical species name (e.g. "Centaurea cyanus")
  variety: string | null,  // Cultivar name or null
  latinName: string,       // Full Latin name
  name: {
    nl: string,            // Dutch common name
    en: string             // English common name
  },
  type: "flower" | "vegetable" | "herb",
  calendar: {
    indoorSowing: [startMonth, endMonth] | null,    // e.g. [3, 4] for March-April
    greenhouse: [startMonth, endMonth] | null,
    coldGreenhouse: [startMonth, endMonth] | null,
    outdoor: [startMonth, endMonth] | null
  },
  germination: "light" | "dark",
  colors: [{ name: string, hex: string }],          // Flower/leaf colors
  images: string[],                                  // Wikipedia or public domain URLs
  heightCm: { min: number, max: number } | null,
  sowingDepthMm: number | null,
  germinationDays: { min: number, max: number } | null,
  germinationTempC: { min: number, max: number } | null,
  pinching: boolean,
  seedsPerCell: number | null,
  careSteps: [{
    action: { nl: string, en: string },
    condition: {
      type: "days" | "height" | "leaves" | "temperature" | "date" | "custom",
      value: number | string | null,
      unit: string | null,
      description: { nl: string, en: string }
    },
    order: number
  }],
  maintenanceNotes: { nl: string, en: string },
  plantingConditions: ("tray" | "outside-direct" | "p9-pot" | "small-pot" | "big-pot" | "module-tray")[],
  minDistanceCm: number,
  stemTips: { nl: string, en: string } | null,      // Only for cut flowers
  sun: "full-sun" | "partial-shade" | "shade",
  status: "unverified"                                // Always set to "unverified" for imports
}
`.trim();

export function usePromptGenerator() {
  function generatePrompt(plants: Plant[], examplePlant?: Plant): string {
    const plantList = plants
      .map((p) => `- ${p.species}${p.variety ? ` '${p.variety}'` : ''}`)
      .join('\n');

    const exampleJson = examplePlant
      ? JSON.stringify(examplePlant, null, 2)
      : '(no example available)';

    return `You are a horticultural data assistant. Research the following plants and provide complete, accurate data for each one.

## Name Validation
For each plant, verify the species and variety names are correct. If a name appears misspelled, doesn't exist, or uses an outdated synonym, suggest the correct name and explain the correction. Include a "nameCorrections" field ONLY for plants where names were corrected.

## Plants to Research
${plantList}

## Output Schema
${SCHEMA_DESCRIPTION}

## Name Corrections Format
If you correct any names, add this field to the plant object:
{
  "nameCorrections": {
    "originalSpecies": "the species as provided",
    "originalVariety": "the variety as provided",
    "correctedSpecies": "the correct species name",
    "correctedVariety": "the correct variety name"
  }
}

## Example Plant
Here is a complete example of what the output should look like:
\`\`\`json
${exampleJson}
\`\`\`

## Instructions
1. Research each plant thoroughly using reliable horticultural sources
2. All bilingual fields must include both Dutch (nl) and English (en) text
3. Calendar months are 1-12 (January=1, December=12), specific to Belgian/Western European climate
4. Care steps should be ordered chronologically after germination
5. Colors should include name and exact hex code
6. For images, use Wikipedia Commons or other public domain sources
7. Set status to "unverified" for all plants
8. Generate the id as a slug from species + variety

## Output Format
Respond with a JSON array containing the plant objects:
\`\`\`json
[
  { ... plant 1 ... },
  { ... plant 2 ... }
]
\`\`\``;
  }

  return { generatePrompt };
}
