/**
 * Fill all missing data fields in Firestore plants.
 * Usage: npx tsx scripts/fill-gaps.ts
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp({ credential: applicationDefault(), projectId: 'floranova-2cb63' });
const db = getFirestore();

// Researched sowing depths (mm) for each plant
const sowingDepths: Record<string, number> = {
  'achillea-millefolium-colorado': 0,          // surface sow, light germinator
  'antirrhinum-doubleshot-peach': 0,           // surface sow, needs light
  'antirrhinum-potomac-appleblossom': 0,       // surface sow, needs light
  'cosmos-bipinnatus-kiiro': 6,                // 6mm deep
  'craspedia-drumstick': 0,                    // surface sow, light germinator
  'dipsacus-fullonum': 5,                      // 5mm deep
  'eschscholzia-thai-silk-pink-champagne': 3,  // 3mm, barely cover
  'gomphrena-globosa-qis-mix': 3,             // 3mm, lightly cover
  'sanguisorba-officinalis-red-thunder': 3,    // 3mm, barely cover
  'scabiosa-stellata-drumstick': 5,            // 5mm deep
  'scabiosa-summer-fruits': 5,                 // 5mm deep
  'verbascum-southern-charm': 0,               // surface sow, needs light
  'xerochrysum-bracteatum-creamy-white': 0,    // surface sow, light germinator
  'xerochrysum-bracteatum-pretty-pink': 0,     // surface sow, light germinator
};

// Missing harvest/bloom periods
const harvestPeriods: Record<string, number[]> = {
  'centaurea-cyanus-classic-magic': [6, 7, 8, 9],   // June-September
  'craspedia-drumstick': [6, 7, 8, 9],              // June-September
  'helianthus-astra-rose-cream': [7, 8, 9, 10],     // July-October
};

// Missing care steps
const careSteps: Record<string, any[]> = {
  'eschscholzia-thai-silk-pink-champagne': [
    {
      action: { nl: 'Uitdunnen', en: 'Thin seedlings' },
      condition: { type: 'height', value: 5, unit: 'cm', description: { nl: 'Wanneer zaailingen 5cm hoog zijn, uitdunnen op 15cm afstand', en: 'When seedlings are 5cm tall, thin to 15cm apart' } },
      order: 1,
    },
    {
      action: { nl: 'Uitplanten', en: 'Plant outside' },
      condition: { type: 'date', value: null, unit: null, description: { nl: 'Na de laatste vorst, eind april/mei', en: 'After last frost, late April/May' } },
      order: 2,
    },
  ],
  'nigella-damascena-persian-jewels-mix': [
    {
      action: { nl: 'Uitdunnen', en: 'Thin seedlings' },
      condition: { type: 'height', value: 5, unit: 'cm', description: { nl: 'Uitdunnen op 20-25cm afstand', en: 'Thin to 20-25cm apart' } },
      order: 1,
    },
    {
      action: { nl: 'Uitplanten', en: 'Plant outside' },
      condition: { type: 'date', value: null, unit: null, description: { nl: 'Na de laatste vorst. Niet verspenen, zaai direct op eindplek.', en: 'After last frost. Do not transplant, sow directly in final position.' } },
      order: 2,
    },
  ],
  'phacelia-tanacetifolia': [
    {
      action: { nl: 'Uitdunnen', en: 'Thin seedlings' },
      condition: { type: 'height', value: 5, unit: 'cm', description: { nl: 'Uitdunnen op 20cm afstand', en: 'Thin to 20cm apart' } },
      order: 1,
    },
  ],
  'phalaris-canariensis': [
    {
      action: { nl: 'Uitdunnen', en: 'Thin seedlings' },
      condition: { type: 'height', value: 5, unit: 'cm', description: { nl: 'Uitdunnen op 15cm afstand', en: 'Thin to 15cm apart' } },
      order: 1,
    },
    {
      action: { nl: 'Oogsten voor droogbloemen', en: 'Harvest for dried flowers' },
      condition: { type: 'custom', value: null, unit: null, description: { nl: 'Oogst wanneer de pluimen nog groen zijn voor mooiste droogresultaat', en: 'Harvest while plumes are still green for best drying result' } },
      order: 2,
    },
  ],
};

// Missing stem tips for beets (harvest/cooking tips instead)
const stemTips: Record<string, { nl: string; en: string }> = {
  'beta-vulgaris-burpees-golden': {
    nl: 'Oogst bij 5-8cm diameter voor de zoetste smaak. Bladeren zijn ook eetbaar als snijbiet. Goudgele kleur blijft behouden bij het koken — geen bloedend sap.',
    en: 'Harvest at 5-8cm diameter for sweetest flavor. Leaves are also edible as chard. Golden color is retained when cooking — no bleeding juice.',
  },
  'beta-vulgaris-chioggia': {
    nl: 'Oogst bij 5-8cm diameter. De kenmerkende rode-witte ringen zijn het mooist rauw of kort gekookt. Lang koken doet de ringen vervagen.',
    en: 'Harvest at 5-8cm diameter. The distinctive red-white rings show best raw or briefly cooked. Prolonged cooking fades the rings.',
  },
};

async function fillGaps() {
  const snap = await db.collection('plants').get();
  let updated = 0;

  for (const doc of snap.docs) {
    const p = doc.data();
    const id = p.id || doc.id;
    const updates: Record<string, any> = {};

    // Fill sowingDepthMm
    if ((p.sowingDepthMm === null || p.sowingDepthMm === undefined) && id in sowingDepths) {
      updates.sowingDepthMm = sowingDepths[id];
    }

    // Fill harvestPeriod
    if (p.calendar && (!p.calendar.harvestPeriod || p.calendar.harvestPeriod.length === 0) && id in harvestPeriods) {
      updates['calendar.harvestPeriod'] = harvestPeriods[id];
    }

    // Fill careSteps
    if ((!p.careSteps || p.careSteps.length === 0) && id in careSteps) {
      updates.careSteps = careSteps[id];
    }

    // Fill stemTips
    if ((!p.stemTips || !p.stemTips.en) && id in stemTips) {
      updates.stemTips = stemTips[id];
    }

    if (Object.keys(updates).length > 0) {
      updates.updatedAt = new Date().toISOString();
      await db.collection('plants').doc(doc.id).update(updates);
      console.log(`✓ ${id}: ${Object.keys(updates).filter(k => k !== 'updatedAt').join(', ')}`);
      updated++;
    }
  }

  console.log(`\nDone! Updated ${updated} plants.`);
}

fillGaps().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
