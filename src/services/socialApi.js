import { db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
  collection,
  getCountFromServer,
  onSnapshot,
} from "firebase/firestore";

/** FOLLOW (writes only to follows/*; Cloud Function creates the notification) */
export async function followUser({ meUid, meProfile, targetUid, targetProfile }) {
  if (!meUid || !targetUid || meUid === targetUid) return;

  const batch = writeBatch(db);

  // A) target's followers: follows/<targetUid>/followers/<meUid>
  batch.set(
    doc(db, "follows", targetUid, "followers", meUid),
    {
      uid: meUid,
      displayName: meProfile?.displayName || "",
      photoURL: meProfile?.photoURL || "",
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  // B) my following: follows/<meUid>/following/<targetUid>
  batch.set(
    doc(db, "follows", meUid, "following", targetUid),
    {
      uid: targetUid,
      displayName: targetProfile?.displayName || "",
      photoURL: targetProfile?.photoURL || "",
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  await batch.commit();

  // ⛔️ Do NOT write notifications here. Cloud Function onFollowCreate will add:
  // notifications/<targetUid>/items/follow:<meUid>
}

/** UNFOLLOW */
export async function unfollowUser({ meUid, targetUid }) {
  if (!meUid || !targetUid || meUid === targetUid) return;

  const batch = writeBatch(db);
  batch.delete(doc(db, "follows", targetUid, "followers", meUid));
  batch.delete(doc(db, "follows", meUid, "following", targetUid));
  await batch.commit();
}

/** One-time check: am I following target? */
export async function isFollowing({ meUid, targetUid }) {
  if (!meUid || !targetUid) return false;
  const snap = await getDoc(doc(db, "follows", meUid, "following", targetUid));
  return snap.exists();
}

/** Live subscription to following status (optional but nice) */
export function onIsFollowing({ meUid, targetUid }, callback) {
  if (!meUid || !targetUid) return () => {};
  const ref = doc(db, "follows", meUid, "following", targetUid);
  return onSnapshot(ref, (snap) => callback(snap.exists()));
}

/** Quick counts */
export async function getFollowCounts(uid) {
  const followingCount = (
    await getCountFromServer(collection(db, "follows", uid, "following"))
  ).data().count;

  const followersCount = (
    await getCountFromServer(collection(db, "follows", uid, "followers"))
  ).data().count;

  return { followingCount, followersCount };
}
