import type { Plant } from 'src/types/plant';

const SCHEMA_DESCRIPTION = `
Plant Data Schema:
{
  id: string,              // MUST use the exact id provided in the plant list above
  species: string,         // Botanical species name (e.g. "Centaurea cyanus")
  variety: string | null,  // Cultivar name or null
  latinName: string,       // Species name only (e.g. "Cosmos bipinnatus"), NO variety
  name: {
    nl: string,            // Dutch common name
    en: string             // English common name
  },
  type: "flower" | "vegetable" | "herb",
  lifecycle: "annual" | "biennial" | "perennial",
  propagation: "seed" | "tuber",           // "tuber" for bulbs/tubers (dahlias, gladiolus, etc.)
  calendar: {
    indoorSowing: number[] | null,    // e.g. [3, 4, 5] for March-May (list each month)
    coldGreenhouse: number[] | null,
    outdoor: number[] | null,
    harvestPeriod: number[] | null    // For flowers: bloom period. For vegetables/herbs: harvest period.
  },
  germination: "light" | "dark",
  colors: [{ name: string, hex: string }],          // Flower/leaf colors
  images: [],                                          // Leave empty — images are managed separately
  heightCm: { min: number, max: number } | null,
  sowingDepthMm: number | null,
  germinationDays: { min: number, max: number } | null,
  germinationTempC: { min: number, max: number } | null,
  pinching: boolean,
  seedsPerCell: number | null,
  careSteps: [{
    action: { nl: string, en: string },
    condition: {
      type: "days" | "height" | "leaves" | "temperature" | "date" | "custom",  // STRICT: only these 6 values allowed
      value: number | string | null,
      unit: string | null,
      description: { nl: string, en: string }
    },
    order: number
  }],
  maintenanceNotes: { nl: string, en: string },
  plantingConditions: ("tray" | "pot" | "outdoor" | "sprout-tray")[],
  minDistanceCm: number,
  stemTips: { nl: string, en: string } | null,      // Only for cut flowers
  sun: "full-sun" | "partial-shade" | "shade",
  status: "unverified"                                // Always set to "unverified" for imports
}
`.trim();

export function usePromptGenerator() {
  function generatePrompt(plants: Plant[], examplePlant?: Plant): string {
    const plantList = plants
      .map((p) => `- ${p.species}${p.variety ? ` '${p.variety}'` : ''} [id: "${p.id}"]`)
      .join('\n');

    const exampleJson = examplePlant
      ? JSON.stringify(examplePlant, null, 2)
      : '(no example available)';

    return `You are a horticultural data assistant. Research the following plants and provide complete, accurate data for each one.

## Name Validation
For each plant, verify the species and variety names are correct. If a name appears misspelled, doesn't exist, or uses an outdated synonym, suggest the correct name and explain the correction. Include a "nameCorrections" field ONLY for plants where names were corrected.

## Plants to Research
The names below may be informal, Dutch, or abbreviated. Identify the correct botanical species and variety for each.
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
6. Set images to an empty array []. Images are managed separately.
7. Set status to "unverified" for all plants
8. For tuber/bulb plants: set propagation to "tuber", germination fields (germination, germinationDays, germinationTempC, seedsPerCell) can be null. Calendar indoorSowing = pre-sprout period, outdoor = planting period.
9. harvestPeriod: for flowers = bloom period, for vegetables/herbs = harvest period. List the months when the plant blooms or produces harvest.
10. For microgreens/sprouts (e.g. garden cress): use plantingConditions ["sprout-tray"], indoorSowing year-round [1-12], harvestPeriod year-round [1-12], add a care step for harvest timing.
11. IMPORTANT: Use the exact id provided in [id: "..."] for each plant. Do NOT generate your own IDs.
12. STRICT ENUM VALIDATION: careSteps condition.type MUST be exactly one of: "days", "height", "leaves", "temperature", "date", "custom". Do NOT use any other values (e.g. no "calendar", "continuous", "duration", "growth", "time", etc.)
13. plantingConditions MUST only contain: "tray", "pot", "outdoor", "sprout-tray". No other values.
14. IMPORTANT: The "name" field must contain ONLY the common name WITHOUT the variety. Example: for Zinnia elegans 'Queen Lime', name should be { nl: "Zinnia", en: "Zinnia" } — NOT "Zinnia 'Queen Lime'". The variety is stored separately in the "variety" field. Similarly, "latinName" must be ONLY the species name (e.g. "Cosmos bipinnatus"), never include the variety (NOT "Cosmos bipinnatus 'Apricotta'").

## Output Format
Respond in TWO steps:

### Step 1 — Name Resolution (for user verification)
First, output a markdown table mapping each input name to the resolved botanical name. Flag any ambiguous or uncertain matches with a warning. Example:
| # | Input name | Resolved species | Resolved variety | Notes |
|---|---|---|---|---|
| 1 | basilicum | Ocimum basilicum | Genovese | Assumed Genovese (most common) |
| 2 | zonnebloem herfstschone | Helianthus annuus | Autumn Beauty | Dutch name |

Then ask: "Please confirm these matches before I proceed with the full research."

### Step 2 — Full JSON (after confirmation)
Once confirmed, respond with a JSON array containing the plant objects. No explanations — just valid JSON:
\`\`\`json
[
  { ... plant 1 ... },
  { ... plant 2 ... }
]
\`\`\``;
  }

  function generateImagePrompt(plants: Plant[]): string {
    const plantList = plants
      .map((p, i) => {
        const colors = p.colors.map((c) => c.name).join(', ');
        const typeLabel = p.type === 'flower' ? 'Flower' : p.type === 'herb' ? 'Herb' : 'Vegetable';
        return `${i + 1}. id: "${p.id}" — ${p.species}${p.variety ? ` '${p.variety}'` : ''}
   Type: ${typeLabel}${colors ? `, ${colors} colored` : ''}`;
      })
      .join('\n');

    return `Find one high-quality image URL for each of these ${plants.length} plants. Use Wikimedia Commons (upload.wikimedia.org) as primary source.

Search strategy:
1. Search "[species name] site:commons.wikimedia.org"
2. Use the Wikimedia API to get direct URLs: https://en.wikipedia.org/w/api.php?action=query&titles=File:FILENAME&prop=imageinfo&iiprop=url&format=json
3. All URLs must be direct links (upload.wikimedia.org/wikipedia/commons/...)

Plants:
${plantList}

## Output Format
Respond with a JSON object using the plant ID as key. This JSON can be pasted directly into the app's import page.

\`\`\`json
{
  "${plants[0]?.id ?? 'plant-id'}": {
    "species": "${plants[0]?.species ?? 'Species name'}",
    "url": "https://upload.wikimedia.org/wikipedia/commons/..."
  }
}
\`\`\`

IMPORTANT:
- Use the exact plant IDs shown above as JSON keys
- Include "species" for reference and "url" with the direct image URL
- Skip plants where no suitable free image exists (omit from JSON)
- Prefer variety-specific images, fall back to species-level if needed`;
  }

  return { generatePrompt, generateImagePrompt };
}
