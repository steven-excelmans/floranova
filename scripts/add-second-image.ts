import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp({ credential: applicationDefault(), projectId: 'floranova-2cb63' });
const db = getFirestore();

const UPLOAD_URL = 'https://api.cloudinary.com/v1_1/dpultori7/image/upload';

async function upload(plantId: string, imageUrl: string): Promise<string> {
  const formData = new URLSearchParams();
  formData.append('file', imageUrl);
  formData.append('upload_preset', 'floranova-preset');
  formData.append('folder', `plants/${plantId}`);
  const r = await fetch(UPLOAD_URL, { method: 'POST', body: formData });
  if (r.ok === false) throw new Error(await r.text());
  const d = await r.json();
  return d.secure_url;
}

async function run() {
  const id = 'helianthus-astra-rose-cream';
  const url = 'https://www.magicgardenseeds.com/media/image/product/20971/lg/altrosa-sonnenblume-astra-rose-helianthus-annuus-samen~5.jpg';
  try {
    const cloudUrl = await upload(id, url);
    console.log('Uploaded:', cloudUrl);
    const doc = await db.collection('plants').doc(id).get();
    const existing = doc.data()?.images || [];
    existing.push({ url: cloudUrl });
    await db.collection('plants').doc(id).update({ images: existing, updatedAt: new Date().toISOString() });
    console.log('Firestore updated with 2nd image');
  } catch (e) {
    console.error('Failed:', e);
  }
}

run().then(() => process.exit(0));
