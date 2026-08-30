import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, updateDoc, doc, addDoc, query, where } from "firebase/firestore";

export async function GET() {
  try {
    let result = [];
    
    // FBM
    let fbmBatchId = null;
    let fbmBatchName = "b1";
    const fbmBatchesSnap = await getDocs(collection(db, "fbm_batches"));
    fbmBatchesSnap.forEach(d => {
      if (d.data().name.toLowerCase() === "batch 1" || d.data().name.toLowerCase() === "b1") {
        fbmBatchId = d.id;
        fbmBatchName = d.data().name;
      }
    });
    if (!fbmBatchId) {
      const newBatch = await addDoc(collection(db, "fbm_batches"), { name: "b1", createdAt: new Date() });
      fbmBatchId = newBatch.id;
    }
    const fbmEntriesSnap = await getDocs(query(collection(db, "accounting_entries"), where("type", "==", "FBM")));
    let fbmCount = 0;
    for (const entry of fbmEntriesSnap.docs) {
      const data = entry.data();
      if (!data.batchId) {
        await updateDoc(entry.ref, { batchId: fbmBatchId, batchName: fbmBatchName });
        fbmCount++;
      }
    }
    result.push(`FBM Migrated: ${fbmCount}`);

    // Offline
    let offlineBatchId = null;
    let offlineBatchName = "b1";
    const offlineBatchesSnap = await getDocs(collection(db, "offline_batches"));
    offlineBatchesSnap.forEach(d => {
      if (d.data().name.toLowerCase() === "batch 1" || d.data().name.toLowerCase() === "b1") {
        offlineBatchId = d.id;
        offlineBatchName = d.data().name;
      }
    });
    if (!offlineBatchId) {
      const newBatch = await addDoc(collection(db, "offline_batches"), { name: "b1", createdAt: new Date() });
      offlineBatchId = newBatch.id;
    }
    const offlineEntriesSnap = await getDocs(query(collection(db, "accounting_entries"), where("type", "==", "Offline")));
    let offlineCount = 0;
    for (const entry of offlineEntriesSnap.docs) {
      const data = entry.data();
      if (!data.batchId) {
        await updateDoc(entry.ref, { batchId: offlineBatchId, batchName: offlineBatchName });
        offlineCount++;
      }
    }
    result.push(`Offline Migrated: ${offlineCount}`);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
