import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, onSnapshot, writeBatch, serverTimestamp } from "firebase/firestore";

export default function FollowButton({ me, target }) {
  const meUid = me?.uid;
  const targetUid = target?.uid;

  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (!meUid || !targetUid || meUid === targetUid) return;
    const ref = doc(db, "follows", meUid, "following", targetUid);
    return onSnapshot(ref, (snap) => setIsFollowing(snap.exists()));
  }, [meUid, targetUid]);

  // hide button on my own profile or if missing data
  if (!meUid || !targetUid || meUid === targetUid) return null;

  async function follow() {
    const batch = writeBatch(db);
    batch.set(
      doc(db, "follows", targetUid, "followers", meUid),
      { uid: meUid, displayName: me?.displayName || "", photoURL: me?.photoURL || "", createdAt: serverTimestamp() },
      { merge: true }
    );
    batch.set(
      doc(db, "follows", meUid, "following", targetUid),
      { uid: targetUid, displayName: target?.displayName || "", photoURL: target?.photoURL || "", createdAt: serverTimestamp() },
      { merge: true }
    );
    await batch.commit();
  }

  async function unfollow() {
    const batch = writeBatch(db);
    batch.delete(doc(db, "follows", targetUid, "followers", meUid));
    batch.delete(doc(db, "follows", meUid, "following", targetUid));
    await batch.commit();
  }

  return (
    <button
      onClick={isFollowing ? unfollow : follow}
      className={`px-4 py-1.5 rounded-full text-sm border transition
        ${isFollowing ? "bg-white text-[#8B6F47] border-[#E2B887]" : "bg-[#8B6F47] text-white border-[#8B6F47]"}`}
    >
      {isFollowing ? "Unfollow" : "Follow"}
    </button>
  );
}