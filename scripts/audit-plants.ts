import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp({ credential: applicationDefault(), projectId: 'floranova-2cb63' });
const db = getFirestore();

async function audit() {
  const snap = await db.collection('plants').get();
  let withImages = 0;
  let withCloudinary = 0;
  let withBloom = 0;
  const total = snap.size;
  const issues: string[] = [];

  for (const doc of snap.docs) {
    const p = doc.data();
    const imgs: any[] = p.images || [];
    const hasAnyImage = imgs.length > 0;
    const hasCloudinary = imgs.some((i: any) => {
      const url = typeof i === 'string' ? i : i.url;
      return url && url.includes('cloudinary');
    });

    if (hasAnyImage) withImages++;
    if (hasCloudinary) withCloudinary++;
    if (p.calendar && p.calendar.harvestPeriod && p.calendar.harvestPeriod.length > 0) withBloom++;

    const missing: string[] = [];
    if (imgs.length === 0) missing.push('images');
    if (p.calendar && (!p.calendar.harvestPeriod || p.calendar.harvestPeriod.length === 0)) missing.push('harvestPeriod');
    if (p.heightCm === null || p.heightCm === undefined) missing.push('heightCm');
    if (p.propagation !== 'tuber' && (p.germinationDays === null || p.germinationDays === undefined)) missing.push('germinationDays');
    if (p.propagation !== 'tuber' && (p.germinationTempC === null || p.germinationTempC === undefined)) missing.push('germinationTempC');
    if (!p.careSteps || p.careSteps.length === 0) missing.push('careSteps');
    if (!p.maintenanceNotes || !p.maintenanceNotes.en) missing.push('maintenanceNotes');
    if (p.propagation !== 'tuber' && (p.sowingDepthMm === null || p.sowingDepthMm === undefined)) missing.push('sowingDepthMm');
    if (!p.colors || p.colors.length === 0) missing.push('colors');
    if (!p.stemTips || !p.stemTips.en) missing.push('stemTips');

    if (missing.length > 0) {
      issues.push(`${p.id}: ${missing.join(', ')}`);
    }
  }

  console.log(`Total plants: ${total}`);
  console.log(`With any images: ${withImages}`);
  console.log(`With Cloudinary images: ${withCloudinary}`);
  console.log(`With bloom/harvest: ${withBloom}`);
  console.log(`\n--- Plants with missing data (${issues.length}) ---`);
  for (const i of issues) {
    console.log(i);
  }
}

audit().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
