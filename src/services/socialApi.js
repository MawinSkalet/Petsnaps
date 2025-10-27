import { db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  runTransaction,
  collection,
  getCountFromServer
} from "firebase/firestore";

export async function followUser({ meUid, meProfile, targetUid, targetProfile }) {
  if (!meUid || !targetUid || meUid === targetUid) return;

  await runTransaction(db, async (tx) => {
    const myFollowingRef = doc(db, "follows", meUid, "following", targetUid);
    const theirFollowersRef = doc(db, "follows", targetUid, "followers", meUid);

    const myFollowingSnap = await tx.get(myFollowingRef);
    if (!myFollowingSnap.exists()) {
      tx.set(myFollowingRef, {
        uid: targetUid,
        displayName: targetProfile?.displayName || "",
        photoURL: targetProfile?.photoURL || "",
        createdAt: serverTimestamp(),
      });
      tx.set(theirFollowersRef, {
        uid: meUid,
        displayName: meProfile?.displayName || "",
        photoURL: meProfile?.photoURL || "",
        createdAt: serverTimestamp(),
      });
    }
  });

  // Add a notification to the target
  await setDoc(doc(collection(db, "notifications", targetUid, "items")), {
    type: "follow",
    fromUid: meUid,
    fromName: meProfile?.displayName || "",
    fromPhoto: meProfile?.photoURL || "",
    createdAt: serverTimestamp(),
    read: false,
  });
}

/** Unfollow */
export async function unfollowUser({ meUid, targetUid }) {
  if (!meUid || !targetUid || meUid === targetUid) return;
  await runTransaction(db, async (tx) => {
    tx.delete(doc(db, "follows", meUid, "following", targetUid));
    tx.delete(doc(db, "follows", targetUid, "followers", meUid));
  });
}

/** Am I following this user? */
export async function isFollowing({ meUid, targetUid }) {
  if (!meUid || !targetUid) return false;
  const snap = await getDoc(doc(db, "follows", meUid, "following", targetUid));
  return snap.exists();
}

/** Quick counts */
export async function getFollowCounts(uid) {
  const followingCount = (await getCountFromServer(collection(db, "follows", uid, "following"))).data().count;
  const followersCount = (await getCountFromServer(collection(db, "follows", uid, "followers"))).data().count;
  return { followingCount, followersCount };
}