import { useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function FirebaseSmokeTest() {
  useEffect(() => {
    (async () => {
      try {
        const ref = await addDoc(collection(db, "smokeTest"), {
          ok: true,
          at: serverTimestamp(),
        });
        console.log("✅ Firestore write succeeded:", ref.id);
      } catch (e) {
        console.error("🔥 Firestore test failed:", e?.code, e?.message);
      }
    })();
  }, []);
  return null;
}