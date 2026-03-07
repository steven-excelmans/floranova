/**
 * Add 4 new plants to Firestore.
 * Usage: npx tsx scripts/add-new-plants.ts
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp({ credential: applicationDefault(), projectId: 'floranova-2cb63' });
const db = getFirestore();

const plants = [
  {
    id: 'alcea-rosea-spring-celebrities-apricot',
    species: 'Alcea rosea',
    variety: 'Spring Celebrities Apricot',
    latinName: 'Alcea rosea',
    name: { nl: 'Stokroos Spring Celebrities Apricot', en: 'Hollyhock Spring Celebrities Apricot' },
    type: 'flower',
    lifecycle: 'annual',
    propagation: 'seed',
    calendar: {
      indoorSowing: [2, 3],
      coldGreenhouse: [4],
      outdoor: null,
      harvestPeriod: [7, 8, 9],
    },
    germination: 'light',
    colors: [
      { name: 'apricot', hex: '#FBCEB1' },
      { name: 'peach', hex: '#FFDAB9' },
    ],
    images: [],
    heightCm: { min: 60, max: 80 },
    sowingDepthMm: 1,
    germinationDays: { min: 10, max: 14 },
    germinationTempC: { min: 18, max: 22 },
    pinching: false,
    seedsPerCell: 1,
    careSteps: [
      {
        action: { nl: 'Oppotten in individuele pot', en: 'Pot up into individual pot' },
        condition: { type: 'leaves', value: 2, unit: 'leaves', description: { nl: 'Wanneer zaailingen 2 echte blaadjes hebben. Voorzichtig hanteren aan het blad, niet aan de stengel.', en: 'When seedlings have 2 true leaves. Handle carefully by the leaf, not the stem.' } },
        order: 1,
      },
      {
        action: { nl: 'Afharden in koude kas', en: 'Harden off in cold greenhouse' },
        condition: { type: 'date', value: null, unit: null, description: { nl: 'Vanaf half april geleidelijk afharden gedurende 7-10 dagen.', en: 'From mid-April, gradually harden off over 7-10 days.' } },
        order: 2,
      },
      {
        action: { nl: 'Uitplanten', en: 'Plant outside' },
        condition: { type: 'date', value: null, unit: null, description: { nl: 'Na de laatste vorst (half mei). Volle zon, goed doorlatende grond.', en: 'After last frost (mid-May). Full sun, well-drained soil.' } },
        order: 3,
      },
    ],
    maintenanceNotes: {
      nl: 'Dwergvarieteit die het eerste jaar bloeit vanuit zaad. Verbeterde resistentie tegen roest. Zorg voor goede luchtcirculatie. Verwijder uitgebloeide bloemen om de bloei te verlengen. Geschikt voor potten en containers. Verdraagt geen wateroverlast.',
      en: 'Dwarf variety that flowers the first year from seed. Improved rust resistance. Ensure good air circulation. Deadhead regularly to prolong flowering. Suitable for pots and containers. Cannot tolerate waterlogged soil.',
    },
    plantingConditions: ['tray', 'pot'],
    minDistanceCm: 40,
    stemTips: {
      nl: 'Oogst wanneer de onderste 2-3 bloemen open zijn. Verwijder bladeren onder de waterlijn. Vaaslevensduur 5-7 dagen. Stengels schuin afsnijden.',
      en: 'Harvest when the bottom 2-3 flowers are open. Remove foliage below the waterline. Vase life 5-7 days. Cut stems at an angle.',
    },
    sun: 'full-sun',
    status: 'unverified',
    nameCorrections: {
      originalSpecies: 'Alcea Rosae',
      originalVariety: 'Sprint Celeberty Apricot',
      correctedSpecies: 'Alcea rosea',
      correctedVariety: 'Spring Celebrities Apricot',
    },
  },
  {
    id: 'celosia-spicata-celway-terracotta',
    species: 'Celosia spicata',
    variety: 'Celway Terracotta',
    latinName: 'Celosia argentea var. spicata',
    name: { nl: 'Tarwecelosia Celway Terracotta', en: 'Wheat Celosia Celway Terracotta' },
    type: 'flower',
    lifecycle: 'annual',
    propagation: 'seed',
    calendar: {
      indoorSowing: [3, 4],
      coldGreenhouse: null,
      outdoor: null,
      harvestPeriod: [7, 8, 9, 10],
    },
    germination: 'light',
    colors: [
      { name: 'terracotta', hex: '#CC5833' },
      { name: 'salmon', hex: '#FA8072' },
    ],
    images: [],
    heightCm: { min: 90, max: 120 },
    sowingDepthMm: 0,
    germinationDays: { min: 6, max: 15 },
    germinationTempC: { min: 21, max: 29 },
    pinching: true,
    seedsPerCell: 1,
    careSteps: [
      {
        action: { nl: 'Zaailingen afkweken bij lagere temperatuur', en: 'Grow seedlings at lower temperature' },
        condition: { type: 'days', value: 10, unit: 'days', description: { nl: 'Na opkomst, kweken bij 17-20C. Vermijd temperaturen onder 15C om premature bloei te voorkomen.', en: 'After emergence, grow at 17-20C. Avoid temperatures below 15C to prevent premature flowering.' } },
        order: 1,
      },
      {
        action: { nl: 'Toppen', en: 'Pinch' },
        condition: { type: 'height', value: 15, unit: 'cm', description: { nl: 'Wanneer zaailingen ca. 15 cm hoog zijn, top afknijpen om vertakking te bevorderen.', en: 'When seedlings are approx. 15 cm tall, pinch the growing tip to promote branching.' } },
        order: 2,
      },
      {
        action: { nl: 'Afharden', en: 'Harden off' },
        condition: { type: 'days', value: 7, unit: 'days', description: { nl: 'Geleidelijk afharden gedurende 7-10 dagen voor uitplanten. Pas na de laatste vorst.', en: 'Gradually harden off over 7-10 days before transplanting. Only after last frost.' } },
        order: 3,
      },
      {
        action: { nl: 'Uitplanten', en: 'Plant outside' },
        condition: { type: 'date', value: null, unit: null, description: { nl: 'Na de laatste vorst, wanneer nachttemperatuur boven 10C blijft. Celosia is zeer vorstgevoelig.', en: 'After last frost, when nighttime temperatures stay above 10C. Celosia is very frost-sensitive.' } },
        order: 4,
      },
    ],
    maintenanceNotes: {
      nl: 'Warmteminnend gewas, gedijt het best bij volle zon en warme zomers. Compostrijke, goed doorlatende grond. Regelmatig water geven maar niet te nat houden. Uitstekende snijbloem en droogbloem; oogst wanneer de aren volledig gekleurd zijn. Blijft de hele zomer doorbloeien bij regelmatig oogsten.',
      en: 'Heat-loving crop, thrives in full sun and warm summers. Compost-rich, well-drained soil. Water regularly but do not keep too wet. Excellent cut flower and dried flower; harvest when spikes are fully colored. Continues blooming all summer when harvested regularly.',
    },
    plantingConditions: ['tray'],
    minDistanceCm: 20,
    stemTips: {
      nl: 'Oogst wanneer de aren bijna volledig gekleurd zijn maar de top nog enigszins groen is. Vaaslevensduur 10-14 dagen. Droogt uitstekend: hang ondersteboven op een droge, donkere plek.',
      en: 'Harvest when spikes are nearly fully colored but the tip is still slightly green. Vase life 10-14 days. Dries excellently: hang upside down in a dry, dark location.',
    },
    sun: 'full-sun',
    status: 'unverified',
  },
  {
    id: 'callistephus-chinensis-apricot',
    species: 'Callistephus chinensis',
    variety: 'Apricot',
    latinName: 'Callistephus chinensis',
    name: { nl: 'Chinese Aster Apricot', en: 'Chinese Aster Apricot' },
    type: 'flower',
    lifecycle: 'annual',
    propagation: 'seed',
    calendar: {
      indoorSowing: [3, 4],
      coldGreenhouse: [4, 5],
      outdoor: [5, 6],
      harvestPeriod: [7, 8, 9, 10],
    },
    germination: 'light',
    colors: [
      { name: 'apricot', hex: '#FBCEB1' },
      { name: 'peach', hex: '#FFDAB9' },
    ],
    images: [],
    heightCm: { min: 50, max: 80 },
    sowingDepthMm: 3,
    germinationDays: { min: 8, max: 14 },
    germinationTempC: { min: 15, max: 20 },
    pinching: true,
    seedsPerCell: 2,
    careSteps: [
      {
        action: { nl: 'Oppotten in grotere pot', en: 'Pot on into larger pot' },
        condition: { type: 'leaves', value: 4, unit: 'leaves', description: { nl: 'Wanneer zaailingen 2-3 echte bladparen hebben', en: 'When seedlings have 2-3 true leaf pairs' } },
        order: 1,
      },
      {
        action: { nl: 'Toppen (pinchen)', en: 'Pinch out growing tip' },
        condition: { type: 'height', value: 15, unit: 'cm', description: { nl: 'Wanneer plant ca. 15 cm hoog is, voor meer vertakking en bloemen', en: 'When plant is approx. 15 cm tall, to encourage branching and more blooms' } },
        order: 2,
      },
      {
        action: { nl: 'Afharden', en: 'Harden off' },
        condition: { type: 'days', value: 7, unit: 'days', description: { nl: 'Geleidelijk aan buitentemperatuur wennen gedurende 7-10 dagen', en: 'Gradually acclimatize to outdoor temperatures over 7-10 days' } },
        order: 3,
      },
      {
        action: { nl: 'Uitplanten', en: 'Plant outside' },
        condition: { type: 'date', value: null, unit: null, description: { nl: 'Na de laatste vorst (half mei in Belgie)', en: 'After last frost (mid-May in Belgium)' } },
        order: 4,
      },
    ],
    maintenanceNotes: {
      nl: 'Zeer gevoelig voor Aster-verwelkingsziekte (Fusarium oxysporum). Plant nooit twee jaar achtereen op dezelfde plek. Gebruik verse, goed doorlatende grond en vermijd overmatig water geven. Verwijder zieke planten onmiddellijk. Kalkhoudende grond (pH 6.5-7.5) helpt. Regelmatig bijmesten met kaliumrijke meststof tijdens de bloei.',
      en: 'Highly susceptible to Aster wilt (Fusarium oxysporum). Never plant in the same spot two years running. Use fresh, well-drained soil and avoid overwatering. Remove diseased plants immediately. Alkaline soil (pH 6.5-7.5) helps. Feed regularly with potassium-rich fertilizer during blooming.',
    },
    plantingConditions: ['tray', 'outdoor'],
    minDistanceCm: 25,
    stemTips: {
      nl: 'Oogst wanneer bloemen voor driekwart open zijn; ze openen verder op de vaas. Knip \'s ochtends vroeg en zet direct in water. Verwijder onderste bladeren. Vaaslevensduur 7-14 dagen. Uitstekende snijbloem voor late zomerboeketten.',
      en: 'Harvest when flowers are three-quarters open; they will continue opening in the vase. Cut early morning and place in water immediately. Remove lower foliage. Vase life 7-14 days. Excellent cut flower for late summer bouquets.',
    },
    sun: 'full-sun',
    status: 'unverified',
  },
  {
    id: 'thunbergia-alata-african-sunset',
    species: 'Thunbergia alata',
    variety: 'African Sunset',
    latinName: 'Thunbergia alata',
    name: { nl: 'Suzanne-met-de-mooie-ogen African Sunset', en: 'Black-eyed Susan Vine African Sunset' },
    type: 'flower',
    lifecycle: 'annual',
    propagation: 'seed',
    calendar: {
      indoorSowing: [3, 4],
      coldGreenhouse: null,
      outdoor: null,
      harvestPeriod: [6, 7, 8, 9, 10],
    },
    germination: 'dark',
    colors: [
      { name: 'terracotta', hex: '#CC5833' },
      { name: 'orange', hex: '#F97316' },
      { name: 'red', hex: '#EF4444' },
      { name: 'apricot', hex: '#FBCEB1' },
      { name: 'cream', hex: '#FFFDD0' },
    ],
    images: [],
    heightCm: { min: 150, max: 200 },
    sowingDepthMm: 6,
    germinationDays: { min: 14, max: 21 },
    germinationTempC: { min: 20, max: 25 },
    pinching: true,
    seedsPerCell: 2,
    careSteps: [
      {
        action: { nl: 'Zaden weken', en: 'Soak seeds' },
        condition: { type: 'custom', value: null, unit: null, description: { nl: 'Week de zaden een nacht in lauw water voor het zaaien om de kieming te versnellen', en: 'Soak seeds overnight in lukewarm water before sowing to speed up germination' } },
        order: 1,
      },
      {
        action: { nl: 'Oppotten', en: 'Pot on' },
        condition: { type: 'leaves', value: 2, unit: 'leaves', description: { nl: 'Wanneer zaailingen 2 echte blaadjes hebben, verpot naar 8 cm potjes', en: 'When seedlings have 2 true leaves, transplant to 8 cm pots' } },
        order: 2,
      },
      {
        action: { nl: 'Toppen', en: 'Pinch tips' },
        condition: { type: 'height', value: 15, unit: 'cm', description: { nl: 'Knip de groeipunten af wanneer de plant ca. 15 cm hoog is om vertakking te stimuleren', en: 'Pinch out growing tips when plant is approx. 15 cm tall to encourage branching' } },
        order: 3,
      },
      {
        action: { nl: 'Uitplanten met steun', en: 'Plant out with support' },
        condition: { type: 'date', value: null, unit: null, description: { nl: 'Na de laatste vorst (half mei). Plant bij een trellis, hek of klimsteun. Afstand 35-40 cm.', en: 'After last frost (mid-May). Plant near a trellis, fence or climbing support. Space 35-40 cm apart.' } },
        order: 4,
      },
    ],
    maintenanceNotes: {
      nl: 'Volle zon, vochtige maar goed doorlatende grond. Regelmatig water geven en bijmesten tijdens het groeiseizoen. Heeft een klimsteun nodig (trellis, gaas of draden). Niet vorstbestendig -- eenjarig in Belgie. Uitgebloeide bloemen verwijderen voor langere bloei.',
      en: 'Full sun, moist but well-drained soil. Water regularly and fertilize during the growing season. Requires climbing support (trellis, netting or wires). Not frost-hardy -- grown as annual in Belgium. Deadhead spent flowers to prolong blooming.',
    },
    plantingConditions: ['tray', 'pot'],
    minDistanceCm: 35,
    stemTips: null,
    sun: 'full-sun',
    status: 'unverified',
  },
];

async function addPlants() {
  const now = new Date().toISOString();

  for (const plant of plants) {
    const docRef = db.collection('plants').doc(plant.id);
    const existing = await docRef.get();
    if (existing.exists) {
      console.log(`SKIP ${plant.id} (already exists)`);
      continue;
    }

    await docRef.set({
      ...plant,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`+ ${plant.id}`);
  }

  console.log('\nDone!');
}

addPlants().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
